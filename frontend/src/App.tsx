import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { KLineChart } from '@/components/charts/KLineChart'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { KDJChart } from '@/components/charts/KDJChart'
import { StockStats } from '@/components/StockStats'
import { formatDate } from '@/lib/utils'

interface StockData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  kdj?: { k: number; d: number; j: number }
  mavol5?: number
  mavol10?: number
  mavol100?: number
}

function App() {
  const [stockCode, setStockCode] = useState('000001')
  const [dividingDate, setDividingDate] = useState('2024-01-01')
  const [stockData, setStockData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStockData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 在开发环境中使用完整URL，在生产环境中使用相对路径
      const baseUrl = import.meta.env.DEV ? 'http://localhost:8000' : ''
      const response = await fetch(`${baseUrl}/api/stock/${stockCode}?dividing_date=${dividingDate}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // 合并历史数据和未来数据
      const allData = [...data.historical_data, ...data.future_data]
      setStockData(allData)
    } catch (err) {
      setError('获取股票数据失败，请检查网络连接或股票代码')
      console.error('Error fetching stock data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStockData()
  }, [])

  const historicalData = stockData.filter(item => item.date < dividingDate)
  const futureData = stockData.filter(item => item.date >= dividingDate)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">股票趋势练习网站</h1>
          <p className="text-muted-foreground">以特定日期为分界点，分析股票历史走势和未来趋势</p>
        </div>

        {/* 控制面板 */}
        <Card>
          <CardHeader>
            <CardTitle>股票选择与时间分界点</CardTitle>
            <CardDescription>输入股票代码和分界日期，开始分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock-code">股票代码</Label>
                <Input
                  id="stock-code"
                  placeholder="例如：000001"
                  value={stockCode}
                  onChange={(e) => setStockCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dividing-date">分界日期</Label>
                <Input
                  id="dividing-date"
                  type="date"
                  value={dividingDate}
                  onChange={(e) => setDividingDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchStockData} disabled={loading} className="w-full">
                  {loading ? '加载中...' : '开始分析'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        {stockData.length > 0 && (
          <>
            {/* 分界点前走势 */}
            <Card>
              <CardHeader>
                <CardTitle>分界点前走势 ({formatDate(new Date(dividingDate))} 之前)</CardTitle>
                <CardDescription>历史价格走势和技术指标分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <KLineChart data={historicalData} height={400} />
                <VolumeChart data={historicalData} height={200} />
                <KDJChart data={historicalData} height={200} />
              </CardContent>
            </Card>

            {/* 分界点后走势 */}
            <Card>
              <CardHeader>
                <CardTitle>分界点后走势 ({formatDate(new Date(dividingDate))} 及之后)</CardTitle>
                <CardDescription>未来趋势预测和技术指标分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <KLineChart data={futureData} height={400} />
                <VolumeChart data={futureData} height={200} />
                <KDJChart data={futureData} height={200} />
              </CardContent>
            </Card>

            {/* 数据统计面板 */}
            <StockStats historicalData={historicalData} futureData={futureData} />
          </>
        )}
      </div>
    </div>
  )
}

export default App