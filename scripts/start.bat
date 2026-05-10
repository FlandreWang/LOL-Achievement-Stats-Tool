@echo off
chcp 65001 >nul
echo ========================================
echo   LOL 英雄成就追踪器 - 启动服务
echo ========================================
echo.

:: 检查 MySQL 是否已启动
echo [1/3] 检查 MySQL 服务状态...
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

:: 安装后端依赖
echo [2/3] 检查后端依赖...
cd /d "%~dp0\..\packages\server"
if not exist "node_modules" (
    echo       正在安装依赖...
    call npm install
) else (
    echo       依赖已存在
)
echo.

:: 启动后端服务
echo [3/3] 启动后端服务...
start "LOL Server" cmd /c "cd /d "%~dp0\..\packages\server" && node index.js"
echo       后端服务启动中... (端口: 3001)
echo.

:: 等待后端启动
timeout /t 2 /nobreak >nul

:: 启动前端服务
echo ========================================
echo   正在启动前端服务...
echo ========================================
cd /d "%~dp0\..\packages\frontend"
start "LOL Frontend" cmd /c "cd /d "%~dp0\..\.." && pnpm dev"
echo.

echo ========================================
echo   服务启动完成！
echo.
echo   后端服务: http://localhost:3001
echo   前端服务: http://localhost:5173
echo.
echo   关闭此窗口不会停止服务
echo   如需停止服务，请运行 stop.bat
echo ========================================
pause
