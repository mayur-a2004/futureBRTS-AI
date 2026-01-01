$root = Resolve-Path "$PSScriptRoot\.."

# 1. Self-Repair
powershell -ExecutionPolicy Bypass -File "$root\repair_structure.ps1"

# 2. Permission Check
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\permission_guard.ps1"

# 3. Task Login
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\task_engine.ps1" -Action "SYSTEM_HOOK" -Target "ALL" -Status "RUNNING"

# 4. Activity Tracker
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\activity_tracker.ps1"

# 5. Event Trigger
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\event_trigger.ps1"

# 6. QA Scan
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\qa_engine.ps1"

Write-Host "System Hook Complete." -ForegroundColor Green
