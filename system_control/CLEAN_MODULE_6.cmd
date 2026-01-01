@echo off
echo ==========================================
echo      FINALIZING MODULE 6 (REAL GEN ENGINE)
echo ==========================================
echo.

echo [1] Archiving Output Files...
move /Y "..\agents\UI_AGENT\output_v6.md" "..\agents\UI_AGENT\output_history\output_v6.md"
move /Y "..\agents\BACKEND_AGENT\output_v6.md" "..\agents\BACKEND_AGENT\output_history\output_v6.md"
move /Y "..\agents\DOC_AGENT\output_v6.md" "..\agents\DOC_AGENT\output_history\output_v6.md"
move /Y "..\agents\QA_AGENT\output_v6.md" "..\agents\QA_AGENT\test_reports\test_report_v6.md"
echo [DONE] Files archived.
echo.

echo [2] Updating Task Logs...
echo - [x] v6: Next.js Frontend & Builder UI >> "..\agents\UI_AGENT\task_log.md"
echo - [x] v6: Express+Redis Backend & Workers >> "..\agents\BACKEND_AGENT\task_log.md"
echo - [x] v6: Microservice Architecture Docs >> "..\agents\DOC_AGENT\task_log.md"
echo - [x] v6: End-to-End Build System Tests (PASS) >> "..\agents\QA_AGENT\task_log.md"
echo [DONE] Logs updated.
echo.

echo [3] Updating Release Cycle...
echo. >> "..\orchestrator\release_cycle.md"
echo ## v6.0.0 (Real Gen Engine) >> "..\orchestrator\release_cycle.md"
echo - Date: 2025-12-02 >> "..\orchestrator\release_cycle.md"
echo - Status: Implementation Ready >> "..\orchestrator\release_cycle.md"
echo - Modules: Next.js, Express, Redis, BullMQ >> "..\orchestrator\release_cycle.md"
echo [DONE] Release cycle updated.
echo.

echo [4] Advancing Queue...
echo Module-7: Cloud Infrastructure > "..\project_flow\module_queue.txt"
echo [DONE] Queue updated to Module-7.
echo.

echo ==========================================
echo      MODULE 6 FINALIZED SUCCESSFULLY
echo ==========================================
pause
