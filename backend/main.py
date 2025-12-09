from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
import pandas as pd
import akshare as ak
import redis
import json
from typing import Optional, List
import asyncio

app = FastAPI(title="股票趋势练习API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 前端开发服务器地址
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

async def fetch_stock_data(symbol: str, start_date: str, end_date: str) -> pd.DataFrame:
    """获取股票数据"""
    try:
        # 使用AKShare获取股票数据
        stock_data = ak.stock_zh_a_hist(symbol=symbol, period="daily", start_date=start_date, end_date=end_date)
        
        if stock_data.empty:
            raise HTTPException(status_code=404, detail="未找到股票数据")
        
        # 重命名列
        stock_data = stock_data.rename(columns={
            '日期': 'date',
            '开盘': 'open',
            '最高': 'high',
            '最低': 'low',
            '收盘': 'close',
            '成交量': 'volume'
        })
        
        # 转换数据类型
        stock_data['date'] = pd.to_datetime(stock_data['date'])
        stock_data = stock_data.sort_values('date')
        
        return stock_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取股票数据失败: {str(e)}")

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
    stock_data = await fetch_stock_data(symbol, start_date, end_date)
    
    if stock_data.empty:
        raise HTTPException(status_code=404, detail="未找到指定日期范围内的股票数据")
    
    # 按分界日期分割数据
    dividing_date_pd = pd.to_datetime(dividing_date)
    historical_data = stock_data[stock_data['date'] < dividing_date_pd]
    future_data = stock_data[stock_data['date'] >= dividing_date_pd]
    
    # 计算技术指标
    historical_data = calculate_kdj(historical_data)
    historical_data = calculate_volume_ma(historical_data)
    
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
    
    response_data = {
        'symbol': symbol,
        'name': f"股票{symbol}",  # 实际项目中可以从AKShare获取股票名称
        'dividing_date': dividing_date,
        'historical_data': format_data(historical_data),
        'future_data': format_data(future_data)
    }
    
    # 缓存数据
    await set_cached_data(cache_key, response_data)
    
    return JSONResponse(content=response_data)

@app.get("/api/stock/search")
async def search_stock(query: str):
    """搜索股票"""
    try:
        # 获取股票列表
        stock_list = ak.stock_info_a_code_name()
        
        # 根据查询条件筛选
        if query:
            stock_list = stock_list[stock_list['名称'].str.contains(query, na=False) | 
                                   stock_list['代码'].str.contains(query, na=False)]
        
        # 转换为响应格式
        result = []
        for _, row in stock_list.head(20).iterrows():  # 限制返回数量
            result.append({
                'symbol': row['代码'],
                'name': row['名称']
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