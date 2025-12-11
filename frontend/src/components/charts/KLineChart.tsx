
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Rectangle
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface KLineChartProps {
  data: any[]
  height?: number
  showMA?: boolean
}

const CandleStick = (props: any) => {
  const { x, y, width, high, low, open, close } = props
  
  const isGrowing = close >= open
  const bodyHeight = Math.abs(close - open)
  const bodyY = isGrowing ? y(close) : y(open)
  
  return (
    <g>
      {/* 上影线 */}
      <line 
        x1={x + width / 2} 
        y1={y(high)} 
        x2={x + width / 2} 
        y2={y(Math.max(open, close))} 
        stroke={isGrowing ? '#ef4444' : '#10b981'}
        strokeWidth={1}
      />
      
      {/* 下影线 */}
      <line 
        x1={x + width / 2} 
        y1={y(low)} 
        x2={x + width / 2} 
        y2={y(Math.min(open, close))} 
        stroke={isGrowing ? '#ef4444' : '#10b981'}
        strokeWidth={1}
      />
      
      {/* K线实体 */}
      <Rectangle
        x={x + width / 4}
        y={bodyY}
        width={width / 2}
        height={bodyHeight}
        fill={isGrowing ? '#ef4444' : '#10b981'}
        stroke="none"
      />
    </g>
  )
}

export function KLineChart({ data, height = 400, showMA = true }: KLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        暂无数据
      </div>
    )
  }

  // 计算移动平均线
  const maData = data.map((item, index) => {
    const newItem = { ...item }
    if (index >= 4) {
      newItem.ma5 = data.slice(index - 4, index + 1).reduce((sum, d) => sum + d.close, 0) / 5
    }
    if (index >= 9) {
      newItem.ma10 = data.slice(index - 9, index + 1).reduce((sum, d) => sum + d.close, 0) / 10
    }
    if (index >= 19) {
      newItem.ma20 = data.slice(index - 19, index + 1).reduce((sum, d) => sum + d.close, 0) / 20
    }
    if (index >= 59) {
      newItem.ma60 = data.slice(index - 59, index + 1).reduce((sum, d) => sum + d.close, 0) / 60
    }
    return newItem
  })

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
            {data.ma5 && <span>MA5:</span>}
            {data.ma5 && <span className="text-right">{formatCurrency(data.ma5)}</span>}
            {data.ma10 && <span>MA10:</span>}
            {data.ma10 && <span className="text-right">{formatCurrency(data.ma10)}</span>}
            {data.ma20 && <span>MA20:</span>}
            {data.ma20 && <span className="text-right">{formatCurrency(data.ma20)}</span>}
            {data.ma60 && <span>MA60:</span>}
            {data.ma60 && <span className="text-right">{formatCurrency(data.ma60)}</span>}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={maData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
        
        {/* K线图 */}
        {maData.map((entry, index) => (
          <CandleStick
            key={index}
            x={index * (100 / maData.length) * 0.8 + 10}
            y={(value: number) => height - 40 - ((value - Math.min(...maData.map(d => d.low))) / 
                (Math.max(...maData.map(d => d.high)) - Math.min(...maData.map(d => d.low)))) * (height - 80)}
            width={80 / maData.length}
            high={entry.high}
            low={entry.low}
            open={entry.open}
            close={entry.close}
          />
        ))}
        
        {/* 移动平均线 */}
        {showMA && (
          <>
            {maData.some(d => d.ma5) && (
              <Line
                type="monotone"
                dataKey="ma5"
                stroke="#ffffff"
                strokeWidth={2}
                dot={false}
                name="MA5"
              />
            )}
            {maData.some(d => d.ma10) && (
              <Line
                type="monotone"
                dataKey="ma10"
                stroke="#ffff00"
                strokeWidth={2}
                dot={false}
                name="MA10"
              />
            )}
            {maData.some(d => d.ma20) && (
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="#d946ef"
                strokeWidth={2}
                dot={false}
                name="MA20"
              />
            )}
            {maData.some(d => d.ma60) && (
              <Line
                type="monotone"
                dataKey="ma60"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                name="MA60"
              />
            )}
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}