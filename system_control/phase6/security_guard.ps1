param(
    [string]$Token
)
# security_guard: require admin token for sensitive actions
$tokenFile = Join-Path $PSScriptRoot ".admin_token"
if (-not (Test-Path $tokenFile)) {
    Write-Error "Admin token not configured. Abort."
    exit 1
}
$expected = (Get-Content $tokenFile -Raw).Trim()
if ($Token -ne $expected) {
    Write-Host "ADMIN CHECK FAILED" -ForegroundColor Red
    exit 2
}
Write-Host "ADMIN CHECK OK" -ForegroundColor Green
