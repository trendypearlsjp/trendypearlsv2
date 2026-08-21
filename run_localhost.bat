@echo off
title Trendy Pearls - Local Admin Dashboard
color 0B
echo ===================================================
echo     Trendy Pearls Local Admin Panel & Server
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed on this laptop!
    echo Opening https://nodejs.org in your browser...
    start "" "https://nodejs.org"
    echo Please install Node.js and run this file again.
    echo.
    pause
    exit /b 1
)

if not exist node_modules\express (
    echo [INFO] First-time setup: Installing required packages...
    call npm install
)

echo [1/3] Auto-pulling latest updates & details from GitHub...
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    if exist .git (
        git pull origin main 2>nul
    )
)

echo [2/3] Opening Admin Dashboard in browser...
start "" "http://localhost:3000/admin"

echo [3/3] Starting Admin Server on http://localhost:3000...
echo Keep this window open while managing your store!
echo (Press Ctrl+C or close this window when done)
echo.

node admin_server.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [NOTICE] Server stopped or encountered an issue.
    pause
)
