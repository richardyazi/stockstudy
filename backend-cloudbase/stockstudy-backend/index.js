const express = require('express');
const cors = require('cors');
const moment = require('moment');
const tcb = require('@cloudbase/node-sdk');

const app = express();
const port = process.env.PORT || 3001;

// CORS配置
app.use(cors());
app.use(express.json());

// 初始化CloudBase
const cloudbase = tcb.init({
  env: process.env.TCB_ENV_ID || 'stockstudy-7gg0qgesca10330c'
});

// CloudBase数据库
const db = cloudbase.database();

// 缓存配置
const CACHE_EXPIRE = 3600; // 1小时缓存

/**
 * 计算KDJ指标
 */
function calculateKDJ(data) {
  if (data.length < 9) return data;
  
  const result = [...data];
  
  for (let i = 8; i < result.length; i++) {
    const window = result.slice(i - 8, i + 1);
    const low9 = Math.min(...window.map(d => d.low));
    const high9 = Math.max(...window.map(d => d.high));
    
    const rsv = ((result[i].close - low9) / (high9 - low9)) * 100;
    
    // 初始化K, D值
    if (i === 8) {
      result[i].kdj_k = rsv;
      result[i].kdj_d = rsv;
    } else {
      result[i].kdj_k = (2/3) * result[i-1].kdj_k + (1/3) * rsv;
      result[i].kdj_d = (2/3) * result[i-1].kdj_d + (1/3) * result[i].kdj_k;
    }
    
    result[i].kdj_j = 3 * result[i].kdj_k - 2 * result[i].kdj_d;
  }
  
  return result;
}

/**
 * 计算成交量移动平均
 */
function calculateVolumeMA(data) {
  const result = [...data];
  
  for (let i = 0; i < result.length; i++) {
    // MAVOL5
    if (i >= 4) {
      const vol5 = result.slice(i - 4, i + 1).reduce((sum, d) => sum + d.volume, 0) / 5;
      result[i].mavol5 = vol5;
    }
    
    // MAVOL10
    if (i >= 9) {
      const vol10 = result.slice(i - 9, i + 1).reduce((sum, d) => sum + d.volume, 0) / 10;
      result[i].mavol10 = vol10;
    }
    
    // MAVOL100
    if (i >= 99) {
      const vol100 = result.slice(i - 99, i + 1).reduce((sum, d) => sum + d.volume, 0) / 100;
      result[i].mavol100 = vol100;
    }
  }
  
  return result;
}

/**
 * 生成模拟股票数据
 */
function generateMockStockData(symbol, startDate, endDate) {
  const start = moment(startDate, 'YYYYMMDD');
  const end = moment(endDate, 'YYYYMMDD');
  const days = end.diff(start, 'days');
  
  const data = [];
  
  // 基础价格设置
  const basePrice = 10 + (parseInt(symbol.slice(-3)) % 100) / 10;
  let currentPrice = basePrice;
  
  for (let i = 0; i <= days; i++) {
    const date = start.clone().add(i, 'days');
    
    // 模拟价格波动
    const volatility = 0.02 + (parseInt(symbol.slice(-2)) % 10) / 1000;
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = 1000000 + Math.random() * 2000000;
    
    data.push({
      date: date.format('YYYY-MM-DD'),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseInt(volume)
    });
    
    currentPrice = close;
  }
  
  return data;
}

/**
 * 获取缓存数据
 */
async function getCachedData(cacheKey) {
  try {
    const result = await db.collection('cache').doc(cacheKey).get();
    if (result.data && result.data.length > 0) {
      const cachedData = result.data[0];
      const now = new Date().getTime();
      
      // 检查缓存是否过期
      if (now - cachedData.timestamp < CACHE_EXPIRE * 1000) {
        return cachedData.data;
      }
    }
  } catch (error) {
    console.error('获取缓存失败:', error);
  }
  
  return null;
}

/**
 * 设置缓存数据
 */
async function setCachedData(cacheKey, data) {
  try {
    await db.collection('cache').doc(cacheKey).set({
      data: data,
      timestamp: new Date().getTime()
    });
  } catch (error) {
    console.error('设置缓存失败:', error);
  }
}

