import { StockOption } from '../types/stock';

// 默认配置文件路径
export const DEFAULT_CONFIG_PATH = '/src/config/stock-config.json';

// 配置接口定义
interface StockConfig {
  stocks: StockOption[];
}

// 配置校验错误类型
export enum ConfigErrorType {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_JSON = 'INVALID_JSON',
  MISSING_STOCKS_FIELD = 'MISSING_STOCKS_FIELD',
  INVALID_STOCK_ITEM = 'INVALID_STOCK_ITEM',
  EMPTY_STOCK_LIST = 'EMPTY_STOCK_LIST'
}

export class ConfigError extends Error {
  constructor(
    public type: ConfigErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

// 默认股票列表（备用）
const DEFAULT_STOCK_LIST: StockOption[] = [
  { code: '000001', name: '平安银行', label: '000001[平安银行]' },
  { code: '000002', name: '万科A', label: '000002[万科A]' },
  { code: '000063', name: '中兴通讯', label: '000063[中兴通讯]' },
  { code: '000333', name: '美的集团', label: '000333[美的集团]' },
  { code: '000858', name: '五粮液', label: '000858[五粮液]' },
  { code: '600000', name: '浦发银行', label: '600000[浦发银行]' },
  { code: '600036', name: '招商银行', label: '600036[招商银行]' },
  { code: '600519', name: '贵州茅台', label: '600519[贵州茅台]' },
  { code: '600887', name: '伊利股份', label: '600887[伊利股份]' },
  { code: '601318', name: '中国平安', label: '601318[中国平安]' },
  { code: '601398', name: '工商银行', label: '601398[工商银行]' },
  { code: '601888', name: '中国中免', label: '601888[中国中免]' },
];

// 校验单个股票项
function validateStockItem(item: any): item is StockOption {
  if (!item || typeof item !== 'object') {
    return false;
  }
  
  const { code, name, label } = item;
  
  if (typeof code !== 'string' || !code.trim()) {
    return false;
  }
  
  if (typeof name !== 'string' || !name.trim()) {
    return false;
  }
  
  if (typeof label !== 'string' || !label.trim()) {
    return false;
  }
  
  return true;
}

// 校验配置数据
function validateConfig(config: any): config is StockConfig {
  if (!config || typeof config !== 'object') {
    throw new ConfigError(
      ConfigErrorType.INVALID_JSON,
      '配置文件格式错误：必须是有效的 JSON 对象'
    );
  }
  
  if (!Array.isArray(config.stocks)) {
    throw new ConfigError(
      ConfigErrorType.MISSING_STOCKS_FIELD,
      '配置文件缺少 stocks 字段或格式错误'
    );
  }
  
  if (config.stocks.length === 0) {
    throw new ConfigError(
      ConfigErrorType.EMPTY_STOCK_LIST,
      '股票列表不能为空'
    );
  }
  
  const invalidItems = config.stocks.filter((item, index) => !validateStockItem(item));
  if (invalidItems.length > 0) {
    throw new ConfigError(
      ConfigErrorType.INVALID_STOCK_ITEM,
      `发现 ${invalidItems.length} 个无效的股票项`,
      { invalidItems }
    );
  }
  
  return true;
}

// 加载配置文件
export async function loadStockConfig(configPath?: string): Promise<StockOption[]> {
  const path = configPath || DEFAULT_CONFIG_PATH;
  
  try {
    // 动态导入配置文件
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new ConfigError(
        ConfigErrorType.FILE_NOT_FOUND,
        `配置文件未找到：${path}`,
        { status: response.status, statusText: response.statusText }
      );
    }
    
    const configData = await response.json();
    
    // 校验配置
    validateConfig(configData);
    
    console.log(`✅ 成功加载股票配置，共 ${configData.stocks.length} 只股票`);
    return configData.stocks;
    
  } catch (error) {
    if (error instanceof ConfigError) {
      console.warn(`⚠️ 配置文件加载失败，使用默认股票列表：${error.message}`);
    } else {
      console.warn(`⚠️ 配置文件加载异常，使用默认股票列表：${error}`);
    }
    
    // 返回默认股票列表
    return DEFAULT_STOCK_LIST;
  }
}

// 获取错误信息（用于显示给用户）
export function getConfigErrorMessage(error: ConfigError): string {
  const messages = {
    [ConfigErrorType.FILE_NOT_FOUND]: '股票配置文件未找到，请检查配置文件路径',
    [ConfigErrorType.INVALID_JSON]: '股票配置文件格式错误，请检查 JSON 格式',
    [ConfigErrorType.MISSING_STOCKS_FIELD]: '股票配置文件缺少必要的 stocks 字段',
    [ConfigErrorType.INVALID_STOCK_ITEM]: '股票配置文件中包含无效的股票项',
    [ConfigErrorType.EMPTY_STOCK_LIST]: '股票列表为空，请至少添加一只股票'
  };
  
  return messages[error.type] || '未知配置文件错误';
}

// 导出默认配置（用于开发和测试）
export { DEFAULT_STOCK_LIST };