import React, { useState } from 'react';
import { FinancialData, CalculationResults, CurrencyCode } from '../../types';
import { formatCurrencyCompact } from '../../utils/finance';
import { formatIntlCompact } from '../../utils/internationalCalculations';
import ModernSliderInput from '../ModernSliderInput';
import ProjectionChart from '../ProjectionChart';
import InternationalProjectionChart from '../InternationalProjectionChart';
import FIREProgressRing from '../FIREProgressRing';
import { ScenarioResults, InternationalScenario } from '../../types/internationalPlanning';
import { COUNTRIES, getCountryOptions } from '../../data/countries';

const countryOptions = getCountryOptions();

interface Phase2ResultsProps {
    data: FinancialData;
    results: CalculationResults;
    currency: CurrencyCode;
    currencySymbol: string;
    updateData: (key: keyof FinancialData, value: any) => void;
    currentAllocation: any;
    savingsRate: number;
    uiMode: 'basic' | 'advanced';
    internationalResults: ScenarioResults;
    internationalScenario: InternationalScenario;
}

const Phase2Results: React.FC<Phase2ResultsProps> = ({
    data,
    results,
    currency,
    currencySymbol,
    updateData,
    currentAllocation,
    savingsRate,
    uiMode,
    internationalResults,
    internationalScenario,
}) => {
    const [showLedger, setShowLedger] = useState(false);

    const strategies: { id: FinancialData['simulationMode']; label: string }[] = [
        { id: 'leaner', label: 'Lean' },
        { id: 'conservative', label: 'Safe' },
        { id: 'aggressive', label: 'Growth' },
        { id: 'crash', label: 'Crash' },
    ];

    // Helpers for risk analysis badges
    const getRiskBadge = (risk: string) => {
        const colors = {
            low: 'bg-emerald-100 text-emerald-700',
            moderate: 'bg-amber-100 text-amber-700',
            high: 'bg-rose-100 text-rose-700',
        };
        return colors[risk as keyof typeof colors] || colors.moderate;
    };

    // Check if we have valid advanced results
    const hasAdvancedData = uiMode === 'advanced' && internationalResults && internationalResults.projections?.length > 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
            {/* ========== SECTION 1: Core Metrics from Simple Mode ========== */}

            {/* Hero Section: Key Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Progress Ring */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-center">
                    <FIREProgressRing
                        currentNetWorth={currentAllocation.totalAssets}
                        fiNumber={hasAdvancedData ? (internationalResults.projections[0]?.totalNetWorthUSD || results.fiNumber) : results.fiNumber}
                        fiAge={hasAdvancedData ? internationalResults.fiAge : results.fiAge}
                        currentAge={data.currentAge}
                        currency={currency}
                        size="lg"
                        showDetails={true}
                    />
                </div>

                {/* Key Stats Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* FIRE Age */}
                    <div className="bg-indigo-600 text-white rounded-xl p-4 shadow-lg">
                        <p className="text-xs font-medium text-indigo-200 uppercase tracking-wide">FIRE Age</p>
                        <p className="text-3xl font-bold mt-1">
                            {hasAdvancedData ? (internationalResults.fiAge || '—') : (results.fiAge || '—')}
                        </p>
                        <p className="text-sm text-indigo-200 mt-1">
                            {hasAdvancedData
                                ? (internationalResults.retirementYear ? `Year ${internationalResults.retirementYear}` : 'Calculate')
                                : (results.timeToFI ? `${results.timeToFI} years` : 'Calculate')
                            }
                        </p>
                    </div>

                    {/* Solvency Status / Success Probability */}
                    {hasAdvancedData ? (
                        <div className={`rounded-xl p-4 shadow-lg ${internationalResults.successProbability >= 80 ? 'bg-emerald-600' : internationalResults.successProbability >= 60 ? 'bg-amber-500' : 'bg-rose-600'} text-white`}>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-wide">Success Rate</p>
                            <p className="text-3xl font-bold mt-1">{internationalResults.successProbability.toFixed(0)}%</p>
                            <p className="text-sm opacity-80 mt-1">Portfolio solvency</p>
                        </div>
                    ) : (
                        <div className={`rounded-xl p-4 shadow-lg ${results.isSolventAtEnd ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-wide">Plan Until {data.liveUntilAge}</p>
                            <p className="text-3xl font-bold mt-1">{results.isSolventAtEnd ? '✓' : '⚠'}</p>
                            <p className="text-sm opacity-80 mt-1">
                                {results.isSolventAtEnd ? 'Solvent' : 'At Risk'}
                            </p>
                        </div>
                    )}

                    {/* Savings Rate */}
                    <div className="bg-amber-500 text-white rounded-xl p-4 shadow-lg">
                        <p className="text-xs font-medium text-amber-100 uppercase tracking-wide">Savings Rate</p>
                        <p className="text-3xl font-bold mt-1">{savingsRate.toFixed(0)}%</p>
                        <p className="text-sm text-amber-100 mt-1">
                            {formatCurrencyCompact(data.monthlySavings, currency)}/mo
                        </p>
                    </div>
                </div>
            </div>

            {/* ========== SECTION 2: Projection Chart ========== */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                {/* Strategy Selector - available for both basic and advanced modes */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <h3 className="font-bold text-slate-800">Net Worth Projection</h3>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                        {strategies.map((strat) => (
                            <button
                                key={strat.id}
                                onClick={() => updateData('simulationMode', strat.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${data.simulationMode === strat.id
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {strat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart - Use International chart for advanced, regular for basic */}
                <div className="w-full">
                    {hasAdvancedData ? (
                        <InternationalProjectionChart
                            projections={internationalResults.projections}
                            fiAge={internationalResults.fiAge}
                            currency={currency}
                        />
                    ) : (
                        <ProjectionChart data={results.projections} fiAge={results.fiAge} currency={currency} />
                    )}
                </div>

                {/* Milestones - only for basic mode */}
                {!hasAdvancedData && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                        {results.milestones.slice(0, 4).map((m, idx) => (
                            <div key={idx} className={`p-4 sm:p-5 rounded-2xl border-2 transition-all hover:shadow-md ${m.reached ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${m.reached ? 'text-emerald-600' : 'text-slate-400'}`}>{m.name}</p>
                                <p className="text-xl font-black text-slate-800 mt-2">{formatCurrencyCompact(m.target, currency)}</p>
                                {m.age && <p className="text-xs font-bold text-slate-500 mt-1">Reached at Age {m.age}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ========== SECTION 3: Asset Allocation & Goals from Simple Mode ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Assets Summary */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Asset Allocation</h3>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs text-slate-500">Total Assets</p>
                            <p className="text-lg font-bold text-slate-800">{formatCurrencyCompact(currentAllocation.totalAssets, currency)}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3">
                            <p className="text-xs text-emerald-600">Liquid</p>
                            <p className="text-lg font-bold text-emerald-700">{formatCurrencyCompact(data.currentNetWorth, currency)}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-blue-600">Retirement</p>
                            <p className="text-lg font-bold text-blue-700">{formatCurrencyCompact(data.retirementAssets, currency)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3">
                            <p className="text-xs text-amber-600">Real Estate</p>
                            <p className="text-lg font-bold text-amber-700">{formatCurrencyCompact(data.nonLiquidAssets, currency)}</p>
                        </div>
                    </div>

                    {/* Return Sliders */}
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Expected Returns</p>
                    <div className="space-y-3">
                        <ModernSliderInput label="Liquid Return" value={data.liquidAssetReturn} onChange={(v) => updateData('liquidAssetReturn', v)} min={1} max={20} step={0.5} suffix="%" icon="💵" />
                        <ModernSliderInput label="Retirement Return" value={data.retirementAssetReturn} onChange={(v) => updateData('retirementAssetReturn', v)} min={1} max={20} step={0.5} suffix="%" icon="🏦" />
                        <ModernSliderInput label="Real Estate Return" value={data.nonLiquidAssetReturn} onChange={(v) => updateData('nonLiquidAssetReturn', v)} min={1} max={15} step={0.5} suffix="%" icon="🏢" />
                    </div>
                </div>

                {/* Goals */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Milestones</h3>
                    <div className="space-y-3 max-h-[360px] overflow-y-auto">
                        {data.goals.map(goal => (
                            <div key={goal.id} className="bg-slate-50 rounded-xl p-4 relative group">
                                <button
                                    onClick={() => updateData('goals', data.goals.filter(g => g.id !== goal.id))}
                                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <p className="font-semibold text-slate-800 text-sm">{goal.name}</p>
                                <ModernSliderInput
                                    label="Target Age"
                                    value={goal.targetAge}
                                    onChange={(v) => updateData('goals', data.goals.map(g => g.id === goal.id ? { ...g, targetAge: v } : g))}
                                    min={data.currentAge}
                                    max={data.liveUntilAge}
                                    icon="🎯"
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => updateData('goals', [...data.goals, { id: Math.random().toString(), name: 'New Milestone', targetAge: data.currentAge + 5, targetAmount: 20000, category: 'Other' }])}
                            className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                        >
                            + Add Milestone
                        </button>
                    </div>
                </div>
            </div>

            {/* ========== SECTION 4: Risk Analysis from Advanced Mode ========== */}
            {hasAdvancedData && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Risk Analysis</h3>
                    <div className="flex flex-wrap gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getRiskBadge(internationalResults.exchangeRateRisk)}`}>
                            💱 FX Risk: {internationalResults.exchangeRateRisk}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getRiskBadge(internationalResults.inflationRisk)}`}>
                            📈 Inflation: {internationalResults.inflationRisk}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${internationalResults.taxEfficiency > 60 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            📊 Tax Optimized: {internationalResults.taxEfficiency > 60 ? 'Yes' : 'Needs Work'}
                        </span>
                    </div>
                </div>
            )}

            {/* ========== SECTION 5: Warnings from Advanced Mode ========== */}
            {hasAdvancedData && internationalResults.warnings.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                    <h3 className="text-sm font-black text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                        ⚠️ Warnings
                    </h3>
                    <ul className="space-y-1">
                        {internationalResults.warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm text-rose-700">{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ========== SECTION 6: Recommendations from Advanced Mode ========== */}
            {hasAdvancedData && internationalResults.recommendations.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                        💡 Recommendations
                    </h3>
                    <div className="space-y-3">
                        {internationalResults.recommendations.map((rec, idx) => (
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
                                            Save {formatCurrencyCompact(rec.potentialSaving, currency)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ========== SECTION 7: Year-by-Year Projections Table ========== */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                    onClick={() => setShowLedger(!showLedger)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-lg">📊</span>
                        <h3 className="font-bold text-slate-800">Year-by-Year Projections</h3>
                    </div>
                    <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${showLedger ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showLedger && (
                    <div className="border-t border-slate-100 overflow-x-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Use Advanced projections table if available, otherwise use basic */}
                        {hasAdvancedData ? (
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Year (Age/Spouse)</th>
                                        <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Phase</th>
                                        <th className="px-3 py-3 text-left font-black uppercase text-slate-500 tracking-wider">Country/Location</th>
                                        <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Income (You/Spouse)</th>
                                        <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Growth (Local)</th>
                                        <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Exp (Local)</th>
                                        <th className="px-3 py-3 text-right font-black uppercase text-slate-500 tracking-wider">Portfolio (Local)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {internationalResults.projections.map((p, idx) => {
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
                                                <td className="px-3 py-2 text-right text-emerald-600 font-medium whitespace-nowrap">
                                                    {p.grossIncome > 0 ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[10px] text-slate-400 font-normal">Total: {symbol} {formatIntlCompact(p.grossIncome, p.currency)}</span>
                                                            <span>
                                                                {symbol} {formatIntlCompact(p.primaryIncome || 0, p.currency)}
                                                                <span className="mx-1 text-slate-300">/</span>
                                                                {p.spouseAge !== undefined ? `${symbol} ${formatIntlCompact(p.spouseIncome || 0, p.currency)}` : '—'}
                                                            </span>
                                                        </div>
                                                    ) : '—'}
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
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Year (Age/Spouse)</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Phase</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Income (You/Spouse)</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Growth</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Expenses</th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-600">Net Worth</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {results.projections.map((p, idx) => (
                                        <tr key={idx} className={`hover:bg-slate-50 ${p.isRetired ? 'bg-indigo-50/30' : ''}`}>
                                            <td className="px-4 py-2.5 font-medium text-slate-800">
                                                {p.year} <span className="text-slate-400 ml-1 text-xs">({p.age}{p.spouseAge !== undefined ? `/${p.spouseAge}` : ''})</span>
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${!p.isRetired ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                    {!p.isRetired ? 'Working' : 'Retired'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-emerald-600 font-medium whitespace-nowrap">
                                                {p.income > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-slate-400 font-normal">Total: {formatCurrencyCompact(p.income, currency)}</span>
                                                        <span className="text-sm">
                                                            {formatCurrencyCompact(p.primaryIncome || 0, currency)}
                                                            <span className="mx-1 text-slate-300">/</span>
                                                            {p.spouseAge !== undefined ? formatCurrencyCompact(p.spouseIncome || 0, currency) : '—'}
                                                        </span>
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-indigo-600 font-medium">
                                                {p.returns !== 0 ? formatCurrencyCompact(p.returns, currency) : '—'}
                                            </td>
                                            <td className="px-4 py-2.5 text-right text-rose-500 font-medium">
                                                {formatCurrencyCompact(p.totalOutflow, currency)}
                                            </td>
                                            <td className={`px-4 py-2.5 text-right font-bold ${p.netWorth > 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                                                {formatCurrencyCompact(p.netWorth, currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Phase2Results;
