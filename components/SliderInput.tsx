
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
  return (
    <div className="flex flex-col space-y-4 group w-full slider-input-container">
      <div className="flex justify-between items-end gap-3">
        <label className="text-[10px] md:text-[11px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors duration-200 uppercase tracking-[0.2em] leading-tight flex-1 min-w-0 slider-input-label">
          {label}
        </label>
        <div className="flex items-center gap-1.5 shrink-0 min-w-0 slider-input-value">
          {prefix && <span className="text-xs font-bold text-slate-400 self-center mb-1">{prefix}</span>}
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="w-20 md:w-28 bg-transparent text-right text-lg md:text-xl font-black text-slate-900 outline-none border-b-2 border-slate-200/60 focus:border-indigo-500 transition-all duration-200 mono py-1 hover:border-slate-300"
          />
          {suffix && <span className="text-xs font-bold text-slate-400 self-center mb-1">{suffix}</span>}
        </div>
      </div>
      <div className="relative flex items-center h-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200/60 rounded-full appearance-none cursor-pointer accent-indigo-600 transition-all duration-200 hover:bg-slate-300/60"
        />
      </div>
      {tooltip && (
        <div className="text-[10px] text-slate-400 leading-snug opacity-90 mt-1 font-medium">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default SliderInput;
