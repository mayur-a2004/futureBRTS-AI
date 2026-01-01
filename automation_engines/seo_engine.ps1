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
