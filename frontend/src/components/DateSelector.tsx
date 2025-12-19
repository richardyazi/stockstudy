import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateSelectorProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export function DateSelector({ value, onChange }: DateSelectorProps) {
  const [inputValue, setInputValue] = useState('');

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (val) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        onChange(date);
      }
    } else {
      onChange(null);
    }
  };

  React.useEffect(() => {
    if (value) {
      setInputValue(formatDate(value));
    }
  }, [value]);

  // 设置日期范围：2020-01-01 到今天
  const minDate = '2020-01-01';
  const maxDate = formatDate(new Date());

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
          <Calendar size={16} />
        </div>
        <input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          min={minDate}
          max={maxDate}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        />
      </div>
    </div>
  );
}
