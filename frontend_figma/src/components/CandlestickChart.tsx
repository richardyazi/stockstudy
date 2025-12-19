import React, { useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { StockDataPoint } from '../types/stock';

interface CandlestickChartProps {
  data: StockDataPoint[];
  divideDate?: Date;
  viewMode?: 'historical' | 'future' | 'compare';
}

export function CandlestickChart({
  data,
  divideDate,
  viewMode = 'historical',
}: CandlestickChartProps) {
  const [showMA, setShowMA] = useState({
    ma5: true,
    ma10: true,
    ma20: true,
    ma60: false,
  });

  // 准备图表数据
  const chartData = data.map((point) => {
    const isHistorical = divideDate
      ? point.date.getTime() < divideDate.getTime()
      : viewMode === 'historical';

    return {
      date: point.date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      }),
      fullDate: point.date,
      open: point.open,
      close: point.close,
      high: point.high,
      low: point.low,
      // K线的绘制：使用上下影线
      candleHigh: point.high,
      candleLow: point.low,
      // K线实体
      candleBody: [
        Math.min(point.open, point.close),
        Math.max(point.open, point.close),
      ],
      isRise: point.close >= point.open,
      isHistorical,
      ma5: point.indicators.ma5,
      ma10: point.indicators.ma10,
      ma20: point.indicators.ma20,
      ma60: point.indicators.ma60,
    };
  });

  // 自定义K线绘制
  const CustomCandlestick = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    const { high, low, open, close, isRise, isHistorical } = payload;

    // 计算坐标
    const yScale = height / (Math.max(...data.map((d) => d.high)) - Math.min(...data.map((d) => d.low)));
    const minPrice = Math.min(...data.map((d) => d.low));

    const highY = y + height - (high - minPrice) * yScale;
    const lowY = y + height - (low - minPrice) * yScale;
    const openY = y + height - (open - minPrice) * yScale;
    const closeY = y + height - (close - minPrice) * yScale;

    const color = isRise ? '#ef4444' : '#22c55e';
    const opacity = viewMode === 'compare' && !isHistorical ? 0.4 : 1;

    return (
      <g opacity={opacity}>
        {/* 上下影线 */}
        <line
          x1={x + width / 2}
          y1={highY}
          x2={x + width / 2}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        {/* K线实体 */}
        <rect
          x={x + 1}
          y={Math.min(openY, closeY)}
          width={Math.max(width - 2, 1)}
          height={Math.abs(closeY - openY) || 1}
          fill={color}
          stroke={color}
        />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
        <p className="mb-2 text-slate-600">{data.fullDate.toLocaleDateString('zh-CN')}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">开盘:</span>
            <span>{data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">收盘:</span>
            <span>{data.close.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">最高:</span>
            <span>{data.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">最低:</span>
            <span>{data.low.toFixed(2)}</span>
          </div>
          {data.ma5 && !isNaN(data.ma5) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">MA5:</span>
              <span>{data.ma5.toFixed(2)}</span>
            </div>
          )}
          {data.ma10 && !isNaN(data.ma10) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">MA10:</span>
              <span>{data.ma10.toFixed(2)}</span>
            </div>
          )}
          {data.ma20 && !isNaN(data.ma20) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">MA20:</span>
              <span>{data.ma20.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* 均线控制 */}
      <div className="flex flex-wrap gap-1.5">
        <label className="flex items-center gap-1.5 px-2 py-0.5 text-xs bg-slate-100 rounded cursor-pointer hover:bg-slate-200 transition-colors">
          <input
            type="checkbox"
            checked={showMA.ma5}
            onChange={(e) => setShowMA({ ...showMA, ma5: e.target.checked })}
            className="rounded w-3 h-3"
          />
          <span>MA5</span>
          <div className="w-4 h-0.5 bg-blue-500"></div>
        </label>
        <label className="flex items-center gap-1.5 px-2 py-0.5 text-xs bg-slate-100 rounded cursor-pointer hover:bg-slate-200 transition-colors">
          <input
            type="checkbox"
            checked={showMA.ma10}
            onChange={(e) => setShowMA({ ...showMA, ma10: e.target.checked })}
            className="rounded w-3 h-3"
          />
          <span>MA10</span>
          <div className="w-4 h-0.5 bg-orange-500"></div>
        </label>
        <label className="flex items-center gap-1.5 px-2 py-0.5 text-xs bg-slate-100 rounded cursor-pointer hover:bg-slate-200 transition-colors">
          <input
            type="checkbox"
            checked={showMA.ma20}
            onChange={(e) => setShowMA({ ...showMA, ma20: e.target.checked })}
            className="rounded w-3 h-3"
          />
          <span>MA20</span>
          <div className="w-4 h-0.5 bg-purple-500"></div>
        </label>
        <label className="flex items-center gap-1.5 px-2 py-0.5 text-xs bg-slate-100 rounded cursor-pointer hover:bg-slate-200 transition-colors">
          <input
            type="checkbox"
            checked={showMA.ma60}
            onChange={(e) => setShowMA({ ...showMA, ma60: e.target.checked })}
            className="rounded w-3 h-3"
          />
          <span>MA60</span>
          <div className="w-4 h-0.5 bg-green-600"></div>
        </label>
      </div>

      {/* 图表 */}
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />

          {/* 分界线 */}
          {divideDate && viewMode === 'compare' && (
            <ReferenceLine
              x={chartData.findIndex(
                (d) => d.fullDate.getTime() >= divideDate.getTime()
              )}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: '分界点', position: 'top', fill: '#8b5cf6', fontSize: 11 }}
            />
          )}

          {/* 均线 */}
          {showMA.ma5 && (
            <Line
              type="monotone"
              dataKey="ma5"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={false}
              name="MA5"
              connectNulls
            />
          )}
          {showMA.ma10 && (
            <Line
              type="monotone"
              dataKey="ma10"
              stroke="#f97316"
              strokeWidth={1.5}
              dot={false}
              name="MA10"
              connectNulls
            />
          )}
          {showMA.ma20 && (
            <Line
              type="monotone"
              dataKey="ma20"
              stroke="#a855f7"
              strokeWidth={1.5}
              dot={false}
              name="MA20"
              connectNulls
            />
          )}
          {showMA.ma60 && (
            <Line
              type="monotone"
              dataKey="ma60"
              stroke="#16a34a"
              strokeWidth={1.5}
              dot={false}
              name="MA60"
              connectNulls
            />
          )}

          {/* K线 - 使用Bar组件模拟 */}
          <Bar dataKey="close" fill="#8884d8" shape={<CustomCandlestick />} name="K线" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}