import React, { useState } from 'react';
import { CurrencyCode } from '../types';
import { parseNumberWithSuffix, formatNumberForDisplay } from '../utils/numberParser';

interface ModernSliderInputProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step?: number;
    prefix?: string;
    suffix?: string;
    tooltip?: React.ReactNode;
    color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple';
    showSlider?: boolean;
    compact?: boolean;
    icon?: string;
    currency?: CurrencyCode;
    error?: string;
}

const colorMap = {
    indigo: { fill: '#6366f1', track: '#e0e7ff' },
    emerald: { fill: '#10b981', track: '#d1fae5' },
    amber: { fill: '#f59e0b', track: '#fef3c7' },
    rose: { fill: '#f43f5e', track: '#ffe4e6' },
    purple: { fill: '#8b5cf6', track: '#ede9fe' },
};

const ModernSliderInput: React.FC<ModernSliderInputProps> = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    prefix = '',
    suffix = '',
    tooltip,
    color = 'indigo',
    showSlider = true,
    icon,
    error,
    currency,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const colors = colorMap[color];

    const fillPercent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

    const formatValue = (val: number): string => {
        return formatNumberForDisplay(val, currency);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty input
        if (inputValue === '' || inputValue === '-') {
            onChange(min);
            return;
        }

        // Try to parse with suffix support
        const parsedValue = parseNumberWithSuffix(inputValue);

        if (parsedValue !== null && !isNaN(parsedValue)) {
            onChange(parsedValue);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        const clampedValue = Math.min(max, Math.max(min, value));
        if (clampedValue !== value) {
            onChange(clampedValue);
        }
    };

    return (
        <div className="relative group">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                    {icon && <span className="text-xs shrink-0">{icon}</span>}
                    <label className={`text-[11px] font-semibold uppercase tracking-wide truncate ${error ? 'text-red-500' : 'text-slate-500'}`}>
                        {label}
                    </label>
                    {tooltip && (
                        <button
                            type="button"
                            className="shrink-0 w-3.5 h-3.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 flex items-center justify-center text-[9px] font-bold transition-colors"
                            onClick={() => setShowTooltip(!showTooltip)}
                        >
                            ?
                        </button>
                    )}
                </div>

                {/* Value Display */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {prefix && <span className="text-xs text-slate-400">{prefix}</span>}
                    <input
                        type="text"
                        value={isFocused ? value : formatValue(value)}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        }}
                        className={`w-14 text-right text-sm font-bold tabular-nums bg-transparent outline-none transition-all ${isFocused
                            ? 'bg-white rounded px-1 ring-1 ring-indigo-400 text-indigo-700'
                            : error ? 'text-red-600' : 'text-slate-700'
                            }`}
                    />
                    {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
                </div>
            </div>

            {/* Slider Track */}
            {showSlider && (
                <div
                    className="relative h-6 flex items-center cursor-pointer"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        const newValue = min + percent * (max - min);
                        const snappedValue = Math.round(newValue / step) * step;
                        onChange(Math.max(min, Math.min(max, snappedValue)));
                    }}
                >
                    {/* Background Track */}
                    <div
                        className="absolute inset-x-0 h-1.5 rounded-full"
                        style={{ backgroundColor: colors.track }}
                    />

                    {/* Filled Track */}
                    <div
                        className="absolute h-1.5 rounded-full transition-all duration-75"
                        style={{
                            width: `${fillPercent}%`,
                            backgroundColor: colors.fill
                        }}
                    />

                    {/* Thumb */}
                    <div
                        className="absolute w-4 h-4 rounded-full bg-white border-2 shadow-md transition-transform duration-75 hover:scale-110"
                        style={{
                            left: `calc(${fillPercent}% - 8px)`,
                            borderColor: colors.fill,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                        }}
                    />

                    {/* Invisible Range Input for drag handling */}
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            )}

            {/* Tooltip Popup */}
            {tooltip && showTooltip && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 p-2.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-800 rotate-45" />
                    <div className="relative">{tooltip}</div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-[10px] text-red-500 font-medium mt-0.5">{error}</p>
            )}
        </div>
    );
};

export default ModernSliderInput;
