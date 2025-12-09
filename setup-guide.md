# 股票趋势练习网站 - 安装指南

## 第一步：安装Docker Desktop

由于系统检测到Docker未安装，请按照以下步骤安装：

### 1. 下载Docker Desktop
- 访问：https://www.docker.com/products/docker-desktop/
- 下载适用于Windows的Docker Desktop安装包

### 2. 安装Docker Desktop
- 运行下载的安装程序
- 按照向导完成安装
- 安装过程中选择"使用WSL 2而不是Hyper-V"

### 3. 启动并配置Docker Desktop
- 安装完成后启动Docker Desktop
- 进入设置界面（Settings）
- 在"General"选项卡中，确保"Use WSL 2 based engine"已勾选
- 在"Resources" > "WSL Integration"中，启用WSL 2集成

## 第二步：验证安装

安装完成后，请重新运行依赖检查：

```cmd
cd i:\stockstudy
install-dependencies.bat
```

## 第三步：启动服务

验证通过后，启动完整服务：

```cmd
start.bat
```

## 替代方案：手动安装依赖

如果Docker安装遇到问题，也可以手动安装依赖：

### 前端依赖
```cmd
cd frontend
npm install
npm run dev
```

### 后端依赖
```cmd
cd backend
pip install -r requirements.txt
python main.py
```

## 故障排除

### 常见问题
1. **WSL2未启用**：以管理员身份运行PowerShell，执行 `wsl --install`
2. **Hyper-V冲突**：确保在BIOS中启用虚拟化支持
3. **端口冲突**：检查3000、8000、6379端口是否被占用

### 获取帮助
- Docker官方文档：https://docs.docker.com/desktop/
- WSL2安装指南：https://docs.microsoft.com/windows/wsl/install

---

**重要提示**：Docker Desktop是运行本项目的前提条件，请务必先完成安装。