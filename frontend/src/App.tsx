import React, { useState, useEffect } from 'react';
import { StockSelector } from './components/StockSelector';
import { DateSelector } from './components/DateSelector';
import { ChartContainer } from './components/ChartContainer';
import { getStockData, healthCheck } from './services/apiService';
import type { StockData } from './types/stock';

export default function App() {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [divideDate, setDivideDate] = useState<Date | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const isHealthy = await healthCheck();
      setBackendStatus(isHealthy ? 'healthy' : 'unhealthy');
    } catch (error) {
      console.error('后端健康检查失败:', error);
      setBackendStatus('unhealthy');
    }
  };

  const handleStockChange = (stockCode: string) => {
    setSelectedStock(stockCode);
    if (stockCode && divideDate) {
      loadStockData(stockCode, divideDate);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setDivideDate(date);
    if (selectedStock && date) {
      loadStockData(selectedStock, date);
    }
  };

  const loadStockData = async (stockCode: string, date: Date) => {
    setLoading(true);
    try {
      // 检查后端服务是否健康
      const isHealthy = await healthCheck();
      if (!isHealthy) {
        throw new Error('后端服务不可用，请确保后端服务已启动');
      }

      // 通过API获取真实股票数据
      const data = await getStockData(stockCode, date);
      
      if (!data) {
        throw new Error('获取股票数据失败，请检查股票代码和日期');
      }
      
      setStockData(data);
    } catch (error) {
      console.error('加载股票数据失败:', error);
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* 紧凑顶部控制栏 */}
      <div className="bg-white shadow-sm border-b border-slate-200 px-3 py-2 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          {/* 标题 */}
          <div className="flex items-center">
            <h1 className="text-base text-slate-800">
              📈 股票趋势练习
            </h1>
          </div>

          {/* 分隔线 */}
          <div className="h-5 w-px bg-slate-300"></div>

          {/* 后端状态指示器 */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            backendStatus === 'healthy' ? 'bg-green-100 text-green-800' :
            backendStatus === 'unhealthy' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {backendStatus === 'healthy' ? '✅' :
             backendStatus === 'unhealthy' ? '❌' :
             '⏳'}
          </div>

          {/* 分隔线 */}
          <div className="h-5 w-px bg-slate-300"></div>

          {/* 控制区域 */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-52">
              <StockSelector
                value={selectedStock}
                onChange={handleStockChange}
              />
            </div>
            <div className="w-40">
              <DateSelector
                value={divideDate}
                onChange={handleDateChange}
              />
            </div>
            
            {selectedStock && divideDate && (
              <>
                <div className="h-5 w-px bg-slate-300"></div>
                <div className="text-xs text-slate-600">
                  <span className="font-semibold">{selectedStock}</span>
                  <span className="mx-1.5">|</span>
                  <span>{divideDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 图表区域 - 占据剩余空间 */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <div>
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-3 text-sm text-slate-600">加载数据中...</p>
            </div>
          </div>
        )}

        {!loading && stockData && (
          <ChartContainer data={stockData} divideDate={divideDate!} />
        )}

        {!loading && !stockData && selectedStock && divideDate && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-slate-600">数据加载失败，请重试</p>
          </div>
        )}

        {!selectedStock && !divideDate && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-slate-400">
              请选择股票代码和分界点日期以开始分析
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
