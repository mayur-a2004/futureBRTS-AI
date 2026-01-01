param(
    [string]$Query = "Status Check",
    [string]$User = "Admin"
)

Write-Host "
[AI] Predictive Engine Triggered" -ForegroundColor Cyan

try {
    $body = @{
        query = $Query
        user  = $User
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8001/predict" -Method POST -Body $body -ContentType "application/json"

    Write-Host "[AI-Response] 	 $($response.result)" -ForegroundColor Green
    Write-Host "[Confidence]  	 $($response.confidence)" -ForegroundColor Gray

    # Save history
    $logPath = Join-Path "C:\Users\Admin\.gemini\antigravity\futurebilder_tool\history_logs\predictive_engine" ("predict_" + (Get-Date -Format "yyyy-MM-dd_HH-mm-ss") + ".log")
    $body | Out-File $logPath
    "
AI Response:
" + ($response | ConvertTo-Json) | Out-File -Append $logPath

    return $response.result
}
catch {
    Write-Host "[ERROR] ML Worker not responding! ($_)" -ForegroundColor Red
    return "ERROR: Unable to fetch prediction."
}
