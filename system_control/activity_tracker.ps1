$root = Resolve-Path "$PSScriptRoot\.."
$snapshotDir = "$root\snapshots"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$snapshotFile = "$snapshotDir\$timestamp.json"

$files = Get-ChildItem -Path "$root\project" -Recurse -File | Select-Object FullName, LastWriteTime, Length
$files | ConvertTo-Json -Depth 2 | Out-File $snapshotFile
Write-Host "Activity Snapshot taken: $timestamp" -ForegroundColor Gray
