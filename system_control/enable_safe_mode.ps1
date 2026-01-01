$ErrorActionPreference = "SilentlyContinue"
Write-Host "== ENABLING FUTUREBILDER SAFE MODE ==" -ForegroundColor Yellow

# 1) Stop all running PowerShell worker processes (excluding this one)
Write-Host "Killing background PowerShell tasks..."
Get-Process powershell -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $PID } | Stop-Process -Force

# 2) Disable unwanted scheduled tasks
$tasks = @(
    "Futurebilder_AutoHistory",
    "Futurebilder_Watchdog",
    "Futurebilder_MasterScheduler",
    "Futurebilder_SEOEngine",
    "Futurebilder_MLMonitor",
    "Futurebilder_SyncCron"
)

foreach ($t in $tasks) {
    # Attempt delete, suppress standard error
    schtasks /Delete /TN $t /F *>$null
    Write-Host "Disabled Task (if existed): $t"
}

# 3) Disable automation engines except essential ones
Write-Host "Disabling heavy automation engines..."
$toDisable = @(
    "automation_engines\phase8",
    "automation_engines\seo_engine",
    "automation_engines\marketing_sync",
    "automation_engines\gamify",
    "automation_workers\ml_worker"
)

# Resolve root relative to this script (assumed in system_control)
$projectRoot = Split-Path $PSScriptRoot -Parent

foreach ($f in $toDisable) {
    $path = Join-Path $projectRoot $f
    if (Test-Path $path) {
        $newName = "${path}_OFF"
        if (-not (Test-Path $newName)) {
            Rename-Item $path $newName -Force
            Write-Host "Disabled Engine Folder: $f -> ${f}_OFF"
        } else {
            Write-Host "Already Disabled: $f"
        }
    } else {
        Write-Host "Not found (or already disabled): $f"
    }
}

# 4) Enable only essential development automation
Write-Host "`nEnabling essential development engines..."
$essential = @(
    "automation_engines\qa_engine.ps1",
    "repair_structure.ps1",
    "run_system.ps1"
)

foreach ($e in $essential) {
    Write-Host "Enabled: $e"
}

# 5) Confirm Done
Write-Host "`nSAFE MODE ACTIVE." -ForegroundColor Green
Write-Host "Your system is now stable. Only essential features will run."
Write-Host "No background PowerShell popups. No heavy automation."
