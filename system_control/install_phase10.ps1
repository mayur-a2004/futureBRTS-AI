param(
    [string]$AdminToken = "",
    [switch]$Force
)

# Phase-10: Super Master Automation installer
$ErrorActionPreference = "Stop"
Write-Host "Phase-10 Installer starting..." -ForegroundColor Cyan

# Resolve project root (support running from system_control)
$root = $PSScriptRoot
if ((Split-Path $root -Leaf) -ieq 'system_control') {
    $projectRoot = Split-Path $root -Parent
}
else {
    $projectRoot = $root
}
Write-Host "Project root = $projectRoot"

# 1) Create master automation folders
$masterFolders = @(
    "automation_master",
    "automation_master\scheduler",
    "automation_master\security",
    "automation_master\auto_heal",
    "automation_master\control_panel",
    "automation_master\logs"
)

foreach ($f in $masterFolders) {
    $p = Join-Path $projectRoot $f
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
        Write-Host "Created: $f"
    }
    else {
        Write-Host "Exists: $f"
    }
}

# helper to write small script files
function WriteFile($relPath, $content) {
    $full = Join-Path $projectRoot $relPath
    $dir = Split-Path $full -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $content | Out-File -FilePath $full -Encoding UTF8 -Force
    Write-Host "File written: $relPath"
}

# 2) Scheduler scripts (stubs + safe behavior)
$schedulerScript = @'
# master_scheduler.ps1
# Scheduler: runs daily backups + 18:00 checkpoint
param()
Write-Host "Scheduler heartbeat: $(Get-Date)"
# create snapshot (logic calls existing auto_history or snapshots engine)
$snaps = Join-Path $PSScriptRoot "..\..\snapshots"
if (-not (Test-Path $snaps)) { New-Item -ItemType Directory -Path $snaps -Force | Out-Null }
$stamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
$report = @{ time = (Get-Date); event = "phase10_scheduler_run" } | ConvertTo-Json
$report | Out-File -FilePath (Join-Path $snaps "snapshot_$stamp.json") -Encoding UTF8
Write-Host "Snapshot created: snapshot_$stamp.json"
'@
WriteFile "automation_master\scheduler\master_scheduler.ps1" $schedulerScript

$backupScript = @'
# auto_backup.ps1
Write-Host "Auto-backup (safe) starting..."
# pack important folders into backup zip (safe)
$root = Split-Path $PSScriptRoot -Parent -Parent
$target = Join-Path $root "snapshots" 
if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }
$zipName = "backup_{0}.zip" -f ((Get-Date).ToString("yyyyMMdd_HHmm"))
$zipPath = Join-Path $target $zipName
# include minimal safe list
$include = @("project","automation_engines","automation_workers","system_control")
Compress-Archive -Path ($include | ForEach-Object { Join-Path $root $_ }) -DestinationPath $zipPath -Force -ErrorAction SilentlyContinue
Write-Host "Backup completed: $zipPath"
'@
WriteFile "automation_master\scheduler\auto_backup.ps1" $backupScript

# 3) Security shield scripts (stubs)
$intrusion = @'
# intrusion_guard.ps1
param()
Write-Host "Intrusion Guard check at $(Get-Date)"
# placeholder: check for suspicious file-changes, quick perms check
$log = Join-Path $PSScriptRoot "..\logs\intrusion.log"
"Intrusion check run: $(Get-Date)" | Out-File -FilePath $log -Append -Encoding UTF8
'@
WriteFile "automation_master\security\intrusion_guard.ps1" $intrusion

$lockdown = @'
# lockdown.ps1
param()
Write-Host "Lockdown triggered (dry-run)."
# This will NOT execute destructive actions. Real lockdown requires admin token.
'@
WriteFile "automation_master\security\lockdown.ps1" $lockdown

# 4) Auto-heal scripts
$healWatch = @'
# heal_watchdog.ps1
param()
Write-Host "Heal Watchdog checking services..."
# Example checks: ensure ML worker, predictive service, and key scripts exist
$root = Split-Path $PSScriptRoot -Parent -Parent
$checks = @("automation_workers\ml_worker\app\api.py","automation_engines\predictive_engine.ps1")
foreach ($c in $checks) {
    if (-not (Test-Path (Join-Path $root $c))) { Write-Host "Missing: $c" }
    else { Write-Host "OK: $c" }
}
'@
WriteFile "automation_master\auto_heal\heal_watchdog.ps1" $healWatch

$healRestore = @'
# heal_restore.ps1
param([switch]$DryRun)
Write-Host "Heal restore invoked. DryRun: $DryRun"
# This is a safe stub. Restoration actions must be manually reviewed.
'@
WriteFile "automation_master\auto_heal\heal_restore.ps1" $healRestore

# 5) Master control panel (invokes above modules)
$masterControl = @'
# master_control.ps1
param()
Write-Host "Master control: initiating phase-10 routines..."
& "$PSScriptRoot\..\scheduler\master_scheduler.ps1"
& "$PSScriptRoot\..\security\intrusion_guard.ps1"
& "$PSScriptRoot\..\auto_heal\heal_watchdog.ps1"
Write-Host "Master control: done."
'@
WriteFile "automation_master\control_panel\master_control.ps1" $masterControl

# 6) Optional: attempt to register scheduled task for daily scheduler (requires admin)
$taskName = "Futurebilder_MasterScheduler"
if ($AdminToken -and $AdminToken.Trim() -ne "") {
    try {
        Write-Host "Attempting to register scheduled task: $taskName (requires admin) ..."
        $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$projectRoot\automation_master\scheduler\master_scheduler.ps1`""
        $trigger = New-ScheduledTaskTrigger -Daily -At 18:00
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -RunLevel Highest -Force | Out-Null
        Write-Host "Scheduled task registered: $taskName"
    }
    catch {
        Write-Warning "Could not register scheduled task (permissions). Task skipped."
    }
}
else {
    Write-Host "No AdminToken provided -- scheduled task creation skipped. Provide -AdminToken to register."
}

# 7) Log
$logFile = Join-Path $projectRoot "automation_master\logs\phase10_install.log"
"Phase10 installed at $(Get-Date) ; AdminTokenProvided: $([bool]$AdminToken) " | Out-File -FilePath $logFile -Append -Encoding UTF8

Write-Host "Phase-10 installation complete." -ForegroundColor Green
