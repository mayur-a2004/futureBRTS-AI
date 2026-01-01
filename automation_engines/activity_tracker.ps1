# activity_tracker.ps1
param([int]$WindowMinutes = 10, [switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\activity_tracker.log"
"Snapshot at $(Get-Date)" | Out-File -Append $log
# scan recent modified files under project
$cutoff = (Get-Date).AddMinutes(-$WindowMinutes)
$modified = Get-ChildItem -Path (Join-Path $root '..\project') -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -ge $cutoff }
"Modified count: $($modified.Count)" | Out-File -Append $log
foreach ($f in $modified) {
    $line = "$($f.FullName) | $($f.LastWriteTime)"
    if (-not $WhatIf) { $line | Out-File -Append $log }
}
# write snapshot file
$snap = Join-Path $root "..\snapshots\snapshot_$(Get-Date -Format yyyyMMdd_HHmmss).json"
$meta = @{
    time = (Get-Date).ToString()
    modified = $modified | Select-Object FullName, LastWriteTime
} | ConvertTo-Json -Depth 4
if (-not $WhatIf) { $meta | Out-File -FilePath $snap -Encoding UTF8 }
"Snapshot saved: $snap" | Out-File -Append $log
