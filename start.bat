@echo off
setlocal EnableExtensions
title Single Product SaaS - Server
cd /d "%~dp0"

set "NOBROWSER="
set "MODE=both"
if /i "%~1"=="nobrowser" set "NOBROWSER=1"
if /i "%~1"=="dashboard" set "MODE=dashboard"
if /i "%~1"=="store" set "MODE=store"

if not exist "node_modules" (
  echo [X] Dependencies are missing.
  echo     Please run  install.bat  first.
  echo.
  pause
  exit /b 1
)

echo ============================================================
echo   Single Product SaaS Engine  -  Starting
echo ============================================================
echo.

echo [..] Checking the local database ...
if exist "scripts\pglite-repair.mjs" call node "scripts\pglite-repair.mjs"
if not exist ".pglite" call node "scripts\preview-db.mjs"
echo.

rem ------------------------------------------------------------------
rem  Is something already listening on port 3000?
rem ------------------------------------------------------------------
set "PORT=3000"
set "EXISTPID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /c:":3000 " ^| findstr /c:"LISTENING"') do set "EXISTPID=%%p"

if not defined EXISTPID goto :launch

echo [!] Port 3000 is already in use by this process:
tasklist /FI "PID eq %EXISTPID%" /NH
echo.
echo     [O] Just open it in the browser
echo     [K] Stop that process and start a fresh server
echo     [N] Start on port 3001 instead  ^(warning: two servers may fight over the local database^)
echo.
choice /c OKN /n /m "  Your choice: "
if errorlevel 3 (
  echo [i] Starting on port 3001.
  set "PORT=3001"
) else if errorlevel 2 (
  echo [..] Stopping process %EXISTPID% ...
  taskkill /PID %EXISTPID% /T /F >nul 2>nul
  timeout /t 2 /nobreak >nul
) else (
  echo [i] Opening the existing instance on port 3000.
  if not defined NOBROWSER (
    start "" "http://localhost:3000"
    if /i not "%MODE%"=="store" start "" "http://localhost:3000/dashboard"
  )
  exit /b 0
)
echo.

:launch
set "APPURL=http://localhost:%PORT%"
echo [OK] Store     : %APPURL%
echo [OK] Dashboard : %APPURL%/dashboard

set "ADMINPW="
if exist ".env" for /f "usebackq tokens=2 delims==" %%p in (`findstr /b /c:"ADMIN_PASSWORD=" ".env" 2^>nul`) do set "ADMINPW=%%p"
set "ADMINPW=%ADMINPW:"=%"
if defined ADMINPW echo [i] Dashboard password (ADMIN_PASSWORD in .env): %ADMINPW%
echo [..] Starting the server. Keep this window open; press Ctrl+C to stop it.
echo.

if /i "%MODE%"=="store" set "PSOPEN=Start-Process '%APPURL%'"
if /i "%MODE%"=="dashboard" set "PSOPEN=Start-Process '%APPURL%/dashboard'"
if /i "%MODE%"=="both" set "PSOPEN=Start-Process '%APPURL%'; Start-Process '%APPURL%/dashboard'"
if not defined PSOPEN set "PSOPEN=Start-Process '%APPURL%'"

if not defined NOBROWSER (
  start "" powershell -NoProfile -WindowStyle Hidden -Command "for ($i=0; $i -lt 180; $i++) { try { $r = Invoke-WebRequest -Uri '%APPURL%' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -ge 200) { %PSOPEN%; break } } catch { Start-Sleep -Seconds 1 } }"
  echo [i] The browser will open automatically once the server is ready.
  echo.
)

call npm run dev -- -p %PORT%

echo.
echo Server stopped.
pause
exit /b 0
