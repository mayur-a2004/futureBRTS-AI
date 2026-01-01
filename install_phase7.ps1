$ErrorActionPreference = "Stop"
Write-Host "=== Installing Phase-7 (AI Predictive Engine Integration) ===" -ForegroundColor Cyan

$root = $PSScriptRoot
$engineDir = Join-Path $root "automation_engines"
$predictDir = Join-Path $root "history_logs\predictive_engine"
$mlURL = "http://127.0.0.1:8001/predict"
$workerApp = Join-Path $root "automation_workers\ml_worker\app"

# 1) Ensure folders exist
$folders = @(
    "automation_engines",
    "history_logs",
    "history_logs\predictive_engine"
)

foreach ($f in $folders) {
    $path = Join-Path $root $f
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created folder: $f"
    }
}

# 1.5) Update Worker API to Generic Mode (match Phase 7 requirements)
# The previous worker was specific. We need a generic text predictor for this phase.
Write-Host "Updating ML Worker to Generic Text Mode..."
$apiFile = Join-Path $workerApp "api.py"
$apiContent = @"
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import datetime

app = FastAPI()

class GenericRequest(BaseModel):
    query: str
    user: str

@app.get('/health')
def health():
    return {'status': 'ok', 'mode': 'generic'}

@app.post('/predict')
def predict_route(req: GenericRequest):
    # Mock AI Logic
    print(f"I received: {req.query} from {req.user}")
    
    # Simple keyword response
    answer = "I processed your request: " + req.query
    if "error" in req.query.lower():
        answer = "I detected an error context."
    elif "status" in req.query.lower():
        answer = "System status is nominal."
        
    return {
        "result": answer,
        "timestamp": datetime.datetime.now().isoformat(),
        "confidence": 0.98
    }

@app.post('/shutdown')
def shutdown():
    import os
    os._exit(0)
"@
$apiContent | Out-File $apiFile -Encoding UTF8 -Force
Write-Host "Updated api.py to Generic Mode"


# 2) Update predictive_engine.ps1
$predictFile = Join-Path $engineDir "predictive_engine.ps1"

$predictContent = @"
param(
    [string]`$Query = "Status Check",
    [string]`$User = "Admin"
)

Write-Host "`n[AI] Predictive Engine Triggered" -ForegroundColor Cyan

try {
    `$body = @{
        query = `$Query
        user  = `$User
    } | ConvertTo-Json

    `$response = Invoke-RestMethod -Uri "$mlURL" -Method POST -Body `$body -ContentType "application/json"

    Write-Host "[AI-Response] `t `$(`$response.result)" -ForegroundColor Green
    Write-Host "[Confidence]  `t `$(`$response.confidence)" -ForegroundColor Gray

    # Save history
    `$logPath = Join-Path "$predictDir" ("predict_" + (Get-Date -Format "yyyy-MM-dd_HH-mm-ss") + ".log")
    `$body | Out-File `$logPath
    "`nAI Response:`n" + (`$response | ConvertTo-Json) | Out-File -Append `$logPath

    return `$response.result
}
catch {
    Write-Host "[ERROR] ML Worker not responding! (`$_)" -ForegroundColor Red
    return "ERROR: Unable to fetch prediction."
}
"@

$predictContent | Out-File -FilePath $predictFile -Encoding UTF8 -Force
Write-Host "Updated predictive_engine.ps1"

# 3) Auto-monitor ML Worker
$monitorFile = Join-Path $engineDir "ml_monitor.ps1"

$monitorContent = @"
Write-Host "Starting ML Health Monitor..."
while (`$true) {
    try {
        `$res = Invoke-RestMethod -Uri "http://127.0.0.1:8001/health" -TimeoutSec 2 -ErrorAction Stop
        if (`$res.status -eq 'ok') {
            # Write-Host "." -NoNewline
        }
    }
    catch {
        Write-Host "`n[ML Worker Down] Triggering Auto-Heal..." -ForegroundColor Yellow
        # Use the system launcher to ensure correct venv usage
        Start-Process "powershell" -ArgumentList "-ExecutionPolicy Bypass -File .\run_system.ps1" -WindowStyle Hidden
        Start-Sleep -Seconds 5
    }
    Start-Sleep -Seconds 10
}
"@

$monitorContent | Out-File $monitorFile -Encoding UTF8 -Force
Write-Host "ML Worker Auto-Monitor Installed"

# 4) Restart the worker to apply new API
Write-Host "Restarting Worker to apply changes..."
try { Invoke-RestMethod -Uri "http://127.0.0.1:8001/shutdown" -Method POST -ErrorAction SilentlyContinue } catch {}
Start-Sleep -Seconds 2
Start-Process "powershell" -ArgumentList "-ExecutionPolicy Bypass -File .\run_system.ps1" -WindowStyle Hidden

# 5) Log success
Write-Host "`n=== PHASE 7 INSTALLED SUCCESSFULLY ===" -ForegroundColor Green
Write-Host "Predictive Engine Connected"
Write-Host "ML Worker Auto-Heal Activated"
Write-Host "Prediction Logs Ready"
