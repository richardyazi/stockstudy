@echo off
REM 股票趋势练习网站 - 前端本地构建脚本
REM 直接调用npm构建命令，绕过PowerShell执行策略限制

chcp 65001 >nul
echo === 股票趋势练习网站 - 前端构建脚本 ===
echo.

REM 检查前端目录是否存在
if not exist "I:\stockstudy\frontend" (
    echo 错误: 前端目录不存在! 请检查路径: I:\stockstudy\frontend
    pause
    exit /b 1
)

REM 检查package.json是否存在
if not exist "I:\stockstudy\frontend\package.json" (
    echo 错误: package.json文件不存在!
    pause
    exit /b 1
)

echo 正在构建前端项目...
echo 构建工具: Vite 6.3.5
echo 输出目录: frontend/build
echo.

REM 直接使用PowerShell执行构建命令，绕过执行策略
powershell -ExecutionPolicy Bypass -Command "cd I:\stockstudy\frontend; npm run build"

if %ERRORLEVEL% neq 0 (
    echo.
    echo 构建失败! 请检查错误信息。
    pause
    exit /b 1
) else (
    echo.
    echo 构建成功完成!
    echo 构建文件已生成到: I:\stockstudy\frontend\build
    echo.
)

pause