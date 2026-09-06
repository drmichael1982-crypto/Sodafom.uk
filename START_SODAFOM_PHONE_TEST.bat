@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0START_SODAFOM_PHONE_TEST.ps1"
if errorlevel 1 (
  echo.
  echo Sodafom setup stopped because something needs attention above.
  pause
)
