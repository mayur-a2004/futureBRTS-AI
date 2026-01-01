param([switch]$Apply)
$root = Split-Path -Parent $PSScriptRoot
$protectPaths = @(
    (Join-Path $root "..\..\project"),
    (Join-Path $root "..\..\system_control"),
    (Join-Path $root "..\..\automation_engines")
)
Write-Host "LOCKDOWN MODE preview. Paths to restrict:"
$protectPaths | ForEach-Object { Write-Host " -> $_" }
if ($Apply) {
    foreach ($p in $protectPaths) {
        if (Test-Path $p) {
            Write-Host "Restricting writes for $p"
            # remove inherited perms and grant Full to current user only
            # Removing inheritance
            icacls $p /inheritance:r
            
            # Granting permissions (User + Admins)
            icacls $p /grant:r "${me}:F"
            icacls $p /grant "Administrators:F"
            icacls $p /grant "System:F"
        }
    }
    Write-Host "Lockdown applied."
} else {
    Write-Host "Dry-run only. Re-run with -Apply to enforce."
}
