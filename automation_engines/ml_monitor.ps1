Write-Host "Starting ML Health Monitor..."
while ($true) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:8001/health" -TimeoutSec 2 -ErrorAction Stop
        if ($res.status -eq 'ok') {
            # Write-Host "." -NoNewline
        }
    }
    catch {
        Write-Host "
[ML Worker Down] Triggering Auto-Heal..." -ForegroundColor Yellow
        # Use the system launcher to ensure correct venv usage
        Start-Process "powershell" -ArgumentList "-ExecutionPolicy Bypass -File .\run_system.ps1" -WindowStyle Hidden
        Start-Sleep -Seconds 5
    }
    Start-Sleep -Seconds 10
}
