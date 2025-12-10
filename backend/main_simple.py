from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import akshare as ak
import pandas as pd
import redis
import json

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

@app.get("/api/stock/{symbol}")
async def get_stock_data(symbol: str, dividing_date: str, historical_days: int = 180, future_days: int = 90):
    """简化版股票数据接口，使用真实股票数据"""
    
    try:
        # 验证日期格式
        dividing_date_obj = datetime.strptime(dividing_date, "%Y-%m-%d")
        
        # 计算日期范围
        start_date = (dividing_date_obj - timedelta(days=historical_days)).strftime("%Y%m%d")
        end_date = (dividing_date_obj + timedelta(days=future_days)).strftime("%Y%m%d")
        
        # 处理A股代码格式
        if symbol.startswith('6'):
            yahoo_symbol = f"{symbol}.SS"
        elif symbol.startswith('0') or symbol.startswith('3'):
            yahoo_symbol = f"{symbol}.SZ"
        else:
            yahoo_symbol = symbol
        
        # 获取股票数据
        stock = yf.Ticker(yahoo_symbol)
        hist_data = stock.history(start=start_date, end=end_date)
        
        if hist_data.empty:
            hist_data = stock.history(period="1y")
        
        if hist_data.empty:
            raise HTTPException(status_code=404, detail=f"无法获取股票 {symbol} 的数据")
        
        # 格式化数据
        hist_data = hist_data.reset_index()
        hist_data = hist_data.rename(columns={
            'Date': 'date', 'Open': 'open', 'High': 'high', 'Low': 'low', 'Close': 'close', 'Volume': 'volume'
        })
        
        # 按分界日期分割数据
        dividing_date_pd = pd.to_datetime(dividing_date)
        historical_data = hist_data[hist_data['date'] < dividing_date_pd]
        future_data = hist_data[hist_data['date'] >= dividing_date_pd]
        
        # 转换为响应格式
        def format_data(df):
            result = []
            for _, row in df.iterrows():
                result.append({
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'open': float(row['open']),
                    'high': float(row['high']),
                    'low': float(row['low']),
                    'close': float(row['close']),
                    'volume': float(row['volume'])
                })
            return result
        
        # 获取股票名称
        stock_name = symbol
        stock_list = [
            {'代码': '000001', '名称': '平安银行'},
            {'代码': '000002', '名称': '万科A'},
            {'代码': '600036', '名称': '招商银行'},
            {'代码': '601318', '名称': '中国平安'},
            {'代码': '600519', '名称': '贵州茅台'}
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
        
        return JSONResponse(content=response_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取股票数据失败: {str(e)}")

@app.get("/api/stock/search")
async def search_stock(query: str):
    """搜索股票"""
    
    # 预定义一些热门A股股票
    stock_list = [
        {'代码': '000001', '名称': '平安银行'},
        {'代码': '000002', '名称': '万科A'},
        {'代码': '000063', '名称': '中兴通讯'},
        {'代码': '000333', '名称': '美的集团'},
        {'代码': '000651', '名称': '格力电器'},
        {'代码': '000858', '名称': '五粮液'},
        {'代码': '002415', '名称': '海康威视'},
        {'代码': '002594', '名称': '比亚迪'},
        {'代码': '300014', '名称': '亿纬锂能'},
        {'代码': '300059', '名称': '东方财富'},
        {'代码': '300750', '名称': '宁德时代'},
        {'代码': '600000', '名称': '浦发银行'},
        {'代码': '600036', '名称': '招商银行'},
        {'代码': '600104', '名称': '上汽集团'},
        {'代码': '600196', '名称': '复星医药'},
        {'代码': '600276', '名称': '恒瑞医药'},
        {'代码': '600519', '名称': '贵州茅台'},
        {'代码': '600887', '名称': '伊利股份'},
        {'代码': '601012', '名称': '隆基绿能'},
        {'代码': '601318', '名称': '中国平安'},
        {'代码': '601398', '名称': '工商银行'},
        {'代码': '601888', '名称': '中国中免'},
        {'代码': '603259', '名称': '药明康德'}
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
    for stock in stock_list[:15]:  # 限制返回数量
        result.append({
            'symbol': stock['代码'],
            'name': stock['名称']
        })
    
    return JSONResponse(content={'stocks': result})

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)