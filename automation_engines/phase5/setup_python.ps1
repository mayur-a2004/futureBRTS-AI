$ErrorActionPreference = "Stop"
Write-Host "🐍 Setting up Python Environment for Phase-5..." -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Create Virtual Env
if (-not (Test-Path "$root\.venv")) {
    Write-Host "Creating .venv..."
    python -m venv "$root\.venv"
}
else {
    Write-Host ".venv exists."
}

# 2. Upgrade pip
Write-Host "Upgrading pip..."
& "$root\.venv\Scripts\python" -m pip install --upgrade pip

# 3. Install Requirements
if (Test-Path "$root\requirements.txt") {
    Write-Host "Installing requirements..."
    & "$root\.venv\Scripts\pip" install -r "$root\requirements.txt"
}

Write-Host "✅ Python Environment Ready." -ForegroundColor Green
Write-Host "To activate manually: .\.venv\Scripts\Activate.ps1"
