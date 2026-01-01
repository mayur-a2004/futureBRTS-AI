# master_control.ps1
param()
Write-Host "Master control: initiating phase-10 routines..."
& "$PSScriptRoot\..\scheduler\master_scheduler.ps1"
& "$PSScriptRoot\..\security\intrusion_guard.ps1"
& "$PSScriptRoot\..\auto_heal\heal_watchdog.ps1"
Write-Host "Master control: done."
