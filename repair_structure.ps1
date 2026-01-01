$ErrorActionPreference = "SilentlyContinue"
Write-Host "Futurebilder Auto-Repair Running..." -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Required Structure
$folders = @(
    "agents",
    "blueprint",
    "history_logs\daily",
    "history_logs\autosave",
    "integration_api",
    "modules",
    "orchestrator",
    "project",
    "project\artifacts",
    "project\backend",
    "project\frontend",
    "project\fb_logs",
    "project\worker",
    "project_flow",
    "snapshots",
    "system_control",
    "scripts"
)

foreach ($f in $folders) {
    $p = Join-Path $root $f
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
        Write-Host "Created: $f"
    }
}

# 2. Cleanup
$dupes = @(
    "project\project",
    "worker",
    "worker\worker",
    ".next",
    "dist",
    "temp"
)

foreach ($d in $dupes) {
    $p = Join-Path $root $d
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force
        Write-Host "Removed: $d"
    }
}

# 3. Junk Clean
Get-ChildItem -Path $root -Include "*.tmp", "*.log", "Thumbs.db" -Recurse | Remove-Item -Force

# 4. Log
$log = Join-Path $root "history_logs\repair.log"
"Repair run at $(Get-Date)" | Out-File -Append $log

Write-Host "Auto-Repair Completed Successfully!" -ForegroundColor Green
