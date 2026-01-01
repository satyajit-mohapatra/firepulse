
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { YearProjection, CurrencyCode } from '../types';
import { formatCurrency, formatCompactNumber } from '../utils/finance';

interface ProjectionChartProps {
  data: YearProjection[];
  fiAge: number | null;
  currency: CurrencyCode;
}

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as YearProjection;
    return (
      <div className="bg-slate-900 border border-white/10 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-2xl min-w-[250px] sm:min-w-[300px] text-white">
        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-3 md:mb-4 border-b border-white/5 pb-2 sm:pb-3">
          Age {label} • Year {data.year}
        </p>
        
        <div className="space-y-3 sm:space-y-4 md:space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Portfolio:</span>
            <span className="text-sm sm:text-base md:text-xl font-black text-indigo-400">{formatCurrency(data.netWorth, currency)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 pt-2 border-t border-white/5">
            <div className="space-y-1">
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-emerald-400 uppercase tracking-wider">Inflow</span>
              <p className="text-xs sm:text-sm font-black">{formatCompactNumber(data.income, currency)}</p>
              <p className="text-[7px] sm:text-[8px] text-slate-500 font-bold uppercase leading-tight">Income + Growth</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-rose-400 uppercase tracking-wider">Outflow</span>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-rose-300">Reg: {formatCompactNumber(data.livingExpenses, currency)}</p>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-rose-400">Med: {formatCompactNumber(data.medicalExpenses, currency)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 pt-2 border-t border-white/5">
            <div className="space-y-1">
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-wider">Returns</span>
              <p className={`text-xs sm:text-sm font-black ${data.returns >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                {data.returns >= 0 ? '+' : ''}{formatCompactNumber(data.returns, currency)}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-wider">FI Goal</span>
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-slate-300">{formatCompactNumber(data.fiNumber, currency)}</p>
              <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (data.netWorth / data.fiNumber) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 sm:pt-3 md:pt-4 flex justify-between items-center border-t border-white/5">
            <span className={`text-[8px] sm:text-[9px] md:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest ${data.isRetired ? 'bg-teal-500/20 text-teal-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              {data.isRetired ? 'Safe Withdrawal' : 'Wealth Accumulation'}
            </span>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-500">
              {data.netWorth > 0 ? 'Solvent' : 'Exhausted'}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const ProjectionChart: React.FC<ProjectionChartProps> = ({ data, fiAge, currency }) => {
  return (
    <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 5, bottom: 15 }}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="age" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
            tickFormatter={(value) => formatCompactNumber(value, currency)}
            width={60}
          />
          <Tooltip 
            content={<CustomTooltip currency={currency} />} 
            cursor={{ stroke: '#6366f1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="netWorth" 
            stroke="#4f46e5" 
            fillOpacity={1} 
            fill="url(#colorNetWorth)" 
            strokeWidth={2}
            isAnimationActive={true}
          />
          {fiAge && (
            <ReferenceLine 
              x={fiAge} 
              stroke="#0d9488" 
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{ 
                value: 'FIRE', 
                position: 'top', 
                fill: '#0d9488', 
                fontSize: 10, 
                fontWeight: 900, 
                letterSpacing: '0.1em',
                dy: -10 
              }} 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectionChart;
