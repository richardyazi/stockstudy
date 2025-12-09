import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface KLineChartProps {
  data: any[]
  height?: number
}

export function KLineChart({ data, height = 400 }: KLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        暂无数据
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <span>开盘:</span>
            <span className="text-right">{formatCurrency(data.open)}</span>
            <span>最高:</span>
            <span className="text-right">{formatCurrency(data.high)}</span>
            <span>最低:</span>
            <span className="text-right">{formatCurrency(data.low)}</span>
            <span>收盘:</span>
            <span className="text-right">{formatCurrency(data.close)}</span>
            <span>涨跌:</span>
            <span className={`text-right ${data.close >= data.open ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(data.close - data.open)}
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => formatCurrency(value).replace('¥', '')}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* 价格线 */}
        <Line
          type="monotone"
          dataKey="close"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          name="收盘价"
        />
        
        {/* 开盘价线 */}
        <Line
          type="monotone"
          dataKey="open"
          stroke="hsl(var(--secondary))"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          name="开盘价"
        />
        
        {/* 支撑阻力线示例 */}
        {data.length > 0 && (
          <>
            <ReferenceLine 
              y={Math.max(...data.map(d => d.high))} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label="阻力"
            />
            <ReferenceLine 
              y={Math.min(...data.map(d => d.low))} 
              stroke="#10b981" 
              strokeDasharray="3 3"
              label="支撑"
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}