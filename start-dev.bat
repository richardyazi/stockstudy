@echo off
chcp 65001 >nul
echo 🚀 启动股票趋势练习网站开发环境...
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装，请先运行 setup-dev.bat
    pause
    exit /b 1
)

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装，请先运行 setup-dev.bat
    pause
    exit /b 1
)

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm未安装，请先运行 setup-dev.bat
    pause
    exit /b 1
)

REM 检查Docker（可选）
docker --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Docker未安装，使用开发模式（后端API需要手动启动）
    set DOCKER_AVAILABLE=false
) else (
    echo ✅ Docker已安装，可以启动完整服务
    set DOCKER_AVAILABLE=true
)

REM 停止已存在的服务
echo.
echo 🔧 清理已存在的服务...
if "%DOCKER_AVAILABLE%"=="true" (
    docker stop redis-dev 2>nul
    docker rm redis-dev 2>nul
    echo ✅ 已清理旧容器
)

echo.
echo 🔧 启动Redis服务...
if "%DOCKER_AVAILABLE%"=="true" (
    docker run -d --name redis-dev -p 6379:6379 redis:7-alpine
    timeout /t 3 /nobreak >nul
    docker ps | findstr redis-dev >nul
    if errorlevel 1 (
        echo ❌ Redis启动失败
        set DOCKER_AVAILABLE=false
        echo 💡 后端API将使用内存缓存
    ) else (
        echo ✅ Redis容器已启动（端口6379）
    )
) else (
    echo ⚠️ 跳过Redis启动（需要Docker）
    echo 💡 后端API将使用内存缓存
)

echo.
echo 🔧 启动后端API服务...
cd backend
tasklist /fi "imagename eq python.exe" /fo csv | findstr /i "main_simple.py" >nul
if not errorlevel 1 (
    echo ℹ️ 后端服务已在运行
) else (
    start "股票趋势分析 - 后端API" cmd /k "cd /d "%~dp0backend" && python main_simple.py"
    echo ✅ 后端API服务已启动（端口8000）
)
cd ..

echo.
echo 🔧 启动前端开发服务器...
cd frontend
tasklist /fi "imagename eq node.exe" /fo csv | findstr /i "vite" >nul
if not errorlevel 1 (
    echo ℹ️ 前端服务已在运行
) else (
    start "股票趋势分析 - 前端开发" cmd /k "cd /d "%~dp0frontend" && powershell -ExecutionPolicy Bypass -Command \"npm run dev\""
    echo ✅ 前端开发服务器已启动（端口3000）
)
cd ..

echo.
echo ⏳ 等待服务启动（10秒）...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 开发环境启动完成！
echo.
echo 📊 访问地址：
echo   前端应用: http://localhost:3000
echo   后端API: http://localhost:8000
echo   API文档: http://localhost:8000/docs
echo   Redis管理: http://localhost:6379

echo.
echo 💡 使用说明：
echo   1. 浏览器打开 http://localhost:3000
echo   2. 输入股票代码（如：000001）
echo   3. 选择分界日期
echo   4. 点击'开始分析'查看图表

echo.
echo 🔍 服务状态检查：
echo   - 后端API: curl http://localhost:8000/api/health
echo   - 前端应用: 检查浏览器控制台
echo   - Redis: docker logs redis-dev (如果使用Docker)
echo   - Docker容器状态: docker ps | findstr "frontend"

echo.
echo 🛑 停止服务：
echo   手动关闭各个命令窗口
echo   或运行 stop-dev.bat
echo.
pause