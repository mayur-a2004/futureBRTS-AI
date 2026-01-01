param(
    [Parameter(Mandatory = $true)][string]$AdminToken,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot  # caller should run from futurebilder_tool\system_control
$phaseDir = Join-Path $root "system_control\phase6"
New-Item -Path $phaseDir -ItemType Directory -Force | Out-Null

# Helper: write file utility
function Write-PhaseFile($name, $content) {
    $path = Join-Path $phaseDir $name
    $content | Out-File -FilePath $path -Encoding UTF8 -Force
    Write-Host "Created: $path"
}

# 1) save admin token (secure-ish)
$tokenPath = Join-Path $phaseDir ".admin_token"
$AdminToken | Out-File -FilePath $tokenPath -Encoding UTF8 -Force
icacls $tokenPath /inheritance:r | Out-Null
# Allow only current user read/write
$currentUser = "$env:USERDOMAIN\$env:USERNAME"
icacls $tokenPath /grant:r "$currentUser:F" | Out-Null
Write-Host "Admin token stored (protected)."

# 2) security_guard.ps1
$guard = @'
param(
    [string]$Token
)
# security_guard: require admin token for sensitive actions
$tokenFile = Join-Path $PSScriptRoot ".admin_token"
if (-not (Test-Path $tokenFile)) {
    Write-Error "Admin token not configured. Abort."
    exit 1
}
$expected = (Get-Content $tokenFile -Raw).Trim()
if ($Token -ne $expected) {
    Write-Host "ADMIN CHECK FAILED" -ForegroundColor Red
    exit 2
}
Write-Host "ADMIN CHECK OK" -ForegroundColor Green
'@
Write-PhaseFile "security_guard.ps1" $guard

# 3) intent_analyzer.ps1 (regex-based quick analyzer)
$intent = @'
param(
    [string]$InputText,
    [string]$Source = "unknown"
)

$root = Split-Path -Parent $PSScriptRoot
$log = Join-Path $root "..\..\history_logs\daily\phase6_intent.log"
if (-not (Test-Path (Split-Path $log))) { New-Item -ItemType Directory -Path (Split-Path $log) -Force | Out-Null }

# suspicious keywords (extendable)
$dangerWords = @(
    "drop\s+table", "delete\s+from", "exec\s+", "shutdown", "format\s+disk", "rm\s+-rf",
    "password", "passwd", "credentials", "open\s+port", "bindshell", "reverse\s+shell"
)
$matched = @()
foreach ($w in $dangerWords) {
    if ($InputText -match $w) { $matched += $w }
}

$out = @{
    time = (Get-Date).ToString("s")
    source = $Source
    input = $InputText
    matches = $matched
}
$outJson = ($out | ConvertTo-Json -Depth 3)
$outJson | Out-File -FilePath $log -Append -Encoding UTF8

if ($matched.Count -gt 0) {
    # escalate to auto-ban queue
    $q = Join-Path $root "phase6_intent_queue.txt"
    "$((Get-Date).ToString('s')) `t $Source `t $InputText" | Out-File -FilePath $q -Append -Encoding UTF8
    Write-Host "Suspicious intent detected -> queued" -ForegroundColor Yellow
    exit 3
} else {
    Write-Host "Intent clean" -ForegroundColor Green
    exit 0
}
'@
Write-PhaseFile "intent_analyzer.ps1" $intent

# 4) auto_ban.ps1
$ban = @'
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
'@
Write-PhaseFile "auto_ban.ps1" $ban

# 5) deploy_protect.ps1 (wrap deploy commands)
$deploy = @'
param(
    [string]$AdminToken,
    [string]$Command
)
$tokenFile = Join-Path $PSScriptRoot ".admin_token"
if (-not (Test-Path $tokenFile)) { Write-Error "No admin token"; exit 1 }
$expected = (Get-Content $tokenFile -Raw).Trim()
if ($AdminToken -ne $expected) { Write-Host "Deploy denied: bad token" -ForegroundColor Red; exit 2 }
Write-Host "Deploy authorized. Running: $Command"
Invoke-Expression $Command
'@
Write-PhaseFile "deploy_protect.ps1" $deploy

# 6) honeypot.ps1 (creates dummy files that log access)
$honeypot = @'
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
'@
Write-PhaseFile "honeypot.ps1" $honeypot

# 7) lockdown.ps1 (safe-mode: only show changes; requires -Force to apply)
$lock = @'
param([switch]$Apply)
$root = Split-Path -Parent $PSScriptRoot
$protectPaths = @(
    (Join-Path $root "..\..\project"),
    (Join-Path $root "..\..\system_control"),
    (Join-Path $root "..\..\automation_engines")
)
Write-Host "LOCKDOWN MODE preview. Paths to restrict:"
$protectPaths | ForEach-Object { Write-Host " -> $_" }
if ($Apply) {
    foreach ($p in $protectPaths) {
        if (Test-Path $p) {
            Write-Host "Restricting writes for $p"
            # remove inherited perms and grant Full to current user only
            # Removing inheritance
            icacls $p /inheritance:r
            
            # Granting permissions (User + Admins)
            icacls $p /grant:r "${me}:F"
            icacls $p /grant "Administrators:F"
            icacls $p /grant "System:F"
        }
    }
    Write-Host "Lockdown applied."
} else {
    Write-Host "Dry-run only. Re-run with -Apply to enforce."
}
'@
Write-PhaseFile "lockdown.ps1" $lock

# 8) installer wrapper so user can rerun installs
$wrapper = @"
# bootstrap runner for phase6
param([string]\$AdminToken)
pwsh -ExecutionPolicy Bypass -File `"\$PSScriptRoot\phase6\security_guard.ps1`" -Token `"\$AdminToken`"
"@
Write-PhaseFile "README_phase6.txt" $wrapper

# 9) create scheduled task to run auto_ban periodically (needs admin rights for Register-ScheduledTask)
try {
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$phaseDir\auto_ban.ps1`""
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration ([TimeSpan]::MaxValue)
    Register-ScheduledTask -TaskName "Futurebuilder_Phase6_Guard" -Action $action -Trigger $trigger -RunLevel Highest -Force | Out-Null
    Write-Host "Scheduled task Futurebuilder_Phase6_Guard created (every 5min)."
}
catch {
    Write-Host "Could not register scheduled task (needs admin). You can run auto_ban.ps1 via cron/other scheduler." -ForegroundColor Yellow
}

Write-Host "Phase-6 security pack installed in $phaseDir" -ForegroundColor Green
Write-Host "Run 'pwsh -File $phaseDir\\intent_analyzer.ps1 -InputText \"...\" -Source \"web-form\"' to test the analyzer."
