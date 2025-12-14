from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
import pandas as pd
import akshare as ak
import requests
import json
from typing import Optional, List, Dict
import asyncio
import time

app = FastAPI(title="股票趋势练习API", version="1.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 内存缓存配置
cache_store: Dict[str, tuple] = {}
CACHE_EXPIRE = 3600  # 缓存过期时间（秒）

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
    """从内存缓存获取数据"""
    if key in cache_store:
        data, timestamp = cache_store[key]
        if time.time() - timestamp < CACHE_EXPIRE:
            return data
        else:
            # 缓存过期，删除
            del cache_store[key]
    return None

async def set_cached_data(key: str, data: dict, expire: int = CACHE_EXPIRE):
    """设置内存缓存数据"""
    cache_store[key] = (data, time.time())

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
            raise HTTPException(status_code=400, detail="不支持的股票代码格式")
        
        if stock_data.empty:
            raise HTTPException(status_code=404, detail="未找到股票数据")
        
        # 处理数据格式
        stock_data['日期'] = pd.to_datetime(stock_data['日期'])
        stock_data = stock_data.rename(columns={
            '日期': 'date',
            '开盘': 'open',
            '最高': 'high',
            '最低': 'low',
            '收盘': 'close',
            '成交量': 'volume'
        })
        
        # 过滤日期范围
        stock_data = stock_data[
            (stock_data['date'] >= start_date_obj) & 
            (stock_data['date'] <= end_date_obj)
        ].sort_values('date')
        
        return stock_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取股票数据失败: {str(e)}")

@app.get("/")
async def root():
    """健康检查接口"""
    return {"status": "healthy", "message": "股票趋势练习API服务正常"}

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/stock/{symbol}")
async def get_stock_data(
    symbol: str,
    dividing_date: str,
    historical_days: int = 180,
    future_days: int = 90
):
    """获取股票数据"""
    try:
        # 验证参数
        if len(symbol) != 6 or not symbol.isdigit():
            raise HTTPException(status_code=400, detail="股票代码格式错误，应为6位数字")
        
        # 解析日期
        try:
            dividing_date_obj = datetime.strptime(dividing_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="分界日期格式错误，应为YYYY-MM-DD")
        
        # 计算日期范围
        start_date = (dividing_date_obj - timedelta(days=historical_days)).strftime("%Y%m%d")
        end_date = (dividing_date_obj + timedelta(days=future_days)).strftime("%Y%m%d")
        
        # 检查缓存
        cache_key = f"stock_{symbol}_{dividing_date}_{historical_days}_{future_days}"
        cached_data = await get_cached_data(cache_key)
        if cached_data:
            return cached_data
        
        # 获取股票数据
        stock_df = await fetch_stock_data_from_akshare(symbol, start_date, end_date)
        
        if stock_df.empty:
            raise HTTPException(status_code=404, detail="在指定日期范围内未找到股票数据")
        
        # 分割数据
        historical_data = stock_df[stock_df['date'] <= dividing_date_obj]
        future_data = stock_df[stock_df['date'] > dividing_date_obj]
        
        # 计算技术指标
        if len(historical_data) >= 9:
            historical_data = calculate_kdj(historical_data)
            historical_data = calculate_volume_ma(historical_data)
        
        if len(future_data) >= 9:
            future_data = calculate_kdj(future_data)
            future_data = calculate_volume_ma(future_data)
        
        # 构建响应数据
        response_data = {
            "symbol": symbol,
            "name": f"股票{symbol}",  # 实际项目中应该获取真实股票名称
            "dividing_date": dividing_date,
            "historical_data": historical_data.to_dict('records'),
            "future_data": future_data.to_dict('records')
        }
        
        # 设置缓存
        await set_cached_data(cache_key, response_data)
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")

@app.get("/api/stock/search")
async def search_stock(query: str):
    """搜索股票"""
    try:
        # 使用AKShare搜索股票
        if len(query) >= 2:
            # 这里可以集成股票搜索功能
            # 暂时返回示例数据
            return {
                "results": [
                    {"symbol": "000001", "name": "平安银行"},
                    {"symbol": "000002", "name": "万科A"},
                    {"symbol": "600000", "name": "浦发银行"}
                ]
            }
        else:
            return {"results": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)