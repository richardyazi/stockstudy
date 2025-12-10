from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
import pandas as pd
import akshare as ak
import requests
import redis
import json
from typing import Optional, List
import asyncio

app = FastAPI(title="股票趋势练习API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis缓存配置
import os
redis_host = os.getenv('REDIS_HOST', 'localhost')
redis_port = int(os.getenv('REDIS_PORT', '6379'))
redis_client = redis.Redis(host=redis_host, port=redis_port, db=0, decode_responses=True)

class StockData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class StockResponse(BaseModel):
    symbol: str
    name: str
    historical_data: List[StockData]
    future_data: List[StockData]
    dividing_date: str

async def get_cached_data(key: str) -> Optional[dict]:
    """从Redis获取缓存数据"""
    try:
        cached = redis_client.get(key)
        if cached:
            return json.loads(cached)
    except Exception:
        pass
    return None

async def set_cached_data(key: str, data: dict, expire: int = 3600):
    """设置Redis缓存数据"""
    try:
        redis_client.setex(key, expire, json.dumps(data, ensure_ascii=False))
    except Exception:
        pass

def calculate_kdj(data: pd.DataFrame) -> pd.DataFrame:
    """计算KDJ指标"""
    if len(data) < 9:
        return data
    
    # 计算RSV
    low_list = data['low'].rolling(window=9, min_periods=9).min()
    high_list = data['high'].rolling(window=9, min_periods=9).max()
    rsv = (data['close'] - low_list) / (high_list - low_list) * 100
    
    # 计算K, D, J
    data['kdj_k'] = rsv.ewm(com=2).mean()
    data['kdj_d'] = data['kdj_k'].ewm(com=2).mean()
    data['kdj_j'] = 3 * data['kdj_k'] - 2 * data['kdj_d']
    
    return data

def calculate_volume_ma(data: pd.DataFrame) -> pd.DataFrame:
    """计算成交量移动平均"""
    for period in [5, 10, 100]:
        data[f'mavol{period}'] = data['volume'].rolling(window=period).mean()
    return data

async def fetch_stock_data_from_akshare(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
    """使用AKShare获取真实股票数据"""
    try:
        # 转换日期格式
        start_date_obj = datetime.strptime(start_date, "%Y%m%d")
        end_date_obj = datetime.strptime(end_date, "%Y%m%d")
        
        # 计算需要获取的数据天数
        days_needed = (end_date_obj - start_date_obj).days + 30  # 多获取一些数据
        
        # 使用AKShare获取股票历史数据
        # 对于A股，AKShare支持直接使用股票代码
        if symbol.startswith('6'):
            # 上证A股
            stock_data = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
        elif symbol.startswith('0') or symbol.startswith('3'):
            # 深证A股
            stock_data = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
        else:
            # 其他股票，尝试通用接口
            stock_data = ak.stock_zh_a_hist(symbol=symbol, period="daily", adjust="qfq")
        
        if stock_data.empty:
            # 如果AKShare没有数据，尝试备选方案
            return await generate_fallback_data(symbol, start_date, end_date)
        
        # 重命名列以匹配我们的数据格式
        stock_data = stock_data.rename(columns={
            '日期': 'date',
            '开盘': 'open',
            '最高': 'high', 
            '最低': 'low',
            '收盘': 'close',
            '成交量': 'volume'
        })
        
        # 转换日期格式
        stock_data['date'] = pd.to_datetime(stock_data['date'])
        
        # 过滤日期范围
        filtered_data = stock_data[
            (stock_data['date'] >= start_date_obj) & 
            (stock_data['date'] <= end_date_obj)
        ]
        
        if filtered_data.empty:
            # 如果过滤后没有数据，返回最近的数据
            filtered_data = stock_data.tail(min(100, len(stock_data)))
            
        if filtered_data.empty:
            # 如果还是没有数据，使用备选方案
            return await generate_fallback_data(symbol, start_date, end_date)
        
        # 只保留需要的列
        filtered_data = filtered_data[['date', 'open', 'high', 'low', 'close', 'volume']]
        
        return filtered_data
        
    except Exception as e:
        # 如果AKShare失败，使用备选方案
        return await generate_fallback_data(symbol, start_date, end_date)

async def generate_fallback_data(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
    """生成基于真实股票特性的模拟数据作为备选方案"""
    try:
        start_date_obj = datetime.strptime(start_date, "%Y%m%d")
        end_date_obj = datetime.strptime(end_date, "%Y%m%d")
        
        # 生成日期范围
        dates = pd.date_range(start=start_date_obj, end=end_date_obj, freq='D')
        
        # 根据股票代码生成不同的价格特性
        # 银行股：价格较低，波动较小
        # 科技股：价格较高，波动较大
        # 消费股：中等价格，稳定增长
        
        if symbol in ['000001', '600036', '601398']:  # 银行股
            base_price = 8.0 + (int(symbol[-2:]) % 5)  # 8-13元
            volatility = 0.015  # 1.5%波动率
            base_volume = 5000000  # 较大成交量
        elif symbol in ['000063', '002415', '300750']:  # 科技股
            base_price = 30.0 + (int(symbol[-2:]) % 20)  # 30-50元
            volatility = 0.035  # 3.5%波动率
            base_volume = 2000000  # 中等成交量
        elif symbol in ['600519', '000858', '600887']:  # 消费股
            base_price = 50.0 + (int(symbol[-2:]) % 30)  # 50-80元
            volatility = 0.025  # 2.5%波动率
            base_volume = 1000000  # 中等成交量
        else:  # 其他股票
            base_price = 15.0 + (int(symbol[-2:]) % 10)  # 15-25元
            volatility = 0.020  # 2%波动率
            base_volume = 1500000  # 中等成交量
        
        data = []
        
        for i, date in enumerate(dates):
            # 生成更真实的股票价格序列
            if i == 0:
                open_price = base_price
            else:
                # 基于前一日收盘价，加上随机波动
                prev_close = data[i-1]['close']
                daily_change = (volatility * (i % 7 - 3) / 100)  # 更真实的日间变化
                open_price = prev_close * (1 + daily_change)
            
            # 日内波动
            intraday_volatility = volatility / 2
            close_price = open_price * (1 + (intraday_volatility * (i % 5 - 2) / 100))
            high_price = max(open_price, close_price) * (1 + intraday_volatility / 3)
            low_price = min(open_price, close_price) * (1 - intraday_volatility / 3)
            
            # 成交量模拟（基于价格变化）
            price_change_pct = abs((close_price - open_price) / open_price) * 100
            volume = base_volume * (1 + price_change_pct / 10 + (i % 10 - 5) / 20)
            
            data.append({
                'date': date,
                'open': round(open_price, 2),
                'high': round(high_price, 2),
                'low': round(low_price, 2),
                'close': round(close_price, 2),
                'volume': int(volume)
            })
        
        df = pd.DataFrame(data)
        return df
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成备选数据失败: {str(e)}")

async def generate_fallback_data(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
    """生成模拟股票数据作为备选方案"""
    try:
        start_date_obj = datetime.strptime(start_date, "%Y%m%d")
        end_date_obj = datetime.strptime(end_date, "%Y%m%d")
        
        # 生成日期范围
        dates = pd.date_range(start=start_date_obj, end=end_date_obj, freq='D')
        data = []
        
        # 基础价格设置（基于股票代码生成不同的基础价格）
        base_price = 10.0 + (int(symbol[-3:]) % 100) / 10  # 基于股票代码生成不同价格
        
        for i, date in enumerate(dates):
            # 模拟价格波动
            volatility = 0.02 + (int(symbol[-2:]) % 10) / 1000  # 2-3%波动率
            
            # 生成随机但相对稳定的价格序列
            if i == 0:
                open_price = base_price
            else:
                open_price = data[i-1]['close'] * (1 + (volatility * (i % 5 - 2) / 100))
            
            close_price = open_price * (1 + (volatility * (i % 7 - 3) / 100))
            high_price = max(open_price, close_price) * (1 + volatility / 4)
            low_price = min(open_price, close_price) * (1 - volatility / 4)
            volume = 1000000 + abs(i % 20 - 10) * 100000  # 模拟成交量波动
            
            data.append({
                'date': date,
                'open': round(open_price, 2),
                'high': round(high_price, 2),
                'low': round(low_price, 2),
                'close': round(close_price, 2),
                'volume': volume
            })
        
        df = pd.DataFrame(data)
        return df
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成备选数据失败: {str(e)}")

@app.get("/api/stock/{symbol}")
async def get_stock_data(
    symbol: str,
    dividing_date: str,
    historical_days: int = 180,
    future_days: int = 90
):
    """获取股票数据，按分界日期分割为历史数据和未来数据"""
    
    # 验证日期格式
    try:
        dividing_date_obj = datetime.strptime(dividing_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="日期格式错误，请使用YYYY-MM-DD格式")
    
    # 计算日期范围
    start_date = (dividing_date_obj - timedelta(days=historical_days)).strftime("%Y%m%d")
    end_date = (dividing_date_obj + timedelta(days=future_days)).strftime("%Y%m%d")
    
    # 生成缓存键
    cache_key = f"stock:{symbol}:{dividing_date}:{historical_days}:{future_days}"
    
    # 尝试从缓存获取数据
    cached_data = await get_cached_data(cache_key)
    if cached_data:
        return JSONResponse(content=cached_data)
    
    # 获取股票数据
    stock_data = await fetch_stock_data_from_akshare(symbol, start_date, end_date)
    
    if stock_data.empty:
        raise HTTPException(status_code=404, detail="未找到指定日期范围内的股票数据")
    
    # 按分界日期分割数据
    dividing_date_pd = pd.to_datetime(dividing_date)
    historical_data = stock_data[stock_data['date'] < dividing_date_pd]
    future_data = stock_data[stock_data['date'] >= dividing_date_pd]
    
    # 计算技术指标
    if not historical_data.empty:
        historical_data = calculate_kdj(historical_data)
        historical_data = calculate_volume_ma(historical_data)
    
    if not future_data.empty:
        future_data = calculate_kdj(future_data)
        future_data = calculate_volume_ma(future_data)
    
    # 转换为响应格式
    def format_data(df: pd.DataFrame) -> List[dict]:
        result = []
        for _, row in df.iterrows():
            item = {
                'date': row['date'].strftime('%Y-%m-%d'),
                'open': float(row['open']),
                'high': float(row['high']),
                'low': float(row['low']),
                'close': float(row['close']),
                'volume': float(row['volume'])
            }
            
            # 添加KDJ指标
            if 'kdj_k' in row and not pd.isna(row['kdj_k']):
                item['kdj'] = {
                    'k': float(row['kdj_k']),
                    'd': float(row['kdj_d']),
                    'j': float(row['kdj_j'])
                }
            
            # 添加成交量移动平均
            for period in [5, 10, 100]:
                col_name = f'mavol{period}'
                if col_name in row and not pd.isna(row[col_name]):
                    item[col_name] = float(row[col_name])
            
            result.append(item)
        
        return result
    
    # 获取股票名称（从预定义列表中查找）
    stock_name = symbol
    stock_list = [
        {'代码': '000001', '名称': '平安银行'},
        {'代码': '000002', '名称': '万科A'},
        {'代码': '000063', '名称': '中兴通讯'},
        {'代码': '000100', '名称': 'TCL科技'},
        {'代码': '000333', '名称': '美的集团'},
        {'代码': '000651', '名称': '格力电器'},
        {'代码': '000725', '名称': '京东方A'},
        {'代码': '000858', '名称': '五粮液'},
        {'代码': '000876', '名称': '新希望'},
        {'代码': '000895', '名称': '双汇发展'},
        {'代码': '000938', '名称': '紫光股份'},
        {'代码': '002024', '名称': '苏宁易购'},
        {'代码': '002027', '名称': '分众传媒'},
        {'代码': '002142', '名称': '宁波银行'},
        {'代码': '002230', '名称': '科大讯飞'},
        {'代码': '002241', '名称': '歌尔股份'},
        {'代码': '002415', '名称': '海康威视'},
        {'代码': '002475', '名称': '立讯精密'},
        {'代码': '002594', '名称': '比亚迪'},
        {'代码': '002714', '名称': '牧原股份'},
        {'代码': '300014', '名称': '亿纬锂能'},
        {'代码': '300059', '名称': '东方财富'},
        {'代码': '300122', '名称': '智飞生物'},
        {'代码': '300142', '名称': '沃森生物'},
        {'代码': '300750', '名称': '宁德时代'},
        {'代码': '600000', '名称': '浦发银行'},
        {'代码': '600009', '名称': '上海机场'},
        {'代码': '600010', '名称': '包钢股份'},
        {'代码': '600016', '名称': '民生银行'},
        {'代码': '600030', '名称': '中信证券'},
        {'代码': '600036', '名称': '招商银行'},
        {'代码': '600050', '名称': '中国联通'},
        {'代码': '600104', '名称': '上汽集团'},
        {'代码': '600111', '名称': '北方稀土'},
        {'代码': '600196', '名称': '复星医药'},
        {'代码': '600276', '名称': '恒瑞医药'},
        {'代码': '600309', '名称': '万华化学'},
        {'代码': '600519', '名称': '贵州茅台'},
        {'代码': '600570', '名称': '恒生电子'},
        {'代码': '600585', '名称': '海螺水泥'},
        {'代码': '600588', '名称': '用友网络'},
        {'代码': '600690', '名称': '海尔智家'},
        {'代码': '600703', '名称': '三安光电'},
        {'代码': '600745', '名称': '闻泰科技'},
        {'代码': '600809', '名称': '山西汾酒'},
        {'代码': '600837', '名称': '海通证券'},
        {'代码': '600887', '名称': '伊利股份'},
        {'代码': '601012', '名称': '隆基绿能'},
        {'代码': '601066', '名称': '中信建投'},
        {'代码': '601088', '名称': '中国神华'},
        {'代码': '601138', '名称': '工业富联'},
        {'代码': '601166', '名称': '兴业银行'},
        {'代码': '601169', '名称': '北京银行'},
        {'代码': '601186', '名称': '中国铁建'},
        {'代码': '601211', '名称': '国泰君安'},
        {'代码': '601288', '名称': '农业银行'},
        {'代码': '601318', '名称': '中国平安'},
        {'代码': '601328', '名称': '交通银行'},
        {'代码': '601398', '名称': '工商银行'},
        {'代码': '601601', '名称': '中国太保'},
        {'代码': '601628', '名称': '中国人寿'},
        {'代码': '601668', '名称': '中国建筑'},
        {'代码': '601688', '名称': '华泰证券'},
        {'代码': '601766', '名称': '中国中车'},
        {'代码': '601800', '名称': '中国交建'},
        {'代码': '601818', '名称': '光大银行'},
        {'代码': '601857', '名称': '中国石油'},
        {'代码': '601888', '名称': '中国中免'},
        {'代码': '601919', '名称': '中远海控'},
        {'代码': '601988', '名称': '中国银行'},
        {'代码': '601989', '名称': '中国重工'},
        {'代码': '603259', '名称': '药明康德'},
        {'代码': '603993', '名称': '洛阳钼业'}
    ]
    
    for stock in stock_list:
        if stock['代码'] == symbol:
            stock_name = stock['名称']
            break
    
    response_data = {
        'symbol': symbol,
        'name': stock_name,
        'dividing_date': dividing_date,
        'historical_data': format_data(historical_data) if not historical_data.empty else [],
        'future_data': format_data(future_data) if not future_data.empty else []
    }
    
    # 缓存数据
    await set_cached_data(cache_key, response_data)
    
    return JSONResponse(content=response_data)

@app.get("/api/stock/search")
async def search_stock(query: str):
    """搜索股票"""
    try:
        # 预定义一些热门A股股票，包含更多股票
        stock_list = [
            {'代码': '000001', '名称': '平安银行', '交易所': 'SZ'},
            {'代码': '000002', '名称': '万科A', '交易所': 'SZ'},
            {'代码': '000063', '名称': '中兴通讯', '交易所': 'SZ'},
            {'代码': '000100', '名称': 'TCL科技', '交易所': 'SZ'},
            {'代码': '000333', '名称': '美的集团', '交易所': 'SZ'},
            {'代码': '000651', '名称': '格力电器', '交易所': 'SZ'},
            {'代码': '000725', '名称': '京东方A', '交易所': 'SZ'},
            {'代码': '000858', '名称': '五粮液', '交易所': 'SZ'},
            {'代码': '000876', '名称': '新希望', '交易所': 'SZ'},
            {'代码': '000895', '名称': '双汇发展', '交易所': 'SZ'},
            {'代码': '000938', '名称': '紫光股份', '交易所': 'SZ'},
            {'代码': '002024', '名称': '苏宁易购', '交易所': 'SZ'},
            {'代码': '002027', '名称': '分众传媒', '交易所': 'SZ'},
            {'代码': '002142', '名称': '宁波银行', '交易所': 'SZ'},
            {'代码': '002230', '名称': '科大讯飞', '交易所': 'SZ'},
            {'代码': '002241', '名称': '歌尔股份', '交易所': 'SZ'},
            {'代码': '002415', '名称': '海康威视', '交易所': 'SZ'},
            {'代码': '002475', '名称': '立讯精密', '交易所': 'SZ'},
            {'代码': '002594', '名称': '比亚迪', '交易所': 'SZ'},
            {'代码': '002714', '名称': '牧原股份', '交易所': 'SZ'},
            {'代码': '300014', '名称': '亿纬锂能', '交易所': 'SZ'},
            {'代码': '300059', '名称': '东方财富', '交易所': 'SZ'},
            {'代码': '300122', '名称': '智飞生物', '交易所': 'SZ'},
            {'代码': '300142', '名称': '沃森生物', '交易所': 'SZ'},
            {'代码': '300750', '名称': '宁德时代', '交易所': 'SZ'},
            {'代码': '600000', '名称': '浦发银行', '交易所': 'SS'},
            {'代码': '600009', '名称': '上海机场', '交易所': 'SS'},
            {'代码': '600010', '名称': '包钢股份', '交易所': 'SS'},
            {'代码': '600016', '名称': '民生银行', '交易所': 'SS'},
            {'代码': '600030', '名称': '中信证券', '交易所': 'SS'},
            {'代码': '600036', '名称': '招商银行', '交易所': 'SS'},
            {'代码': '600050', '名称': '中国联通', '交易所': 'SS'},
            {'代码': '600104', '名称': '上汽集团', '交易所': 'SS'},
            {'代码': '600111', '名称': '北方稀土', '交易所': 'SS'},
            {'代码': '600196', '名称': '复星医药', '交易所': 'SS'},
            {'代码': '600276', '名称': '恒瑞医药', '交易所': 'SS'},
            {'代码': '600309', '名称': '万华化学', '交易所': 'SS'},
            {'代码': '600519', '名称': '贵州茅台', '交易所': 'SS'},
            {'代码': '600570', '名称': '恒生电子', '交易所': 'SS'},
            {'代码': '600585', '名称': '海螺水泥', '交易所': 'SS'},
            {'代码': '600588', '名称': '用友网络', '交易所': 'SS'},
            {'代码': '600690', '名称': '海尔智家', '交易所': 'SS'},
            {'代码': '600703', '名称': '三安光电', '交易所': 'SS'},
            {'代码': '600745', '名称': '闻泰科技', '交易所': 'SS'},
            {'代码': '600809', '名称': '山西汾酒', '交易所': 'SS'},
            {'代码': '600837', '名称': '海通证券', '交易所': 'SS'},
            {'代码': '600887', '名称': '伊利股份', '交易所': 'SS'},
            {'代码': '601012', '名称': '隆基绿能', '交易所': 'SS'},
            {'代码': '601066', '名称': '中信建投', '交易所': 'SS'},
            {'代码': '601088', '名称': '中国神华', '交易所': 'SS'},
            {'代码': '601138', '名称': '工业富联', '交易所': 'SS'},
            {'代码': '601166', '名称': '兴业银行', '交易所': 'SS'},
            {'代码': '601169', '名称': '北京银行', '交易所': 'SS'},
            {'代码': '601186', '名称': '中国铁建', '交易所': 'SS'},
            {'代码': '601211', '名称': '国泰君安', '交易所': 'SS'},
            {'代码': '601288', '名称': '农业银行', '交易所': 'SS'},
            {'代码': '601318', '名称': '中国平安', '交易所': 'SS'},
            {'代码': '601328', '名称': '交通银行', '交易所': 'SS'},
            {'代码': '601398', '名称': '工商银行', '交易所': 'SS'},
            {'代码': '601601', '名称': '中国太保', '交易所': 'SS'},
            {'代码': '601628', '名称': '中国人寿', '交易所': 'SS'},
            {'代码': '601668', '名称': '中国建筑', '交易所': 'SS'},
            {'代码': '601688', '名称': '华泰证券', '交易所': 'SS'},
            {'代码': '601766', '名称': '中国中车', '交易所': 'SS'},
            {'代码': '601800', '名称': '中国交建', '交易所': 'SS'},
            {'代码': '601818', '名称': '光大银行', '交易所': 'SS'},
            {'代码': '601857', '名称': '中国石油', '交易所': 'SS'},
            {'代码': '601888', '名称': '中国中免', '交易所': 'SS'},
            {'代码': '601919', '名称': '中远海控', '交易所': 'SS'},
            {'代码': '601988', '名称': '中国银行', '交易所': 'SS'},
            {'代码': '601989', '名称': '中国重工', '交易所': 'SS'},
            {'代码': '603259', '名称': '药明康德', '交易所': 'SS'},
            {'代码': '603993', '名称': '洛阳钼业', '交易所': 'SS'}
        ]
        
        # 根据查询条件筛选
        if query:
            filtered_stocks = []
            for stock in stock_list:
                if (query.lower() in stock['名称'].lower() or 
                    query in stock['代码'] or
                    query.lower() in stock['名称'].lower().replace('A', '')):
                    filtered_stocks.append(stock)
            stock_list = filtered_stocks
        
        # 转换为响应格式
        result = []
        for stock in stock_list[:20]:  # 限制返回数量
            result.append({
                'symbol': stock['代码'],
                'name': stock['名称']
            })
        
        return JSONResponse(content={'stocks': result})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索股票失败: {str(e)}")

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)