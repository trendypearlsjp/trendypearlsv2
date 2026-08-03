@echo off
title Trendy Pearls - Environment & Package Installer
color 0A
echo ===================================================
echo     Trendy Pearls Environment & Package Installer
echo ===================================================
echo.

echo [1/3] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Node.js is NOT installed on this laptop!
    echo Opening Node.js download page...
    start "" "https://nodejs.org"
    echo Please install Node.js and run this script again.
    echo.
) else (
    echo [OK] Node.js is installed.
)

echo.
echo [2/3] Checking Git installation...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Git is NOT installed on this laptop!
    echo Opening official Git download page...
    start "" "https://git-scm.com/downloads"
    echo Please download and install Git for Windows to enable live publishing.
    echo.
) else (
    echo [OK] Git is installed.
)

echo.
echo [3/3] Installing required project packages (xlsx, serve, express, multer)...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo  SUCCESS: All required packages installed cleanly!
    echo ===================================================
    echo You can now run 'run_localhost.bat' or 'update_store.bat'.
) else (
    echo.
    echo [NOTICE] If packages didn't install, make sure Node.js is installed first.
)

echo.
echo Press any key to close this window...
pause >nul
