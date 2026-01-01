$ErrorActionPreference = "Stop"
Write-Host "Installing ML Worker..." -ForegroundColor Cyan

# Root
$root = $PSScriptRoot
$workerRoot = Join-Path $root "automation_workers\ml_worker\app"

# 1) Create folder structure
Write-Host "Creating folder structure..."
$folders = @(
    "automation_workers",
    "automation_workers\ml_worker",
    "automation_workers\ml_worker\app"
)

foreach ($f in $folders) {
    $path = Join-Path $root $f
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "   Created: $f"
    }
    else {
        Write-Host "   Exists: $f"
    }
}

# 2) File helper
function WriteFile($path, $content) {
    $full = Join-Path $workerRoot $path
    $content | Out-File -FilePath $full -Encoding UTF8 -Force
    Write-Host "   File written: $path"
}

# 3) Python files
Write-Host "Writing Python backend files..."

$apiContent = "from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import predict

app = FastAPI()

class Profile(BaseModel):
    userId: str
    age: int
    education: str
    degree: str
    goal: str

@app.get('/health')
def health():
    return {'status': 'ok'}

@app.post('/predict')
def predict_route(profile: Profile):
    return predict.run_inference(profile.dict())

@app.post('/shutdown')
def shutdown():
    import os
    os._exit(0)
"
WriteFile "api.py" $apiContent

$predictContent = "import random
def run_inference(profile):
    return {'path': 'entrepreneur', 'score': 0.95}
"
WriteFile "predict.py" $predictContent

$reqContent = "fastapi
uvicorn
pydantic
scikit-learn
"
WriteFile "requirements.txt" $reqContent

# 4) Install dependencies
Write-Host "Creating Python venv..."

$venv = Join-Path $workerRoot "..\.venv"
if (-not (Test-Path $venv)) {
    python -m venv $venv
    Write-Host "   venv created."
}

$pip = Join-Path $venv "Scripts\pip.exe"
$req = Join-Path $workerRoot "requirements.txt"

Write-Host "Installing packages..."
& $pip install -r $req

# 5) Health Check
Write-Host "Starting ML worker..."
$py = Join-Path $venv "Scripts\python.exe"
Start-Process -FilePath $py `
    -ArgumentList "-m uvicorn api:app --host 127.0.0.1 --port 8001" `
    -WorkingDirectory $workerRoot `
    -WindowStyle Hidden

Start-Sleep -Seconds 5

try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:8001/health" -TimeoutSec 3
    Write-Host "   Health OK - ML worker alive!" -ForegroundColor Green
}
catch {
    Write-Host "   Worker NOT responding" -ForegroundColor Red
}

Write-Host "ML WORKER INSTALLATION COMPLETE!" -ForegroundColor Green
