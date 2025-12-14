# 股票趋势练习网站 - 环境配置手册

## 配置变更说明 (v2.1 - 2025-12-14)

根据项目需求，本系统已调整为**单一开发环境配置**，简化了部署和维护复杂度。

### 变更内容
- ✅ 移除多环境配置（生产环境、开发环境）
- ✅ 统一使用单一开发环境配置
- ✅ 简化配置文件管理
- ✅ 优化资源配置，更适合开发调试

## 当前环境架构

### 开发环境配置

**基本信息**
- **环境ID**: `stockstudy-dev-7gg0qgesca10330c`
- **配置文件**: `cloudbaserc.json`
- **部署命令**: `tcb framework deploy`
- **配置版本**: v2.1 (2025-12-14)

**访问地址**
- **前端应用**: https://stockstudy-dev-7gg0qgesca10330c-1251378228.tcloudbaseapp.com/
- **后端API**: https://stockstudy-backend-dev-{id}.sh.run.tcloudbase.com/api/

**技术规格**
- **服务类型**: 容器型云托管
- **运行时**: Python 3.8+ (基于Dockerfile)
- **CPU规格**: 0.25核
- **内存规格**: 0.5GB
- **实例数**: 最小1个，最大2个
- **端口**: 8000

## 配置文件说明

### 主配置文件 (cloudbaserc.json)

```json
{
  "$schema": "https://framework-1258016615.tcloudbaseapp.com/schema/latest.json",
  "version": "2.0",
  "envId": "stockstudy-dev-7gg0qgesca10330c",
  "region": "ap-shanghai",
  "functionRoot": "./backend-cloudbase",
  "functions": [
    {
      "name": "stockstudy-backend-dev",
      "timeout": 60,
      "envVariables": {
        "TCB_ENV_ID": "stockstudy-dev-7gg0qgesca10330c",
        "NODE_ENV": "development",
        "DEBUG": "true",
        "CACHE_EXPIRE": "1800"
      },
      "runtime": "Nodejs18.15",
      "memory": 256,
      "handler": "index.handler",
      "installDependency": true,
      "ignore": [
        "node_modules",
        "node_modules/**/*",
        ".git"
      ]
    }
  ],
  "hosting": {
    "stockstudy-frontend-dev": {
      "public": "./frontend/dist",
      "ignore": [
        "node_modules",
        "node_modules/**/*",
        ".git"
      ],
      "rewriteRules": [
        {
          "source": "^((?!\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|txt|xml|map)$).)*$",
          "target": "/index.html"
        }
      ]
    }
  }
}
```

### 环境变量配置

**开发环境特性**
- **调试模式**: 启用DEBUG模式，便于问题排查
- **缓存时间**: 1800秒，适合开发调试需求
- **内存配置**: 256MB，优化开发资源使用
- **访问方式**: 公网访问 (PUBLIC)

## 部署流程

### 首次部署

1. **环境准备**
   ```bash
   # 创建CloudBase开发环境
   # 环境ID: stockstudy-dev-7gg0qgesca10330c
   ```

2. **环境检查**
   ```bash
   # 检查环境配置
   check-env.bat
   ```

3. **部署应用**
   ```bash
   # 部署到开发环境
   deploy-dev.bat
   ```

### 更新部署

```bash
# 代码更新后重新部署
tcb framework deploy
```

## 脚本说明

### 部署脚本
- `deploy-dev.bat` - 开发环境部署脚本
- `build-frontend-cloudbase.bat` - 前端构建脚本

### 检查脚本
- `check-env.bat` - 环境配置检查脚本

## API接口文档

### 基础接口

**健康检查接口**
```
GET /api/health
```

**响应示例**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-14T10:30:00Z",
  "version": "2.1"
}
```

### 股票数据接口

**获取股票数据**
```
GET /api/stock/{symbol}
参数:
  - dividing_date: 分界日期 (YYYY-MM-DD)
  - historical_days: 历史天数
  - future_days: 未来天数
```

**股票搜索接口**
```
GET /api/stock/search
参数:
  - query: 搜索关键词
```

## 故障排除

### 常见问题

1. **部署失败**
   - 检查环境ID是否正确配置
   - 确认CloudBase环境已创建
   - 检查网络连接

2. **API连接失败**
   - 检查后端服务是否正常运行
   - 确认API路径配置正确
   - 检查CORS配置

3. **前端构建失败**
   - 检查Node.js版本
   - 确认依赖安装完成
   - 检查构建脚本配置

### 日志查看

```bash
# 查看部署日志
tcb framework deploy --verbose

# 查看服务状态
tcb env:info
```

## 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  前端应用        │    │  后端API服务     │    │  CloudBase平台   │
│                 │    │                 │    │                 │
│ • React + Vite  │◄──►│ • FastAPI       │◄──►│ • 云托管服务     │
│ • Recharts图表  │    │ • AKShare数据   │    │ • 静态网站托管   │
│ • Tailwind CSS  │    │ • Redis缓存     │    │ • 自动扩缩容     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                       │                       │
       │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  用户浏览器      │    │  A股数据源      │    │  腾讯云基础设施  │
│                 │    │                 │    │                 │
│ • 股票数据展示   │    │ • 实时行情数据  │    │ • 计算资源       │
│ • 技术指标分析   │    │ • 历史数据      │    │ • 网络资源       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 技术支持

- **CloudBase官方文档**: https://cloudbase.net
- **项目Issue反馈**: 项目仓库Issues
- **维护团队**: 项目开发团队

---

**最后更新**: 2025-12-14  
**维护团队**: 项目开发团队  
**项目状态**: ✅ 开发环境就绪  
**配置版本**: v2.1