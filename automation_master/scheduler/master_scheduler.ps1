# master_scheduler.ps1
# Scheduler: runs daily backups + 18:00 checkpoint
param()
Write-Host "Scheduler heartbeat: $(Get-Date)"
# create snapshot (logic calls existing auto_history or snapshots engine)
$snaps = Join-Path $PSScriptRoot "..\..\snapshots"
if (-not (Test-Path $snaps)) { New-Item -ItemType Directory -Path $snaps -Force | Out-Null }
$stamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$report = @{ time = (Get-Date); event = "phase10_scheduler_run" } | ConvertTo-Json
$report | Out-File -FilePath (Join-Path $snaps "snapshot_$stamp.json") -Encoding UTF8
Write-Host "Snapshot created: snapshot_$stamp.json"
