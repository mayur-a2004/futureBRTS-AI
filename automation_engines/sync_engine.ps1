# sync_engine.ps1
param([switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\sync_engine.log"
"Sync run at $(Get-Date)" | Out-File -Append $log
# simple compare: list js/ts files in frontend vs backend
$feFiles = Get-ChildItem -Path (Join-Path $root '..\project\frontend') -Recurse -Include *.js,*.ts -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
$beFiles = Get-ChildItem -Path (Join-Path $root '..\project\backend') -Recurse -Include *.js,*.ts -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
$missingInBackend = $feFiles | Where-Object { $_ -notin $beFiles } | Select-Object -Unique
if ($missingInBackend.Count -gt 0) {
    "Missing server-side counterparts: $($missingInBackend -join ', ')" | Out-File -Append $log
} else {
    "Sync OK" | Out-File -Append $log
}
