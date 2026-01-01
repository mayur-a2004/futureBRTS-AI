# Self-QA: Scan logs for recent errors
$root = Resolve-Path "$PSScriptRoot\.."
$logs = Get-ChildItem "$root\history_logs\*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($logs) {
    $errors = Select-String -Path $logs.FullName -Pattern "Error|Fail|Exception"
    if ($errors) {
        Write-Host "QA Alert: Found potential issues in recent logs." -ForegroundColor Yellow
    }
    else {
        Write-Host "QA Scan: System Nominal." -ForegroundColor Green
    }
}
