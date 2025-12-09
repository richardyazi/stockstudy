#!/bin/bash

echo "🚀 启动股票趋势练习网站..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "📦 构建并启动服务..."

# 构建并启动服务
docker-compose up --build -d

echo "⏳ 等待服务启动..."

# 等待后端服务启动
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."

# 检查后端服务
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "✅ 后端服务运行正常"
else
    echo "❌ 后端服务启动失败"
fi

# 检查前端服务
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 前端服务运行正常"
else
    echo "❌ 前端服务启动失败"
fi

echo ""
echo "🎉 股票趋势练习网站已启动完成！"
echo ""
echo "📊 前端地址: http://localhost:3000"
echo "🔧 后端API: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"
echo ""
echo "💡 使用说明:"
echo "   1. 打开浏览器访问 http://localhost:3000"
echo "   2. 输入股票代码（如：000001）"
echo "   3. 选择分界日期"
echo "   4. 点击'开始分析'查看图表"
echo ""
echo "🛑 停止服务: docker-compose down"
echo "📈 查看日志: docker-compose logs -f"