# 股票趋势练习网站 - 版本变更记录

## v2.1 (2025-12-14)

### 重大变更

#### 环境配置重构
- **移除多环境配置**: 将原有的生产环境+开发环境双环境架构，调整为单一开发环境配置
- **简化配置文件**: 删除 `cloudbaserc.dev.json`，统一使用 `cloudbaserc.json` 作为开发环境配置文件
- **环境ID变更**: 主配置文件环境ID从 `stockstudy-7gg0qgesca10330c` 变更为 `stockstudy-dev-7gg0qgesca10330c`

#### 配置优化
- **开发友好配置**: 启用DEBUG模式，缓存时间调整为1800秒，内存配置优化为256MB
- **服务名称变更**: 后端服务名称从 `stockstudy-backend` 变更为 `stockstudy-backend-dev`
- **前端托管名称**: 静态网站托管名称从 `stockstudy-frontend` 变更为 `stockstudy-frontend-dev`

#### 文档更新
- **项目文档重构**: 更新 README.md、DEPLOYMENT.md、DEVELOPMENT.md 文档，移除多环境相关内容
- **新增配置手册**: 创建 ENV_CONFIG_GUIDE.md 环境配置手册
- **删除过时文档**: 删除 MULTI_ENV_GUIDE.md 多环境指南

#### 脚本清理
- **删除生产环境脚本**: 删除 `deploy-prod.bat` 生产环境部署脚本
- **更新开发环境脚本**: 更新 `deploy-dev.bat` 和 `check-env.bat`，适配单一环境配置

### 影响范围

#### 配置文件变更
```
修改文件:
- cloudbaserc.json (重构为开发环境配置)
- deploy-dev.bat (更新部署命令)
- check-env.bat (更新环境检查逻辑)

删除文件:
- cloudbaserc.dev.json (开发环境配置文件)
- deploy-prod.bat (生产环境部署脚本)
- MULTI_ENV_GUIDE.md (多环境指南)
```

#### 部署流程变更
- **部署命令简化**: 统一使用 `tcb framework deploy`，无需配置文件参数
- **环境检查简化**: 仅检查单一开发环境配置
- **部署目标变更**: 所有部署均指向开发环境 `stockstudy-dev-7gg0qgesca10330c`

#### 访问地址变更
- **前端应用**: https://stockstudy-dev-7gg0qgesca10330c-1251378228.tcloudbaseapp.com/
- **后端API**: https://stockstudy-backend-dev-{id}.sh.run.tcloudbase.com/api/

### 技术细节

#### 配置对比
| 配置项 | v2.0 (多环境) | v2.1 (单一环境) |
|--------|--------------|----------------|
| 环境数量 | 2 (生产+开发) | 1 (开发) |
| 配置文件 | 2个 | 1个 |
| 部署脚本 | 2个 | 1个 |
| 调试模式 | 仅开发环境 | 始终启用 |
| 内存配置 | 生产512MB/开发256MB | 统一256MB |

#### 部署流程对比
- **v2.0**: 需要区分环境配置文件，部署命令复杂
- **v2.1**: 单一配置文件，标准部署命令，简化操作

### 迁移指南

#### 从v2.0升级到v2.1
1. **备份现有配置**: 备份 `cloudbaserc.json` 和 `cloudbaserc.dev.json`
2. **更新配置文件**: 使用新的 `cloudbaserc.json` 开发环境配置
3. **清理过时文件**: 删除 `cloudbaserc.dev.json` 和 `deploy-prod.bat`
4. **更新部署脚本**: 使用新的 `deploy-dev.bat`
5. **重新部署**: 执行 `deploy-dev.bat` 部署到开发环境

#### 注意事项
- 此次变更不影响现有数据，仅涉及环境配置调整
- 原有生产环境数据保持不变，但后续部署将指向开发环境
- 如需重新启用生产环境，需要手动恢复相应配置

### 维护说明

#### 后续维护
- 所有部署操作均使用单一开发环境配置
- 调试模式始终启用，便于问题排查
- 资源配置针对开发场景优化，成本可控

#### 技术支持
- 如有环境配置问题，参考 ENV_CONFIG_GUIDE.md
- 部署问题参考 DEPLOYMENT.md
- 开发问题参考 DEVELOPMENT.md

---

**变更日期**: 2025-12-14  
**变更人员**: 项目开发团队  
**审核状态**: ✅ 已完成  
**影响评估**: 🔄 中等影响（配置变更，不影响功能）