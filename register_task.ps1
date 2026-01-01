$scriptPath = (Resolve-Path ".\automation_master\scheduler\master_scheduler.ps1").Path
Write-Host "Registering task for script: $scriptPath"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At 18:00
Register-ScheduledTask -TaskName "Futurebilder_MasterScheduler" -Action $action -Trigger $trigger -RunLevel Highest -Force
Write-Host "Task registered."
