@echo off
echo 🚀 设置股票趋势练习网站开发环境...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装，请先安装Node.js
    echo 📥 下载地址: https://nodejs.org/zh-cn/download/
    pause
    exit /b 1
) else (
    echo ✅ Node.js已安装
    node --version
)

REM 检查npm是否安装
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm未安装，请检查Node.js安装
    pause
    exit /b 1
) else (
    echo ✅ npm已安装
    npm --version
)

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Docker未安装，将使用开发模式（后端API需要手动启动）
    echo 📥 建议安装Docker Desktop: https://www.docker.com/products/docker-desktop/
) else (
    echo ✅ Docker已安装
    docker --version
)

echo.
echo 📦 安装前端依赖...
cd frontend
npm install

if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    pause
    exit /b 1
) else (
    echo ✅ 前端依赖安装成功
)

echo.
echo 🔧 安装后端依赖...
cd ..\backend
pip install -r requirements_simple.txt

if errorlevel 1 (
    echo ⚠️ 后端依赖安装失败，请手动安装
    echo 命令: pip install -r backend\requirements_simple.txt
) else (
    echo ✅ 后端依赖安装成功
)

echo.
echo 🎉 开发环境设置完成！
echo.
echo 📋 启动说明：
echo   1. 开发模式: 运行 start-dev.bat
echo   2. 生产模式: 运行 start.bat (需要Docker)
echo.
pause