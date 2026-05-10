@echo off
chcp 65001 >nul
echo ========================================
echo   LOL 英雄成就追踪器 - 停止服务
echo ========================================
echo.

:: 停止 Node.js 进程（后端和前端）
echo [1/2] 停止 Node.js 服务...
tasklist /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq LOL*" 2>nul | findstr "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    taskkill /F /FI "WINDOWTITLE eq LOL*" >nul 2>&1
    echo       Node.js 服务已停止
) else (
    echo       未发现运行中的 Node.js 服务
)
echo.

:: 询问是否停止 MySQL
echo [2/2] MySQL 服务管理
echo       当前 MySQL 服务状态：
sc query mysql | findstr "STATE"
echo.
set /p stopMySQL="是否停止 MySQL 服务？(y/N): "
if /i "%stopMySQL%"=="y" (
    net stop mysql >nul 2>&1
    if %errorlevel% equ 0 (
        echo       MySQL 服务已停止
    ) else (
        echo       MySQL 服务停止失败，请以管理员权限运行此脚本
    )
) else (
    echo       MySQL 服务保持运行
)
echo.

echo ========================================
echo   服务停止完成！
echo ========================================
pause
