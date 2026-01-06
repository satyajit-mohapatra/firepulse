import React from 'react';
import { FinancialData, CalculationResults, CurrencyCode } from '../../types';
import { formatCurrency, formatCompactNumber, formatCurrencyCompact } from '../../utils/finance';
import SliderInput from '../SliderInput';
import ProjectionChart from '../ProjectionChart';

interface Phase2ResultsProps {
    data: FinancialData;
    results: CalculationResults;
    currency: CurrencyCode;
    currencySymbol: string;
    updateData: (key: keyof FinancialData, value: any) => void;
    currentAllocation: any;
    savingsRate: number;
}

const Phase2Results: React.FC<Phase2ResultsProps> = ({
    data,
    results,
    currency,
    currencySymbol,
    updateData,
    currentAllocation,
    savingsRate,
}) => {
    const strategies: { id: FinancialData['simulationMode']; label: string }[] = [
        { id: 'leaner', label: 'Leaner' },
        { id: 'conservative', label: 'Conservative' },
        { id: 'aggressive', label: 'Aggressive' },
        { id: 'crash', label: 'Crash' },
    ];

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* FIRE STATUS CARDS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                <div className="sm:col-span-1 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-4xl text-white shadow-2xl shadow-purple-600/40 relative overflow-hidden group border border-white/20 backdrop-blur-xl hover:shadow-3xl hover:shadow-purple-600/50 transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 md:-mr-12 md:-mt-12 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] mb-1.5 sm:mb-2 text-white/90">Solvency FIRE Age</p>
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl lg:text-5xl font-black tracking-tighter italic leading-none drop-shadow-2xl">{results.fiAge || '—'}</h2>
                        <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase mt-1.5 sm:mt-2 text-white/80 tracking-widest">{results.fiYear ? `Safe Retirement Year: ${results.fiYear}` : 'Capital Exhaustion Risk'}</p>
                    </div>
                </div>

                <div className="sm:col-span-1 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-4xl text-white shadow-2xl shadow-emerald-600/40 relative overflow-hidden group border border-white/20 backdrop-blur-xl hover:shadow-3xl hover:shadow-emerald-600/50 transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative z-10">
                        <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] mb-1.5 sm:mb-2 text-white/90">Longevity Limit</p>
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl lg:text-4xl font-black tracking-tighter italic mono drop-shadow-2xl">Age {data.liveUntilAge}</h2>
                        <p className={`text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase mt-1.5 sm:mt-2 tracking-widest ${results.isSolventAtEnd ? 'text-emerald-200' : 'text-pink-200 animate-pulse'}`}>
                            {results.isSolventAtEnd ? 'Portfolio remains solvent' : 'Warning: Portfolio exhausts'}
                        </p>
                    </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl md:rounded-4xl text-white shadow-2xl shadow-amber-600/40 relative overflow-hidden group border border-white/20 backdrop-blur-xl hover:shadow-3xl hover:shadow-amber-600/50 transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative z-10">
                        <p className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] md:tracking-[0.3em] mb-1.5 sm:mb-2 text-white/90">Savings Velocity</p>
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl lg:text-4xl font-black tracking-tighter italic mono drop-shadow-2xl">{savingsRate.toFixed(1)}%</h2>
                        <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-amber-100 uppercase mt-1.5 sm:mt-2 tracking-widest">Surplus: {formatCurrencyCompact(data.monthlySavings, currency)}/mo</p>
                    </div>
                </div>
            </section>

            {/* TOP ROW: ALLOCATION & VISUAL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* ASSET ALLOCATION DISPLAY */}
                <div className="bg-white/95 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/40 shadow-2xl shadow-purple-600/25 hover:shadow-3xl hover:shadow-purple-600/35 transition-all duration-500 h-full relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-[2rem] md:rounded-[3rem] pointer-events-none"></div>
                    <h2 className="text-[10px] md:text-xs font-black text-purple-700 uppercase tracking-[0.4em] italic mb-8 md:mb-10 relative z-10">Asset Allocation</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10 relative z-10">
                        <div className="bg-gradient-to-br from-purple-100/90 to-pink-100/70 p-3 md:p-5 rounded-[1rem] md:rounded-[1.5rem] border border-purple-200/50 shadow-lg">
                            <p className="text-[8px] md:text-[10px] font-black text-purple-700 uppercase tracking-[0.15em] mb-2">Total Assets</p>
                            <h3 className="text-lg md:text-xl font-black text-purple-900 tracking-tighter">{formatCurrencyCompact(currentAllocation.totalAssets, currency)}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-100/90 to-teal-100/70 p-3 md:p-5 rounded-[1rem] md:rounded-[1.5rem] border border-emerald-200/50 shadow-lg">
                            <p className="text-[8px] md:text-[10px] font-black text-emerald-700 uppercase tracking-[0.15em] mb-2">Liquid</p>
                            <h3 className="text-lg md:text-xl font-black text-emerald-900 tracking-tighter">{formatCurrencyCompact(data.currentNetWorth, currency)}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-blue-100/90 to-indigo-100/70 p-3 md:p-5 rounded-[1rem] md:rounded-[1.5rem] border border-blue-200/50 shadow-lg">
                            <p className="text-[8px] md:text-[10px] font-black text-blue-700 uppercase tracking-[0.15em] mb-2">401k / IRA</p>
                            <h3 className="text-lg md:text-xl font-black text-blue-900 tracking-tighter">{formatCurrencyCompact(data.retirementAssets, currency)}</h3>
                        </div>
                        <div className="bg-gradient-to-br from-amber-100/90 to-orange-100/70 p-3 md:p-5 rounded-[1rem] md:rounded-[1.5rem] border border-amber-200/50 shadow-lg">
                            <p className="text-[8px] md:text-[10px] font-black text-amber-700 uppercase tracking-[0.15em] mb-2">Real Estate</p>
                            <h3 className="text-lg md:text-xl font-black text-amber-900 tracking-tighter">{formatCurrencyCompact(data.nonLiquidAssets, currency)}</h3>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Expected Returns</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                                <SliderInput label="Liquid Return" value={data.liquidAssetReturn} onChange={(v) => updateData('liquidAssetReturn', v)} min={1} max={20} step={0.5} suffix="%" />
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                                <SliderInput label="401k/IRA Return" value={data.retirementAssetReturn} onChange={(v) => updateData('retirementAssetReturn', v)} min={1} max={20} step={0.5} suffix="%" />
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                                <SliderInput label="Real Estate Return" value={data.nonLiquidAssetReturn} onChange={(v) => updateData('nonLiquidAssetReturn', v)} min={1} max={15} step={0.5} suffix="%" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* VISUAL CHART & MILESTONES */}
                <div className="bg-white/95 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/40 shadow-2xl shadow-purple-600/25 transition-all duration-500 h-full flex flex-col relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-[2rem] md:rounded-[3rem] pointer-events-none"></div>

                    <div className="bg-gradient-to-r from-purple-600/95 via-pink-600/95 to-purple-700/95 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-3 md:p-4 mb-6 relative z-10">
                        <div className="grid grid-cols-4 gap-3 md:gap-4">
                            {strategies.map((strat) => (
                                <button
                                    key={strat.id}
                                    onClick={() => updateData('simulationMode', strat.id)}
                                    className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-widest transition-all border-2 ${data.simulationMode === strat.id
                                        ? 'bg-gradient-to-r from-white to-white/90 text-purple-700 border-white shadow-lg scale-105'
                                        : 'bg-white/10 backdrop-blur-md text-white/80 border-white/20 hover:border-white/40 hover:bg-white/20 hover:scale-105'
                                        }`}
                                >
                                    {strat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <h2 className="text-[10px] md:text-xs font-black text-purple-700 uppercase tracking-[0.4em] italic mb-6 md:mb-8 relative z-10">Visual Projection</h2>
                    <div className="flex-1 min-h-[300px]">
                        <ProjectionChart data={results.projections} fiAge={results.fiAge} currency={currency} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 relative z-10">
                        {results.milestones.slice(0, 4).map((m, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border transition-all ${m.reached ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className={`text-[9px] font-black uppercase tracking-wider ${m.reached ? 'text-teal-600' : 'text-slate-400'}`}>{m.name}</h5>
                                    {m.age && <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Age {m.age}</span>}
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ${m.reached ? 'bg-teal-500' : 'bg-slate-300'}`} style={{ width: `${Math.min(100, (data.currentNetWorth / m.target) * 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SOLVENCY LEDGER TABLE */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Solvency Ledger</h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year-by-year projections</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Age (Year)</th>
                                <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Phase</th>
                                <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Income</th>
                                <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Growth</th>
                                <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Outflow</th>
                                <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Portfolio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {results.projections.map((p, idx) => (
                                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${p.isRetired ? 'bg-purple-50/30' : ''}`}>
                                    <td className="px-3 py-2 font-bold text-slate-800">
                                        {p.age} <span className="text-slate-400 font-normal ml-1">({p.year})</span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${!p.isRetired ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {!p.isRetired ? 'WORKING' : 'RETIRED'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right text-emerald-600 font-medium tracking-tight">
                                        {p.income > 0 ? (currencySymbol + formatCompactNumber(p.income, currency)) : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right text-indigo-600 font-medium tracking-tight">
                                        {p.returns !== 0 ? (currencySymbol + formatCompactNumber(p.returns, currency)) : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-right text-rose-600 font-medium tracking-tight">
                                        {currencySymbol}{formatCompactNumber(p.totalOutflow, currency)}
                                    </td>
                                    <td className={`px-3 py-2 text-right font-bold tracking-tight ${p.netWorth > 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                                        {currencySymbol}{formatCompactNumber(p.netWorth, currency)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ROADMAP TIMELINE */}
            <div className="bg-white/95 p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm relative z-10">
                <h2 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic mb-8">Roadmap Timeline</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {data.goals.map(goal => (
                        <div key={goal.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group/goal transition-all hover:shadow-lg">
                            <button
                                onClick={() => updateData('goals', data.goals.filter(g => g.id !== goal.id))}
                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover/goal:opacity-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <h4 className="font-black text-base uppercase tracking-widest text-slate-800 mb-6">{goal.name}</h4>
                            <SliderInput
                                label="Target Age"
                                value={goal.targetAge}
                                onChange={(v) => updateData('goals', data.goals.map(g => g.id === goal.id ? { ...g, targetAge: v } : g))}
                                min={data.currentAge}
                                max={data.liveUntilAge}
                            />
                        </div>
                    ))}
                    <button
                        onClick={() => updateData('goals', [...data.goals, { id: Math.random().toString(), name: 'New Milestone', targetAge: data.currentAge + 5, targetAmount: 20000, category: 'Other' }])}
                        className="p-10 border-4 border-dashed border-slate-200 rounded-[2rem] text-xs font-black uppercase tracking-widest text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all"
                    >
                        + Add Milestone
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Phase2Results;
