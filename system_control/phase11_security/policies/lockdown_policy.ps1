# lockdown_policy.ps1
# Non-destructive policy.
param([switch]$Apply)

Write-Host "Lockdown policy loaded. Apply flag: " $Apply

if ($Apply) {
    Write-Host "Applying sample policy: disable project autoruns for non-admin users (demo)."
    New-Item -ItemType File -Path (Join-Path $PSScriptRoot "..\policy_applied.flag") -Force | Out-Null
    Write-Host "Policy applied (flag created)."
} else {
    Write-Host "Dry-run: no policy changes made."
}

