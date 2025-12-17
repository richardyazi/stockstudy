import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { StockOption } from '../types/stock';
import { searchStocks } from '../services/apiService';
import { loadStockConfig, DEFAULT_STOCK_LIST } from '../utils/stockConfigLoader';

interface StockSelectorProps {
  value: string;
  onChange: (stockCode: string) => void;
  /** 股票选项列表，支持自定义配置 */
  stockOptions?: StockOption[];
  /** 是否显示股票代码 */
  showCode?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 配置文件路径，支持自定义 */
  configPath?: string;
}

export function StockSelector({ 
  onChange, 
  stockOptions,
  showCode = true,
  placeholder = '输入股票代码或名称...',
  configPath
}: StockSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<StockOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [stockList, setStockList] = useState<StockOption[]>([]);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 加载股票配置数据
  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoading(true);
        setConfigError(null);
        
        // 优先使用传入的股票选项，否则从配置文件加载
        if (stockOptions && stockOptions.length > 0) {
          setStockList(stockOptions);
          setConfigLoaded(true);
          return;
        }
        
        const loadedStocks = await loadStockConfig(configPath);
        setStockList(loadedStocks);
        setConfigLoaded(true);
        
      } catch (error) {
        console.error('加载股票配置失败:', error);
        setConfigError('股票配置加载失败，使用默认股票列表');
        setStockList(DEFAULT_STOCK_LIST);
        setConfigLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
  }, [stockOptions, configPath]);

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

  // const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const val = e.target.value;
  //   setInputValue(val);

  //   if (val.trim()) {
  //     setLoading(true);
  //     try {
  //       // 通过API搜索股票
  //       const apiResults = await searchStocks(val);
        
  //       // 转换为前端需要的格式
  //       const filtered = apiResults.map(stock => ({
  //         code: stock.symbol,
  //         name: stock.name,
  //         label: `${stock.symbol}[${stock.name}]`
  //       }));
        
  //       setSuggestions(filtered);
  //       setShowSuggestions(true);
  //       setSelectedIndex(-1);
  //     } catch (error) {
  //       console.error('搜索股票失败:', error);
  //       setSuggestions([]);
  //       setShowSuggestions(false);
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else {
  //     setSuggestions([]);
  //     setShowSuggestions(false);
  //   }
  // };

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
      <div className="flex items-center justify-between mb-2">
        <label className="text-slate-700">
          股票代码/名称
        </label>
        {configError && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            {configError}
          </span>
        )}
      </div>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search size={20} />
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
          placeholder={placeholder}
          disabled={!configLoaded || loading}
          className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl">
          <div className="px-4 py-3 text-center text-slate-500">
            搜索中...
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          {suggestions.map((stock, index) => (
            <button
              key={stock.code}
              onClick={() => handleSelectStock(stock)}
              className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : ''
              } ${index !== suggestions.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-800">{stock.label}</span>
                {showCode && (
                  <span className="text-slate-400 text-sm">{stock.code}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
