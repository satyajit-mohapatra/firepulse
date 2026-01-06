// International Financial Planning Calculator Component
import React, { useState, useMemo, useCallback } from 'react';
import {
    InternationalScenario,
    ScenarioType,
    LifePhase,
    ScenarioResults,
} from '../types/internationalPlanning';
import { FinancialData } from '../types';
import { COUNTRIES, getCountryOptions, calculateTax, getEffectiveTaxRate } from '../data/countries';
import {
    calculateInternationalScenario,
    createDefaultScenario,
    formatIntlCurrency,
    formatIntlCompact,
    calculateRelocationCosts,
    calculateLifestyleMatch,
} from '../utils/internationalCalculations';
import SliderInput from './SliderInput';
import InternationalProjectionChart from './InternationalProjectionChart';

// Scenario type options
const SCENARIO_TYPES: { id: ScenarioType; label: string; description: string; icon: string }[] = [
    {
        id: 'work-retire',
        label: 'Work → Retire Abroad',
        description: 'Work in one country, retire in another',
        icon: '🌅',
    },
    {
        id: 'work-move-retire',
        label: 'Work → Move → Retire',
        description: 'Work, relocate mid-career, then retire',
        icon: '✈️',
    },
    {
        id: 'work-move-work-retire',
        label: 'Work → Move → Work → Retire',
        description: 'Multi-phase career across countries',
        icon: '🌍',
    },
];

const countryOptions = getCountryOptions();

const COUNTRY_FLAGS: Record<string, string> = {
    US: '🇺🇸', IN: '🇮🇳', UK: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺',
    DE: '🇩🇪', SG: '🇸🇬', AE: '🇦🇪', PT: '🇵🇹', MX: '🇲🇽',
    TH: '🇹🇭', JP: '🇯🇵',
};

