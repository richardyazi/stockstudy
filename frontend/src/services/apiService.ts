import axios from 'axios';
import type { StockData, StockSearchResult } from '../types/stock';

// API基础URL - 生产环境地址
const API_BASE_URL = 'https://stockstudy-backend-207775-4-1251378228.sh.run.tcloudbase.com';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API请求错误:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 搜索股票
// 搜索股票
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const response = await apiClient.get(`/api/stock/search?query=${encodeURIComponent(query)}`);
    return response.data.stocks || [];
  } catch (error) {
    console.error('搜索股票失败:', error);
    // 如果API失败，返回空数组
    return [];
  }
}

// 获取股票数据
export async function getStockData(
  stockCode: string,
  divideDate: Date,
  historicalDays: number = 180,
  futureDays: number = 90
): Promise<StockData | null> {
  try {
    const formattedDate = divideDate.toISOString().split('T')[0];
    
    const response = await apiClient.get(
      `/api/stock/${stockCode}?dividing_date=${formattedDate}&historical_days=${historicalDays}&future_days=${futureDays}`
    );

    const apiData = response.data;

    // 转换API数据格式为前端需要的格式
    const transformDataPoint = (point: any) => ({
      date: new Date(point.date),
      open: point.open,
      high: point.high,
      low: point.low,
      close: point.close,
      volume: point.volume,
      indicators: {
        k: point.kdj?.k || null,
        d: point.kdj?.d || null,
        j: point.kdj?.j || null,
        vol5: point.mavol5 || null,
        vol10: point.mavol10 || null,
        vol100: point.mavol100 || null,
      }
    });

    const historicalData = apiData.historical_data.map(transformDataPoint);
    const futureData = apiData.future_data.map(transformDataPoint);
    const allData = [...historicalData, ...futureData];

    return {
      stockCode: apiData.symbol,
      stockName: apiData.name,
      divideDate: new Date(apiData.dividing_date),
      historicalData,
      futureData,
      allData,
    };
  } catch (error) {
    console.error('获取股票数据失败:', error);
    
    // 如果API失败，返回null，前端会显示错误信息
    return null;
  }
}

// 健康检查
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await apiClient.get('/api/health');
    return response.status === 200;
  } catch (error) {
    console.error('后端服务健康检查失败:', error);
    return false;
  }
}

// 获取股票列表（用于下拉选择）
export async function getStockList(): Promise<StockSearchResult[]> {
  try {
    // 搜索空字符串获取所有股票
    return await searchStocks('');
  } catch (error) {
    console.error('获取股票列表失败:', error);
    return [];
  }
}