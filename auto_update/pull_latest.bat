@echo off
title Trendy Pearls - Auto-Pull Latest Updates
color 0A
echo ===================================================
echo   Trendy Pearls - Pulling Latest Store Updates
echo ===================================================
echo.

where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed on this computer.
    echo Download Git from https://git-scm.com/downloads to enable auto-updates.
    pause
    exit /b 1
)

echo Syncing with GitHub repository (trendypearlsv2)...
cd /d "%~dp0\.."

if not exist .git (
    echo Initializing Git repository link...
    git init
    git remote add origin https://github.com/trendypearlsjp/trendypearlsv2.git
    git branch -M main
)

git pull origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo  SUCCESS: All latest updates & details pulled!
    echo ===================================================
) else (
    echo.
    echo [NOTICE] Pull completed or no new updates found.
)

echo.
echo Press any key to close...
pause >nul
