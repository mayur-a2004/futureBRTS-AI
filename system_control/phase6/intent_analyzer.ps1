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
