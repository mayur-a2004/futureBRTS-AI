# automation_phase3_install.ps1
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$enginesDir = Join-Path $root 'automation_engines'
If (-not (Test-Path $enginesDir)) { New-Item -ItemType Directory -Path $enginesDir | Out-Null }

function Write-FileIfChanged {
    param($Path, $Content)
    $prev = if (Test-Path $Path) { Get-Content -Raw -ErrorAction SilentlyContinue $Path } else { '' }
    if ($prev -ne $Content) {
        $Content | Out-File -FilePath $Path -Encoding UTF8 -Force
        Write-Host "Wrote: $Path"
    }
    else {
        Write-Host "Unchanged: $Path"
    }
}

# engine templates (shortened names)
$files = @{
    'task_engine.ps1'       = @'
# task_engine.ps1
param([switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\task_engine.log"
"Run at $(Get-Date) (WhatIf=$WhatIf)" | Out-File -Append $log
# Simple task loader: reads project_flow\module_queue.txt if exists
$queue = Join-Path $root "..\project_flow\module_queue.txt"
if (Test-Path $queue) {
    $tasks = Get-Content $queue | Where-Object { $_.Trim() -ne "" }
    "Loaded tasks: $($tasks.Count)" | Out-File -Append $log
    # Simple split: create task files under history_logs/daily as snapshots
    foreach ($t in $tasks) {
        $id = [Guid]::NewGuid().ToString().Substring(0,8)
        $out = Join-Path $root "..\history_logs\daily\task_$id.txt"
        $text = "Task:$t`nAssigned:AutoEngine`nCreated:$(Get-Date)"
        if (-not $WhatIf) { $text | Out-File -FilePath $out -Force }
        "Task created: $out" | Out-File -Append $log
    }
} else {
    "No queue found: $queue" | Out-File -Append $log
}
'@
    'activity_tracker.ps1'  = @'
# activity_tracker.ps1
param([int]$WindowMinutes = 10, [switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\activity_tracker.log"
"Snapshot at $(Get-Date)" | Out-File -Append $log
# scan recent modified files under project
$cutoff = (Get-Date).AddMinutes(-$WindowMinutes)
$modified = Get-ChildItem -Path (Join-Path $root '..\project') -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -ge $cutoff }
"Modified count: $($modified.Count)" | Out-File -Append $log
foreach ($f in $modified) {
    $line = "$($f.FullName) | $($f.LastWriteTime)"
    if (-not $WhatIf) { $line | Out-File -Append $log }
}
# write snapshot file
$snap = Join-Path $root "..\snapshots\snapshot_$(Get-Date -Format yyyyMMdd_HHmmss).json"
$meta = @{
    time = (Get-Date).ToString()
    modified = $modified | Select-Object FullName, LastWriteTime
} | ConvertTo-Json -Depth 4
if (-not $WhatIf) { $meta | Out-File -FilePath $snap -Encoding UTF8 }
"Snapshot saved: $snap" | Out-File -Append $log
'@
    'permission_guard.ps1'  = @'
# permission_guard.ps1
param([switch]$AutoQuarantine, [switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\permission_guard.log"
"Guard run at $(Get-Date)" | Out-File -Append $log
# Define allowed creators (you can add system accounts)
$allowedPaths = @(
    Join-Path $root '..\project',
    Join-Path $root '..\automation_engines'
)
# scan for suspicious new files in root
$items = Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue
foreach ($i in $items) {
    $path = $i.FullName
    $ok = $false
    foreach ($a in $allowedPaths) { if ($path -like "$a*") { $ok = $true } }
    if (-not $ok) {
        $msg = "Suspicious file: $path"
        $msg | Out-File -Append $log
        if ($AutoQuarantine -and -not $WhatIf) {
            $qdir = Join-Path $root '..\quarantine'
            if (-not (Test-Path $qdir)) { New-Item -ItemType Directory -Path $qdir | Out-Null }
            Move-Item -Path $path -Destination $qdir -Force
            "Quarantined: $path -> $qdir" | Out-File -Append $log
        }
    }
}
'@
    'qa_engine.ps1'         = @'
# qa_engine.ps1
param([switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\qa_engine.log"
"QA run at $(Get-Date)" | Out-File -Append $log
# Basic checks:
$errs = @()
# 1) check package.json in frontend/backend
$fe = Join-Path $root "..\project\frontend\package.json"
$be = Join-Path $root "..\project\backend\package.json"
if (-not (Test-Path $fe)) { $errs += "Missing frontend/package.json" }
if (-not (Test-Path $be)) { $errs += "Missing backend/package.json" }
# 2) detect .next or dist in repo root (should be inside project)
$illegal = Get-ChildItem -Path $root -Filter ".next","dist" -Recurse -ErrorAction SilentlyContinue
foreach ($i in $illegal) { $errs += "Nonstandard build output: $($i.FullName)" }
if ($errs.Count -eq 0) { "QA OK" | Out-File -Append $log } else { $errs | Out-File -Append $log }
'@
    'event_trigger.ps1'     = @'
# event_trigger.ps1
param([string]$Event='daily_snapshot', [switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\event_trigger.log"
"Trigger: $Event at $(Get-Date)" | Out-File -Append $log
switch ($Event) {
    'daily_snapshot' {
        & (Join-Path $root 'activity_tracker.ps1') -WhatIf:$WhatIf
    }
    'quick_qa' {
        & (Join-Path $root 'qa_engine.ps1') -WhatIf:$WhatIf
    }
    default {
        "Unknown event: $Event" | Out-File -Append $log
    }
}
'@
    'sync_engine.ps1'       = @'
# sync_engine.ps1
param([switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\sync_engine.log"
"Sync run at $(Get-Date)" | Out-File -Append $log
# simple compare: list js/ts files in frontend vs backend
$feFiles = Get-ChildItem -Path (Join-Path $root '..\project\frontend') -Recurse -Include *.js,*.ts -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
$beFiles = Get-ChildItem -Path (Join-Path $root '..\project\backend') -Recurse -Include *.js,*.ts -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
$missingInBackend = $feFiles | Where-Object { $_ -notin $beFiles } | Select-Object -Unique
if ($missingInBackend.Count -gt 0) {
    "Missing server-side counterparts: $($missingInBackend -join ', ')" | Out-File -Append $log
} else {
    "Sync OK" | Out-File -Append $log
}
'@
    'predictive_engine.ps1' = @'
# predictive_engine.ps1
param([switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\predictive_engine.log"
"Predictive run at $(Get-Date)" | Out-File -Append $log
# crude heuristic: if lots of modified files in last 1 hour -> risk high
$cut = (Get-Date).AddHours(-1)
$mods = Get-ChildItem -Path (Join-Path $root '..\project') -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -ge $cut }
$risk = if ($mods.Count -gt 30) { 'HIGH' } elseif ($mods.Count -gt 10) { 'MEDIUM' } else { 'LOW' }
"Modified in last hour: $($mods.Count). Risk: $risk" | Out-File -Append $log
'@
    'perf_optimizer.ps1'    = @'
# perf_optimizer.ps1
param([switch]$Apply, [switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\perf_optimizer.log"
"Perf run at $(Get-Date) Apply=$Apply WhatIf=$WhatIf" | Out-File -Append $log
# cleanup large logs older than 30 days
$age = (Get-Date).AddDays(-30)
$logs = Get-ChildItem -Path (Join-Path $root '..') -Recurse -Include *.log -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $age -and $_.Length -gt 1kb }
foreach ($l in $logs) {
    "Old log: $($l.FullName) size:$($l.Length)" | Out-File -Append $log
    if ($Apply -and -not $WhatIf) { Remove-Item -Path $l.FullName -Force }
}
"Perf done" | Out-File -Append $log
'@
    'seo_engine.ps1'        = @'
# seo_engine.ps1
param([switch]$WhatIf)
$root = $PSScriptRoot
$log = Join-Path $root "..\history_logs\seo_engine.log"
"SEO run at $(Get-Date)" | Out-File -Append $log
$pages = Get-ChildItem -Path (Join-Path $root '..\project\frontend') -Recurse -Include *.html,*.htm -ErrorAction SilentlyContinue
foreach ($p in $pages) {
    $txt = Get-Content -Raw -Path $p.FullName -ErrorAction SilentlyContinue
    if ($txt -notmatch '<meta\s+name=["'']description') {
        "Missing meta description: $($p.FullName)" | Out-File -Append $log
    }
}
"SEO scan complete" | Out-File -Append $log
'@
}

# write files
foreach ($name in $files.Keys) {
    $path = Join-Path $enginesDir $name
    Write-FileIfChanged -Path $path -Content $files[$name]
}

# ensure history_logs exists
$hl = Join-Path $root 'history_logs'
If (-not (Test-Path $hl)) { New-Item -ItemType Directory -Path $hl | Out-Null }
Write-Host "Phase-3 automation engines installed at $enginesDir"
