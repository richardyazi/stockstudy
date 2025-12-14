import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import type { StockDataPoint } from '../types/stock';

interface KDJChartProps {
  data: StockDataPoint[];
  divideDate?: Date;
}

export function KDJChart({ data, divideDate }: KDJChartProps) {
  // 准备图表数据
  const chartData = data.map((point) => {
    const isHistorical = divideDate
      ? point.date.getTime() < divideDate.getTime()
      : true;

    return {
      date: point.date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      }),
      fullDate: point.date,
      k: point.indicators.k,
      d: point.indicators.d,
      j: point.indicators.j,
      isHistorical,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-200">
        <p className="mb-2 text-slate-600">
          {data.fullDate.toLocaleDateString('zh-CN')}
        </p>
        <div className="space-y-1 text-sm">
          {data.k && !isNaN(data.k) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">K:</span>
              <span className="text-blue-600">{data.k.toFixed(2)}</span>
            </div>
          )}
          {data.d && !isNaN(data.d) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">D:</span>
              <span className="text-orange-600">{data.d.toFixed(2)}</span>
            </div>
          )}
          {data.j && !isNaN(data.j) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">J:</span>
              <span className="text-purple-600">{data.j.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* KDJ说明 */}
      <div className="flex items-center gap-6 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-red-200 rounded"></div>
          <span>超买区 (K&gt;80)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-200 rounded"></div>
          <span>超卖区 (K&lt;20)</span>
        </div>
      </div>

      {/* 图表 */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* 超买超卖区域 */}
          <ReferenceArea y1={80} y2={100} fill="#fecaca" fillOpacity={0.3} />
          <ReferenceArea y1={0} y2={20} fill="#bbf7d0" fillOpacity={0.3} />

          {/* 参考线 */}
          <ReferenceLine y={80} stroke="#dc2626" strokeDasharray="3 3" />
          <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
          <ReferenceLine y={20} stroke="#16a34a" strokeDasharray="3 3" />

          {/* 分界线 */}
          {divideDate && (
            <ReferenceLine
              x={chartData.findIndex(
                (d) => d.fullDate.getTime() >= divideDate.getTime()
              )}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}

          {/* KDJ线 */}
          <Line
            type="monotone"
            dataKey="k"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="K线"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="d"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            name="D线"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="j"
            stroke="#a855f7"
            strokeWidth={2}
            dot={false}
            name="J线"
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
