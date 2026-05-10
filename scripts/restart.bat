@echo off
chcp 65001 >nul
echo ========================================
echo   LOL 英雄成就追踪器 - 重启服务
echo ========================================
echo.

:: 停止现有服务
echo [1/4] 停止现有服务...
taskkill /F /FI "WINDOWTITLE eq LOL*" >nul 2>&1
timeout /t 1 /nobreak >nul
echo       完成
echo.

:: 检查 MySQL 状态
echo [2/4] 检查 MySQL 服务...
sc query mysql | findstr "RUNNING" >nul 2>&1
if %errorlevel% equ 0 (
    echo       MySQL 服务已在运行
) else (
    echo       MySQL 服务未运行，正在启动...
    net start mysql >nul 2>&1
    if %errorlevel% equ 0 (
        echo       MySQL 服务启动成功
    ) else (
        echo       MySQL 服务启动失败，请以管理员权限运行此脚本
        pause
        exit /b 1
    )
)
echo.

:: 启动后端服务
echo [3/4] 启动后端服务...
start "LOL Server" cmd /c "cd /d "%~dp0\..\packages\server" && node index.js"
echo       后端服务启动中... (端口: 3001)
timeout /t 2 /nobreak >nul
echo.

:: 启动前端服务
echo [4/4] 启动前端服务...
cd /d "%~dp0\..\.."
start "LOL Frontend" cmd /c "cd /d "%~dp0\..\.." && pnpm dev"
echo       前端服务启动中...
echo.

echo ========================================
echo   服务重启完成！
echo.
echo   后端服务: http://localhost:3001
echo   前端服务: http://localhost:5173
echo.
echo   关闭此窗口不会停止服务
echo   如需停止服务，请运行 stop.bat
echo ========================================
pause
