from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
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
async def get_stock_data(symbol: str, dividing_date: str):
    """简化版股票数据接口"""
    
    # 返回模拟数据
    response_data = {
        'symbol': symbol,
        'name': f"股票{symbol}",
        'dividing_date': dividing_date,
        'historical_data': [
            {
                'date': '2024-01-01',
                'open': 10.0,
                'high': 11.0,
                'low': 9.5,
                'close': 10.5,
                'volume': 1000000
            }
        ],
        'future_data': [
            {
                'date': '2024-01-02',
                'open': 10.5,
                'high': 11.2,
                'low': 10.3,
                'close': 10.8,
                'volume': 1200000
            }
        ]
    }
    
    return JSONResponse(content=response_data)

@app.get("/api/stock/search")
async def search_stock(query: str):
    """搜索股票"""
    
    # 返回模拟搜索结果
    result = [
        {'symbol': '000001', 'name': '平安银行'},
        {'symbol': '000002', 'name': '万科A'},
        {'symbol': '600036', 'name': '招商银行'}
    ]
    
    return JSONResponse(content={'stocks': result})

@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)