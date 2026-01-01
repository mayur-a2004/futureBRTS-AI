# run_phase8.ps1 - starts ML worker api and autopilot monitor
$root = 'C:\Users\Admin\.gemini\antigravity\futurebilder_tool'
$mlApp = Join-Path $root 'automation_workers\ml_worker\app'
$venv = Join-Path $root 'automation_workers\ml_worker\.venv\Scripts\python.exe'
if (Test-Path $venv) {
    $api = Join-Path $mlApp 'api.py'
    Start-Process -FilePath $venv -ArgumentList "`"$api`"" -NoNewWindow
    Write-Host 'ML worker started using venv python.'
}
else {
    Write-Host 'Venv python not found. Attempting system python...' 
    Start-Process -FilePath 'python' -ArgumentList (Join-Path $mlApp 'api.py') -NoNewWindow
}
# start super autopilot
if (Test-Path (Join-Path $root 'system_control\super_autopilot.ps1')) {
    & pwsh -ExecutionPolicy Bypass -File (Join-Path $root 'system_control\super_autopilot.ps1')
}
else {
    Write-Host 'super_autopilot.ps1 not present.'
}
