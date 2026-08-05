@echo off
title Trendy Pearls - Store Auto-Sync & Git Deployment Engine
color 0A
echo ===================================================
echo     Trendy Pearls Store Auto-Sync & Publisher
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed on this laptop.
    echo Please install Node.js from https://nodejs.org
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo [1/3] Checking dependencies...
if not exist node_modules\xlsx (
    echo [INFO] Installing required packages (xlsx)...
    call npm install
)

echo [2/3] Syncing products.xlsx and images...
node sync_store.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to sync products sheet. Please check products.xlsx format.
    pause
    exit /b 1
)

echo [3/3] Committing and pushing updates to GitHub live store...
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    if not exist .git (
        echo [INFO] Initializing Git repository link...
        git init
        git remote add origin https://github.com/trendypearlsjp/trendypearlsv2.git
        git branch -M main
    )
    git config user.email "trendypearlsjp@gmail.com"
    git config user.name "Trendy Pearls Boutique"
    git add .
    git commit -m "Auto-sync store catalog updates - %DATE% %TIME%" 2>nul
    git pull --rebase origin main
    git push origin main
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Syncing with forced push...
        git push -f origin main
    )
    echo.
    echo ===================================================
    echo  SUCCESS: Store catalog synced & pushed live!
    echo ===================================================
) else (
    echo [WARNING] Git is not installed on this laptop.
    echo Products synced locally! Install Git from https://git-scm.com/downloads to auto-push.
)

echo.
echo Press any key to close this window...
pause >nul
