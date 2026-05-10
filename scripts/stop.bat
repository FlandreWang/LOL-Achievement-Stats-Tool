@echo off
chcp 65001 > NUL
echo ========================================
echo   LOL Hero Achievement Tracker - Stopping
echo ========================================
echo.

echo [1/2] Stopping services...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001.*LISTENING"') do taskkill /F /PID %%a > /dev/null 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173.*LISTENING"') do taskkill /F /PID %%a > /dev/null 2>&1
echo       Services stopped
echo.

echo [2/2] MySQL Service Management
echo       Current MySQL service status:
sc query mysql | findstr "STATE"
echo.
set /p stopMySQL="Stop MySQL service? (y/N): "
if /i "%stopMySQL%"=="y" (
    net stop mysql
    if %errorlevel% equ 0 (
        echo       MySQL service stopped
    ) else (
        echo       Failed to stop MySQL. Run as Administrator.
    )
) else (
    echo       MySQL service kept running
)
echo.

echo ========================================
echo   All services stopped!
echo ========================================
pause