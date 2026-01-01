$ErrorActionPreference = "SilentlyContinue"
Write-Host "Futurebilder Phase-2 Automation Engine Setup Starting..." -ForegroundColor Cyan

$root = $PSScriptRoot
$enginePath = Join-Path $root "automation_engines"

if (-not (Test-Path $enginePath)) {
    New-Item -ItemType Directory -Path $enginePath | Out-Null
    Write-Host "Created folder: automation_engines"
}
else {
    Write-Host "Folder exists: automation_engines"
}

$engines = @{}
$engines["task_engine.ps1"] = "Write-Host 'Task Engine Running...'"
$engines["activity_tracker.ps1"] = "Write-Host 'Activity Tracker Running...'"
$engines["event_trigger.ps1"] = "Write-Host 'Event Trigger Running...'"
$engines["permission_guard.ps1"] = "Write-Host 'Permission Guard Running...'"
$engines["qa_engine.ps1"] = "Write-Host 'QA Engine Running...'"
$engines["sync_engine.ps1"] = "Write-Host 'Sync Engine Running...'"

foreach ($key in $engines.Keys) {
    $path = Join-Path $enginePath $key
    if (-not (Test-Path $path)) {
        Set-Content -Path $path -Value $engines[$key]
        Write-Host "Created engine: $key"
    }
    else {
        Write-Host "Exists: $key"
    }
}

Write-Host "Phase-2 Automation Engines Installed Successfully!" -ForegroundColor Green
