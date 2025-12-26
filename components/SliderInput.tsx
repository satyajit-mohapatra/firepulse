
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
    <div className="flex flex-col space-y-3 group w-full">
      <div className="flex justify-between items-end gap-2">
        <label className="text-[10px] md:text-[11px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] leading-tight flex-1">
          {label}
        </label>
        <div className="flex items-center gap-1 shrink-0">
          {prefix && <span className="text-xs font-bold text-slate-400 self-center mb-1">{prefix}</span>}
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="w-24 md:w-32 bg-transparent text-right text-xl font-black text-slate-900 outline-none border-b border-slate-200 focus:border-indigo-500 transition-all mono py-0"
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
          className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600 transition-all"
        />
      </div>
      {tooltip && (
        <div className="text-[10px] text-slate-400 leading-snug opacity-90 mt-0.5 font-medium">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default SliderInput;
