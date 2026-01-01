# heal_watchdog.ps1
param()
Write-Host "Heal Watchdog checking services..."
# Example checks: ensure ML worker, predictive service, and key scripts exist
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$checks = @("automation_workers\ml_worker\app\api.py", "automation_engines\predictive_engine.ps1")
foreach ($c in $checks) {
    if (-not (Test-Path (Join-Path $root $c))) { Write-Host "Missing: $c" }
    else { Write-Host "OK: $c" }
}
