# task_engine.ps1
param([switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\task_engine.log"
"Run at $(Get-Date) (WhatIf=$WhatIf)" | Out-File -Append $log
# Simple task loader: reads project_flow\module_queue.txt if exists
$queue = Join-Path $root "..\project_flow\module_queue.txt"
if (Test-Path $queue) {
    $tasks = Get-Content $queue | Where-Object { $_.Trim() -ne "" }
    "Loaded tasks: $($tasks.Count)" | Out-File -Append $log
    # Simple split: create task files under history_logs/daily as snapshots
    foreach ($t in $tasks) {
        $id = [Guid]::NewGuid().ToString().Substring(0,8)
        $out = Join-Path $root "..\history_logs\daily\task_$id.txt"
        $text = "Task:$t`nAssigned:AutoEngine`nCreated:$(Get-Date)"
        if (-not $WhatIf) { $text | Out-File -FilePath $out -Force }
        "Task created: $out" | Out-File -Append $log
    }
} else {
    "No queue found: $queue" | Out-File -Append $log
}
