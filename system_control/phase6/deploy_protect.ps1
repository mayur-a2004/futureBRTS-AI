param(
    [string]$AdminToken,
    [string]$Command
)
$tokenFile = Join-Path $PSScriptRoot ".admin_token"
if (-not (Test-Path $tokenFile)) { Write-Error "No admin token"; exit 1 }
$expected = (Get-Content $tokenFile -Raw).Trim()
if ($AdminToken -ne $expected) { Write-Host "Deploy denied: bad token" -ForegroundColor Red; exit 2 }
Write-Host "Deploy authorized. Running: $Command"
Invoke-Expression $Command