// Phase Editor Component
const PhaseEditor: React.FC<{
    phase: LifePhase;
    onChange: (phase: LifePhase) => void;
    onDelete?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    isFirst: boolean;
    isLast: boolean;
    onMatchLifestyle?: () => void;
}> = ({ phase, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onMatchLifestyle }) => {
    const countryData = COUNTRIES[phase.country];

    const phaseColors = {
        work: 'from-emerald-500 to-teal-600',
        transition: 'from-amber-500 to-orange-600',
        retirement: 'from-purple-500 to-pink-600',
    };

    const phaseLabels = {
        work: 'Working Phase',
        transition: 'Transition',
        retirement: 'Retirement',
    };

    return (
        <div className={`relative bg-gradient-to-br ${phaseColors[phase.type]} p-1 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}>
            <div className="bg-white rounded-xl p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className={`text-3xl`}>
                            {phase.type === 'work' ? '💼' : phase.type === 'transition' ? '✈️' : '🌴'}
                        </span>
                        <div>
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                                {phaseLabels[phase.type]}
                            </h4>
                            <p className="text-xs text-slate-500">Ages {phase.startAge} - {phase.endAge}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {onMoveUp && !isFirst && (
                            <button
                                onClick={onMoveUp}
                                className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-100"
                                title="Move up"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                        )}
                        {onMoveDown && !isLast && (
                            <button
                                onClick={onMoveDown}
                                className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-100"
                                title="Move down"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        )}
                        {!isFirst && onDelete && (
                            <button
                                onClick={onDelete}
                                className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 ml-1"
                                title="Delete phase"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Country Selection */}
                <div className="mb-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                        Country
                    </label>
                    <select
                        value={phase.country}
                        onChange={(e) => onChange({ ...phase, country: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                        {countryOptions.map(c => (
                            <option key={c.value} value={c.value}>
                                {c.flag} {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <SliderInput
                        label="Start Age"
                        value={phase.startAge}
                        onChange={(v) => onChange({ ...phase, startAge: v })}
                        min={18}
                        max={phase.endAge - 1}
                        tooltip="Age where this life phase begins"
                    />
                    <SliderInput
                        label="End Age"
                        value={phase.endAge}
                        onChange={(v) => onChange({ ...phase, endAge: v })}
                        min={phase.startAge + 1}
                        max={100}
                        tooltip="Age where this life phase ends"
                    />
                </div>

                {/* Work Phase Specific */}
                {phase.type === 'work' && (
                    <div className="space-y-3">
                        <SliderInput
                            label="Annual Income"
                            value={phase.annualIncome || 0}
                            onChange={(v) => onChange({ ...phase, annualIncome: v })}
                            min={0}
                            max={1000000}
                            step={5000}
                            prefix={countryData?.currencySymbol || '$'}
                            tooltip="Estimate pre-tax annual income from employment"
                        />
                        <SliderInput
                            label="Income Growth %"
                            value={phase.incomeGrowthRate || 3}
                            onChange={(v) => onChange({ ...phase, incomeGrowthRate: v })}
                            min={0}
                            max={15}
                            step={0.5}
                            suffix="%"
                            tooltip="Expected annual salary increase (real growth + matches inflation)"
                        />
                    </div>
                )}

                {/* Monthly Expenses */}
                <div className="mt-4">
                    <SliderInput
                        label="Monthly Expenses"
                        value={phase.monthlyExpenses}
                        onChange={(v) => onChange({ ...phase, monthlyExpenses: v })}
                        min={100}
                        max={1000000}
                        step={100}
                        prefix={countryData?.currencySymbol || '$'}
                        tooltip={`Monthly living costs including rent/food (Cost of Living Index: ${countryData?.costOfLivingIndex || 100})`}
                    />
                </div>

                {onMatchLifestyle && !isFirst && (
                    <button
                        onClick={onMatchLifestyle}
                        className="mt-2 w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 border border-indigo-100"
                    >
                        ⚖️ Match Lifestyle (PPP)
                    </button>
                )}

                {/* Country Tax Info */}
                {phase.type === 'work' && countryData && phase.annualIncome && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Effective Tax Rate:</span>
                            <span className="font-bold text-slate-700">
                                {getEffectiveTaxRate(phase.annualIncome, phase.country).toFixed(1)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-slate-500">Est. Annual Tax:</span>
                            <span className="font-bold text-rose-600">
                                {formatIntlCurrency(calculateTax(phase.annualIncome, phase.country), countryData.currency)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Timeline Visualization
const TimelineVisualization: React.FC<{
    phases: LifePhase[];
    currentAge: number;
    lifeExpectancy: number;
}> = ({ phases, currentAge, lifeExpectancy }) => {
    const maxAge = Math.max(lifeExpectancy, ...phases.map(p => p.endAge));
    const totalYears = Math.max(1, maxAge - currentAge);

    const getPhaseColor = (type: string) => {
        switch (type) {
            case 'work': return 'bg-gradient-to-r from-emerald-500 to-teal-500';
            case 'transition': return 'bg-gradient-to-r from-amber-500 to-orange-500';
            case 'retirement': return 'bg-gradient-to-r from-purple-500 to-pink-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div className="relative">
            {/* Timeline Bar */}
            <div className="h-12 bg-slate-100 rounded-full flex shadow-inner relative">
                {phases.map((phase, idx) => {
                    const duration = Math.max(0, phase.endAge - phase.startAge + 1);
                    const width = (duration / totalYears) * 100;

                    return (
                        <div
                            key={phase.id}
                            className={`${getPhaseColor(phase.type)} flex items-center justify-center relative group transition-all duration-300 hover:brightness-110 ${idx === 0 ? 'rounded-l-full' : ''
                                } ${idx === phases.length - 1 ? 'rounded-r-full' : ''}`}
                            style={{ width: `${width}%` }}
                        >
                            <span className="text-white text-[10px] font-black uppercase tracking-wider truncate px-2">
                                {COUNTRIES[phase.country]?.name || phase.country}
                            </span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                                <div className="bg-slate-900/95 text-white text-[11px] p-3 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] whitespace-nowrap border border-white/10 backdrop-blur-xl ring-1 ring-white/20">
                                    <div className="flex items-center gap-2 mb-1.5 border-b border-white/10 pb-1.5">
                                        <span className="text-base">{COUNTRY_FLAGS[phase.country] || '🌍'}</span>
                                        <div>
                                            <div className="font-black text-white uppercase tracking-wider">
                                                {COUNTRIES[phase.country]?.name || phase.country}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                {phase.type} phase • {phase.endAge - phase.startAge + 1} years
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-400">Age Span:</span>
                                            <span className="font-bold text-indigo-300">{phase.startAge} — {phase.endAge}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-400">Expenses:</span>
                                            <span className="font-bold text-rose-300">
                                                {COUNTRIES[phase.country]?.currencySymbol}{phase.monthlyExpenses.toLocaleString()}/mo
                                            </span>
                                        </div>
                                        {phase.type === 'work' && phase.annualIncome && (
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Income:</span>
                                                <span className="font-bold text-emerald-300">
                                                    {COUNTRIES[phase.country]?.currencySymbol}{phase.annualIncome.toLocaleString()}/yr
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Tooltip Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-slate-900/95" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Age Markers */}
            <div className="relative h-6 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                <span className="absolute left-0 transform -translate-x-1/2">{currentAge}</span>
                {phases.map((phase, idx) => {
                    const offset = ((phase.endAge - currentAge) / totalYears) * 100;
                    return (
                        <span
                            key={idx}
                            className="absolute transform -translate-x-1/2 hidden sm:block whitespace-nowrap"
                            style={{ left: `${offset}%` }}
                        >
                            {phase.endAge}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

// Results Dashboard
const ResultsDashboard: React.FC<{
    results: ScenarioResults;
    scenario: InternationalScenario;
    currency: string;
}> = ({ results, scenario, currency }) => {
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
                                    <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Age (Year)</th>
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
                                                {p.age} <span className="text-slate-400 font-normal">({p.year})</span>
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

// Main Component
const InternationalPlanner: React.FC<{ data: FinancialData; currency: string }> = ({ data, currency }) => {
    const [activeTab, setActiveTab] = useState<'scenario' | 'phases' | 'assets' | 'settings' | 'results'>('scenario');
    const [scenarioType, setScenarioType] = useState<ScenarioType>('work-retire');

    const tabs = [
        { id: 'scenario', label: 'Scenario', icon: '📋', description: 'Choose your journey' },
        { id: 'phases', label: 'Life Phases', icon: '🗓️', description: 'Plan your timeline' },
        { id: 'assets', label: 'Assets', icon: '💰', description: 'Current net worth' },
        { id: 'settings', label: 'Country Params', icon: '⚙️', description: 'Tax & inflation' },
        { id: 'results', label: 'Results', icon: '📊', description: 'View projections' },
    ] as const;

    const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
    const prevTab = tabs[currentTabIndex - 1];
    const nextTab = tabs[currentTabIndex + 1];

    // Initialize scenario with data from main app
    const [scenario, setScenario] = useState<InternationalScenario>(() => {
        const defaultScenario = createDefaultScenario('work-retire');
        return {
            ...defaultScenario,
            currentAge: data.currentAge,
            lifeExpectancy: data.liveUntilAge,
            liquidAssets: [{
                country: 'US', // Defaulting to US for now, could be dynamic
                currency: 'USD',
                currentValue: data.currentNetWorth,
                valueInUSD: data.currentNetWorth,
                assetType: 'mixed',
                expectedReturn: data.liquidAssetReturn,
                taxEfficient: false,
            }],
            retirementAccounts: [{
                country: 'US',
                accountType: '401k',
                currentBalance: data.retirementAssets,
                valueInUSD: data.retirementAssets,
                vestingPercentage: 100,
                portableToCountries: ['US'],
                earlyWithdrawalPenalty: 10,
                withdrawalAge: 59.5,
                expectedReturn: data.retirementAssetReturn,
            }],
            // Update first phase with current age and income
            phases: defaultScenario.phases.map((phase, index) => {
                if (index === 0) {
                    return {
                        ...phase,
                        startAge: data.currentAge,
                        annualIncome: data.monthlyIncome * 12,
                        monthlyExpenses: data.monthlyExpenses,
                    };
                }
                return phase;
            })
        };
    });

    // Recalculate when scenario changes
    const results = useMemo(() => calculateInternationalScenario(scenario), [scenario]);

    // Handle scenario type change
    const handleScenarioTypeChange = useCallback((type: ScenarioType) => {
        setScenarioType(type);
        setScenario(prev => {
            const newDefault = createDefaultScenario(type);
            return {
                ...newDefault,
                currentAge: data.currentAge,
                lifeExpectancy: data.liveUntilAge,
                liquidAssets: prev.liquidAssets, // Preserve asset edits
                retirementAccounts: prev.retirementAccounts, // Preserve retirement account edits
                realEstateAssets: prev.realEstateAssets,
                countryConfigs: prev.countryConfigs,
                phases: newDefault.phases.map((phase, index) => {
                    if (index === 0) {
                        return {
                            ...phase,
                            startAge: data.currentAge,
                            annualIncome: data.monthlyIncome * 12,
                            monthlyExpenses: data.monthlyExpenses,
                        };
                    }
                    return phase;
                })
            };
        });
    }, [data]);

    // Update a specific phase
    const updatePhase = useCallback((index: number, updatedPhase: LifePhase) => {
        setScenario(prev => {
            const newPhases = [...prev.phases];
            newPhases[index] = updatedPhase;

            // Ensure continuity for subsequent phases
            for (let i = index + 1; i < newPhases.length; i++) {
                const prevPhase = newPhases[i - 1];
                if (newPhases[i].startAge !== prevPhase.endAge + 1) {
                    const duration = newPhases[i].endAge - newPhases[i].startAge;
                    newPhases[i] = {
                        ...newPhases[i],
                        startAge: prevPhase.endAge + 1,
                        endAge: prevPhase.endAge + 1 + Math.max(0, duration)
                    };
                }
            }

            // Ensure continuity for previous phases if start age changed
            if (index > 0 && updatedPhase.startAge !== prev.phases[index - 1].endAge + 1) {
                newPhases[index - 1] = {
                    ...newPhases[index - 1],
                    endAge: updatedPhase.startAge - 1
                };
            }

            return {
                ...prev,
                phases: newPhases,
            };
        });
    }, []);

    // Move a phase
    const movePhase = useCallback((index: number, direction: 'up' | 'down') => {
        setScenario(prev => {
            const newPhases = [...prev.phases];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= newPhases.length) return prev;

            // Swap phases
            const temp = newPhases[index];
            newPhases[index] = newPhases[targetIndex];
            newPhases[targetIndex] = temp;

            // Re-calculate ages for continuity
            let currentStartAge = prev.currentAge;
            const updatedPhases = newPhases.map((phase) => {
                const duration = Math.max(0, phase.endAge - phase.startAge);
                const updated = {
                    ...phase,
                    startAge: currentStartAge,
                    endAge: currentStartAge + duration
                };
                currentStartAge = updated.endAge + 1;
                return updated;
            });

            return {
                ...prev,
                phases: updatedPhases,
            };
        });
    }, []);

    // Delete a phase
    const deletePhase = useCallback((index: number) => {
        setScenario(prev => {
            const filteredPhases = prev.phases.filter((_, i) => i !== index);

            // Recalculate continuity after deletion
            let currentStartAge = prev.currentAge;
            const updatedPhases = filteredPhases.map((phase) => {
                const duration = Math.max(0, phase.endAge - phase.startAge);
                const updated = {
                    ...phase,
                    startAge: currentStartAge,
                    endAge: currentStartAge + duration
                };
                currentStartAge = updated.endAge + 1;
                return updated;
            });

            return {
                ...prev,
                phases: updatedPhases,
            };
        });
    }, []);

    // Add a new phase
    const addPhase = useCallback((type: 'work' | 'transition' | 'retirement') => {
        setScenario(prev => {
            const lastPhase = prev.phases[prev.phases.length - 1];
            const startAge = (lastPhase?.endAge || prev.currentAge) + 1;
            const duration = type === 'transition' ? 1 : 10;

            const newPhase: LifePhase = {
                id: `phase-${Date.now()}`,
                type,
                country: lastPhase?.country || 'US',
                startAge,
                endAge: startAge + duration,
                monthlyExpenses: lastPhase?.monthlyExpenses || 4000,
                ...(type === 'work' ? { annualIncome: 100000, incomeGrowthRate: 3 } : {}),
            };

            return {
                ...prev,
                phases: [...prev.phases, newPhase],
            };
        });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
            {/* Wizard Progress */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto py-8 px-4">
                    <div className="relative flex items-center justify-between">
                        {/* Progress Line */}
                        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-100" />
                        <div
                            className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-indigo-600 transition-all duration-500 ease-in-out"
                            style={{ width: `${(currentTabIndex / (tabs.length - 1)) * 100}%` }}
                        />

                        {/* Steps */}
                        {tabs.map((tab, idx) => {
                            const isCompleted = currentTabIndex > idx;
                            const isActive = activeTab === tab.id;

                            return (
                                <div key={tab.id} className="relative z-10 flex flex-col items-center">
                                    <button
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive
                                            ? 'border-indigo-600 bg-white text-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                                            : isCompleted
                                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                                : 'border-slate-200 bg-white text-slate-400'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span className="text-sm font-bold">{idx + 1}</span>
                                        )}
                                    </button>
                                    <div className="absolute top-12 flex flex-col items-center text-center">
                                        <span className={`text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                                            {tab.label}
                                        </span>
                                        <span className="hidden text-[9px] text-slate-400 sm:block font-bold uppercase tracking-tight">
                                            {tab.description}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
                {/* Timeline Preview */}
                <div className="mt-6 mb-10 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm relative z-40">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-8">
                        Lifetime Timeline
                    </h3>
                    <TimelineVisualization
                        phases={scenario.phases}
                        currentAge={scenario.currentAge}
                        lifeExpectancy={scenario.lifeExpectancy}
                    />
                </div>

                {activeTab === 'scenario' && (
                    <div className="space-y-6">
                        {/* Scenario Type Selection */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                                Choose Your Journey
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {SCENARIO_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleScenarioTypeChange(type.id)}
                                        className={`p-4 sm:p-6 rounded-xl border-2 text-left transition-all ${scenarioType === type.id
                                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                                            : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="text-3xl mb-2 block">{type.icon}</span>
                                        <h4 className="font-bold text-slate-800 text-sm">{type.label}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{type.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Basic Settings */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                                Basic Settings
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SliderInput
                                    label="Current Age"
                                    value={scenario.currentAge}
                                    onChange={(v) => setScenario(prev => ({ ...prev, currentAge: v }))}
                                    min={18}
                                    max={70}
                                />
                                <SliderInput
                                    label="Life Expectancy"
                                    value={scenario.lifeExpectancy}
                                    onChange={(v) => setScenario(prev => ({ ...prev, lifeExpectancy: v }))}
                                    min={70}
                                    max={110}
                                />
                                <SliderInput
                                    label="Exchange Rate Volatility"
                                    value={scenario.exchangeRateVolatility}
                                    onChange={(v) => setScenario(prev => ({ ...prev, exchangeRateVolatility: v }))}
                                    min={0}
                                    max={30}
                                    suffix="%"
                                    tooltip="Expected currency fluctuation risk"
                                />
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        Inflation Scenario
                                    </label>
                                    <select
                                        value={scenario.inflationScenario}
                                        onChange={(e) => setScenario(prev => ({
                                            ...prev,
                                            inflationScenario: e.target.value as 'low' | 'moderate' | 'high'
                                        }))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                                    >
                                        <option value="low">Low (2-3%)</option>
                                        <option value="moderate">Moderate (4-6%)</option>
                                        <option value="high">High (7-10%)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Phases Tab */}
                {activeTab === 'phases' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {scenario.phases.map((phase, idx) => (
                                <PhaseEditor
                                    key={phase.id}
                                    phase={phase}
                                    onChange={(p) => updatePhase(idx, p)}
                                    onDelete={() => deletePhase(idx)}
                                    onMoveUp={() => movePhase(idx, 'up')}
                                    onMoveDown={() => movePhase(idx, 'down')}
                                    isFirst={idx === 0}
                                    isLast={idx === scenario.phases.length - 1}
                                    onMatchLifestyle={idx > 0 ? () => {
                                        const basePhase = scenario.phases[0];
                                        const matched = calculateLifestyleMatch(
                                            basePhase.monthlyExpenses,
                                            basePhase.country,
                                            phase.country
                                        );
                                        updatePhase(idx, { ...phase, monthlyExpenses: Math.round(matched) });
                                    } : undefined}
                                />
                            ))}
                        </div>

                        {/* Add Phase Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => addPhase('work')}
                                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors"
                            >
                                + Add Work Phase
                            </button>
                            <button
                                onClick={() => addPhase('transition')}
                                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors"
                            >
                                + Add Transition
                            </button>
                            <button
                                onClick={() => addPhase('retirement')}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors"
                            >
                                + Add Retirement
                            </button>
                        </div>
                    </div>
                )}

                {/* Assets Tab */}
                {activeTab === 'assets' && (
                    <div className="space-y-6">
                        {/* Liquid Assets */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="text-2xl opacity-20">💵</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                Liquid Assets
                            </h3>
                            {scenario.liquidAssets.map((asset, idx) => {
                                const countryData = COUNTRIES[asset.country];
                                return (
                                    <div key={idx} className="bg-slate-50/50 p-4 rounded-xl mb-4 border border-slate-100">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Country</label>
                                                <select
                                                    value={asset.country}
                                                    onChange={(e) => {
                                                        const newAssets = [...scenario.liquidAssets];
                                                        newAssets[idx] = { ...asset, country: e.target.value };
                                                        setScenario(prev => ({ ...prev, liquidAssets: newAssets }));
                                                    }}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                >
                                                    {countryOptions.map(c => (
                                                        <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <SliderInput
                                                    label={`Value (${countryData?.currency || 'USD'})`}
                                                    value={asset.currentValue}
                                                    onChange={(v) => {
                                                        const newAssets = [...scenario.liquidAssets];
                                                        newAssets[idx] = {
                                                            ...asset,
                                                            currentValue: v,
                                                            valueInUSD: v * (countryData?.exchangeRateToUSD || 1)
                                                        };
                                                        setScenario(prev => ({ ...prev, liquidAssets: newAssets }));
                                                    }}
                                                    min={0}
                                                    max={100000000 / (countryData?.exchangeRateToUSD || 1)}
                                                    step={10000}
                                                    prefix={countryData?.currencySymbol || '$'}
                                                    tooltip={`Value in USD: ${formatIntlCurrency(asset.valueInUSD, 'USD')}`}
                                                />
                                            </div>
                                            <div>
                                                <SliderInput
                                                    label="Expected Return"
                                                    value={asset.expectedReturn}
                                                    onChange={(v) => {
                                                        const newAssets = [...scenario.liquidAssets];
                                                        newAssets[idx] = { ...asset, expectedReturn: v };
                                                        setScenario(prev => ({ ...prev, liquidAssets: newAssets }));
                                                    }}
                                                    min={1}
                                                    max={20}
                                                    step={0.5}
                                                    suffix="%"
                                                    tooltip="Expected annual return rate for this asset"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={() => setScenario(prev => ({
                                                        ...prev,
                                                        liquidAssets: prev.liquidAssets.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="w-full py-2 text-rose-500 text-xs font-bold uppercase hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => setScenario(prev => ({
                                    ...prev,
                                    liquidAssets: [...prev.liquidAssets, {
                                        country: 'US',
                                        currency: 'USD',
                                        currentValue: 0,
                                        valueInUSD: 0,
                                        assetType: 'mixed',
                                        expectedReturn: 8,
                                        taxEfficient: false,
                                    }],
                                }))}
                                className="w-full py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-100 hover:border-slate-300 transition-all"
                            >
                                + Add Liquid Asset
                            </button>
                        </div>

                        {/* Retirement Accounts */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="text-2xl opacity-20">🏦</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                Retirement Accounts
                            </h3>
                            {scenario.retirementAccounts.map((account, idx) => {
                                const countryData = COUNTRIES[account.country];
                                return (
                                    <div key={idx} className="bg-slate-50/50 p-4 rounded-xl mb-4 border border-slate-100">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Country</label>
                                                <select
                                                    value={account.country}
                                                    onChange={(e) => {
                                                        const newAccounts = [...scenario.retirementAccounts];
                                                        newAccounts[idx] = { ...account, country: e.target.value };
                                                        setScenario(prev => ({ ...prev, retirementAccounts: newAccounts }));
                                                    }}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                >
                                                    {countryOptions.map(c => (
                                                        <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Type</label>
                                                <select
                                                    value={account.accountType}
                                                    onChange={(e) => {
                                                        const newAccounts = [...scenario.retirementAccounts];
                                                        newAccounts[idx] = { ...account, accountType: e.target.value };
                                                        setScenario(prev => ({ ...prev, retirementAccounts: newAccounts }));
                                                    }}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                >
                                                    <option value="401k">401k / Pension</option>
                                                    <option value="ira">IRA / Individual</option>
                                                    <option value="roth">Roth / Tax-Free</option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-1">
                                                <SliderInput
                                                    label={`Balance (${countryData?.currency || 'USD'})`}
                                                    value={account.currentBalance}
                                                    onChange={(v) => {
                                                        const newAccounts = [...scenario.retirementAccounts];
                                                        newAccounts[idx] = {
                                                            ...account,
                                                            currentBalance: v,
                                                            valueInUSD: v * (countryData?.exchangeRateToUSD || 1)
                                                        };
                                                        setScenario(prev => ({ ...prev, retirementAccounts: newAccounts }));
                                                    }}
                                                    min={0}
                                                    max={50000000 / (countryData?.exchangeRateToUSD || 1)}
                                                    step={5000}
                                                    prefix={countryData?.currencySymbol || '$'}
                                                    tooltip={`Value in USD: ${formatIntlCurrency(account.valueInUSD, 'USD')}`}
                                                />
                                            </div>
                                            <div>
                                                <SliderInput
                                                    label="Withdrawal Age"
                                                    value={account.withdrawalAge}
                                                    onChange={(v) => {
                                                        const newAccounts = [...scenario.retirementAccounts];
                                                        newAccounts[idx] = { ...account, withdrawalAge: v };
                                                        setScenario(prev => ({ ...prev, retirementAccounts: newAccounts }));
                                                    }}
                                                    min={45}
                                                    max={75}
                                                    tooltip="Age when you plan to start withdrawing from this account"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={() => setScenario(prev => ({
                                                        ...prev,
                                                        retirementAccounts: prev.retirementAccounts.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="w-full py-2 text-rose-500 text-xs font-bold uppercase hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => setScenario(prev => ({
                                    ...prev,
                                    retirementAccounts: [...prev.retirementAccounts, {
                                        country: 'US',
                                        accountType: '401k',
                                        currentBalance: 0,
                                        valueInUSD: 0,
                                        vestingPercentage: 100,
                                        portableToCountries: ['US'],
                                        earlyWithdrawalPenalty: 10,
                                        withdrawalAge: 59.5,
                                        expectedReturn: 7,
                                    }],
                                }))}
                                className="w-full py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-100 hover:border-slate-300 transition-all"
                            >
                                + Add Retirement Account
                            </button>
                        </div>

                        {/* Real Estate / Non-Liquid */}
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="text-2xl opacity-20">🏠</span>
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                                Real Estate / Non-Liquid
                            </h3>
                            {scenario.realEstateAssets.map((asset, idx) => {
                                const countryData = COUNTRIES[asset.country];
                                return (
                                    <div key={idx} className="bg-slate-50/50 p-4 rounded-xl mb-4 border border-slate-100">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Country</label>
                                                <select
                                                    value={asset.country}
                                                    onChange={(e) => {
                                                        const newAssets = [...scenario.realEstateAssets];
                                                        newAssets[idx] = { ...asset, country: e.target.value };
                                                        setScenario(prev => ({ ...prev, realEstateAssets: newAssets }));
                                                    }}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                >
                                                    {countryOptions.map(c => (
                                                        <option key={c.value} value={c.value}>{c.flag} {c.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <SliderInput
                                                    label={`Property Value (${countryData?.currency || 'USD'})`}
                                                    value={asset.currentValue}
                                                    onChange={(v) => {
                                                        const newAssets = [...scenario.realEstateAssets];
                                                        newAssets[idx] = {
                                                            ...asset,
                                                            currentValue: v,
                                                            valueInUSD: v * (countryData?.exchangeRateToUSD || 1)
                                                        };
                                                        setScenario(prev => ({ ...prev, realEstateAssets: newAssets }));
                                                    }}
                                                    min={0}
                                                    max={50000000 / (countryData?.exchangeRateToUSD || 1)}
                                                    step={50000}
                                                    prefix={countryData?.currencySymbol || '$'}
                                                />
                                            </div>
                                            <div>
                                                <SliderInput
                                                    label="Appreciation Rate"
                                                    value={asset.appreciationRate}
                                                    onChange={(v) => {
                                                        const newAssets = [...scenario.realEstateAssets];
                                                        newAssets[idx] = { ...asset, appreciationRate: v };
                                                        setScenario(prev => ({ ...prev, realEstateAssets: newAssets }));
                                                    }}
                                                    min={0}
                                                    max={15}
                                                    step={0.5}
                                                    suffix="%"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={() => setScenario(prev => ({
                                                        ...prev,
                                                        realEstateAssets: prev.realEstateAssets.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="w-full py-2 text-rose-500 text-xs font-bold uppercase hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => setScenario(prev => ({
                                    ...prev,
                                    realEstateAssets: [...prev.realEstateAssets, {
                                        country: 'US',
                                        propertyType: 'investment',
                                        currentValue: 0,
                                        valueInUSD: 0,
                                        mortgageBalance: 0,
                                        appreciationRate: 4,
                                    }],
                                }))}
                                className="w-full py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-100 hover:border-slate-300 transition-all"
                            >
                                + Add Property
                            </button>
                        </div>
                    </div>
                )}

                {/* Country Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6">
                                Country-Specific Financial Parameters
                            </h3>
                            <p className="text-xs text-slate-500 mb-6 font-medium">
                                Configure expected inflation and return rates for each country involved in your scenario.
                            </p>

                            <div className="space-y-8">
                                {Array.from(new Set([
                                    ...scenario.phases.map(p => p.country),
                                    ...scenario.liquidAssets.map(a => a.country),
                                    ...scenario.retirementAccounts.map(a => a.country),
                                    ...scenario.realEstateAssets.map(a => a.country)
                                ])).map(countryCode => {
                                    const countryData = COUNTRIES[countryCode];
                                    if (!countryData) return null;

                                    const config = scenario.countryConfigs[countryCode] || {
                                        inflationRate: countryData.averageInflation,
                                        expectedReturnLiquid: 8,
                                        expectedReturnRetirement: 7,
                                        expectedReturnRealEstate: 4
                                    };

                                    const updateConfig = (key: keyof typeof config, value: number) => {
                                        setScenario(prev => ({
                                            ...prev,
                                            countryConfigs: {
                                                ...prev.countryConfigs,
                                                [countryCode]: { ...config, [key]: value }
                                            }
                                        }));
                                    };

                                    return (
                                        <div key={countryCode} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="text-2xl">{countryOptions.find(o => o.value === countryCode)?.flag}</span>
                                                <h4 className="font-black text-slate-800 uppercase tracking-wider">{countryData.name}</h4>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <SliderInput
                                                    label="Annual Inflation"
                                                    value={config.inflationRate}
                                                    onChange={(v) => updateConfig('inflationRate', v)}
                                                    min={0} max={20} step={0.1} suffix="%"
                                                    tooltip="Local currency degradation rate"
                                                />
                                                <SliderInput
                                                    label="Liquid Return"
                                                    value={config.expectedReturnLiquid}
                                                    onChange={(v) => updateConfig('expectedReturnLiquid', v)}
                                                    min={1} max={20} step={0.5} suffix="%"
                                                    tooltip="Expected return on liquid investments (stocks/bonds) in this country"
                                                />
                                                <SliderInput
                                                    label="Retire Return"
                                                    value={config.expectedReturnRetirement}
                                                    onChange={(v) => updateConfig('expectedReturnRetirement', v)}
                                                    min={1} max={20} step={0.5} suffix="%"
                                                    tooltip="Expected return on retirement accounts in this country"
                                                />
                                                <SliderInput
                                                    label="RE Growth"
                                                    value={config.expectedReturnRealEstate}
                                                    onChange={(v) => updateConfig('expectedReturnRealEstate', v)}
                                                    min={0} max={15} step={0.5} suffix="%"
                                                    tooltip="Expected capital appreciation of real estate in this country"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <ResultsDashboard results={results} scenario={scenario} currency={currency} />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                    <button
                        onClick={() => prevTab && setActiveTab(prevTab.id)}
                        disabled={!prevTab}
                        className={`px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${prevTab
                            ? 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm border border-slate-200 cursor-pointer'
                            : 'opacity-0 pointer-events-none'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Back to</span> {prevTab?.label}
                    </button>

                    <button
                        onClick={() => nextTab && setActiveTab(nextTab.id)}
                        disabled={!nextTab}
                        className={`px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${nextTab
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
                            : 'opacity-0 pointer-events-none'
                            }`}
                    >
                        <span className="hidden sm:inline">Continue to</span> {nextTab?.label}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InternationalPlanner;
