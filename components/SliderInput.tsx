
import React from 'react';

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
  tooltip
}) => {
  const incrementValue = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const decrementValue = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  return (
    <div className="flex flex-col space-y-2 group w-full slider-input-container">
      <div className="flex flex-col space-y-1">
        <label className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors duration-200 uppercase tracking-[0.2em] leading-tight slider-input-label">
          {label}
        </label>
        <div className="flex items-center justify-between gap-2 slider-input-value pt-1">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-1">
            {prefix && <span className="text-[10px] sm:text-xs font-bold text-slate-400 self-center">{prefix}</span>}
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              min={min}
              max={max}
              step={step}
              className="w-full bg-transparent text-left text-base sm:text-lg md:text-xl font-black text-slate-900 outline-none border-b-2 border-slate-200/60 focus:border-indigo-500 transition-all duration-200 mono py-1 hover:border-slate-300"
            />
            {suffix && <span className="text-[10px] sm:text-xs font-bold text-slate-400 self-center">{suffix}</span>}
          </div>
          <div className="flex flex-col gap-0.5 shrink-0">
            <button
              onClick={incrementValue}
              disabled={value >= max}
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 transition-all duration-200 group"
              aria-label="Increase value"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 group-hover:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={decrementValue}
              disabled={value <= min}
              className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-300 transition-all duration-200 group"
              aria-label="Decrease value"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600 group-hover:text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {tooltip && (
        <div className="text-[9px] sm:text-[10px] text-slate-400 leading-snug opacity-90 mt-1 font-medium">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default SliderInput;
