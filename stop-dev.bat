@echo off
chcp 65001 >nul
echo 🛑 停止股票趋势练习网站开发环境...
echo.

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ℹ️ Docker未安装，跳过容器清理
) else (
    REM 停止Redis容器
    echo 🔧 停止Redis容器...
    docker stop redis-dev >nul 2>&1
    if errorlevel 1 (
        echo ⚠️ Redis容器未运行或停止失败
    ) else (
        echo ✅ Redis容器已停止
    )
    
    REM 删除Redis容器
    docker rm redis-dev >nul 2>&1
    if errorlevel 1 (
        echo ⚠️ Redis容器删除失败
    ) else (
        echo ✅ Redis容器已删除
    )
)

REM 尝试停止Python进程
echo.
echo 🔧 停止后端API进程...
taskkill /f /im python.exe 2>nul
if errorlevel 1 (
    echo ⚠️ 后端进程停止失败或未运行
) else (
    echo ✅ 后端API进程已停止
)

REM 尝试停止Node进程
echo.
echo 🔧 停止前端开发进程...
taskkill /f /im node.exe 2>nul
if errorlevel 1 (
    echo ⚠️ 前端进程停止失败或未运行
) else (
    echo ✅ 前端开发进程已停止
)

echo.
echo ✅ 开发环境已清理完成！
echo.
echo 📋 清理完成状态：
echo   - Redis容器: 已清理
echo   - 后端API进程: 已停止
echo   - 前端开发进程: 已停止
echo.
echo 🔍 如果仍有服务运行，请手动关闭相关命令窗口
echo.
pause