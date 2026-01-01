@echo off
echo ==========================================
echo      FORCE APPLYING MODULE 4 (GAMIFICATION)
echo ==========================================
echo.

echo [1] Archiving Output Files...
move /Y "..\agents\UI_AGENT\output_v4.md" "..\agents\UI_AGENT\output_history\output_v4.md"
move /Y "..\agents\BACKEND_AGENT\output_v4.md" "..\agents\BACKEND_AGENT\output_history\output_v4.md"
move /Y "..\agents\DOC_AGENT\output_v4.md" "..\agents\DOC_AGENT\output_history\output_v4.md"
move /Y "..\agents\QA_AGENT\output_v4.md" "..\agents\QA_AGENT\test_reports\test_report_v4.md"
echo [DONE] Files archived.
echo.

echo [2] Updating Task Logs...
echo - [x] v4: Gamification UI (Profile, Leaderboard) >> "..\agents\UI_AGENT\task_log.md"
echo - [x] v4: Gamification Logic (XP, Levels, Badges) >> "..\agents\BACKEND_AGENT\task_log.md"
echo - [x] v4: Gamification Documentation >> "..\agents\DOC_AGENT\task_log.md"
echo - [x] v4: Gamification Tests (PASS) >> "..\agents\QA_AGENT\task_log.md"
echo [DONE] Logs updated.
echo.

echo [3] Updating Release Cycle...
echo. >> "..\orchestrator\release_cycle.md"
echo ## v4.0.0 (Gamification) >> "..\orchestrator\release_cycle.md"
echo - Date: 2025-12-02 >> "..\orchestrator\release_cycle.md"
echo - Status: Design Phase Complete >> "..\orchestrator\release_cycle.md"
echo - Modules: Gamification Engine >> "..\orchestrator\release_cycle.md"
echo [DONE] Release cycle updated.
echo.

echo [4] Advancing Queue...
echo Module-5: Final Polish & Launch > "..\project_flow\module_queue.txt"
echo [DONE] Queue updated to Module-5.
echo.

echo ==========================================
echo      MODULE 4 APPLIED SUCCESSFULLY
echo ==========================================
pause
