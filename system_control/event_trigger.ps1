$hour = (Get-Date).Hour
if ($hour -eq 18) {
    Write-Host "6PM Trigger: Saving Daily History..." -ForegroundColor Cyan
    $root = Resolve-Path "$PSScriptRoot\.."
    powershell -ExecutionPolicy Bypass -File "$root\system_control\auto_history.ps1"
}
