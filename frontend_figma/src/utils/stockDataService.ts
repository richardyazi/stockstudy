import type { StockData, StockDataPoint, TechnicalIndicators } from '../types/stock';

// 计算移动平均线
function calculateMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// 计算MACD
function calculateMACD(
  data: number[]
): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = ema12.map((val, i) => val - ema26[i]);
  const signal = calculateEMA(macd, 9);
  const histogram = macd.map((val, i) => val - signal[i]);

  return { macd, signal, histogram };
}

// 计算EMA
function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[i]);
    } else {
      result.push((data[i] - result[i - 1]) * multiplier + result[i - 1]);
    }
  }
  return result;
}

// 计算KDJ
function calculateKDJ(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 9
): { k: number[]; d: number[]; j: number[] } {
  const k: number[] = [];
  const d: number[] = [];
  const j: number[] = [];

  let prevK = 50;
  let prevD = 50;

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      k.push(NaN);
      d.push(NaN);
      j.push(NaN);
    } else {
      const periodHighs = highs.slice(i - period + 1, i + 1);
      const periodLows = lows.slice(i - period + 1, i + 1);
      const highest = Math.max(...periodHighs);
      const lowest = Math.min(...periodLows);

      const rsv =
        highest === lowest ? 50 : ((closes[i] - lowest) / (highest - lowest)) * 100;

      const currentK = (2 / 3) * prevK + (1 / 3) * rsv;
      const currentD = (2 / 3) * prevD + (1 / 3) * currentK;
      const currentJ = 3 * currentK - 2 * currentD;

      k.push(currentK);
      d.push(currentD);
      j.push(currentJ);

      prevK = currentK;
      prevD = currentD;
    }
  }

  return { k, d, j };
}

// 生成股票数据
export function generateStockData(stockCode: string, divideDate: Date): StockData {
  // 获取股票名称
  const stockNames: { [key: string]: string } = {
    '000001': '平安银行',
    '000002': '万科A',
    '000063': '中兴通讯',
    '000333': '美的集团',
    '000858': '五粮液',
    '600000': '浦发银行',
    '600036': '招商银行',
    '600519': '贵州茅台',
    '600887': '伊利股份',
    '601318': '中国平安',
    '601398': '工商银行',
    '601888': '中国中免',
  };

  const stockName = stockNames[stockCode] || '未知股票';

  // 生成上市以来的全部数据（这里模拟3年数据）
  const startDate = new Date(divideDate);
  startDate.setFullYear(startDate.getFullYear() - 2); // 分界点前2年
  
  const endDate = new Date(divideDate);
  endDate.setFullYear(endDate.getFullYear() + 1); // 分界点后1年

  const allData: StockDataPoint[] = [];
  let currentDate = new Date(startDate);
  let basePrice = 10 + Math.random() * 90; // 初始价格 10-100

  while (currentDate <= endDate) {
    // 跳过周末
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      // 生成价格数据（模拟随机波动）
      const change = (Math.random() - 0.5) * 2; // -1 到 1
      const open = basePrice;
      const close = basePrice + change;
      const high = Math.max(open, close) + Math.random() * 0.5;
      const low = Math.min(open, close) - Math.random() * 0.5;
      const volume = Math.floor((10000 + Math.random() * 50000) * 10000);

      allData.push({
        date: new Date(currentDate),
        open,
        high,
        low,
        close,
        volume,
        indicators: {},
      });

      basePrice = close;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 计算技术指标
  const closes = allData.map((d) => d.close);
  const highs = allData.map((d) => d.high);
  const lows = allData.map((d) => d.low);
  const volumes = allData.map((d) => d.volume);

  const ma5 = calculateMA(closes, 5);
  const ma10 = calculateMA(closes, 10);
  const ma20 = calculateMA(closes, 20);
  const ma60 = calculateMA(closes, 60);
  const { macd, signal, histogram } = calculateMACD(closes);
  const { k, d, j } = calculateKDJ(highs, lows, closes);
  const vol5 = calculateMA(volumes, 5);
  const vol10 = calculateMA(volumes, 10);
  const vol100 = calculateMA(volumes, 100);

  // 将指标添加到数据点
  allData.forEach((point, i) => {
    point.indicators = {
      ma5: ma5[i],
      ma10: ma10[i],
      ma20: ma20[i],
      ma60: ma60[i],
      macd: macd[i],
      signal: signal[i],
      histogram: histogram[i],
      k: k[i],
      d: d[i],
      j: j[i],
      vol5: vol5[i],
      vol10: vol10[i],
      vol100: vol100[i],
    };
  });

  // 分割历史和未来数据
  const divideDateTimestamp = divideDate.getTime();
  const historicalData = allData.filter(
    (point) => point.date.getTime() < divideDateTimestamp
  );
  const futureData = allData.filter(
    (point) => point.date.getTime() >= divideDateTimestamp
  );

  // 默认显示前后100天
  const displayHistorical = historicalData.slice(-100);
  const displayFuture = futureData.slice(0, 100);

  return {
    stockCode,
    stockName,
    divideDate,
    historicalData: displayHistorical,
    futureData: displayFuture,
    allData,
  };
}
