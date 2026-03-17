import React from 'react';
import { Users, Plus, Minus } from 'lucide-react';

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export const GuestSelector: React.FC<GuestSelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
  className = '',
}) => {
  const increment = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Users className="w-4 h-4 text-gray-500" />
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Minus className="w-3 h-3" />
      </button>
      
      <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
        {value}
      </span>
      
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};
