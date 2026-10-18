@echo off
setlocal EnableExtensions
title Single Product SaaS - Installer
cd /d "%~dp0"

echo ============================================================
echo   Single Product SaaS Engine  -  Installer
echo ============================================================
echo.

rem ------------------------------------------------------------------
rem  1) Node.js / npm
rem ------------------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 goto :install_node

for /f "delims=" %%v in ('node -v') do set "NODEVER=%%v"
echo [OK] Node.js %NODEVER% found.

where npm >nul 2>nul
if errorlevel 1 (
  echo [X] npm was not found next to Node.js.
  echo     Please reinstall Node.js LTS from https://nodejs.org
  goto :fail
)
for /f "delims=" %%v in ('npm -v') do set "NPMVER=%%v"
echo [OK] npm %NPMVER% found.

for /f "tokens=1 delims=." %%m in ("%NODEVER:v=%") do set "NODEMAJOR=%%m"
if %NODEMAJOR% GTR 22 echo [i] Note: Next.js 15 is tested on Node 20/22. If the dev server feels slow, install Node 22 LTS from https://nodejs.org
echo.

rem ------------------------------------------------------------------
rem  2) .env
rem ------------------------------------------------------------------
if exist ".env" (
  echo [OK] .env already present.
) else (
  if exist ".env.example" (
    copy /y ".env.example" ".env" >nul
    echo [OK] Created .env from .env.example ^(open it and add your keys^).
  ) else (
    echo [!] No .env file found - the app may not start correctly.
  )
)
echo.

rem ------------------------------------------------------------------
rem  3) Stop a running instance (Windows locks its files)
rem ------------------------------------------------------------------
set "RUNPIDS="
powershell -NoProfile -Command "(Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*\single-product-saas-engine\*' }).ProcessId" > "%TEMP%\spse_pids.txt" 2>nul
for /f "usebackq delims=" %%p in ("%TEMP%\spse_pids.txt") do set "RUNPIDS=%%p "
del "%TEMP%\spse_pids.txt" >nul 2>nul

if defined RUNPIDS (
  echo [!] This app is already running ^(pid %RUNPIDS%^).
  echo     Windows keeps its files locked, so npm install can fail with "EPERM".
  choice /c YN /n /m "  Stop it now so the installation can proceed? [Y/n]: "
  if errorlevel 2 (
    echo [!] Continuing without stopping it - npm install may fail below.
  ) else (
    for %%p in (%RUNPIDS%) do taskkill /PID %%p /T /F >nul 2>nul
    timeout /t 2 /nobreak >nul
    echo [OK] Stopped the running instance.
  )
)
echo.

rem ------------------------------------------------------------------
rem  4) Dependencies
rem ------------------------------------------------------------------
echo [..] Installing dependencies ^(npm install^) ...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo [!] First attempt failed - waiting 5 seconds and retrying once ...
  timeout /t 5 /nobreak >nul
  call npm install --no-audit --no-fund
)
if errorlevel 1 (
  echo [X] npm install failed. Read the messages above.
  goto :fail
)
echo [OK] Dependencies installed.
echo.

rem ------------------------------------------------------------------
rem  5) Prisma client
rem ------------------------------------------------------------------
echo [..] Generating the Prisma client ...
call npx prisma generate
if errorlevel 1 echo [!] prisma generate reported an error - continuing anyway.
echo.

rem ------------------------------------------------------------------
rem  6) Local database (embedded PGlite)
rem ------------------------------------------------------------------
echo [..] Preparing the local database ^(PGlite^) ...
if exist "scripts\pglite-repair.mjs" call node "scripts\pglite-repair.mjs"
call node "scripts\preview-db.mjs"
if errorlevel 1 (
  echo [X] Could not prepare the database.
  echo     Try deleting the .pglite folder and running this file again.
  goto :fail
)
echo [OK] Database ready.
echo.

rem ------------------------------------------------------------------
rem  7) Playwright browser (optional)
rem ------------------------------------------------------------------
set "PW="
set /p "PW=Install Playwright Chromium for scraping JS-heavy stores? [y/N]: "
if /i "%PW%"=="y" (
  echo [..] Downloading Chromium ^(this can take a few minutes^) ...
  call npx playwright install chromium
  echo [OK] Playwright ready.
) else (
  echo [i] Skipped. Static stores still work.
  echo     You can install it later with:  npx playwright install chromium
)
echo.

echo ============================================================
echo   Installation finished.  Now run  start.bat
echo ============================================================
pause
exit /b 0

rem ------------------------------------------------------------------
rem  Helpers
rem ------------------------------------------------------------------
:install_node
echo [!] Node.js was not found on this computer.
choice /c YN /n /m "Install Node.js LTS now with winget? [Y/N]: "
if errorlevel 2 goto :no_node

where winget >nul 2>nul
if errorlevel 1 (
  echo [X] winget is not available on this machine.
  echo     Install Node.js LTS manually from https://nodejs.org then re-run install.bat
  goto :fail
)

echo [..] Installing Node.js LTS with winget ...
call winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
echo.
echo [OK] Finished. CLOSE this window, open a new one, and run install.bat again.
pause
exit /b 0

:no_node
echo [X] Node.js is required. Install it from https://nodejs.org then re-run install.bat.

:fail
echo.
pause
exit /b 1
