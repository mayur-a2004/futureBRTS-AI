# auto_backup.ps1
Write-Host "Auto-backup (safe) starting..."
# pack important folders into backup zip (safe)
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$target = Join-Path $root "snapshots" 
if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }
$zipName = "backup_{0}.zip" -f ((Get-Date).ToString("yyyyMMdd_HHmm"))
$zipPath = Join-Path $target $zipName
# include minimal safe list
$include = @("project", "automation_engines", "automation_workers", "system_control")
Compress-Archive -Path ($include | ForEach-Object { Join-Path $root $_ }) -DestinationPath $zipPath -Force -ErrorAction SilentlyContinue
Write-Host "Backup completed: $zipPath"
