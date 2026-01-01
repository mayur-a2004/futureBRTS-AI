@echo off
echo ==========================================
echo      FINALIZING MODULE 7 (CLOUD INFRA)
echo ==========================================
echo.

echo [1] Archiving Output Files...
move /Y "..\agents\UI_AGENT\output_v7.md" "..\agents\UI_AGENT\output_history\output_v7.md"
move /Y "..\agents\BACKEND_AGENT\output_v7.md" "..\agents\BACKEND_AGENT\output_history\output_v7.md"
move /Y "..\agents\DOC_AGENT\output_v7.md" "..\agents\DOC_AGENT\output_history\output_v7.md"
move /Y "..\agents\QA_AGENT\output_v7.md" "..\agents\QA_AGENT\test_reports\test_report_v7.md"
echo [DONE] Files archived.
echo.

echo [2] Updating Task Logs...
echo - [x] v7: Cloud Dashboard UI >> "..\agents\UI_AGENT\task_log.md"
echo - [x] v7: Terraform & Cloud Integration >> "..\agents\BACKEND_AGENT\task_log.md"
echo - [x] v7: Infrastructure Documentation >> "..\agents\DOC_AGENT\task_log.md"
echo - [x] v7: Infra Tests (PASS) >> "..\agents\QA_AGENT\task_log.md"
echo [DONE] Logs updated.
echo.

echo [3] Updating Release Cycle...
echo. >> "..\orchestrator\release_cycle.md"
echo ## v7.0.0 (Cloud Infrastructure) >> "..\orchestrator\release_cycle.md"
echo - Date: 2025-12-02 >> "..\orchestrator\release_cycle.md"
echo - Status: Implementation Ready >> "..\orchestrator\release_cycle.md"
echo - Modules: AWS/GCP, Terraform, Docker >> "..\orchestrator\release_cycle.md"
echo [DONE] Release cycle updated.
echo.

echo [4] Advancing Queue...
echo Module-8: Maintenance ^& Scaling > "..\project_flow\module_queue.txt"
echo [DONE] Queue updated to Module-8.
echo.

echo ==========================================
echo      MODULE 7 FINALIZED SUCCESSFULLY
echo ==========================================
pause
