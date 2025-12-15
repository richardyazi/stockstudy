import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { StockOption } from '../types/stock';
import { searchStocks } from '../services/apiService';

// 模拟股票数据库
const STOCK_LIST: StockOption[] = [
  { code: '000001', name: '平安银行', label: '000001[平安银行]' },
  { code: '000002', name: '万科A', label: '000002[万科A]' },
  { code: '000063', name: '中兴通讯', label: '000063[中兴通讯]' },
  { code: '000333', name: '美的集团', label: '000333[美的集团]' },
  { code: '000858', name: '五粮液', label: '000858[五粮液]' },
  { code: '600000', name: '浦发银行', label: '600000[浦发银行]' },
  { code: '600036', name: '招商银行', label: '600036[招商银行]' },
  { code: '600519', name: '贵州茅台', label: '600519[贵州茅台]' },
  { code: '600887', name: '伊利股份', label: '600887[伊利股份]' },
  { code: '601318', name: '中国平安', label: '601318[中国平安]' },
  { code: '601398', name: '工商银行', label: '601398[工商银行]' },
  { code: '601888', name: '中国中免', label: '601888[中国中免]' },
];

interface StockSelectorProps {
  value: string;
  onChange: (stockCode: string) => void;
}

export function StockSelector({ onChange }: StockSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<StockOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

    if (val.trim()) {
      const filtered = STOCK_LIST.filter(
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
      <label className="block mb-2 text-slate-700">
        股票代码/名称
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={20} />
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
          placeholder="输入股票代码或名称..."
          className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                <span className="text-slate-400 text-sm">{stock.code}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
