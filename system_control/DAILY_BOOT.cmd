echo ================================
echo FUTUREBILDER DAILY AUTO START
echo ================================

:: 1) Create daily history file
set DATE=%date:~0,2%-%date:~3,2%-%date:~6,4%
set FILE=futurebilder_tool/project_flow/daily_reports/history_%DATE%.md

echo # Daily Work Report - %DATE% > %FILE%
echo Generated new daily report: %FILE%

:: 2) Announce morning session start
echo [SYSTEM] Daily Work Session Started (10:00 AM IST)
echo [SYSTEM] Waiting for "start" command from User...

:: 3) Leave control to ChatGPT for task generation
