@echo off
echo ========================================
echo 检查CloudBase开发环境状态 (v2.1 - 2025-12-14)
echo ========================================

echo 检查开发环境配置...
if exist "cloudbaserc.json" (
    echo [✓] 开发环境配置文件存在
    type cloudbaserc.json | findstr "envId"
) else (
    echo [✗] 开发环境配置文件不存在
)

echo.
echo 检查前端构建配置...
if exist "build-frontend-cloudbase.bat" (
    echo [✓] 前端构建脚本存在
) else (
    echo [✗] 前端构建脚本不存在
)

echo.
echo 检查前端目录...
if exist "frontend" (
    echo [✓] 前端目录存在
    if exist "frontend\dist" (
        echo [✓] 前端构建目录存在
    ) else (
        echo [✗] 前端构建目录不存在，需要先构建
    )
) else (
    echo [✗] 前端目录不存在
)

echo.
echo ========================================
echo 环境检查完成
echo ========================================
echo.
echo 部署命令说明:
echo 开发环境: deploy-dev.bat
echo.
pause