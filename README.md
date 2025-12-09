# 股票趋势练习网站

基于AKShare API的股票趋势分析练习平台，帮助用户通过历史数据练习股票趋势判断和技术指标分析。

## 🚀 功能特性

- **股票选择与日期分界点设置** - 支持A股股票代码输入和日期分界点选择
- **K线图展示** - 专业的蜡烛图展示，支持价格走势分析
- **成交量副图** - 成交量柱状图，叠加MAVOL5、MAVOL10、MAVOL100移动平均线
- **KDJ技术指标** - 完整的KDJ指标计算和可视化展示
- **对比分析** - 分界点前后数据对比分析
- **数据统计** - 关键指标统计和对比分析

## 🛠️ 技术栈

### 前端
- React 18 + TypeScript
- shadcn/ui (基于Tailwind CSS)
- Recharts (图表可视化)
- Vite (构建工具)

### 后端
- FastAPI (Python异步框架)
- AKShare (A股数据接口)
- Redis (数据缓存)
- Pandas + NumPy (数据处理)

## 🚀 快速开始

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+

### 一键启动

```bash
# 克隆项目
git clone <项目地址>
cd stockstudy

# 启动服务
./start.sh
```

### 手动启动

```bash
# 启动所有服务
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 访问地址
- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

## 📊 使用说明

1. **选择股票**: 输入A股股票代码（如：000001 平安银行）
2. **设置分界点**: 选择分析的分界日期
3. **开始分析**: 点击"开始分析"按钮
4. **查看图表**: 
   - K线图：价格走势分析
   - 成交量图：交易量分析
   - KDJ指标：超买超卖分析
5. **对比分析**: 查看分界点前后的数据对比

## 🏗️ 项目结构

```
stockstudy/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/       # React组件
│   │   │   ├── charts/       # 图表组件
│   │   │   └── ui/           # UI组件
│   │   ├── lib/              # 工具函数
│   │   └── App.tsx           # 主应用
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # 后端API服务
│   ├── main.py              # FastAPI应用
│   └── requirements.txt     # Python依赖
├── docs/                     # 项目文档
├── docker-compose.yml       # Docker编排
└── start.sh                 # 启动脚本
```

## 🔧 开发指南

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

### 后端开发

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 环境变量配置

后端服务支持以下环境变量：
- `REDIS_HOST`: Redis主机地址 (默认: localhost)
- `REDIS_PORT`: Redis端口 (默认: 6379)

## 📈 API接口

### 获取股票数据
```
GET /api/stock/{symbol}?dividing_date=2024-01-01&historical_days=180&future_days=90
```

### 搜索股票
```
GET /api/stock/search?query=平安
```

### 健康检查
```
GET /api/health
```

## 🐛 故障排除

### 常见问题

1. **服务启动失败**
   - 检查Docker和Docker Compose是否安装
   - 检查端口3000、8000、6379是否被占用

2. **股票数据获取失败**
   - 检查股票代码格式是否正确
   - 确认AKShare API服务正常

3. **图表显示异常**
   - 检查浏览器控制台是否有错误信息
   - 确认网络连接正常

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs backend
docker-compose logs redis
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

MIT License

## 📞 联系信息

如有问题或建议，请通过以下方式联系：
- 提交Issue
- 发送邮件

---

**项目状态**: 🚀 开发中  
**最后更新**: 2025-12-09