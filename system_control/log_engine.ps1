param([string]$message = "System Check")
$root = Resolve-Path "$PSScriptRoot\.."
$logFile = "$root\history_logs\daily_log_$(Get-Date -Format 'yyyy-MM-dd').txt"
$timestamp = Get-Date -Format "HH:mm:ss"
"[$timestamp] $message" | Out-File -Append $logFile
