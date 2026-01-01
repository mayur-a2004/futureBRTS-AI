# shutdown_system.ps1
Write-Host "Shutdown requested..." -ForegroundColor Yellow

# 1. Graceful Shutdown (API request)
try { 
    Write-Host "Attempting graceful API shutdown..."
    Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8001/shutdown -TimeoutSec 5 -ErrorAction SilentlyContinue
}
catch {
    # It might fail if already down or endpoint doesn't exist
}

# 2. Force Kill (Safety Net)
# Matching processes running from the project directory (futurebilder_tool)
$procs = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*futurebilder_tool*" -or $_.Path -like "*futurebuilder_tool*" }

if ($procs) {
    Write-Host "Forcing shutdown for $($procs.Count) python process(es)..."
    $procs | Stop-Process -Force
}

Write-Host "System stopped." -ForegroundColor Green
