import React, { useState, useRef } from 'react';
import { parseNumberWithSuffix, formatNumberForDisplay } from '../utils/numberParser';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  tooltip?: React.ReactNode;
  currency?: string; // Currency code for proper formatting
}

const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix = '',
  suffix = '',
  tooltip,
  currency = 'USD'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const sliderRef = useRef<HTMLInputElement>(null);

  // Calculate fill percentage for the slider track
  const fillPercent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // Format display value with K/M/L/Cr abbreviations based on currency
  const formatDisplayValue = (val: number): string => {
    return formatNumberForDisplay(val, currency);
  };

  // Handle focus - show raw number
  const handleFocus = () => {
    setIsFocused(true);
    setInputValue(value.toString());
  };

  // Handle input change - allow typing any number with suffix support
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    // Try to parse with suffix support (10k, 1m, 5lac, 5cr, etc.)
    const parsedValue = parseNumberWithSuffix(raw);
    if (parsedValue !== null && !isNaN(parsedValue)) {
      onChange(parsedValue);
    }
  };

  // Handle blur - validate and clamp
  const handleInputBlur = () => {
    setIsFocused(false);
    const numValue = parseNumberWithSuffix(inputValue);
    if (numValue !== null && !isNaN(numValue)) {
      const clampedValue = Math.min(max, Math.max(min, numValue));
      onChange(clampedValue);
    }
  };

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    onChange(numValue);
    setInputValue(numValue.toString());
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Label and Value Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
          <label className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-slate-600 truncate">
            {label}
          </label>

          {tooltip && (
            <button
              type="button"
              className="flex-shrink-0 w-4 h-4 rounded-full bg-slate-200 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center transition-all text-[10px] font-bold"
              onClick={() => setShowTooltip(!showTooltip)}
              onBlur={() => setTimeout(() => setShowTooltip(false), 200)}
            >
              ?
            </button>
          )}
        </div>

        {/* Value Display with inline editing */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {prefix && (
            <span className="text-sm font-semibold text-slate-500">
              {prefix}
            </span>
          )}
          <input
            type="text"
            inputMode="decimal"
            value={isFocused ? inputValue : formatDisplayValue(value)}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleInputBlur}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
              }
              if (e.key === 'Enter') {
                (e.target as HTMLInputElement).blur();
              }
            }}
            className={`w-16 sm:w-20 text-right text-base sm:text-lg font-bold tracking-tight outline-none transition-all duration-150 rounded px-1 ${isFocused
              ? 'bg-white text-indigo-600 ring-2 ring-indigo-400'
              : 'bg-transparent text-slate-800 hover:bg-slate-50'
              }`}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          />
          {suffix && (
            <span className="text-sm font-semibold text-slate-500">
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-transparent">
          {/* Filled Track */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{ width: `${fillPercent}%` }}
          />
        </div>

        {/* Range Input */}
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Custom Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full pointer-events-none transition-transform hover:scale-110"
          style={{ left: `calc(${fillPercent}% - 8px)` }}
        />
      </div>

      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div className="p-2.5 bg-slate-800 text-white text-xs rounded-lg shadow-lg mt-1">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default SliderInput;
