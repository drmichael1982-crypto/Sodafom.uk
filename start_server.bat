@echo off
cd /d "%~dp0"
set PORT=5000
set HOST=0.0.0.0

if not exist .env (
  copy /y .env.example .env >nul
)

findstr /B /C:"OPENAI_API_KEY=PUT_NEW_KEY_HERE" /C:"OPENAI_API_KEY=PUT_ME_KEY_HERE" .env >nul
if not errorlevel 1 (
  echo.
  echo ERROR: OpenAI key is still the placeholder in .env.
  echo Put your current OPENAI_API_KEY in .env, save it, then run again.
  echo The key stays on the laptop/server and is never put in the Android app.
  echo.
  start notepad "%~dp0.env"
  pause
  exit /b 1
)

if not exist dist\server.bundle.mjs (
  echo Building Sodafom backend...
  call npm run build
  if errorlevel 1 (
    echo.
    echo Build failed. Run npm install first, then run start_server.bat again.
    echo.
    pause
    exit /b 1
  )
)

echo Starting Sodafom backend on all network interfaces, port 5000...
echo Phone must be on the same Wi-Fi as this laptop for local testing.
node --env-file=.env dist/server.bundle.mjs
