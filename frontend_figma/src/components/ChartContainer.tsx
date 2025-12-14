import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { CandlestickChart } from './CandlestickChart';
import { VolumeChart } from './VolumeChart';
import { KDJChart } from './KDJChart';
import type { StockData } from '../types/stock';

interface ChartContainerProps {
  data: StockData;
  divideDate: Date;
}

type ViewMode = 'historical' | 'future' | 'compare';
type TimeRange = 'day' | 'week' | 'month';

export function ChartContainer({ data, divideDate }: ChartContainerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('historical');
  const [timeRange, setTimeRange] = useState<TimeRange>('day');

  const historicalData = data.historicalData;
  const futureData = data.futureData;

  const currentData =
    viewMode === 'historical'
      ? historicalData
      : viewMode === 'future'
      ? futureData
      : [...historicalData.slice(-50), ...futureData.slice(0, 50)];

  return (
    <div className="space-y-6">
      {/* 控制栏 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* 视图切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('historical')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'historical'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingDown size={18} />
              <span>历史走势</span>
            </button>
            <button
              onClick={() => setViewMode('future')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'future'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp size={18} />
              <span>未来走势</span>
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                viewMode === 'compare'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart3 size={18} />
              <span>对比模式</span>
            </button>
          </div>

          {/* 时间周期选择 */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === 'day'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              日线
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === 'week'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              周线
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg transition-all ${
                timeRange === 'month'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              月线
            </button>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">股票代码</p>
              <p className="mt-1">
                {data.stockCode}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500">股票名称</p>
              <p className="mt-1">{data.stockName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">历史数据点</p>
              <p className="mt-1">{historicalData.length} 天</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">未来数据点</p>
              <p className="mt-1">{futureData.length} 天</p>
            </div>
          </div>
        </div>
      </div>

      {/* K线图 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="mb-4 flex items-center gap-2 text-slate-800">
          <BarChart3 size={20} />
          <span>K线图与均线指标</span>
          {viewMode === 'compare' && (
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded">
              分界点: {divideDate.toLocaleDateString('zh-CN')}
            </span>
          )}
        </h3>
        <CandlestickChart
          data={currentData}
          divideDate={viewMode === 'compare' ? divideDate : undefined}
          viewMode={viewMode}
        />
      </div>

      {/* 成交量图 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="mb-4 flex items-center gap-2 text-slate-800">
          <BarChart3 size={20} />
          <span>成交量</span>
        </h3>
        <VolumeChart
          data={currentData}
          divideDate={viewMode === 'compare' ? divideDate : undefined}
        />
      </div>

      {/* KDJ指标图 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="mb-4 flex items-center gap-2 text-slate-800">
          <BarChart3 size={20} />
          <span>KDJ指标</span>
        </h3>
        <KDJChart
          data={currentData}
          divideDate={viewMode === 'compare' ? divideDate : undefined}
        />
      </div>
    </div>
  );
}
