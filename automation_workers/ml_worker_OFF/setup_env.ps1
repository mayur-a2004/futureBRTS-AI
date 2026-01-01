Write-Host "Setting up Python venv..."
$root = $PSScriptRoot
if (-not (Test-Path "$root\.venv")) {
    python -m venv "$root\.venv"
}
& "$root\.venv\Scripts\python" -m pip install --upgrade pip
& "$root\.venv\Scripts\pip" install -r "$root\requirements.txt"
Write-Host "ML Worker Environment Ready."
