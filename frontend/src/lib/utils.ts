import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function calculateKDJ(data: any[]) {
  if (!data || data.length < 9) return data
  
  const result = [...data]
  
  // 计算RSV值
  for (let i = 8; i < result.length; i++) {
    const period = result.slice(i - 8, i + 1)
    const low = Math.min(...period.map(d => d.low))
    const high = Math.max(...period.map(d => d.high))
    const current = result[i]
    
    const rsv = ((current.close - low) / (high - low)) * 100
    
    // 计算K值 (今日K值 = 2/3 * 昨日K值 + 1/3 * 今日RSV)
    const prevK = result[i - 1]?.kdj?.k || 50
    const k = (2/3) * prevK + (1/3) * rsv
    
    // 计算D值 (今日D值 = 2/3 * 昨日D值 + 1/3 * 今日K值)
    const prevD = result[i - 1]?.kdj?.d || 50
    const d = (2/3) * prevD + (1/3) * k
    
    // 计算J值 (J = 3K - 2D)
    const j = 3 * k - 2 * d
    
    result[i] = {
      ...current,
      kdj: { k, d, j }
    }
  }
  
  return result
}

export function calculateVolumeMA(data: any[], periods = [5, 10, 100]) {
  const result = [...data]
  
  periods.forEach(period => {
    for (let i = period - 1; i < result.length; i++) {
      const periodData = result.slice(i - period + 1, i + 1)
      const ma = periodData.reduce((sum, d) => sum + d.volume, 0) / period
      
      result[i] = {
        ...result[i],
        [`mavol${period}`]: ma
      }
    }
  })
  
  return result
}