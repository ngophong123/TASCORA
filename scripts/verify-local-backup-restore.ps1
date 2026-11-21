# Local Disposable PostgreSQL Backup & Restore Verification (Workstream 4 / Phase 4G)
# SAFETY: Operates ONLY against an ephemeral local Docker Postgres container.
# Never targets, reads, overwrites, or deletes hosted staging or production databases.

$ErrorActionPreference = 'Stop'

$dockerInfo = docker info --format '{{.ServerVersion}}' 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Output 'BLOCKED: Docker Desktop Linux engine daemon is not running locally. Start Docker Desktop before executing backup/restore verification.'
  exit 2
}

$containerName = "tascora-backup-verify-$(Get-Random -Minimum 1000 -Maximum 9999)"
$dumpFile = Join-Path ([System.IO.Path]::GetTempPath()) "$containerName.sql"

try {
  Write-Output "Starting disposable Postgres 15 container $containerName..."
  docker run --rm -d --name $containerName `
    -e POSTGRES_USER=tascora_test `
    -e POSTGRES_PASSWORD=tascora_test `
    -e POSTGRES_DB=tascora_backup_src `
    -p 55449:5432 `
    postgres:15-alpine | Out-Null

  $ready = $false
  for ($i = 0; $i -lt 30; $i++) {
    docker exec $containerName pg_isready -U tascora_test -d tascora_backup_src | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) { throw 'Disposable Postgres container did not become ready within 30s.' }

  # 1. Deploy all ordered Prisma migrations
  $env:DATABASE_URL = 'postgresql://tascora_test:tascora_test@127.0.0.1:55449/tascora_backup_src'
  pnpm db:migrate:deploy
  if ($LASTEXITCODE -ne 0) { throw 'prisma migrate deploy failed on disposable database.' }

  # 2. Seed deterministic relational + financial ledger fixture data into source DB
  $seedSql = @"
INSERT INTO users (id, email, password, role, status, "createdAt", "updatedAt") VALUES
  ('cbackupbuyer00000000000001', 'backup-buyer@test.invalid', 'hash-unused', 'BUYER', 'ACTIVE', NOW(), NOW()),
  ('cbackupseller0000000000001', 'backup-seller@test.invalid', 'hash-unused', 'SELLER', 'ACTIVE', NOW(), NOW());

INSERT INTO seller_profiles (id, "userId", "firstName", "lastName", status, "verificationStatus", level, "onboardingStep", languages, skills, "createdAt", "updatedAt") VALUES
  ('cbackupsprof00000000000001', 'cbackupseller0000000000001', 'Ada', 'Lovelace', 'APPROVED', 'APPROVED', 'NEW_SELLER', 4, ARRAY['English'], ARRAY['TypeScript'], NOW(), NOW());

INSERT INTO categories (id, name, slug, "createdAt", "updatedAt") VALUES
  ('cbackupcat0000000000000001', 'Backup Engineering', 'backup-engineering', NOW(), NOW());

INSERT INTO services (id, "sellerProfileId", "categoryId", title, description, status, "createdAt", "updatedAt") VALUES
  ('cbackupsvc0000000000000001', 'cbackupsprof00000000000001', 'cbackupcat0000000000000001', 'Disposable Backup Test Gig', 'Verifies backup restore integrity', 'PUBLISHED', NOW(), NOW());

INSERT INTO service_packages (id, "serviceId", type, title, description, price, "deliveryDays", revisions, features) VALUES
  ('cbackuppkg0000000000000001', 'cbackupsvc0000000000000001', 'BASIC', 'Basic Tier', 'Standard tier', 100.00, 3, 1, ARRAY['Verified restore']);

INSERT INTO orders (id, "buyerId", "sellerId", "serviceId", "packageId", amount, currency, "platformFeeBps", status, "createdAt", "updatedAt") VALUES
  ('cbackupord0000000000000001', 'cbackupbuyer00000000000001', 'cbackupsprof00000000000001', 'cbackupsvc0000000000000001', 'cbackuppkg0000000000000001', 100.00, 'usd', 1000, 'COMPLETED', NOW(), NOW());

INSERT INTO transactions (id, "orderId", "attemptKey", amount, "refundedAmount", currency, status, "createdAt", "updatedAt") VALUES
  ('cbackuptx00000000000000001', 'cbackupord0000000000000001', 'backup-attempt-1', 100.00, 0.00, 'usd', 'SUCCEEDED', NOW(), NOW());

INSERT INTO escrows (id, "orderId", "transactionId", amount, released, "releasedAt", "createdAt", "updatedAt") VALUES
  ('cbackupesc0000000000000001', 'cbackupord0000000000000001', 'cbackuptx00000000000000001', 100.00, true, NOW(), NOW(), NOW());

INSERT INTO financial_entries (id, "orderId", type, "eventKey", "amountDelta", "pendingDelta", "availableDelta", "reservedDelta", "paidDelta", "feeDelta", "transactionId", "createdAt") VALUES
  ('cbackupfe00000000000000001', 'cbackupord0000000000000001', 'PAYMENT_RECEIVED', 'backup:tx:received', 100.00, 90.00, 0.00, 0.00, 0.00, 10.00, 'cbackuptx00000000000000001', NOW()),
  ('cbackupfe00000000000000002', 'cbackupord0000000000000001', 'SELLER_EARNING_AVAILABLE', 'backup:ord:available', 0.00, -90.00, 90.00, 0.00, 0.00, 0.00, 'cbackuptx00000000000000001', NOW());
"@
  $seedSql | docker exec -i $containerName psql -v ON_ERROR_STOP=1 -U tascora_test -d tascora_backup_src | Out-Null

  # 3. Backup with timing
  $backupSw = [System.Diagnostics.Stopwatch]::StartNew()
  docker exec $containerName pg_dump -U tascora_test -d tascora_backup_src > $dumpFile
  $backupSw.Stop()
  $dumpBytes = (Get-Item $dumpFile).Length

  # 4. Restore into fresh disposable DB with timing
  docker exec $containerName createdb -U tascora_test tascora_backup_restored
  $restoreSw = [System.Diagnostics.Stopwatch]::StartNew()
  Get-Content -Raw $dumpFile | docker exec -i $containerName psql -v ON_ERROR_STOP=1 -U tascora_test -d tascora_backup_restored | Out-Null
  $restoreSw.Stop()

  # 5. Verify schema, migrations, record counts, foreign keys, and ledger consistency
  $srcTables = (docker exec $containerName psql -U tascora_test -d tascora_backup_src -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';").Trim()
  $dstTables = (docker exec $containerName psql -U tascora_test -d tascora_backup_restored -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';").Trim()
  $dstMigrations = (docker exec $containerName psql -U tascora_test -d tascora_backup_restored -tAc "SELECT count(*) FROM _prisma_migrations WHERE finished_at IS NOT NULL;").Trim()
  $dstFkCount = (docker exec $containerName psql -U tascora_test -d tascora_backup_restored -tAc "SELECT count(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_schema='public';").Trim()
  $invalidFks = (docker exec $containerName psql -U tascora_test -d tascora_backup_restored -tAc "SELECT count(*) FROM pg_constraint WHERE contype='f' AND NOT convalidated;").Trim()
  $recordCheck = (docker exec $containerName psql -U tascora_test -d tascora_backup_restored -tAc "SELECT (SELECT count(*) FROM users) || ',' || (SELECT count(*) FROM orders) || ',' || (SELECT count(*) FROM escrows) || ',' || (SELECT count(*) FROM financial_entries);").Trim()
  $ledgerDelta = (docker exec $containerName psql -U tascora_test -d tascora_backup_restored -tAc "SELECT COALESCE(SUM(\"pendingDelta\" + \"availableDelta\" + \"reservedDelta\" + \"paidDelta\" + \"feeDelta\"), 0)::numeric(12,2) FROM financial_entries;").Trim()
  $orderGross = (docker exec $containerName psql -U tascora_test -d tascora_backup_restored -tAc "SELECT COALESCE(SUM(amount), 0)::numeric(12,2) FROM orders;").Trim()

  $report = [ordered]@{
    status            = 'PASS'
    backupDurationMs  = [math]::Round($backupSw.Elapsed.TotalMilliseconds, 2)
    restoreDurationMs = [math]::Round($restoreSw.Elapsed.TotalMilliseconds, 2)
    dumpSizeBytes     = $dumpBytes
    sourceTables      = [int]$srcTables
    restoredTables    = [int]$dstTables
    appliedMigrations = [int]$dstMigrations
    foreignKeyCount   = [int]$dstFkCount
    invalidForeignKeys = [int]$invalidFks
    restoredCounts    = $recordCheck
    ledgerAllocated   = $ledgerDelta
    orderGross        = $orderGross
  }

  if ($srcTables -ne $dstTables -or [int]$srcTables -lt 10) { throw "Table mismatch ($srcTables vs $dstTables)" }
  if ([int]$invalidFks -ne 0) { throw "Invalid foreign keys detected: $invalidFks" }
  if ($recordCheck -ne '2,1,1,2') { throw "Restored record count mismatch: $recordCheck" }
  if ($ledgerDelta -ne $orderGross) { throw "Ledger conservation mismatch after restore ($ledgerDelta vs $orderGross)" }

  Write-Output ($report | ConvertTo-Json -Depth 4)
  Write-Output 'LOCAL_BACKUP_RESTORE_PASS'
} finally {
  docker rm -f $containerName 2>$null | Out-Null
  if (Test-Path $dumpFile) { Remove-Item -Force $dumpFile }
}
