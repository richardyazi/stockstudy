import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { StockOption } from '../types/stock';
import { searchStocks } from '../services/apiService';
import { loadStockConfig, DEFAULT_STOCK_LIST } from '../utils/stockConfigLoader';

interface StockSelectorProps {
  value: string;
  onChange: (stockCode: string) => void;
}

export function StockSelector({ 
  onChange
}: StockSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<StockOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [stockList, setStockList] = useState<StockOption[]>([]);
  const [configLoaded, setConfigLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 加载股票配置数据
  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoading(true);
        
        // 尝试从后端API获取股票列表
        try {
          const apiResults = await searchStocks('');
          if (apiResults.length > 0) {
            // 转换为前端需要的格式
            const apiStocks = apiResults.map(stock => ({
              code: stock.symbol,
              name: stock.name,
              label: `${stock.symbol}[${stock.name}]`
            }));
            setStockList(apiStocks);
          } else {
            // API返回空列表，使用默认配置
            const loadedStocks = await loadStockConfig();
            setStockList(loadedStocks);
          }
        } catch (apiError) {
          console.warn('API搜索失败，使用本地配置:', apiError);
          // API失败时使用本地配置
          const loadedStocks = await loadStockConfig();
          setStockList(loadedStocks);
        }
        
        setConfigLoaded(true);
      } catch (error) {
        console.error('加载股票配置失败:', error);
        // 最终兜底方案
        setStockList(DEFAULT_STOCK_LIST);
        setConfigLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.trim() && stockList.length > 0) {
      const filtered = stockList.filter(
        (stock) =>
          stock.code.includes(val) ||
          stock.name.includes(val) ||
          stock.label.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  const handleSelectStock = (stock: StockOption) => {
    setInputValue(stock.label);
    onChange(stock.code);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectStock(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search size={16} />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="股票代码/名称"
          disabled={!configLoaded || loading}
          className="w-full pl-8 pr-7 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl">
          <div className="px-3 py-2 text-center text-slate-500 text-sm">
            加载中...
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          {suggestions.map((stock, index) => (
            <button
              key={stock.code}
              onClick={() => handleSelectStock(stock)}
              className={`w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : ''
              } ${index !== suggestions.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-800">{stock.label}</span>
                <span className="text-slate-400 text-xs">{stock.code}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