/**
 * 获取股票数据API
 */
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { dividing_date, historical_days = 180, future_days = 90 } = req.query;
    
    // 验证参数
    if (!dividing_date) {
      return res.status(400).json({ error: '缺少分界日期参数' });
    }
    
    // 验证日期格式
    if (!moment(dividing_date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({ error: '日期格式错误，请使用YYYY-MM-DD格式' });
    }
    
    // 生成缓存键
    const cacheKey = `stock:${symbol}:${dividing_date}:${historical_days}:${future_days}`;
    
    // 尝试从缓存获取
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    
    // 计算日期范围
    const dividingDate = moment(dividing_date, 'YYYY-MM-DD');
    const startDate = dividingDate.clone().subtract(historical_days, 'days').format('YYYYMMDD');
    const endDate = dividingDate.clone().add(future_days, 'days').format('YYYYMMDD');
    
    // 获取股票数据
    const stockData = generateMockStockData(symbol, startDate, endDate);
    
    if (!stockData || stockData.length === 0) {
      return res.status(404).json({ error: '未找到指定日期范围内的股票数据' });
    }
    
    // 按分界日期分割数据
    const dividingDateStr = dividingDate.format('YYYY-MM-DD');
    const historicalData = stockData.filter(d => d.date < dividingDateStr);
    const futureData = stockData.filter(d => d.date >= dividingDateStr);
    
    // 计算技术指标
    const historicalWithIndicators = calculateVolumeMA(calculateKDJ(historicalData));
    const futureWithIndicators = calculateVolumeMA(calculateKDJ(futureData));
    
    // 获取股票名称
    const stockName = getStockName(symbol);
    
    // 构建响应数据
    const responseData = {
      symbol: symbol,
      name: stockName,
      dividing_date: dividing_date,
      historical_data: historicalWithIndicators,
      future_data: futureWithIndicators
    };
    
    // 缓存数据
    await setCachedData(cacheKey, responseData);
    
    res.json(responseData);
    
  } catch (error) {
    console.error('获取股票数据失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * 搜索股票API
 */
app.get('/api/stock/search', (req, res) => {
  try {
    const { query } = req.query;
    
    // 预定义股票列表
    const stockList = [
      { symbol: '000001', name: '平安银行' },
      { symbol: '000002', name: '万科A' },
      { symbol: '000063', name: '中兴通讯' },
      { symbol: '000333', name: '美的集团' },
      { symbol: '000651', name: '格力电器' },
      { symbol: '000858', name: '五粮液' },
      { symbol: '002415', name: '海康威视' },
      { symbol: '002594', name: '比亚迪' },
      { symbol: '300750', name: '宁德时代' },
      { symbol: '600036', name: '招商银行' },
      { symbol: '600519', name: '贵州茅台' },
      { symbol: '601318', name: '中国平安' },
      { symbol: '601398', name: '工商银行' }
    ];
    
    // 搜索过滤
    let filteredStocks = stockList;
    if (query) {
      filteredStocks = stockList.filter(stock => 
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.includes(query)
      );
    }
    
    res.json({ stocks: filteredStocks.slice(0, 20) });
    
  } catch (error) {
    console.error('搜索股票失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

/**
 * 健康检查API
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'stockstudy-backend-cloudbase',
    environment: process.env.TCB_ENV_ID || 'unknown'
  });
});

/**
 * 获取股票名称
 */
function getStockName(symbol) {
  const stockMap = {
    '000001': '平安银行',
    '000002': '万科A', 
    '000063': '中兴通讯',
    '000333': '美的集团',
    '000651': '格力电器',
    '000858': '五粮液',
    '002415': '海康威视',
    '002594': '比亚迪',
    '300750': '宁德时代',
    '600036': '招商银行',
    '600519': '贵州茅台',
    '601318': '中国平安',
    '601398': '工商银行'
  };
  
  return stockMap[symbol] || symbol;
}

// 云函数入口
module.exports.handler = async (event, context) => {
  // 将HTTP请求转换为Express应用处理
  const { path, httpMethod, queryString, headers, body } = event;
  
  // 创建模拟的HTTP请求对象
  const req = {
    method: httpMethod,
    url: path,
    query: queryString || {},
    headers: headers || {},
    body: body ? JSON.parse(body) : {}
  };
  
  // 创建模拟的HTTP响应对象
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    
    status(code) {
      this.statusCode = code;
      return this;
    },
    
    json(data) {
      this.body = JSON.stringify(data);
      this.headers['Content-Type'] = 'application/json';
      return this;
    },
    
    send(data) {
      this.body = data;
      return this;
    }
  };
  
  // 处理请求
  try {
    // 根据路径路由到相应的处理函数
    if (path === '/api/health' && httpMethod === 'GET') {
      // 健康检查
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'stockstudy-backend-cloudbase',
        environment: process.env.TCB_ENV_ID || 'unknown'
      });
    } else if (path.startsWith('/api/stock/') && httpMethod === 'GET') {
      // 股票数据接口
      const symbol = path.split('/')[3];
      const { dividing_date, historical_days = 180, future_days = 90 } = queryString || {};
      
      if (!dividing_date) {
        res.status(400).json({ error: '缺少分界日期参数' });
      } else {
        // 生成模拟股票数据
        const startDate = '20230101';
        const endDate = '20241214';
        const stockData = generateMockStockData(symbol, startDate, endDate);
        
        const responseData = {
          symbol: symbol,
          name: getStockName(symbol),
          dividing_date: dividing_date,
          historical_data: stockData.slice(0, 180),
          future_data: stockData.slice(180)
        };
        
        res.json(responseData);
      }
    } else if (path === '/api/stock/search' && httpMethod === 'GET') {
      // 股票搜索接口
      const { query } = queryString || {};
      
      const stockList = [
        { symbol: '000001', name: '平安银行' },
        { symbol: '000002', name: '万科A' },
        { symbol: '000063', name: '中兴通讯' },
        { symbol: '000333', name: '美的集团' },
        { symbol: '000651', name: '格力电器' },
        { symbol: '000858', name: '五粮液' },
        { symbol: '002415', name: '海康威视' },
        { symbol: '002594', name: '比亚迪' },
        { symbol: '300750', name: '宁德时代' },
        { symbol: '600036', name: '招商银行' },
        { symbol: '600519', name: '贵州茅台' },
        { symbol: '601318', name: '中国平安' },
        { symbol: '601398', name: '工商银行' }
      ];
      
      let filteredStocks = stockList;
      if (query) {
        filteredStocks = stockList.filter(stock => 
          stock.name.toLowerCase().includes(query.toLowerCase()) ||
          stock.symbol.includes(query)
        );
      }
      
      res.json({ stocks: filteredStocks.slice(0, 20) });
    } else {
      res.status(404).json({ error: '接口不存在' });
    }
    
    return {
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body
    };
    
  } catch (error) {
    console.error('处理请求失败:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '服务器内部错误' })
    };
  }
};