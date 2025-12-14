@echo off
echo ========================================
echo 部署到CloudBase开发环境 (v2.1 - 2025-12-14)
echo ========================================

echo 检查环境配置...
if not exist "cloudbaserc.json" (
    echo 错误: 配置文件 cloudbaserc.json 不存在
    pause
    exit /b 1
)

echo 构建前端...
call build-frontend-cloudbase.bat

if errorlevel 1 (
    echo 前端构建失败
    pause
    exit /b 1
)

echo 部署到CloudBase开发环境...
tcb framework deploy

if errorlevel 1 (
    echo 部署失败
    pause
    exit /b 1
)

echo ========================================
echo 开发环境部署完成！
echo 前端访问: https://stockstudy-dev-7gg0qgesca10330c-1251378228.tcloudbaseapp.com/
echo 后端API: https://stockstudy-backend-dev-{id}.sh.run.tcloudbase.com/api/
echo 注意: 请查看部署日志获取实际的后端访问地址
echo ========================================

pause