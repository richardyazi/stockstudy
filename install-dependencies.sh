#!/bin/bash

echo "📦 安装股票趋势练习网站依赖..."

# 检查系统类型
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "检测到 Linux 系统"
    # Linux 依赖安装
    if command -v apt-get &> /dev/null; then
        echo "使用 apt-get 安装依赖..."
        sudo apt-get update
        sudo apt-get install -y docker.io docker-compose curl
    elif command -v yum &> /dev/null; then
        echo "使用 yum 安装依赖..."
        sudo yum install -y docker docker-compose curl
    fi
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "检测到 macOS 系统"
    echo "请手动安装 Docker Desktop: https://www.docker.com/products/docker-desktop"
    
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "检测到 Windows 系统"
    echo "请手动安装 Docker Desktop: https://www.docker.com/products/docker-desktop"
    echo "安装完成后，请确保启用 WSL2 后端"
fi

echo "✅ 依赖安装完成"