# install_phase11.ps1
# Phase-11 : Cyber Security / Safe Mode Installer for Futurebilder
# Usage: pwsh -ExecutionPolicy Bypass -File .\system_control\install_phase11.ps1 -AdminToken "OPTIONAL" -Force

param(
    [string]$AdminToken = "",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Write-Host "`n Phase-11 Cyber Security Installer Starting..." -ForegroundColor Cyan

# Root paths
if ($PSScriptRoot) {
    $currentDir = $PSScriptRoot
} else {
    $currentDir = Get-Location
}
Write-Host "Debug: currentDir is '$currentDir'"

# resolve project root
if ((Split-Path $currentDir -Leaf) -eq "system_control") {
    $projectRoot = Split-Path $currentDir -Parent
} else {
    $projectRoot = $currentDir
}
Write-Host "Debug: projectRoot is '$projectRoot'"

$historyDir = Join-Path $projectRoot "history_logs"
$snapshotsDir = Join-Path $projectRoot "snapshots"
$phase11Dir = Join-Path $projectRoot "system_control\phase11_security"
$logFile = Join-Path $historyDir "phase11_install.log"

Write-Host "Debug: phase11Dir is '$phase11Dir'"

# Helper logging
function Log($text) {
    $entry = "{0} - {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $text
    Write-Host $text
    if (-not (Test-Path $historyDir)) { New-Item -ItemType Directory -Path $historyDir -Force | Out-Null }
    $entry | Out-File -FilePath $logFile -Encoding UTF8 -Append
}

# Admin check
function Test-IsAdmin {
    $id = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $p = New-Object System.Security.Principal.WindowsPrincipal($id)
    return $p.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)
}

# 0) Snapshot
function Save-Snapshot {
    if (-not (Test-Path $snapshotsDir)) { New-Item -ItemType Directory -Path $snapshotsDir -Force | Out-Null }
    $timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssK")
    $name = Join-Path $snapshotsDir ("phase11_snapshot_{0}.json" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
    
    # Simple snapshot content to avoid recursion issues
    $snapshotContent = "Snapshot at $timestamp for $projectRoot"
    $snapshotContent | Out-File -FilePath $name -Encoding utf8
    Log "Snapshot saved: $name"
}

# 1) Safety
if (-not (Test-IsAdmin)) {
    Log "WARNING: Not running as Administrator. Some actions will be skipped."
    $isAdmin = $false
} else {
    Log "Running as Administrator."
    $isAdmin = $true
}

# 2) Save snapshot
Save-Snapshot

# 3) Create phase11 folder
if (-not (Test-Path $phase11Dir)) {
    New-Item -ItemType Directory -Path $phase11Dir -Force | Out-Null
    Log "Created phase11 security folder: $phase11Dir"
} else {
    Log "Phase11 folder exists: $phase11Dir"
}

# subfolders
$sub = @("audit","hooks","quarantine","policies")
foreach ($s in $sub) {
    $p = Join-Path $phase11Dir $s
    if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p -Force | Out-Null; Log "Created: $p" }
}

# 4) Write lockdown policy
$lockdown = Join-Path $phase11Dir "policies\lockdown_policy.ps1"
Write-Host "Debug: Writing lockdown to '$lockdown'"

$nl = [Environment]::NewLine
$lockdownContent = '# lockdown_policy.ps1' + $nl
$lockdownContent += '# Non-destructive policy.' + $nl
$lockdownContent += 'param([switch]$Apply)' + $nl
$lockdownContent += $nl
$lockdownContent += 'Write-Host "Lockdown policy loaded. Apply flag: " $Apply' + $nl
$lockdownContent += $nl
$lockdownContent += 'if ($Apply) {' + $nl
$lockdownContent += '    Write-Host "Applying sample policy: disable project autoruns for non-admin users (demo)."' + $nl
$lockdownContent += '    New-Item -ItemType File -Path (Join-Path $PSScriptRoot "..\policy_applied.flag") -Force | Out-Null' + $nl
$lockdownContent += '    Write-Host "Policy applied (flag created)."' + $nl
$lockdownContent += '} else {' + $nl
$lockdownContent += '    Write-Host "Dry-run: no policy changes made."' + $nl
$lockdownContent += '}' + $nl

$lockdownContent | Out-File -FilePath $lockdown -Encoding UTF8 -Force
Log "Wrote lockdown policy: $lockdown"

# 5) Write audit script
$audit = Join-Path $phase11Dir "audit\watchdog_audit.ps1"
$auditContent = '# watchdog_audit.ps1' + $nl
$auditContent += '$out = Join-Path (Split-Path $PSScriptRoot -Parent) "..\history_logs\phase11_watchdog.log"' + $nl
$auditContent += '$pows = Get-WmiObject Win32_Process -Filter "name=''powershell.exe''" | Select-Object ProcessId,CommandLine' + $nl
$auditContent += '$pows | ConvertTo-Json | Out-File -FilePath $out -Encoding utf8 -Append' + $nl

$auditContent | Out-File -FilePath $audit -Encoding UTF8 -Force
Log "Wrote audit script: $audit"

# 6) Secure ACLs
$currentUser = "$env:USERDOMAIN\$env:USERNAME"
try {
    icacls $phase11Dir /inheritance:r | Out-Null
    icacls $phase11Dir /grant:r "${currentUser}:(OI)(CI)F" | Out-Null
    icacls $phase11Dir /grant:r "SYSTEM:(OI)(CI)F" | Out-Null
    Log "Set restrictive ACLs on $phase11Dir for $currentUser and SYSTEM."
} catch {
    Log "ACL set failed or skipped: $_"
}

# 7) Firewall rules
if ($isAdmin) {
    try {
        $ruleName = "Futurebilder_Block_MLWorker_Remote"
        $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
        if (-not $existing) {
            New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Block -LocalPort 8001 -Protocol TCP -Profile Any -Description "Block external access to ML worker (allow only localhost)" | Out-Null
            Log "Firewall rule created: $ruleName"
        } else {
            Log "Firewall rule exists: $ruleName"
        }
    } catch {
        Log "Firewall operation failed: $_"
    }
} else {
    Log "Admin required for firewall rules."
}

# 8) Scheduled Task
$taskName = "Futurebilder_Phase11_Audit"
if ($isAdmin) {
    try {
        $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$audit`""
        $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1)
        if (-not (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue)) {
            Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -RunLevel Highest -Force | Out-Null
            Log "Scheduled audit task registered: $taskName"
        } else {
            Log "Scheduled task already exists: $taskName"
        }
    } catch {
        Log "Scheduled task registration failed: $_"
    }
} else {
    Log "Admin required for scheduled tasks."
}

# 9) Quarantine
$quarantineFlag = Join-Path $phase11Dir "quarantine\QUARANTINE_README.txt"
"Quarantine area for Phase11." | Out-File -FilePath $quarantineFlag -Encoding UTF8 -Force
Log "Quarantine placeholder created."

# 10) Finalize
Save-Snapshot
Log "Phase-11 installation completed."

Write-Host "`n Phase-11 (Cyber Security) installed. Review log at: $logFile" -ForegroundColor Green
if (-not $isAdmin) { Write-Host "Note: Run this script as Administrator to enable firewall & scheduled tasks features." -ForegroundColor Yellow }
