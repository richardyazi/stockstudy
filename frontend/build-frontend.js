const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建前端项目...');

// 确保存在 .env.production 文件
if (!fs.existsSync('.env.production')) {
  console.error('❌ 找不到 .env.production 文件');
  process.exit(1);
}

// 复制 .env.production 为 .env（用于构建）
fs.copyFileSync('.env.production', '.env');
console.log('✅ 已设置生产环境配置');

// 删除旧的构建目录
if (fs.existsSync('build')) {
  fs.rmSync('build', { recursive: true, force: true });
  console.log('✅ 已清理旧的构建文件');
}

try {
  // 安装依赖
  console.log('📦 安装依赖...');
  execSync('npm install', { stdio: 'inherit' });
  
  // 构建项目
  console.log('🔨 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 验证构建结果
  if (fs.existsSync('build')) {
    console.log('✅ 构建成功！');
    
    // 检查构建文件中的API地址
    const indexPath = path.join('build', 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('📄 构建文件已生成');
    }
    
    // 验证API地址是否正确配置
    console.log('🔍 验证API地址配置...');
    
    // 搜索构建文件中的API地址
    const buildFiles = fs.readdirSync('build');
    buildFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join('build', file);
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('stockstudy-backend-207775-4-1251378228')) {
          console.log(`✅ 生产环境API地址已正确配置在 ${file}`);
        }
        if (content.includes('localhost:8000')) {
          console.warn(`⚠️  发现旧的API地址在 ${file}`);
        }
      }
    });
    
  } else {
    throw new Error('构建目录不存在');
  }
  
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}