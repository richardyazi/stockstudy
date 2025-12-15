@echo off
REM 前端本地构建脚本 - Windows批处理版本
REM 调用PowerShell脚本进行构建

chcp 65001 >nul
echo === 股票趋势练习网站 - 前端构建脚本 ===
echo.

REM 检查PowerShell是否可用
powershell -Command "Write-Host '检查PowerShell环境...' -ForegroundColor Yellow"
if %ERRORLEVEL% neq 0 (
    echo 错误: PowerShell不可用!
    pause
    exit /b 1
)

REM 执行PowerShell构建脚本
powershell -ExecutionPolicy Bypass -File "build-frontend-local.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo 构建失败! 请检查错误信息。
    pause
    exit /b 1
) else (
    echo.
    echo 构建成功完成!
    echo.
)

pause