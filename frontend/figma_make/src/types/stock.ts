export interface StockPrice {
  date: Date;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export interface TechnicalIndicators {
  ma5?: number;
  ma10?: number;
  ma20?: number;
  ma60?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
  k?: number;
  d?: number;
  j?: number;
  vol5?: number;
  vol10?: number;
  vol100?: number;
}

export interface StockDataPoint extends StockPrice {
  indicators: TechnicalIndicators;
}

export interface StockData {
  stockCode: string;
  stockName: string;
  divideDate: Date;
  historicalData: StockDataPoint[];
  futureData: StockDataPoint[];
  allData: StockDataPoint[];
}

export interface StockOption {
  code: string;
  name: string;
  label: string;
}
