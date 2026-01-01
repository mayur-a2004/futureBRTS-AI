# system_control\lockdown_system.ps1
# Comprehensive Security Lockdown & Diagnostics Wrapper

param(
    [switch]$Apply,
    [switch]$Diagnostics
)

$ErrorActionPreference = "Continue"
Write-Host "FUTUREBILDER SYSTEM LOCKDOWN PROTOCOL" -ForegroundColor Red

$root = $PSScriptRoot
$projectRoot = Split-Path $root -Parent

# 1. Phase-6 Core Lockdown
$p6 = Join-Path $root "phase6\lockdown.ps1"
if (Test-Path $p6) {
    Write-Host "`n[Phase-6] Core Access Control:" -ForegroundColor Yellow
    if ($Apply) {
        & pwsh -File $p6 -Apply
    }
    else {
        & pwsh -File $p6 
    }
}

# 2. Phase-8 Sentinel Self-Defense
$p8 = Join-Path $root "phase8_sentinel\self_defense.ps1"
if (Test-Path $p8) {
    Write-Host "`n[Phase-8] Sentinel Self-Defense:" -ForegroundColor Yellow
    & pwsh -File $p8
}
else {
    Write-Host "[Phase-8] Sentinel not found." -ForegroundColor DarkGray
}

# 3. Phase-8 Integrity Check
$p8w = Join-Path $root "phase8_sentinel\integrity_watchdog.ps1"
if (Test-Path $p8w) {
    Write-Host "`n[Phase-8] Integrity Watchdog:" -ForegroundColor Yellow
    & pwsh -File $p8w
}

# 4. Diagnostics Mode
if ($Diagnostics) {
    Write-Host "`n[Diagnostics] detailed permission report..." -ForegroundColor Cyan
    $targets = @("system_control", "automation_engines", ".admin_token")
    foreach ($t in $targets) {
        $tp = Join-Path $projectRoot $t
        if (Test-Path $tp) {
            $acl = Get-Acl $tp
            Write-Host "Target: $t | Owner: $($acl.Owner)"
            if ($acl.Access) {
                foreach ($rule in $acl.Access) {
                    Write-Host "  - $($rule.IdentityReference): $($rule.FileSystemRights) ($($rule.AccessControlType))"
                }
            }
        }
    }
}

Write-Host "`nLockdown Protocol Complete." -ForegroundColor Green
