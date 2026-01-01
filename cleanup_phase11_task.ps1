try {
    Unregister-ScheduledTask -TaskName "Futurebilder_Phase11_Audit" -Confirm:$false -ErrorAction Stop
    Write-Host "Task unregistered."
} catch {
    Write-Host "Task not found or access denied."
}
