import React, { useState } from 'react';
import { StockSelector } from './components/StockSelector';
import { DateSelector } from './components/DateSelector';
import { ChartContainer } from './components/ChartContainer';
import { generateStockData } from './utils/stockDataService';
import type { StockData } from './types/stock';

export default function App() {
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [divideDate, setDivideDate] = useState<Date | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);

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
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = generateStockData(stockCode, date);
      setStockData(data);
    } catch (error) {
      console.error('加载股票数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="mb-8">
          <h1 className="text-4xl mb-2 text-slate-800">
            📈 股票趋势练习平台
          </h1>
          <p className="text-slate-600">
            选择股票和分界点日期，对比分析历史走势与未来趋势
          </p>
        </header>

        {/* 控制面板 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StockSelector
              value={selectedStock}
              onChange={handleStockChange}
            />
            <DateSelector
              value={divideDate}
              onChange={handleDateChange}
            />
          </div>

          {selectedStock && divideDate && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <span className="font-semibold">当前选择：</span>
                {selectedStock} | 分界点：{divideDate.toLocaleDateString('zh-CN')}
              </p>
            </div>
          )}
        </div>

        {/* 图表区域 */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">加载数据中...</p>
          </div>
        )}

        {!loading && stockData && (
          <ChartContainer data={stockData} divideDate={divideDate!} />
        )}

        {!loading && !stockData && selectedStock && divideDate && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-slate-600">数据加载失败，请重试</p>
          </div>
        )}

        {!selectedStock && !divideDate && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-slate-400">
              请选择股票代码和分界点日期以开始分析
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
