# Explicit disposable lifecycle. Does not read .env or start Compose services.
$ErrorActionPreference = 'Stop'
$taskLabel = 'financial-' + [Guid]::NewGuid().ToString('N')
$taskName = 'tascora-pg-' + $taskLabel
$taskPassword = [Guid]::NewGuid().ToString('N')
$taskContainer = $null
try {
  $taskCreated = & docker run -d --name $taskName --label "tascora.validation=$taskLabel" --tmpfs /var/lib/postgresql/data -p '127.0.0.1::5432' -e 'POSTGRES_USER=tascora_test' -e "POSTGRES_PASSWORD=$taskPassword" -e 'POSTGRES_DB=tascora_migration_test' postgres:15-alpine
  if ($LASTEXITCODE -ne 0 -or -not $taskCreated) { throw 'Disposable container creation failed; Docker must be available' }
  $taskContainer = "$taskCreated".Trim()
  if ($LASTEXITCODE -ne 0 -or $taskContainer -notmatch '^[0-9a-f]{64}$') { throw 'Disposable container creation failed' }
  $taskInfo = (& docker inspect $taskContainer | ConvertFrom-Json)[0]
  if ($taskInfo.Config.Labels.'tascora.validation' -ne $taskLabel -or '/var/lib/postgresql/data' -notin $taskInfo.HostConfig.Tmpfs.PSObject.Properties.Name) { throw 'Unexpected container isolation' }
  $taskBinding = $taskInfo.NetworkSettings.Ports.'5432/tcp'[0]
  if ($taskBinding.HostIp -ne '127.0.0.1' -or [int]$taskBinding.HostPort -le 0 -or $taskBinding.HostPort -eq '5432') { throw 'Unexpected disposable binding' }
  Write-Output "Disposable task $taskName created on loopback port $($taskBinding.HostPort) (tmpfs only)"
  $taskReady = $false
  for ($taskTry=0; $taskTry -lt 30; $taskTry++) {
    & docker exec $taskContainer pg_isready -h 127.0.0.1 -U tascora_test -d tascora_migration_test *> $null
    if ($LASTEXITCODE -eq 0) { $taskReady=$true; break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $taskReady) { throw 'Disposable PostgreSQL readiness failed' }
  foreach ($taskDatabase in @('tascora_migration_test_second', 'tascora_migration_test_repeat')) {
    & docker exec $taskContainer createdb -U tascora_test $taskDatabase
    if ($LASTEXITCODE -ne 0) { throw 'Disposable database creation failed' }
    $env:TASCORA_DISPOSABLE_DATABASE_URL = "postgresql://tascora_test:$taskPassword@127.0.0.1:$($taskBinding.HostPort)/$taskDatabase"
    & node scripts/validate-disposable-postgres.mjs
    if ($LASTEXITCODE -ne 0) { throw "Disposable validation failed: $taskDatabase" }
    Write-Output "CLEAN DATABASE PASS: $taskDatabase"
  }
} finally {
  Remove-Item Env:TASCORA_DISPOSABLE_DATABASE_URL -ErrorAction SilentlyContinue
  if ($taskContainer -match '^[0-9a-f]{64}$') {
    $taskFinal = (& docker inspect $taskContainer | ConvertFrom-Json)[0]
    if ($taskFinal.Id -ne $taskContainer -or $taskFinal.Config.Labels.'tascora.validation' -ne $taskLabel -or '/var/lib/postgresql/data' -notin $taskFinal.HostConfig.Tmpfs.PSObject.Properties.Name) { throw 'Refusing unverified cleanup target' }
    & docker rm -f $taskContainer | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Owned container cleanup failed' }
    Write-Output 'Owned disposable container and all test databases removed; no existing database touched'
  }
}
