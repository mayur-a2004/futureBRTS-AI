<#
    install_phase8.ps1
    Usage:
      pwsh -ExecutionPolicy Bypass -File .\system_control\install_phase8.ps1 -AdminToken "SECRET"

    This script installs Phase-8 (Life Engine):
      - Verifies structure (repair_structure.ps1)
      - Triggers existing automation phases
      - Creates ML worker + FastAPI skeleton (automation_workers/ml_worker/app)
      - Prepares predictive integration script
      - Creates super-autopilot hook / scheduled task (optional admin only)
      - Generates logs and reports
#>

param(
    [Parameter(Mandatory = $false)][string]$AdminToken = "",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Write-Host "Phase-8 installer started..." -ForegroundColor Cyan

try {
    $root = $PSScriptRoot
    # If running from system_control/, PSScriptRoot is project/system_control,
    # project root = Parent of system_control
    if ((Split-Path $root -Leaf) -ieq 'system_control') {
        $projectRoot = Split-Path $root -Parent
    }
    else {
        # Assume current folder is project root
        $projectRoot = $root
    }

    Write-Host "Project root = $projectRoot"

    # 0) Safety check - require admin for critical actions
    function Test-IsAdmin {
        $id = [Security.Principal.WindowsIdentity]::GetCurrent()
        $pr = New-Object Security.Principal.WindowsPrincipal($id)
        return $pr.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    }
    $isAdmin = $false
    try { $isAdmin = Test-IsAdmin } catch { $isAdmin = $false }

    if (-not $isAdmin) {
        Write-Warning "Warning: Running without Administrator. Some Phase-8 actions (scheduled tasks, protected perms) will be skipped."
    }

    # 1) Ensure good base structure by calling repair script if exists
    $repairScript = Join-Path $projectRoot "repair_structure.ps1"
    if (Test-Path $repairScript) {
        Write-Host "Running repair_structure.ps1 to ensure folder layout..." -ForegroundColor Yellow
        try {
            & pwsh -ExecutionPolicy Bypass -File $repairScript
            Write-Host "Base structure repair completed."
        }
        catch {
            Write-Warning "repair_structure.ps1 failed: $_. Exception. Continuing but check logs."
        }
    }
    else {
        Write-Warning "repair_structure.ps1 not found. Skipping structure repair."
    }

    # 2) Make Phase8 folder and automation_engines/phase8
    $phase8Dir = Join-Path $projectRoot "automation_engines\phase8"
    if (-not (Test-Path $phase8Dir)) {
        New-Item -ItemType Directory -Path $phase8Dir -Force | Out-Null
        Write-Host "Created: $phase8Dir"
    }
    else {
        Write-Host "Exists: $phase8Dir"
    }

    # 3) Reuse existing installation scripts if present (phase6 / ml_worker / phase7)
    $scriptsToCall = @(
        "system_control\install_phase6.ps1",
        "system_control\install_ml_worker.ps1",
        "system_control\install_phase7.ps1"
    )
    foreach ($s in $scriptsToCall) {
        $path = Join-Path $projectRoot $s
        if (Test-Path $path) {
            Write-Host "Running: $s"
            try {
                & pwsh -ExecutionPolicy Bypass -File $path -ErrorAction Stop
                Write-Host "OK: $s"
            }
            catch {
                Write-Warning "Script $s failed: $_. Continuing"
            }
        }
        else {
            Write-Host "Not found: $s (skipped)"
        }
    }

    # 4) Create FastAPI skeleton for ML worker
    $mlApp = Join-Path $projectRoot "automation_workers\ml_worker\app"
    if (-not (Test-Path $mlApp)) { New-Item -ItemType Directory -Path $mlApp -Force | Out-Null }

    # files: api.py, predict.py, requirements.txt
    $apiPy = @"
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import asyncio

app = FastAPI(title='Futurebilder ML Worker')

class PredictRequest(BaseModel):
    user_id: str
    payload: dict

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.post('/predict')
async def predict(req: PredictRequest):
    # placeholder - replace with real model call
    return {'user_id': req.user_id, 'prediction': 'placeholder', 'score': 0.0}
    
if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8001)
"@

    $predictPy = @"
# predict.py - helper module for ML models
def load_model():
    # place model loading code here
    return None

def run_prediction(model, data):
    # placeholder
    return {'predicted': 'value', 'confidence': 0.0}
"@

    $reqs = @"
fastapi
uvicorn[standard]
pydantic
numpy
scikit-learn
joblib
"@

    $apiPath = Join-Path $mlApp "api.py"
    $predictPath = Join-Path $mlApp "predict.py"
    $reqPath = Join-Path $mlApp "requirements.txt"

    $apiPy | Out-File -FilePath $apiPath -Encoding UTF8 -Force
    $predictPy | Out-File -FilePath $predictPath -Encoding UTF8 -Force
    $reqs | Out-File -FilePath $reqPath -Encoding UTF8 -Force

    Write-Host "ML FastAPI skeleton written to: $mlApp"

    # 5) Try to create venv and install requirements (if python available)
    $pythonExe = "python"
    $venvOK = $false
    try {
        $pyVer = & $pythonExe --version 2>&1
        if ($LASTEXITCODE -eq 0) { 
            Write-Host "Python found: $pyVer"
            $venvDir = Join-Path $projectRoot "automation_workers\ml_worker\.venv"
            & $pythonExe -m venv $venvDir
            $pip = Join-Path $venvDir "Scripts\pip.exe"
            if (Test-Path $pip) {
                Write-Host "Installing ML requirements via pip (this may take time)..."
                & $pip install -r $reqPath
                $venvOK = $true
                Write-Host "Python venv and requirements installed."
            }
            else {
                Write-Warning "pip not found in created venv; skipping pip install."
            }
        }
        else {
            Write-Warning "Python command returned non-zero; skipping python venv."
        }
    }
    catch {
        Write-Warning "Python/venv step failed: $_"
    }

    # 6) Create predictive integration script in automation_engines/phase8
    $phase8Script = @"
# predictive_connector.ps1 - Phase8 helper
Write-Host 'Predictive connector placeholder. Use this script to call ML worker at http://127.0.0.1:8001/predict'
"@
    $phase8File = Join-Path $phase8Dir "predictive_connector.ps1"
    $phase8Script | Out-File -FilePath $phase8File -Encoding UTF8 -Force
    Write-Host "Phase8 helper written: $phase8File"

    # 7) Create a super-run script that starts ML worker and autopilot
    $runAll = @"
# run_phase8.ps1 - starts ML worker api and autopilot monitor
`$root = '$projectRoot'
`$mlApp = Join-Path `$root 'automation_workers\ml_worker\app'
`$venv = Join-Path `$root 'automation_workers\ml_worker\.venv\Scripts\python.exe'
if (Test-Path `$venv) {
    Start-Process -FilePath `$venv -ArgumentList '\"' + (Join-Path `$mlApp 'api.py') + '\"' -NoNewWindow
    Write-Host 'ML worker started using venv python.'
} else {
    Write-Host 'Venv python not found. Attempting system python...' 
    Start-Process -FilePath 'python' -ArgumentList (Join-Path `$mlApp 'api.py') -NoNewWindow
}
# start super autopilot
if (Test-Path (Join-Path `$root 'system_control\super_autopilot.ps1')) {
    & pwsh -ExecutionPolicy Bypass -File (Join-Path `$root 'system_control\super_autopilot.ps1')
} else {
    Write-Host 'super_autopilot.ps1 not present.'
}
"@
    $runFile = Join-Path $phase8Dir "run_phase8.ps1"
    $runAll | Out-File -FilePath $runFile -Encoding UTF8 -Force
    Write-Host "Combined runner written: $runFile"

    # 8) Create scheduled daily snapshot at 18:00 IST (Windows Task Scheduler) - require admin
    if ($isAdmin) {
        try {
            $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$projectRoot\system_control\run.ps1`""
            $trigger = New-ScheduledTaskTrigger -Daily -At 18:00
            $taskName = "Futurebuilder_DailySnapshot_Phase8"
            Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -RunLevel Highest -Force
            Write-Host "Scheduled daily snapshot task created: $taskName"
        }
        catch {
            Write-Warning "Failed to create scheduled task: $_"
        }
    }
    else {
        Write-Warning "Not admin: skipping scheduled task creation. Run the installer as Admin to enable scheduler."
    }

    # 9) Create permission guard token (if provided)
    if ($AdminToken -ne "") {
        $tokenPath = Join-Path $projectRoot ".admin_token"
        $AdminToken | Out-File -FilePath $tokenPath -Encoding UTF8 -Force
        if ($isAdmin) {
            icacls $tokenPath /inheritance:r | Out-Null
            $currentUser = "$env:USERDOMAIN\$env:USERNAME"
            icacls $tokenPath /grant:r "$currentUser:F" | Out-Null
        }
        Write-Host "Admin token written (protected): $tokenPath"
    }
    else {
        Write-Host "No AdminToken passed. Permission-guard not activated."
    }

    # 10) Create Phase8 README manifest
    $readme = @"
