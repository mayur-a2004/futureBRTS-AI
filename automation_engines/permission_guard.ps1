param([switch]$AutoQuarantine, [switch]$WhatIf)
$scriptDir = $PSScriptRoot
# Resolve absolute path to repo root (one level up from automation_engines)
$repoRoot = (Resolve-Path (Join-Path $scriptDir '..')).Path
$log = Join-Path $repoRoot "history_logs\permission_guard.log"

"Guard run at $(Get-Date)" | Out-File -Append $log -Encoding UTF8

# Define Whitelist (Folders in Root)
$allowedFolders = @(
    "project",
    "automation_engines",
    "history_logs",
    "snapshots",
    "system_control",
    "scripts",
    "advanced_engines",
    "agents", "blueprint", "integration_api", "modules", "orchestrator", "project_flow", "worker",
    ".venv", ".git"
)

# Define Whitelist (Files in Root)
$allowedRootFiles = @(
    "repair_structure.ps1",
    "run.ps1",
    "run_dev.ps1",
    "run_fix.ps1",
    "install_phase2.ps1",
    "automation_phase3_install.ps1",
    "automation_engines_setup.ps1"
)

# Scan All Files
$items = Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue

foreach ($i in $items) {
    $fullPath = $i.FullName
    
    # Get path relative to repo root
    # +1 for the trailing slash
    $relPath = $fullPath.Substring($repoRoot.Length + 1)
    
    $isSafe = $false

    # 1. Check if inside allowed folder
    foreach ($folder in $allowedFolders) {
        if ($relPath.StartsWith($folder)) {
            $isSafe = $true
            break
        }
    }

    # 2. Check if allowed root file
    if (-not $isSafe) {
        # Check if file is in root (no folder separator in relPath?)
        # PowerShell paths might use \
        if ($relPath -notmatch "\\") {
            foreach ($pattern in $allowedRootFiles) {
                if ($relPath -like $pattern) {
                    $isSafe = $true
                    break
                }
            }
        }
    }

    if (-not $isSafe) {
        $msg = "⚠️ Unauthorized File Detected: $relPath"
        Write-Host $msg -ForegroundColor Yellow
        $msg | Out-File -Append $log -Encoding UTF8
        
        if ($AutoQuarantine -and -not $WhatIf) {
            $quarantineDir = Join-Path $repoRoot "quarantine"
            if (-not (Test-Path $quarantineDir)) { New-Item -ItemType Directory -Path $quarantineDir -Force | Out-Null }
            
            # Move
            $dest = Join-Path $quarantineDir (Split-Path $relPath -Leaf)
            # Handle collision
            if (Test-Path $dest) { $dest = Join-Path $quarantineDir ("$(get-date -format yyyyMMddHHmmss)_" + (Split-Path $relPath -Leaf)) }
            
            Move-Item -Path $fullPath -Destination $dest -Force
            
            $act = "⛔ QUARANTINED: $relPath -> $dest"
            Write-Host $act -ForegroundColor Red
            $act | Out-File -Append $log -Encoding UTF8
        }
    }
}
Write-Host "🛡️ Permission Guard Scan Complete." -ForegroundColor Green
