@echo off
chcp 65001 >nul
echo 🚀 设置股票趋势练习网站开发环境...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装，请先安装Python
    echo 📥 下载地址: https://www.python.org/downloads/
    echo 💡 安装时勾选'Add Python to PATH'
    pause
    exit /b 1
) else (
    echo ✅ Python已安装
    python --version
)

REM 检查pip是否安装
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip未安装，请检查Python安装
    pause
    exit /b 1
) else (
    echo ✅ pip已安装
    pip --version
)

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
powershell -ExecutionPolicy Bypass -Command "npm ci"

if errorlevel 1 (
    echo ⚠️ 前端依赖安装失败，尝试使用npm install...
    powershell -ExecutionPolicy Bypass -Command "npm install"
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    ) else (
        echo ✅ 前端依赖安装成功（使用npm install）
    )
) else (
    echo ✅ 前端依赖安装成功
)

echo.
echo 🔧 安装后端依赖...
cd ..\backend
pip install -r requirements_simple.txt

if errorlevel 1 (
    echo ⚠️ 后端依赖安装失败，尝试使用pip3...
    pip3 install -r requirements_simple.txt
    if errorlevel 1 (
        echo ⚠️ 后端依赖安装失败，请手动安装
        echo 命令: pip install -r backend\requirements_simple.txt
    ) else (
        echo ✅ 后端依赖安装成功（使用pip3）
    )
) else (
    echo ✅ 后端依赖安装成功
)

REM 创建.env文件（如果不存在）
cd ..
if not exist backend\.env (
    echo ℹ️ 创建后端环境配置文件...
    copy backend\.env.example backend\.env >nul
    echo ✅ 环境配置文件已创建
)

echo.
echo 🎉 开发环境设置完成！
echo.
echo 📋 启动说明：
echo   1. 开发模式: 运行 start-dev.bat
echo   2. Docker模式: 运行 start.bat (需要Docker)
echo   3. 开发模式（Docker）: 运行 docker-compose -f docker-compose.dev.yml up

echo.
echo 🔍 环境检查：
echo   前端: http://localhost:3000
echo   后端: http://localhost:8000
echo   API文档: http://localhost:8000/docs

echo.
pause