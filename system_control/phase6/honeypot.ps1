param()
$root = Split-Path -Parent $PSScriptRoot
$hpDir = Join-Path $root "phase6_honeypot"
New-Item -Path $hpDir -ItemType Directory -Force | Out-Null
# create simple trap files
1..5 | ForEach-Object {
    $f = Join-Path $hpDir ("trap_{0}.txt" -f $_)
    "This is a trap. Access logged at $(Get-Date)" | Out-File -FilePath $f -Encoding UTF8 -Force
}
# create watchfile
$watch = Join-Path $root "phase6_honeypot_access.log"
Get-ChildItem -Path $hpDir -Recurse | ForEach-Object {
    $_.FullName | Out-File -FilePath $watch -Append -Encoding UTF8
}
Write-Host "Honeypot created at $hpDir"
