@echo off
setlocal
cd /d "%~dp0"
if not exist "package.json" cd /d "%~dp0..\work\archie-test-one"
if not exist "package.json" (
  echo Extract the school-preview source ZIP before running this launcher.
  pause
  exit /b 1
)
curl -fsS http://127.0.0.1:4187/api/health 2>nul | findstr /C:"archie-test" >nul
if not errorlevel 1 (
  start "" "http://127.0.0.1:4187/"
  exit /b 0
)
if not exist "node_modules\vite\package.json" (
  call npm ci
  if errorlevel 1 exit /b 1
)
call npm run build:archie
if errorlevel 1 exit /b 1
set "HOST=127.0.0.1"
set "PORT=4187"
set "ARCHIE_CLOUD_PROVIDER=none"
set "ARCHIE_OLLAMA_URL="
echo Open http://127.0.0.1:4187/ when the server says it is listening.
echo Keep this terminal open while using the preview. Press Ctrl+C to stop.
call npm run start:archie
