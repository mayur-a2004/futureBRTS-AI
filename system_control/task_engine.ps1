param(
    [string]$Action,
    [string]$Target,
    [string]$Status = "PENDING"
)
$root = Resolve-Path "$PSScriptRoot\.."
$taskLog = "$root\history_logs\tasks_log.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$timestamp] ACTION: $Action -> TARGET: $Target -> STATUS: $Status" | Out-File -Append $taskLog
