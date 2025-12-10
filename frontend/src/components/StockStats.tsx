
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatPercentage } from '@/lib/utils'

interface StockStatsProps {
  historicalData: any[]
  futureData: any[]
}

export function StockStats({ historicalData, futureData }: StockStatsProps) {
  const calculateStats = (data: any[]) => {
    if (data.length === 0) return null

    const closes = data.map(d => d.close)
    const volumes = data.map(d => d.volume)
    
    const firstClose = closes[0]
    const lastClose = closes[closes.length - 1]
    const maxClose = Math.max(...closes)
    const minClose = Math.min(...closes)
    const avgClose = closes.reduce((sum, close) => sum + close, 0) / closes.length
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0)
    const avgVolume = totalVolume / volumes.length
    const changePercent = (lastClose - firstClose) / firstClose

    return {
      firstClose,
      lastClose,
      maxClose,
      minClose,
      avgClose,
      totalVolume,
      avgVolume,
      changePercent,
      changeAmount: lastClose - firstClose,
      dataCount: data.length
    }
  }

  const historicalStats = calculateStats(historicalData)
  const futureStats = calculateStats(futureData)

  if (!historicalStats) return null

  const formatVolume = (value: number) => {
    if (value >= 100000000) {
      return (value / 100000000).toFixed(2) + '亿'
    } else if (value >= 10000) {
      return (value / 10000).toFixed(2) + '万'
    }
    return value.toFixed(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据统计对比</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 历史数据统计 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">历史数据统计</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">起始价:</span>
                <div className="font-medium">{formatCurrency(historicalStats.firstClose)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">结束价:</span>
                <div className="font-medium">{formatCurrency(historicalStats.lastClose)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">最高价:</span>
                <div className="font-medium">{formatCurrency(historicalStats.maxClose)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">最低价:</span>
                <div className="font-medium">{formatCurrency(historicalStats.minClose)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">平均价:</span>
                <div className="font-medium">{formatCurrency(historicalStats.avgClose)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">涨跌幅:</span>
                <div className={`font-medium ${historicalStats.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatPercentage(historicalStats.changePercent)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">涨跌额:</span>
                <div className={`font-medium ${historicalStats.changeAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(historicalStats.changeAmount)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">数据点数:</span>
                <div className="font-medium">{historicalStats.dataCount} 天</div>
              </div>
            </div>
          </div>

          {/* 未来数据统计 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">未来数据统计</h3>
            {futureStats ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">起始价:</span>
                  <div className="font-medium">{formatCurrency(futureStats.firstClose)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">当前价:</span>
                  <div className="font-medium">{formatCurrency(futureStats.lastClose)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">最高价:</span>
                  <div className="font-medium">{formatCurrency(futureStats.maxClose)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">最低价:</span>
                  <div className="font-medium">{formatCurrency(futureStats.minClose)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">涨跌幅:</span>
                  <div className={`font-medium ${futureStats.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(futureStats.changePercent)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">数据点数:</span>
                  <div className="font-medium">{futureStats.dataCount} 天</div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">暂无未来数据</div>
            )}
          </div>
        </div>

        {/* 成交量统计 */}
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold mb-4">成交量统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">历史总成交量:</span>
              <div className="font-medium">{formatVolume(historicalStats.totalVolume)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">历史日均成交量:</span>
              <div className="font-medium">{formatVolume(historicalStats.avgVolume)}</div>
            </div>
            {futureStats && (
              <>
                <div>
                  <span className="text-muted-foreground">未来总成交量:</span>
                  <div className="font-medium">{formatVolume(futureStats.totalVolume)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">未来日均成交量:</span>
                  <div className="font-medium">{formatVolume(futureStats.avgVolume)}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}