import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Dot
} from 'recharts'

interface MACDChartProps {
  data: any[]
  height?: number
}

const MACDBar = (props: any) => {
  const { x, y, width, height, macd } = props
  
  const isPositive = macd >= 0
  const fillColor = isPositive ? '#ef4444' : '#10b981'
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={Math.max(height, 1)}
      fill={fillColor}
      stroke="none"
    />
  )
}

export function MACDChart({ data, height = 200 }: MACDChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        暂无数据
      </div>
    )
  }

  // 计算MACD指标
  const macdData = data.map((item, index) => {
    const newItem = { ...item }
    
    if (index >= 25) {
      // 计算EMA12
      const ema12 = data.slice(index - 11, index + 1).reduce((sum, d) => sum + d.close, 0) / 12
      
      // 计算EMA26
      const ema26 = data.slice(index - 25, index + 1).reduce((sum, d) => sum + d.close, 0) / 26
      
      // 计算DIFF
      newItem.diff = ema12 - ema26
      
      // 计算DEA（DIFF的9日EMA）
      if (index >= 33) {
        // 使用原始数据计算DEA，避免循环引用
        const prevData = data.slice(Math.max(0, index - 8), index)
        const prevDEAs = prevData.map((_, i) => {
          if (i >= 25) {
            const prevEma12 = data.slice(Math.max(0, i - 11), i + 1).reduce((sum, d) => sum + d.close, 0) / 12
            const prevEma26 = data.slice(Math.max(0, i - 25), i + 1).reduce((sum, d) => sum + d.close, 0) / 26
            return prevEma12 - prevEma26
          }
          return undefined
        }).filter(d => d !== undefined)
        
        if (prevDEAs.length >= 8) {
          newItem.dea = prevDEAs.reduce((sum, d) => sum + d, 0) / 9
          newItem.macd = (newItem.diff - newItem.dea) * 2
        }
      }
    }
    
    return newItem
  })

  // 检测零轴穿越信号（在macdData完全定义后）
  const macdDataWithSignals = macdData.map((item, index) => {
    const newItem = { ...item }
    
    if (index > 0 && newItem.diff !== undefined && macdData[index - 1].diff !== undefined) {
      const prevDiff = macdData[index - 1].diff
      const currentDiff = newItem.diff
      
      // 上穿零轴
      if (prevDiff < 0 && currentDiff >= 0) {
        newItem.zeroCrossUp = true
      }
      // 下穿零轴
      if (prevDiff > 0 && currentDiff <= 0) {
        newItem.zeroCrossDown = true
      }
    }
    
    return newItem
  })

  // 过滤出有MACD数据的数据点
  const filteredData = macdDataWithSignals.filter(item => item.macd !== undefined)

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        暂无MACD数据（需要至少26个交易日的数据）
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
            {data.diff !== undefined && <span>DIFF:</span>}
            {data.diff !== undefined && <span className="text-right">{data.diff.toFixed(4)}</span>}
            {data.dea !== undefined && <span>DEA:</span>}
            {data.dea !== undefined && <span className="text-right">{data.dea.toFixed(4)}</span>}
            {data.macd !== undefined && <span>MACD:</span>}
            {data.macd !== undefined && 
              <span className={`text-right ${data.macd >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                {data.macd.toFixed(4)}
              </span>
            }
            {data.zeroCrossUp && (
              <>
                <span>信号:</span>
                <span className="text-right text-yellow-500">上穿零轴</span>
              </>
            )}
            {data.zeroCrossDown && (
              <>
                <span>信号:</span>
                <span className="text-right text-blue-500">下穿零轴</span>
              </>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    
    if (payload.zeroCrossUp) {
      return (
        <Dot
          cx={cx}
          cy={cy}
          r={4}
          fill="#fbbf24"
          stroke="#000"
          strokeWidth={1}
        />
      )
    }
    
    if (payload.zeroCrossDown) {
      return (
        <Dot
          cx={cx}
          cy={cy}
          r={4}
          fill="#3b82f6"
          stroke="#000"
          strokeWidth={1}
        />
      )
    }
    
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        
        {/* 零轴线 */}
        <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" strokeWidth={1} />
        
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* MACD柱状图 */}
        <Bar
          dataKey="macd"
          shape={<MACDBar />}
          name="MACD"
          radius={[2, 2, 0, 0]}
        />
        
        {/* DIFF线 */}
        <Line
          type="monotone"
          dataKey="diff"
          stroke="#ffffff"
          strokeWidth={2}
          dot={<CustomDot />}
          name="DIFF"
        />
        
        {/* DEA线 */}
        <Line
          type="monotone"
          dataKey="dea"
          stroke="#ffff00"
          strokeWidth={2}
          dot={false}
          name="DEA"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}