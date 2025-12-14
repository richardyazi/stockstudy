# 股票趋势练习网站 - 开发环境指南

## 项目概述

股票趋势练习网站是一个用于学习和练习股票技术分析的工具，提供专业的K线图、技术指标展示和趋势分析功能。

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 4.5
- **UI组件**: Recharts (图表库)
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios

### 后端
- **框架**: FastAPI
- **语言**: Python 3.11
- **数据获取**: AKShare
- **数据处理**: Pandas
- **缓存**: Redis

### 开发工具
- **容器化**: Docker + Docker Compose
- **包管理**: npm (前端), pip (后端)
- **代码质量**: ESLint, TypeScript

## 快速开始

### 方式一：开发模式（推荐）

1. **设置开发环境**
   ```bash
   # 运行设置脚本
   setup-dev.bat
   ```

2. **启动开发服务**
   ```bash
   # 启动前端和后端服务
   start-dev.bat
   ```

3. **访问应用**
   - 前端应用: http://localhost:3000
   - 后端API: http://localhost:8000
   - API文档: http://localhost:8000/docs

### 方式二：Docker开发模式

1. **使用Docker Compose启动**
   ```bash
   # 启动开发环境（包含Redis）
   docker-compose -f docker-compose.dev.yml up
   ```

2. **访问应用**
   - 前端应用: http://localhost:3000
   - 后端API: http://localhost:8000

### 方式三：生产模式

1. **使用Docker Compose启动**
   ```bash
   # 启动生产环境
   start.bat
   ```

## 开发环境详细配置

### 前置要求

- **Node.js** (18.0+): [下载地址](https://nodejs.org/zh-cn/download/)
- **Python** (3.8+): [下载地址](https://www.python.org/downloads/)
- **Docker** (可选): [下载地址](https://www.docker.com/products/docker-desktop/)

### 环境变量配置

#### 后端环境变量 (.env)
```bash
# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0

# 应用配置
DEBUG=true
CACHE_EXPIRE=3600
LOG_LEVEL=DEBUG
```

#### 前端环境变量
```bash
# Vite环境变量
VITE_API_URL=http://localhost:8000
```

### 项目结构

```
stockstudy/
├── backend/                 # 后端服务
│   ├── main.py             # 主应用文件
│   ├── main_simple.py      # 简化版应用（开发用）
│   ├── requirements.txt    # 生产依赖
│   ├── requirements_simple.txt # 开发依赖
│   └── Dockerfile          # Docker镜像配置
├── frontend/               # 前端应用
│   ├── src/                # 源代码
│   ├── package.json        # 依赖配置
│   ├── vite.config.ts      # Vite配置
│   └── Dockerfile          # Docker镜像配置
├── docker-compose.yml      # 生产环境配置
├── docker-compose.dev.yml  # 开发环境配置
├── setup-dev.bat           # 环境设置脚本
├── start-dev.bat           # 开发启动脚本
├── stop-dev.bat            # 开发停止脚本
└── README.md               # 项目说明
```

## 开发工作流

### 前端开发

1. **进入前端目录**
   ```bash
   cd frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **代码检查**
   ```bash
   npm run lint          # ESLint检查
   npm run type-check    # TypeScript类型检查
   ```

### 后端开发

1. **进入后端目录**
   ```bash
   cd backend
   ```

2. **安装依赖**
   ```bash
   pip install -r requirements_simple.txt
   ```

3. **启动开发服务器**
   ```bash
   python main_simple.py
   ```

4. **API测试**
   ```bash
   # 测试健康检查
   curl http://localhost:8000/api/health
   
   # 测试股票数据接口
   curl "http://localhost:8000/api/stock/000001?start_date=2023-01-01&end_date=2023-12-31"
   ```

## 调试和故障排除

### 常见问题

1. **端口占用问题**
   ```bash
   # 查看端口占用
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000
   netstat -ano | findstr :6379
   ```

2. **依赖安装失败**
   - 检查网络连接
   - 尝试使用国内镜像源
   - 清除缓存重新安装

3. **Docker容器问题**
   ```bash
   # 查看容器状态
   docker ps
   
   # 查看容器日志
   docker logs <container_name>
   
   # 重启容器
   docker restart <container_name>
   ```

### 日志查看

- **前端日志**: 浏览器开发者工具控制台
- **后端日志**: 后端服务控制台输出
- **Redis日志**: `docker logs redis-dev`

## 性能优化

### 前端优化
- 使用代码分割和懒加载
- 图表组件按需加载
- 启用Gzip压缩

### 后端优化
- Redis缓存股票数据
- 异步处理数据请求
- 启用响应压缩

## CloudBase开发环境部署说明

### 本地开发环境
```bash
# 使用开发模式
start-dev.bat

# 或使用Docker开发模式
docker-compose -f docker-compose.dev.yml up
```

### CloudBase开发环境部署
```bash
# 部署到CloudBase开发环境
tcb framework deploy

# 开发环境访问地址
# 前端: https://stockstudy-dev-7gg0qgesca10330c-1251378228.tcloudbaseapp.com/
# 后端: https://stockstudy-backend-dev-{id}.sh.run.tcloudbase.com/api/
```

### 环境配置说明

**配置变更记录 (v2.1 - 2025-12-14):**
- 调整为单一开发环境配置，简化部署流程
- 统一使用 `cloudbaserc.json` 配置文件
- 移除多环境复杂度，专注于开发调试需求

#### 环境变量配置
- **本地开发**: 使用默认环境变量 (localhost:8000)
- **CloudBase开发环境**: 使用统一配置文件 (cloudbaserc.json)

#### API连接配置
前端应用会根据环境自动调整API连接地址：
- 本地开发: http://localhost:8000
- CloudBase开发环境: 开发环境后端地址

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

本项目采用MIT许可证。

## 技术支持

如有问题，请提交Issue或联系开发团队。