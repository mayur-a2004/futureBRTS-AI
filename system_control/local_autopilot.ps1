param()
Write-Host "Starting Local Autopilot (Isolated Mode)..." -ForegroundColor Cyan

$root = Split-Path $PSScriptRoot -Parent
$flag = Join-Path $root ".local_runtime\ISOLATED_MODE"

if (-not (Test-Path $flag)) {
    Write-Error "Isolated mode is not enabled. Enable first."
    exit
}

# Engines to run locally
$engines = @(
    "automation_engines\task_engine.ps1",
    "automation_engines\qa_engine.ps1",
    "automation_engines\sync_engine.ps1",
    "automation_engines\seo_engine\seo_engine.ps1",
    "automation_engines\predictive_engine.ps1",
    "automation_engines\perf_optimizer.ps1"
)

foreach ($e in $engines) {
    $path = Join-Path $root $e
    if (Test-Path $path) {
        Write-Host "Running: $e"
        # Using powershell explicitly for compatibility
        Start-Job -ScriptBlock { param($p) powershell -ExecutionPolicy Bypass -File $p } -ArgumentList $path | Out-Null
    }
}

Write-Host "All engines running in LOCAL background (no system tasks)."
Write-Host "No popup windows. No system modifications."
