# Local Disposable PostgreSQL Backup & Restore Verification (Phase 4G)
# SAFETY: Operates ONLY against an ephemeral local Docker Postgres container.
# Never targets hosted staging or production databases.

$ErrorActionPreference = 'Stop'

$dockerInfo = docker info --format '{{.ServerVersion}}' 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Output 'BLOCKED: Docker daemon is not running locally. Start Docker Desktop to run disposable pg_dump/restore verification.'
  exit 2
}

$containerName = "tascora-backup-verify-$(Get-Random -Minimum 1000 -Maximum 9999)"
$dumpFile = Join-Path ([System.IO.Path]::GetTempPath()) "$containerName.sql"

try {
  Write-Output "Starting disposable Postgres container $containerName..."
  docker run --rm -d --name $containerName `
    -e POSTGRES_USER=tascora_test `
    -e POSTGRES_PASSWORD=tascora_test `
    -e POSTGRES_DB=tascora_backup_src `
    -p 55449:5432 `
    postgres:15-alpine | Out-Null

  for ($i = 0; $i -lt 30; $i++) {
    docker exec $containerName pg_isready -U tascora_test -d tascora_backup_src | Out-Null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
  }

  $env:DATABASE_URL = 'postgresql://tascora_test:tascora_test@127.0.0.1:55449/tascora_backup_src'
  pnpm db:migrate:deploy

  docker exec $containerName pg_dump -U tascora_test -d tascora_backup_src > $dumpFile
  docker exec $containerName createdb -U tascora_test tascora_backup_restored
  Get-Content -Raw $dumpFile | docker exec -i $containerName psql -U tascora_test -d tascora_backup_restored | Out-Null

  $srcTables = docker exec $containerName psql -U tascora_test -d tascora_backup_src -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"
  $dstTables = docker exec $containerName psql -U tascora_test -d tascora_backup_restored -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"

  Write-Output "Backup/Restore Verification: source_tables=$srcTables restored_tables=$dstTables"
  if ($srcTables -ne $dstTables -or [int]$srcTables -lt 10) {
    throw "Table count mismatch after restore ($srcTables vs $dstTables)"
  }
  Write-Output 'LOCAL_BACKUP_RESTORE_PASS'
} finally {
  docker rm -f $containerName 2>$null | Out-Null
  if (Test-Path $dumpFile) { Remove-Item -Force $dumpFile }
}
