import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { StockOption } from '../types/stock';

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

export function StockSelector({ value, onChange }: StockSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<StockOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
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
      <div className="relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={16} />
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
          className="w-full pl-8 pr-7 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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