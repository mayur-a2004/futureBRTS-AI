# perf_optimizer.ps1
param([switch]$Apply, [switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\perf_optimizer.log"
"Perf run at $(Get-Date) Apply=$Apply WhatIf=$WhatIf" | Out-File -Append $log
# cleanup large logs older than 30 days
$age = (Get-Date).AddDays(-30)
$logs = Get-ChildItem -Path (Join-Path $root '..') -Recurse -Include *.log -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $age -and $_.Length -gt 1kb }
foreach ($l in $logs) {
    "Old log: $($l.FullName) size:$($l.Length)" | Out-File -Append $log
    if ($Apply -and -not $WhatIf) { Remove-Item -Path $l.FullName -Force }
}
"Perf done" | Out-File -Append $log
