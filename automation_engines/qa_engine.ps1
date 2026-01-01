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
$illegal = Get-ChildItem -Path $root -Include ".next", "dist" -Recurse -ErrorAction SilentlyContinue
foreach ($i in $illegal) { $errs += "Nonstandard build output: $($i.FullName)" }
if ($errs.Count -eq 0) { "QA OK" | Out-File -Append $log } else { $errs | Out-File -Append $log }
