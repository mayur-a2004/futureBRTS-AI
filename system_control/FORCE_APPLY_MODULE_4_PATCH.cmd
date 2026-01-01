@echo off
echo =========================================================
echo   APPLYING FORCE PATCH FOR MODULE-4 (FEATURE COMPOSER)
echo =========================================================

REM COPY MODULE-4 TASK FILES INTO AGENT INPUT LOCATIONS

copy /Y ..\modules\MODULE-4\UI_TASK.txt ..\agents\UI_AGENT\task_input.txt
copy /Y ..\modules\MODULE-4\BACKEND_TASK.txt ..\agents\BACKEND_AGENT\task_input.txt
copy /Y ..\modules\MODULE-4\DOC_TASK.txt ..\agents\DOC_AGENT\task_input.txt
copy /Y ..\modules\MODULE-4\QA_TASK.txt ..\agents\QA_AGENT\task_input.txt

echo ✓ Task input files replaced successfully.

REM DELETE OLD GAMIFICATION OUTPUTS (to avoid cache conflict)

del /Q ..\agents\UI_AGENT\output_v4.md
del /Q ..\agents\BACKEND_AGENT\output_v4.md
del /Q ..\agents\DOC_AGENT\output_v4.md
del /Q ..\agents\QA_AGENT\output_v4.md

echo ✓ Old v4 outputs removed.

echo =========================================================
echo   RUNNING MODULE-4 NOW WITH CLEAN INPUTS
echo =========================================================

call auto_run_module.cmd MODULE-4

echo =========================================================
echo   MODULE-4 FORCE RUN COMPLETE
echo =========================================================
pause
