@echo off
chcp 65001 > NUL
echo ========================================
echo   LOL Hero Achievement Tracker - Restarting
echo ========================================
echo.

echo [1/4] Stopping existing services...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING"') do taskkill /F /PID %%a > /dev/null 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173.*LISTENING"') do taskkill /F /PID %%a > /dev/null 2>&1
timeout /t 1 /nobreak > NUL
echo       Done
echo.

echo [2/4] Checking MySQL service...
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

echo [3/4] Starting backend server...
cd /d %~dp0\..\packages\server
start "LOL Server" cmd /k "node index.js"
echo       Backend starting on port 3001...
timeout /t 2 /nobreak > NUL
echo.

echo [4/4] Starting frontend server...
cd /d %~dp0\..
start "LOL Frontend" cmd /k "pnpm dev"
echo       Frontend starting on port 5173...
echo.

echo ========================================
echo   All services restarted!
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo.
echo   Close this window to keep services running
echo   Run stop.bat to stop all services
echo ========================================
pause