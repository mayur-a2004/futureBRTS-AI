$ErrorActionPreference = "SilentlyContinue"
Unregister-ScheduledTask -TaskName "Futurebilder_MasterScheduler" -Confirm:$false
if ($?) {
    Write-Host "Task unregistered."
}
else {
    Write-Host "Task not active or access denied."
}
