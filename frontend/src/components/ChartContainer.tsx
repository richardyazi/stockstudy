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
    <div className="h-full bg-white flex flex-col">
      {/* 紧凑控制栏 */}
      <div className="border-b border-slate-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* 左侧：视图切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('historical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-all ${
                viewMode === 'historical'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingDown size={14} />
              <span>历史走势</span>
            </button>
            <button
              onClick={() => setViewMode('future')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-all ${
                viewMode === 'future'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp size={14} />
              <span>未来走势</span>
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-all ${
                viewMode === 'compare'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart3 size={14} />
              <span>对比模式</span>
            </button>
          </div>

          {/* 右侧：时间周期和统计信息 */}
          <div className="flex items-center gap-4">
            {/* 统计信息 */}
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span>{data.stockCode} {data.stockName}</span>
              <span>历史: {historicalData.length}天</span>
              <span>未来: {futureData.length}天</span>
            </div>
            
            {/* 分隔线 */}
            <div className="h-6 w-px bg-slate-300"></div>

            {/* 时间周期 */}
            <div className="flex gap-1">
              <button
                onClick={() => setTimeRange('day')}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  timeRange === 'day'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                日线
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  timeRange === 'week'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                周线
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  timeRange === 'month'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                月线
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 - 紧凑垂直布局 */}
      <div className="flex-1 overflow-auto">
        {/* K线图 */}
        <div className="border-b border-slate-200 px-4 pt-2 pb-1">
          <CandlestickChart
            data={currentData}
            divideDate={viewMode === 'compare' ? divideDate : undefined}
            viewMode={viewMode}
          />
        </div>

        {/* 成交量图 */}
        <div className="border-b border-slate-200 px-4 pt-2 pb-1">
          <VolumeChart
            data={currentData}
            divideDate={viewMode === 'compare' ? divideDate : undefined}
          />
        </div>

        {/* KDJ指标图 */}
        <div className="px-4 pt-2 pb-2">
          <KDJChart
            data={currentData}
            divideDate={viewMode === 'compare' ? divideDate : undefined}
          />
        </div>
      </div>
    </div>
  );
}