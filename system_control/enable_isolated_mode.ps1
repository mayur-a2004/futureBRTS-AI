param()
Write-Host "Enabling Futurebilder ISOLATED MODE..." -ForegroundColor Cyan

$root = Split-Path $PSScriptRoot -Parent
$runtime = Join-Path $root ".local_runtime"

if (-not (Test-Path $runtime)) {
    New-Item -ItemType Directory -Path $runtime | Out-Null
}

# Save isolated flag
$flag = Join-Path $runtime "ISOLATED_MODE"
"ENABLED" | Out-File $flag -Encoding UTF8 -Force

Write-Host "Isolated execution mode ENABLED."
Write-Host "All automation will now run ONLY inside Antigravity."
Write-Host "No Windows scheduled tasks will be used." -ForegroundColor Yellow
