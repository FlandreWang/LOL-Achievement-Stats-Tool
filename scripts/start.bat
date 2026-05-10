@echo off
chcp 65001 > NUL
echo ========================================
echo   LOL Hero Achievement Tracker - Starting
echo ========================================
echo.

echo [1/3] Checking MySQL service...
sc query mysql | findstr "RUNNING" > NUL
if %errorlevel% equ 0 (
    echo       MySQL is already running
) else (
    echo       Starting MySQL service...
    net start mysql
    if %errorlevel% equ 0 (
        echo       MySQL started successfully
    ) else (
        echo       Failed to start MySQL. Run as Administrator.
        pause
        exit /b 1
    )
)
echo.

echo [2/3] Checking backend dependencies...
cd /d %~dp0\..\packages\server
if not exist "node_modules" (
    echo       Installing dependencies...
    call npm install
) else (
    echo       Dependencies already installed
)
echo.

echo [3/3] Starting backend server...
cd /d %~dp0\..\packages\server
start "LOL Server" cmd /k "node index.js"
echo       Backend starting on port 3001...
echo.

timeout /t 2 /nobreak > NUL

echo ========================================
echo   Starting frontend server...
echo ========================================
cd /d %~dp0\..
start "LOL Frontend" cmd /k "pnpm dev"
echo.

echo ========================================
echo   All services started!
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo.
echo   Close this window to keep services running
echo   Run stop.bat to stop all services
echo ========================================
pause