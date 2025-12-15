# 前端本地构建脚本 - PowerShell版本
# 使用生产环境配置构建前端项目

param(
    [string]$ApiUrl = "https://stockstudy-backend-207775-4-1251378228.sh.run.tcloudbase.com"
)

Write-Host "=== 股票趋势练习网站 - 前端构建脚本 ===" -ForegroundColor Green
Write-Host "构建时间: $(Get-Date)" -ForegroundColor Yellow
Write-Host "API地址: $ApiUrl" -ForegroundColor Cyan

# 检查是否在frontend目录
$currentDir = Get-Location
$isInFrontendDir = $currentDir.Path -like "*frontend"

if (-not $isInFrontendDir) {
    Write-Host "切换到frontend目录..." -ForegroundColor Yellow
    Set-Location "frontend"
}

# 检查package.json是否存在
if (-not (Test-Path "package.json")) {
    Write-Host "错误: package.json文件不存在!" -ForegroundColor Red
    Write-Host "请确保在正确的项目目录中运行此脚本" -ForegroundColor Red
    exit 1
}

# 设置环境变量
Write-Host "设置生产环境变量..." -ForegroundColor Yellow
$env:VITE_API_URL = $ApiUrl

# 检查Node.js是否安装
Write-Host "检查Node.js环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✓ Node.js版本: $nodeVersion" -ForegroundColor Green
    Write-Host "✓ npm版本: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "错误: Node.js未安装或未添加到PATH环境变量!" -ForegroundColor Red
    Write-Host "请先安装Node.js: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# 检查依赖是否安装
if (-not (Test-Path "node_modules")) {
    Write-Host "安装依赖包..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误: 依赖安装失败!" -ForegroundColor Red
        exit 1
    }
}

# 清理旧的构建文件
if (Test-Path "build") {
    Write-Host "清理旧的构建文件..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "build"
}

# 执行构建
Write-Host "开始构建前端项目..." -ForegroundColor Green
try {
    # 使用生产环境模式构建
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 构建成功完成!" -ForegroundColor Green
        
        # 验证构建结果
        if (Test-Path "build") {
            $buildFiles = Get-ChildItem "build" -Recurse | Measure-Object
            Write-Host "生成文件数量: $($buildFiles.Count)" -ForegroundColor Cyan
            
            # 检查API地址是否正确应用
            Write-Host "验证API地址配置..." -ForegroundColor Yellow
            $jsFiles = Get-ChildItem "build" -Filter "*.js" -Recurse
            foreach ($file in $jsFiles) {
                $content = Get-Content $file.FullName -Raw
                if ($content -match $ApiUrl) {
                    Write-Host "✓ API地址正确应用: $($file.Name)" -ForegroundColor Green
                }
                if ($content -match "localhost:8000") {
                    Write-Host "⚠️ 发现旧API地址: $($file.Name)" -ForegroundColor Yellow
                }
            }
        }
        
        Write-Host ""
        Write-Host "=== 构建完成 ===" -ForegroundColor Green
        Write-Host "构建目录: $(Get-Location)\build" -ForegroundColor Cyan
        Write-Host "API地址: $ApiUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "下一步操作:" -ForegroundColor Yellow
        Write-Host "1. 使用CloudBase工具上传build目录到静态托管" -ForegroundColor White
        Write-Host "2. 访问 https://tcb.cloud.tencent.com 查看部署状态" -ForegroundColor White
        
    } else {
        Write-Host "错误: 构建失败!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "错误: 构建过程中发生异常!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# 返回到原始目录
if (-not $isInFrontendDir) {
    Set-Location ".."
}