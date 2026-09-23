@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 or newer, then run this file again.
  pause
  exit /b 1
)
echo Open http://localhost:8080 after the server reports it is running.
echo If you changed the configured port, use that port instead.
node backend/server.mjs
pause
