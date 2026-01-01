# system_control\phase8_intent_analyzer.ps1
# Usage: pwsh -File .\system_control\phase8_intent_analyzer.ps1 -Input "check system status"

param(
    [Parameter(Mandatory = $true)][string]$InputString
)

$ErrorActionPreference = "Stop"
$mlUrl = "http://127.0.0.1:8001/predict"

Write-Host "🧠 Phase-8 Intent Analyzer (AI)" -ForegroundColor Cyan
Write-Host "Input: $InputString"

try {
    $body = @{
        user_id = "admin_user"
        payload = @{
            text = $InputString
            mode = "intent_classification"
        }
    } | ConvertTo-Json -Depth 2 -Compress

    # Use curl/Invoke-RestMethod
    # Note: Using Invoke-RestMethod for parsing ease
    $response = Invoke-RestMethod -Uri $mlUrl -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
    
    Write-Host "`n[AI Response]" -ForegroundColor Green
    Write-Host "Prediction: $($response.prediction)"
    Write-Host "Confidence: $($response.score)"
    Write-Host "Raw: $($response | ConvertTo-Json -Depth 2)"

}
catch {
    Write-Error "Failed to contact ML Worker at $mlUrl. Is it running?"
    Write-Error $_
}
