import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line
} from 'recharts'

interface VolumeChartProps {
  data: any[]
  height?: number
}

export function VolumeChart({ data, height = 200 }: VolumeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        暂无数据
      </div>
    )
  }

  const formatVolume = (value: number) => {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(2) + '亿'
    } else if (value >= 10000) {
      return (value / 10000).toFixed(2) + '万'
    }
    return value.toString()
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <span>成交量:</span>
            <span className="text-right">{formatVolume(data.volume)}</span>
            {data.mavol5 && <span>MAVOL5:</span>}
            {data.mavol5 && <span className="text-right">{formatVolume(data.mavol5)}</span>}
            {data.mavol10 && <span>MAVOL10:</span>}
            {data.mavol10 && <span className="text-right">{formatVolume(data.mavol10)}</span>}
            {data.mavol100 && <span>MAVOL100:</span>}
            {data.mavol100 && <span className="text-right">{formatVolume(data.mavol100)}</span>}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
          tickFormatter={formatVolume}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* 成交量柱状图 */}
        <Bar
          dataKey="volume"
          fill="hsl(var(--muted))"
          name="成交量"
          radius={[2, 2, 0, 0]}
        />
        
        {/* 移动平均成交量线 */}
        {data.some(d => d.mavol5) && (
          <Line
            type="monotone"
            dataKey="mavol5"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="MAVOL5"
          />
        )}
        
        {data.some(d => d.mavol10) && (
          <Line
            type="monotone"
            dataKey="mavol10"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="MAVOL10"
          />
        )}
        
        {data.some(d => d.mavol100) && (
          <Line
            type="monotone"
            dataKey="mavol100"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="MAVOL100"
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}