// 环境配置
interface AppConfig {
  /** 默认股票配置文件路径 */
  stockConfigPath: string;
  /** 是否启用配置缓存 */
  enableConfigCache: boolean;
  /** 缓存过期时间（毫秒） */
  cacheExpiry: number;
}

// 开发环境配置
export const devConfig: AppConfig = {
  stockConfigPath: '/src/config/stock-config.json',
  enableConfigCache: true,
  cacheExpiry: 5 * 60 * 1000 // 5分钟
};

// 生产环境配置
export const prodConfig: AppConfig = {
  stockConfigPath: '/src/config/stock-config.json',
  enableConfigCache: true,
  cacheExpiry: 30 * 60 * 1000 // 30分钟
};

// 根据环境变量选择配置
const isProduction = import.meta.env.PROD;
export const appConfig: AppConfig = isProduction ? prodConfig : devConfig;