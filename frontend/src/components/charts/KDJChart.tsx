
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  Dot
} from 'recharts'

interface KDJChartProps {
  data: any[]
  height?: number
}

export function KDJChart({ data, height = 200 }: KDJChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        暂无数据
      </div>
    )
  }

  // 过滤出有KDJ数据的数据点
  const kdjData = data.filter(item => item.kdj)

  if (kdjData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        暂无KDJ数据（需要至少9个交易日的数据）
      </div>
    )
  }

  // 检测金叉死叉信号
  const enhancedKdjData = kdjData.map((item, index) => {
    const newItem = { ...item }
    if (index > 0) {
      const prevK = kdjData[index - 1].kdj.k
      const prevD = kdjData[index - 1].kdj.d
      const currentK = item.kdj.k
      const currentD = item.kdj.d
      
      // 金叉：K线上穿D线
      if (prevK < prevD && currentK > currentD) {
        newItem.goldenCross = true
      }
      // 死叉：K线下穿D线
      if (prevK > prevD && currentK < currentD) {
        newItem.deathCross = true
      }
    }
    return newItem
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const kValue = data.kdj.k.toFixed(2)
      const dValue = data.kdj.d.toFixed(2)
      const jValue = data.kdj.j.toFixed(2)
      
      let signal = ''
      if (kValue > 80 && dValue > 80) signal = '超买区域'
      else if (kValue < 20 && dValue < 20) signal = '超卖区域'
      
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <span>K值:</span>
            <span className="text-right">{kValue}</span>
            <span>D值:</span>
            <span className="text-right">{dValue}</span>
            <span>J值:</span>
            <span className="text-right">{jValue}</span>
            {signal && (
              <>
                <span>信号:</span>
                <span className={`text-right ${signal.includes('超买') ? 'text-red-500' : 'text-green-500'}`}>
                  {signal}
                </span>
              </>
            )}
            {data.goldenCross && (
              <>
                <span>金叉:</span>
                <span className="text-right text-yellow-500">✓</span>
              </>
            )}
            {data.deathCross && (
              <>
                <span>死叉:</span>
                <span className="text-right text-blue-500">✓</span>
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
    
    if (payload.goldenCross) {
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
    
    if (payload.deathCross) {
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
      <LineChart data={enhancedKdjData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        
        {/* 超买超卖区域 */}
        <ReferenceArea y1={80} y2={100} fill="#ef444420" stroke="none" />
        <ReferenceArea y1={0} y2={20} fill="#10b98120" stroke="none" />
        
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
          ticks={[0, 20, 50, 80, 100]}
        />
        
        {/* 超买超卖线 */}
        <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
        <ReferenceLine y={20} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* K线 */}
        <Line
          type="monotone"
          dataKey="kdj.k"
          stroke="#ffffff"
          strokeWidth={2}
          dot={<CustomDot />}
          name="K线"
        />
        
        {/* D线 */}
        <Line
          type="monotone"
          dataKey="kdj.d"
          stroke="#ffff00"
          strokeWidth={2}
          dot={false}
          name="D线"
        />
        
        {/* J线 */}
        <Line
          type="monotone"
          dataKey="kdj.j"
          stroke="#d946ef"
          strokeWidth={2}
          dot={false}
          name="J线"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}