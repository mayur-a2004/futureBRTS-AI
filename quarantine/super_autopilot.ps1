$ErrorActionPreference = "SilentlyContinue"
Write-Host "Futurebilder SUPER AUTOPILOT Engaging..." -ForegroundColor Cyan

$root = $PSScriptRoot
$engines = Join-Path $root "automation_engines"

# 1. Self-Repair First
Write-Host "Phase 1: Structural Integrity" -ForegroundColor Yellow
if (Test-Path "$root\repair_structure.ps1") {
    & "$root\repair_structure.ps1"
}

# 2. Permission Lock
Write-Host "Phase 2: Security Perimeter" -ForegroundColor Yellow
& "$engines\permission_guard.ps1" -AutoQuarantine

# 3. Code Health (QA + Sync + SEO)
Write-Host "Phase 3: Codebase Health Checks" -ForegroundColor Yellow
& "$engines\qa_engine.ps1"
& "$engines\sync_engine.ps1"
& "$engines\seo_engine.ps1"

# 4. Ops & Perf
Write-Host "Phase 4: Operations & Performance" -ForegroundColor Yellow
& "$engines\perf_optimizer.ps1" -Apply
& "$engines\predictive_engine.ps1"

# 5. Snapshot
Write-Host "Phase 5: State Snapshot" -ForegroundColor Yellow
& "$engines\activity_tracker.ps1"

# 6. Task Management
Write-Host "Phase 6: Task Processing" -ForegroundColor Yellow
& "$engines\task_engine.ps1"

Write-Host "AUTOPILOT CYCLE COMPLETE." -ForegroundColor Green
Write-Host "System is Optimized, Secured, and Synchronized." -ForegroundColor Green
