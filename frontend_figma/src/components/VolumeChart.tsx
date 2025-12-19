import React from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import type { StockDataPoint } from '../types/stock';

interface VolumeChartProps {
  data: StockDataPoint[];
  divideDate?: Date;
}

export function VolumeChart({ data, divideDate }: VolumeChartProps) {
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
      volume: point.volume,
      isRise: point.close >= point.open,
      isHistorical,
      vol5: point.indicators.vol5,
      vol10: point.indicators.vol10,
      vol100: point.indicators.vol100,
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
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">成交量:</span>
            <span>{(data.volume / 10000).toFixed(0)} 万</span>
          </div>
          {data.vol5 && !isNaN(data.vol5) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">VOL5:</span>
              <span>{(data.vol5 / 10000).toFixed(0)} 万</span>
            </div>
          )}
          {data.vol10 && !isNaN(data.vol10) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">VOL10:</span>
              <span>{(data.vol10 / 10000).toFixed(0)} 万</span>
            </div>
          )}
          {data.vol100 && !isNaN(data.vol100) && (
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">VOL100:</span>
              <span>{(data.vol100 / 10000).toFixed(0)} 万</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 自定义Bar颜色
  const CustomBar = (props: any) => {
    const { fill, x, y, width, height, payload } = props;
    if (!payload) return null;

    const color = payload.isRise ? '#ef4444' : '#22c55e';
    const opacity = divideDate && !payload.isHistorical ? 0.4 : 1;

    return (
      <rect x={x} y={y} width={width} height={height} fill={color} opacity={opacity} />
    );
  };

  return (
    <ResponsiveContainer width="100%" height={150}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />

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

        {/* 成交量柱状图 */}
        <Bar dataKey="volume" name="成交量" shape={<CustomBar />} />

        {/* 移动平均成交量线 */}
        <Line
          type="monotone"
          dataKey="vol5"
          stroke="#3b82f6"
          strokeWidth={1}
          dot={false}
          name="VOL5"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="vol10"
          stroke="#f97316"
          strokeWidth={1}
          dot={false}
          name="VOL10"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="vol100"
          stroke="#16a34a"
          strokeWidth={1}
          dot={false}
          name="VOL100"
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}