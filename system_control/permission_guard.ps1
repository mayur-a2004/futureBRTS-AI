Write-Host "Permission Guard Active" -ForegroundColor Gray
# Logic: Ensure critical system folders aren't deleted
$root = Resolve-Path "$PSScriptRoot\.."
$critical = @("system_control", "project", "history_logs")
foreach ($folder in $critical) {
    if (-not (Test-Path "$root\$folder")) {
        Write-Host "Security Breach: $folder missing! Triggering Repair..." -ForegroundColor Red
        powershell -ExecutionPolicy Bypass -File "$root\repair_structure.ps1"
    }
}
