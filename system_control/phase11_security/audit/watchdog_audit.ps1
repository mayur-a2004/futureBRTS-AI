# watchdog_audit.ps1
$out = Join-Path (Split-Path $PSScriptRoot -Parent) "..\history_logs\phase11_watchdog.log"
$pows = Get-WmiObject Win32_Process -Filter "name='powershell.exe'" | Select-Object ProcessId,CommandLine
$pows | ConvertTo-Json | Out-File -FilePath $out -Encoding utf8 -Append

