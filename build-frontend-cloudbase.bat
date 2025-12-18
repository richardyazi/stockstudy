@echo off
REM 股票趋势练习网站 - 前端云部署构建脚本
REM 统一使用build目录，集成TCB CLI部署功能

chcp 65001 >nul
echo === 股票趋势练习网站 - 前端云部署构建脚本 ===
echo.

REM 检查前端目录是否存在
if not exist "frontend" (
    echo 错误: 前端目录不存在! 请检查路径: frontend
    pause
    exit /b 1
)

REM 检查package.json是否存在
if not exist "frontend\package.json" (
    echo 错误: package.json文件不存在!
    pause
    exit /b 1
)

cd frontend

echo 正在构建前端项目...
echo 构建工具: Vite 6.3.5
echo 输出目录: frontend/build
echo.

REM 清理build目录
if exist "build" (
    echo 清理现有的build目录...
    rmdir /s /q build
)

REM 执行npm构建
powershell -ExecutionPolicy Bypass -Command "npm run build"

if %ERRORLEVEL% neq 0 (
    echo.
    echo 构建失败! 请检查错误信息。
    pause
    exit /b 1
)

echo.
echo 构建成功完成!
echo 构建文件已生成到: frontend/build

echo.
echo 复制配置文件到构建目录...

REM 确保配置文件目录存在
if not exist "build/src/config" (
    mkdir "build/src/config"
)

REM 复制stock-config.json到构建目录
if exist "src/config/stock-config.json" (
    copy "src/config/stock-config.json" "build/src/config/stock-config.json"
    echo 配置文件stock-config.json已复制到build/src/config/
) else (
    echo 警告: src/config/stock-config.json配置文件不存在!
)

echo.
echo 构建和配置复制完成!

echo.
echo ===============================================
echo 开始部署到腾讯云CloudBase...
echo ===============================================
echo.

REM 检查是否已安装CloudBase CLI
cloudbase --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 错误: CloudBase CLI未安装! 请先安装: npm install -g @cloudbase/cli
    echo.
    echo 跳过部署步骤...
    pause
    exit /b 1
)

echo 检查CloudBase环境状态...
cloudbase env:list | findstr stockstudy-7gg0qgesca10330c >nul
if %ERRORLEVEL% neq 0 (
    echo 错误: CloudBase环境 stockstudy-7gg0qgesca10330c 不存在或无法访问!
    echo.
    echo 跳过部署步骤...
    pause
    exit /b 1
)

echo 环境检查通过，开始部署静态网站...
echo.

REM 部署到CloudBase静态网站托管
cloudbase hosting:deploy build -e stockstudy-7gg0qgesca10330c

if %ERRORLEVEL% neq 0 (
    echo.
    echo 部署失败! 请检查错误信息。
    pause
    exit /b 1
)

echo.
echo ===============================================
echo 部署成功完成!
echo ===============================================
echo.
echo 访问地址: https://stockstudy-7gg0qgesca10330c-1251378228.tcloudbaseapp.com/
echo.
echo 注意: 由于CDN缓存，新部署的文件可能需要几分钟才能完全生效
echo.

pause