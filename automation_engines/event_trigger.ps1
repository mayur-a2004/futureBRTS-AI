# event_trigger.ps1
param([string]$Event='daily_snapshot', [switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\event_trigger.log"
"Trigger: $Event at $(Get-Date)" | Out-File -Append $log
switch ($Event) {
    'daily_snapshot' {
        & (Join-Path $root 'activity_tracker.ps1') -WhatIf:$WhatIf
    }
    'quick_qa' {
        & (Join-Path $root 'qa_engine.ps1') -WhatIf:$WhatIf
    }
    default {
        "Unknown event: $Event" | Out-File -Append $log
    }
}
