@echo off
echo 🛑 停止股票趋势练习网站开发环境...
echo.

REM 停止Redis容器
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

echo.
echo 💡 提示：前端和后端服务需要手动关闭命令窗口
echo.
echo 📋 需要手动关闭的窗口：
echo   - 后端API服务窗口

echo   - 前端开发服务器窗口
echo.
echo ✅ 开发环境已清理完成！
pause