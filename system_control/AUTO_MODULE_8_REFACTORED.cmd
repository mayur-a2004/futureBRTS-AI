@echo off
echo ================================
echo   FUTUREBILDER AUTO MODULE-8
echo ================================

echo [1] Creating MODULE-8 tasks...

if not exist "..\modules\MODULE-8" mkdir "..\modules\MODULE-8" >nul 2>&1

copy "TEMPLATES\UI_TASK_M8.txt" "..\modules\MODULE-8\UI_TASK.txt" >nul
copy "TEMPLATES\BACKEND_TASK_M8.txt" "..\modules\MODULE-8\BACKEND_TASK.txt" >nul
copy "TEMPLATES\DOC_TASK_M8.txt" "..\modules\MODULE-8\DOC_TASK.txt" >nul
copy "TEMPLATES\QA_TASK_M8.txt" "..\modules\MODULE-8\QA_TASK.txt" >nul

echo [DONE] Tasks created.


echo [2] Injecting tasks into agents...

copy "..\modules\MODULE-8\UI_TASK.txt" "..\agents\UI_AGENT\task_input.txt" /Y
copy "..\modules\MODULE-8\BACKEND_TASK.txt" "..\agents\BACKEND_AGENT\task_input.txt" /Y
copy "..\modules\MODULE-8\DOC_TASK.txt" "..\agents\DOC_AGENT\task_input.txt" /Y
copy "..\modules\MODULE-8\QA_TASK.txt" "..\agents\QA_AGENT\task_input.txt" /Y

echo [DONE] Agents updated.


echo [3] Running Multi-Agent Engine...
call auto_run_module.cmd MODULE-8
echo [DONE] Module-8 executed.


echo [4] Finalizing...
call CLEAN_MODULE_8.cmd
echo [DONE] Module-8 finalized.


echo =========================================
echo       MODULE-8 COMPLETED SUCCESSFULLY
echo =========================================
pause
