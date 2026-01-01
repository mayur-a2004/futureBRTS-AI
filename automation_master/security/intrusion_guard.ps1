# intrusion_guard.ps1
param()
Write-Host "Intrusion Guard check at $(Get-Date)"
# placeholder: check for suspicious file-changes, quick perms check
$log = Join-Path $PSScriptRoot "..\logs\intrusion.log"
"Intrusion check run: $(Get-Date)" | Out-File -FilePath $log -Append -Encoding UTF8