Phase-8: Life Intelligence Engine
- ML FastAPI: automation_workers\ml_worker\app\api.py
- Runner: automation_engines\phase8\run_phase8.ps1
- Predictive connector: automation_engines\phase8\predictive_connector.ps1
- To start everything: pwsh -ExecutionPolicy Bypass -File automation_engines\phase8\run_phase8.ps1
"@
    $readmePath = Join-Path $phase8Dir "README_phase8.txt"
    $readme | Out-File -FilePath $readmePath -Encoding UTF8 -Force

    # 11) Log Phase-8 install
    $installLog = Join-Path $projectRoot "history_logs\phase8_install.log"
    "Phase8 installed at $(Get-Date) - Admin=$isAdmin - venv=$venvOK" | Out-File -FilePath $installLog -Append -Encoding UTF8

    Write-Host "Phase-8 installation complete." -ForegroundColor Green
    Write-Host "`nNext steps:"
    Write-Host "  1) If python is installed, start the worker: pwsh -File automation_engines\phase8\run_phase8.ps1"
    Write-Host "  2) Test predict API: curl -X POST http://127.0.0.1:8001/predict -d '{\"user_id\":\"test\",\"payload\":{}}' -H 'Content-Type:application/json'"
    Write-Host "  3) Check logs: history_logs\phase8_install.log"
}
catch {
    Write-Error "Phase-8 installer failed: $_"
    exit 1
}
