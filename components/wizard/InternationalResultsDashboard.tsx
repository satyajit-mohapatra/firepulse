
import React, { useState } from 'react';
import { ScenarioResults, InternationalScenario } from '../../types/internationalPlanning';
import { COUNTRIES, getCountryOptions } from '../../data/countries';
import { formatIntlCompact } from '../../utils/internationalCalculations';
import InternationalProjectionChart from '../InternationalProjectionChart';

const countryOptions = getCountryOptions();

interface InternationalResultsDashboardProps {
    results: ScenarioResults;
    scenario: InternationalScenario;
    currency: string;
}

const InternationalResultsDashboard: React.FC<InternationalResultsDashboardProps> = ({ results, scenario, currency }) => {
    const [showProjections, setShowProjections] = useState(false);

    const getStatusColor = (probability: number) => {
        if (probability >= 80) return 'text-emerald-600';
        if (probability >= 60) return 'text-amber-600';
        return 'text-rose-600';
    };

    const getRiskBadge = (risk: string) => {
        const colors = {
            low: 'bg-emerald-100 text-emerald-700',
            moderate: 'bg-amber-100 text-amber-700',
            high: 'bg-rose-100 text-rose-700',
        };
        return colors[risk as keyof typeof colors] || colors.moderate;
    };

    return (
        <div className="space-y-6">
            {/* Projection Chart */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Net Worth Projection</h3>
                <InternationalProjectionChart projections={results.projections} fiAge={results.fiAge} currency={currency} />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* FIRE Age */}
                <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-4 sm:p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-white/80">FIRE Age</p>
                    <h2 className="text-3xl font-black tracking-tighter">{results.fiAge || '—'}</h2>
                    <p className="text-[10px] font-medium text-white/70 mt-1">
                        {results.retirementYear ? `Year ${results.retirementYear}` : 'Not achieved'}
                    </p>
                </div>

                {/* Success Probability */}
                <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-4 sm:p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-white/80">Success Rate</p>
                    <h2 className={`text-3xl font-black tracking-tighter ${getStatusColor(results.successProbability)}`}>
                        {results.successProbability.toFixed(0)}%
                    </h2>
                    <p className="text-[10px] font-medium text-white/70 mt-1">Portfolio solvency</p>
                </div>

                {/* Projected Net Worth */}
                <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-4 sm:p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-white/80">Final Net Worth</p>
                    <h2 className="text-2xl font-black tracking-tighter">
                        ${formatIntlCompact(results.medianEndBalance, currency)}
                    </h2>
                    <p className="text-[10px] font-medium text-white/70 mt-1">
                        Range: ${formatIntlCompact(results.worstCaseEndBalance, currency)} - ${formatIntlCompact(results.bestCaseEndBalance, currency)}
                    </p>
                </div>

                {/* Tax Efficiency */}
                <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-4 sm:p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-white/80">Tax Efficiency</p>
                    <h2 className="text-3xl font-black tracking-tighter">{results.taxEfficiency.toFixed(0)}</h2>
                    <p className="text-[10px] font-medium text-white/70 mt-1">Score (0-100)</p>
                </div>
            </div>

            {/* Risk Indicators */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Risk Analysis</h3>
                <div className="flex flex-wrap gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getRiskBadge(results.exchangeRateRisk)}`}>
                        💱 FX Risk: {results.exchangeRateRisk}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getRiskBadge(results.inflationRisk)}`}>
                        📈 Inflation: {results.inflationRisk}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${results.taxEfficiency > 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        📊 Tax Optimized: {results.taxEfficiency > 60 ? 'Yes' : 'Needs Work'}
                    </span>
                </div>
            </div>

            {/* Warnings */}
            {results.warnings.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                    <h3 className="text-sm font-black text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        ⚠️ Warnings
                    </h3>
                    <ul className="space-y-1">
                        {results.warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm text-rose-700">{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                        💡 Recommendations
                    </h3>
                    <div className="space-y-3">
                        {results.recommendations.map((rec, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-xl border-l-4 ${rec.priority === 'high' ? 'border-rose-500 bg-rose-50' :
                                    rec.priority === 'medium' ? 'border-amber-500 bg-amber-50' :
                                        'border-blue-500 bg-blue-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{rec.title}</h4>
                                        <p className="text-xs text-slate-600 mt-1">{rec.description}</p>
                                    </div>
                                    {rec.potentialSaving && (
                                        <span className="text-xs font-bold text-emerald-600 whitespace-nowrap">
                                            Save ${formatIntlCompact(rec.potentialSaving, currency)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projections Table Toggle */}
            <button
                onClick={() => setShowProjections(!showProjections)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors flex items-center justify-center gap-2"
            >
                {showProjections ? 'Hide' : 'Show'} Year-by-Year Projections
                <svg
                    className={`w-4 h-4 transition-transform ${showProjections ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Projections Table */}
            {showProjections && (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Year (You/Spouse)</th>
                                    <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Phase</th>
                                    <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Country/Location</th>
                                    <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Income (Local)</th>
                                    <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Growth (Local)</th>
                                    <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Exp (Local)</th>
                                    <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Portfolio (Local)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {results.projections.map((p, idx) => {
                                    // Calculate local currency values
                                    // Healthcare in projection is USD, so convert back
                                    const localHealthcare = p.healthcareCosts / p.exchangeRate;
                                    const localTotalExpenses = p.livingExpenses + localHealthcare;
                                    const localNetWorth = p.totalNetWorthUSD / p.exchangeRate;
                                    const symbol = COUNTRIES[p.country]?.currencySymbol || p.currency;

                                    return (
                                        <tr key={idx} className={`hover:bg-slate-50 ${p.phase === 'retirement' ? 'bg-purple-50/30' : ''}`}>
                                            <td className="px-3 py-2 font-bold text-slate-800">
                                                {p.year} <span className="text-slate-400 font-normal">({p.age}{p.spouseAge !== undefined ? `/${p.spouseAge}` : ''})</span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.phase === 'work' ? 'bg-emerald-100 text-emerald-700' :
                                                    p.phase === 'transition' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {p.phase}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <span>{countryOptions.find(c => c.value === p.country)?.flag}</span>
                                                    <span>{COUNTRIES[p.country]?.name || p.country}</span>
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right text-emerald-600 font-medium">
                                                {p.grossIncome > 0 ? `${symbol} ${formatIntlCompact(p.grossIncome, p.currency)}` : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right text-indigo-600 font-medium">
                                                {symbol} {formatIntlCompact(p.investmentGrowth / p.exchangeRate, p.currency)}
                                            </td>
                                            <td className="px-3 py-2 text-right text-rose-600 font-medium">
                                                {symbol} {formatIntlCompact(localTotalExpenses, p.currency)}
                                            </td>
                                            <td className={`px-3 py-2 text-right font-bold ${p.isSolvent ? 'text-slate-800' : 'text-rose-600'}`}>
                                                {symbol} {formatIntlCompact(localNetWorth, p.currency)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InternationalResultsDashboard;
