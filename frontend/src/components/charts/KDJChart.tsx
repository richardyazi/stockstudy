
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <span>K值:</span>
            <span className="text-right">{data.kdj.k.toFixed(2)}</span>
            <span>D值:</span>
            <span className="text-right">{data.kdj.d.toFixed(2)}</span>
            <span>J值:</span>
            <span className="text-right">{data.kdj.j.toFixed(2)}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={kdjData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 12 }}
          domain={[0, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* K线 */}
        <Line
          type="monotone"
          dataKey="kdj.k"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="K线"
        />
        
        {/* D线 */}
        <Line
          type="monotone"
          dataKey="kdj.d"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          name="D线"
        />
        
        {/* J线 */}
        <Line
          type="monotone"
          dataKey="kdj.j"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          name="J线"
        />
        
        {/* 超买超卖线 */}
        <Line
          type="monotone"
          dataKey={() => 80}
          stroke="#ef4444"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          name="超买线"
        />
        
        <Line
          type="monotone"
          dataKey={() => 20}
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
          name="超卖线"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}