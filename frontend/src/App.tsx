import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { KLineChart } from '@/components/charts/KLineChart'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { KDJChart } from '@/components/charts/KDJChart'
import { MACDChart } from '@/components/charts/MACDChart'
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
  const [selectedIndicator, setSelectedIndicator] = useState('volume') // 默认显示成交量
  const [showMA, setShowMA] = useState(true)
  const [showVolumeMA, setShowVolumeMA] = useState(true)

  const fetchStockData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 使用环境变量配置的API地址，并添加/api前缀
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const apiPath = baseUrl.includes('localhost') ? '' : '/api'
      const response = await fetch(`${baseUrl}${apiPath}/stock/${stockCode}?dividing_date=${dividingDate}`)
      
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
            
            {/* 技术指标选择 */}
            {stockData.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>技术指标</Label>
                    <div className="flex space-x-2">
                      <Button
                        variant={selectedIndicator === 'volume' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedIndicator('volume')}
                      >
                        成交量
                      </Button>
                      <Button
                        variant={selectedIndicator === 'kdj' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedIndicator('kdj')}
                      >
                        KDJ
                      </Button>
                      <Button
                        variant={selectedIndicator === 'macd' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedIndicator('macd')}
                      >
                        MACD
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>移动平均线</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show-ma"
                        checked={showMA}
                        onChange={(e) => setShowMA(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="show-ma" className="text-sm">显示MA</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>成交量指标</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show-volume-ma"
                        checked={showVolumeMA}
                        onChange={(e) => setShowVolumeMA(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="show-volume-ma" className="text-sm">显示MAVOL</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>图表设置</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        // 重置缩放功能
                        window.location.reload()
                      }}>
                        重置
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <KLineChart data={historicalData} height={400} showMA={showMA} />
                
                {/* 动态显示技术指标 */}
                {selectedIndicator === 'volume' && (
                  <VolumeChart data={historicalData} height={200} showVolumeMA={showVolumeMA} />
                )}
                {selectedIndicator === 'kdj' && (
                  <KDJChart data={historicalData} height={200} />
                )}
                {selectedIndicator === 'macd' && (
                  <MACDChart data={historicalData} height={200} />
                )}
              </CardContent>
            </Card>

            {/* 分界点后走势 */}
            <Card>
              <CardHeader>
                <CardTitle>分界点后走势 ({formatDate(new Date(dividingDate))} 及之后)</CardTitle>
                <CardDescription>未来趋势预测和技术指标分析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <KLineChart data={futureData} height={400} showMA={showMA} />
                
                {/* 动态显示技术指标 */}
                {selectedIndicator === 'volume' && (
                  <VolumeChart data={futureData} height={200} showVolumeMA={showVolumeMA} />
                )}
                {selectedIndicator === 'kdj' && (
                  <KDJChart data={futureData} height={200} />
                )}
                {selectedIndicator === 'macd' && (
                  <MACDChart data={futureData} height={200} />
                )}
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