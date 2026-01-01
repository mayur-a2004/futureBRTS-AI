param()
$root = Split-Path -Parent $PSScriptRoot
$queue = Join-Path $root "phase6_intent_queue.txt"
$banFile = Join-Path $root "phase6_banlist.txt"
$log = Join-Path $root "..\..\history_logs\daily\phase6_ban.log"
if (-not (Test-Path $queue)) { exit 0 }

$lines = Get-Content $queue -ErrorAction SilentlyContinue
if (-not $lines) { exit 0 }

# simple frequency check: same source >2 entries => ban
$group = $lines | ForEach-Object {
    $parts = $_ -split "`t"
    [PSCustomObject]@{ time=$parts[0]; source=$parts[1]; payload=$parts[2] }
}
$counts = $group | Group-Object -Property source
foreach ($g in $counts) {
    if ($g.Count -ge 2) {
        $entry = $g.Name
        if (-not (Select-String -Path $banFile -Pattern [regex]::Escape($entry) -Quiet -ErrorAction SilentlyContinue)) {
            $entry | Out-File -FilePath $banFile -Append -Encoding UTF8
            "$((Get-Date).ToString('s')) BANNED: $entry" | Out-File -FilePath $log -Append -Encoding UTF8
            Write-Host "Auto-Banned: $entry" -ForegroundColor Red
        }
    }
}

# cleanup queue (keep last 100)
$keep = $lines | Select-Object -Last 100
$keep | Out-File -FilePath $queue -Encoding UTF8
