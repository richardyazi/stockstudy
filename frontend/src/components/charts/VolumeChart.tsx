
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ReferenceArea,
  Rectangle
} from 'recharts'

interface VolumeChartProps {
  data: any[]
  height?: number
  showVolumeMA?: boolean
}

const VolumeBar = (props: any) => {
  const { x, y, width, height, open, close, volume } = props
  
  const isGrowing = close >= open
  const fillColor = isGrowing ? '#ef4444' : '#10b981'
  
  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={Math.max(height, 1)}
      fill={fillColor}
      stroke="none"
    />
  )
}

export function VolumeChart({ data, height = 200, showVolumeMA = true }: VolumeChartProps) {
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

  // 计算移动平均成交量
  const volumeData = data.map((item, index) => {
    const newItem = { ...item }
    if (index >= 4) {
      newItem.mavol5 = data.slice(index - 4, index + 1).reduce((sum, d) => sum + d.volume, 0) / 5
    }
    if (index >= 9) {
      newItem.mavol10 = data.slice(index - 9, index + 1).reduce((sum, d) => sum + d.volume, 0) / 10
    }
    if (index >= 99) {
      newItem.mavol100 = data.slice(index - 99, index + 1).reduce((sum, d) => sum + d.volume, 0) / 100
    }
    return newItem
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={volumeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
          shape={<VolumeBar />}
          name="成交量"
          radius={[2, 2, 0, 0]}
        />
        
        {/* 移动平均成交量线 */}
        {showVolumeMA && (
          <>
            {volumeData.some(d => d.mavol5) && (
              <Line
                type="monotone"
                dataKey="mavol5"
                stroke="#ffffff"
                strokeWidth={2}
                dot={false}
                name="MAVOL5"
              />
            )}
            {volumeData.some(d => d.mavol10) && (
              <Line
                type="monotone"
                dataKey="mavol10"
                stroke="#ffff00"
                strokeWidth={2}
                dot={false}
                name="MAVOL10"
              />
            )}
            {volumeData.some(d => d.mavol100) && (
              <Line
                type="monotone"
                dataKey="mavol100"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                name="MAVOL100"
              />
            )}
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}