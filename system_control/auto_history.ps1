$root = Resolve-Path "$PSScriptRoot\.."
$historyFile = "$root\history_logs\history_$(Get-Date -Format 'yyyy-MM-dd').txt"

if (-not (Test-Path $historyFile)) {
    "HISTORY STARTED: $(Get-Date)" | Out-File $historyFile
    Write-Host "New History File Created." -ForegroundColor Gray
}

# Append Snapshot of file structure
"--- SNAPSHOT $(Get-Date) ---" | Out-File -Append $historyFile
Get-ChildItem -Path $root -Recurse -Depth 2 | Select-Object FullName, LastWriteTime | Out-String | Out-File -Append $historyFile
