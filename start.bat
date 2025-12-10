@echo off
chcp 65001 >nul
echo 🚀 启动股票趋势练习网站...

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker未安装，请先安装Docker
    pause
    exit /b 1
)

REM 检查Docker Compose是否安装
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose未安装，请先安装Docker Compose
    pause
    exit /b 1
)

echo 📦 构建并启动服务...

REM 构建并启动服务
docker-compose up --build -d

if errorlevel 1 (
    echo ❌ 服务启动失败，请检查错误信息
    pause
    exit /b 1
)

echo ⏳ 等待服务启动...

REM 等待后端服务启动
timeout /t 10 /nobreak >nul

echo 🔍 检查服务状态...

REM 检查后端服务
curl -f http://localhost:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ 后端服务启动失败
) else (
    echo ✅ 后端服务运行正常
)

REM 检查前端服务
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ❌ 前端服务启动失败
) else (
    echo ✅ 前端服务运行正常
)

echo.
echo 🎉 股票趋势练习网站已启动完成！
echo.
echo 📊 前端地址: http://localhost:3000
echo 🔧 后端API: http://localhost:8000
echo 📚 API文档: http://localhost:8000/docs
echo.
echo 💡 使用说明:
echo    1. 打开浏览器访问 http://localhost:3000
echo    2. 输入股票代码（如：000001）
echo    3. 选择分界日期
echo    4. 点击'开始分析'查看图表
echo.
echo 🛑 停止服务: docker-compose down
echo 📈 查看日志: docker-compose logs -f
echo.
pause