# run_system.ps1
Write-Host "Starting Futurebuilder System..." -ForegroundColor Cyan

$root = $PSScriptRoot

# 1) repair structure
$repairScript = Join-Path $root "repair_structure.ps1"
if (Test-Path $repairScript) {
    Write-Host "Running Repair Structure..."
    powershell -ExecutionPolicy Bypass -File $repairScript
}

# 2) start core services: ML worker
$workerAppDir = Join-Path $root "automation_workers\ml_worker\app"
if (Test-Path $workerAppDir) {
    Write-Host "Launching ML Worker (Hidden)..."
    # Starting in a hidden window
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd `"$workerAppDir`"; python -m uvicorn api:app --host 127.0.0.1 --port 8001" -WindowStyle Hidden
}
else {
    Write-Host "⚠️ ML Worker directory not found at: $workerAppDir" -ForegroundColor Yellow
}

# 3) register backup schedule (placeholder)
Write-Host "System started. ML worker should be on port 8001." -ForegroundColor Green
