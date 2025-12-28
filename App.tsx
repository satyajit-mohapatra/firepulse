
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialData, CalculationResults, CurrencyCode, Milestone, InvestmentGoal } from './types';
import { calculateFIRE, formatCurrency, formatCurrencyCompact, getCurrencySymbol, formatCompactNumber, getAgeBasedAllocation } from './utils/finance';
import SliderInput from './components/SliderInput';
import ProjectionChart from './components/ProjectionChart';

const currencies: { code: CurrencyCode; name: string }[] = [
  { code: 'USD', name: 'USD ($)' },
  { code: 'EUR', name: 'EUR (€)' },
  { code: 'GBP', name: 'GBP (£)' },
  { code: 'JPY', name: 'JPY (¥)' },
  { code: 'CAD', name: 'CAD (C$)' },
  { code: 'AUD', name: 'AUD (A$)' },
  { code: 'INR', name: 'INR (₹)' },
  { code: 'BRL', name: 'BRL (R$)' },
];

const App: React.FC = () => {
  const [data, setData] = useState<FinancialData>({
    currentAge: 44,
    retirementAge: 55,
    liveUntilAge: 90,
    currentNetWorth: 100000,
    nonLiquidAssets: 200000,
    monthlyIncome: 6000,
    monthlySavings: 2400,
    annualBonus: 0,
    incomeIncreaseRate: 5,
    expenseIncreaseRate: 3,
    retirementExpenseMultiplier: 85,
    monthlyExpenses: 3100,
    monthlyMedical: 500,
    medicalInflation: 15,
    annualExpenses: 60000,
    swpAmount: 5000,
    retirementTaxRate: 24,
    liquidAssetReturn: 12,
    nonLiquidAssetReturn: 6,
    inflationRate: 8,
    withdrawalRate: 4,
    futureIncome: 0,
    futureIncomeStartAge: 65,
    simulationMode: 'leaner',
    withdrawalStrategy: 'fixed',
    goals: []
  });

  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [showLedger, setShowLedger] = useState(false);
  const [showLongevityTable, setShowLongevityTable] = useState(false);
  const [activeTab, setActiveTab] = useState<'inputs' | 'results'>('inputs');

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const results = useMemo(() => calculateFIRE(data), [data]);

  // Calculate current asset allocation
  const currentAllocation = useMemo(() => {
    const allocation = getAgeBasedAllocation(data.currentAge, data.retirementAge);
    const totalAssets = data.currentNetWorth + data.nonLiquidAssets;
    const liquidPercentage = totalAssets > 0 ? (data.currentNetWorth / totalAssets) * 100 : 0;
    const nonLiquidPercentage = totalAssets > 0 ? (data.nonLiquidAssets / totalAssets) * 100 : 0;

    return {
      ...allocation,
      liquidPercentage,
      nonLiquidPercentage,
      totalAssets
    };
  }, [data.currentAge, data.retirementAge, data.currentNetWorth, data.nonLiquidAssets]);

  const updateData = (key: keyof FinancialData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [key]: value };
      if (key === 'monthlyIncome' || key === 'monthlyExpenses' || key === 'monthlyMedical') {
        newData.monthlySavings = Math.max(0, newData.monthlyIncome - (newData.monthlyExpenses + newData.monthlyMedical));
      } else if (key === 'monthlySavings') {
        newData.monthlyIncome = newData.monthlySavings + newData.monthlyExpenses + newData.monthlyMedical;
      }
      return newData;
    });
  };



  const strategies: { id: FinancialData['simulationMode']; label: string }[] = [
    { id: 'leaner', label: 'Leaner' },
    { id: 'conservative', label: 'Conservative' },
    { id: 'aggressive', label: 'Aggressive' },
    { id: 'crash', label: 'Crash' },
  ];

  const savingsRate = useMemo(() => {
    if (data.monthlyIncome === 0) return 0;
    return (data.monthlySavings / data.monthlyIncome) * 100;
  }, [data.monthlyIncome, data.monthlySavings]);

  const longevityTooltip = (
    <div className="space-y-2">
      <p>The target horizon for solvency. Your FIRE age ensures you never run out of money before this age.</p>
      <button
        onClick={() => setShowLongevityTable(!showLongevityTable)}
        className="text-indigo-600 font-bold hover:underline uppercase tracking-tighter"
      >
        {showLongevityTable ? 'Hide Benchmarks' : 'View Longevity Benchmarks'}
      </button>
      {showLongevityTable && (
        <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-x-auto animate-in fade-in zoom-in-95 duration-200">
          <table className="w-full text-[9px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-1 font-black uppercase text-slate-500 pr-2">Category</th>
                <th className="pb-1 font-black uppercase text-slate-500 pr-2">Perc.</th>
                <th className="pb-1 font-black uppercase text-slate-500 pr-2">Age</th>
                <th className="pb-1 font-black uppercase text-slate-500">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-1 font-bold text-slate-700 pr-2">Average</td>
                <td className="py-1 text-slate-500 pr-2">50%</td>
                <td className="py-1 font-black text-indigo-600 pr-2">72.5</td>
                <td className="py-1 text-slate-400">Standard expectancy today.</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-slate-700 pr-2">High</td>
                <td className="py-1 text-slate-500 pr-2">20%</td>
                <td className="py-1 font-black text-indigo-600 pr-2">~86</td>
                <td className="py-1 text-slate-400">Reached by healthiest 20%.</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-slate-700 pr-2">Elite</td>
                <td className="py-1 text-slate-500 pr-2">10%</td>
                <td className="py-1 font-black text-indigo-600 pr-2">~91</td>
                <td className="py-1 text-slate-400">Longest-lived 10%.</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-slate-700 pr-2">Extreme</td>
                <td className="py-1 text-slate-500 pr-2">5%</td>
                <td className="py-1 font-black text-indigo-600 pr-2">~95</td>
                <td className="py-1 text-slate-400">Top 5% super-survivors.</td>
              </tr>
              <tr>
                <td className="py-1 font-bold text-slate-700 pr-2">Maximum</td>
                <td className="py-1 text-slate-500 pr-2">&lt;0.01%</td>
                <td className="py-1 font-black text-rose-600 pr-2">113-128*</td>
                <td className="py-1 text-slate-400">Absolute limit (India records).</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden transition-colors duration-500">
      {/* FIXED TOP SECTION */}
      <div className="flex-none bg-slate-50 z-50 border-b border-slate-200 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-1 md:pt-2 lg:pt-2 pb-0 space-y-1 md:space-y-2">
          {/* HEADER */}
          <header className="flex flex-col sm:flex-row justify-between items-center gap-2 print:hidden">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">FirePulse</h1>
                <p className="text-[8px] md:text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-2">Longevity Strategy Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none cursor-pointer shadow-sm">
                {currencies.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 print:hidden"
                title="Print or Save as PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
            </div>
          </header>

          {/* PRIMARY DISPLAY - Always Visible */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 print:hidden">
            <div className="md:col-span-1 bg-indigo-600 p-3 md:p-4 rounded-2xl md:rounded-3xl text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full -mr-6 -mt-6 md:-mr-8 md:-mt-8 group-hover:scale-110 transition-transform"></div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-1">Solvency FIRE Age</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter italic leading-none">{results.fiAge || '—'}</h2>
              <p className="text-[9px] md:text-[10px] font-black uppercase mt-1 opacity-70 tracking-widest">{results.fiYear ? `Safe Retirement Year: ${results.fiYear}` : 'Capital Exhaustion Risk'}</p>
            </div>

            <div className="md:col-span-1 bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Longevity Limit</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter italic mono">Age {data.liveUntilAge}</h2>
              <p className={`text-[9px] font-bold uppercase mt-1 tracking-widest ${results.isSolventAtEnd ? 'text-teal-600' : 'text-rose-600 animate-pulse'}`}>
                {results.isSolventAtEnd ? 'Portfolio remains solvent' : 'Warning: Portfolio exhausts'}
              </p>
            </div>

            <div className="md:col-span-1 bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Savings Velocity</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter italic mono">{savingsRate.toFixed(1)}%</h2>
              <p className="text-[9px] md:text-[10px] font-bold text-indigo-500 uppercase mt-1 tracking-widest">Surplus: {formatCurrencyCompact(data.monthlySavings, currency)}/mo</p>
            </div>
          </section>

          <div className="print:hidden">
            <div className="flex gap-4 -mb-[1px]">
              <button
                onClick={() => setActiveTab('inputs')}
                className={`pb-1 px-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'inputs'
                  ? 'border-indigo-600 text-indigo-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                  }`}
              >
                Input Parameters
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`pb-1 px-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'results'
                  ? 'border-indigo-600 text-indigo-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200'
                  }`}
              >
                Results & Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 md:px-8 md:pb-8 lg:px-12 lg:pb-12 pt-0 scroll-smooth">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
          {/* STICKY SIMULATION CONTROLS - Always visible when scrolling */}
          {activeTab === 'results' && (
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-b-2xl rounded-t-none border-t-0 shadow-lg p-2 md:p-3 mb-6">
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {strategies.map((strat) => (
                  <button
                    key={strat.id}
                    onClick={() => updateData('simulationMode', strat.id)}
                    className={`px-4 py-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border ${data.simulationMode === strat.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
                      }`}
                  >
                    {strat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Print Title - Only visible when printing */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-black text-slate-900 mb-2">FirePulse - Financial Independence Report</h1>
            <p className="text-sm text-slate-600">Generated on {new Date().toLocaleDateString()}</p>
            <hr className="my-4 border-slate-300" />
          </div>

          {/* Print Layout - Reordered for better print flow */}
          <div className="hidden print:block space-y-6">

            {/* 2. Core Stats */}
            <div className="p-4 bg-white border border-slate-300 rounded">
              <h3 className="text-sm font-black text-indigo-600 uppercase mb-3 border-b border-slate-200 pb-2">Core Stats</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-bold">Age Now:</span> {data.currentAge}</div>
                <div><span className="font-bold">Retire Age:</span> {data.retirementAge}</div>
                <div><span className="font-bold">Live Until Age:</span> {data.liveUntilAge}</div>
                <div><span className="font-bold">Net Worth:</span> {formatCurrency(data.currentNetWorth, currency)}</div>
              </div>
            </div>

            {/* 3. Cash Flow */}
            <div className="p-4 bg-white border border-slate-300 rounded">
              <h3 className="text-sm font-black text-emerald-600 uppercase mb-3 border-b border-slate-200 pb-2">Cash Flow</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-bold">Monthly Income:</span> {formatCurrency(data.monthlyIncome, currency)}</div>
                <div><span className="font-bold">Monthly Living:</span> {formatCurrency(data.monthlyExpenses, currency)}</div>
                <div><span className="font-bold">Monthly Medical:</span> {formatCurrency(data.monthlyMedical, currency)}</div>
                <div><span className="font-bold">Monthly Surplus:</span> {formatCurrency(data.monthlySavings, currency)}</div>
              </div>
            </div>

            {/* 4. Estimated Numbers */}
            <div className="p-4 bg-white border border-slate-300 rounded">
              <h3 className="text-sm font-black text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">Estimated</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-bold">Simulation Mode:</span> {data.simulationMode}</div>
                <div><span className="font-bold">Income Growth:</span> {data.incomeIncreaseRate}%</div>
                <div><span className="font-bold">Global Inflation:</span> {data.inflationRate}%</div>
                <div><span className="font-bold">Medical Inflation:</span> {data.medicalInflation}%</div>
                <div><span className="font-bold">Est. Return:</span> {((data.liquidAssetReturn + data.nonLiquidAssetReturn) / 2).toFixed(1)}%</div>
                <div><span className="font-bold">Post-Retire Tax:</span> {data.retirementTaxRate}%</div>
              </div>
            </div>

            {/* 5. Visual Graph */}
            <div className="p-4 bg-white border border-slate-300 rounded">
              <h3 className="text-sm font-black text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">Projection Chart</h3>
              <div className="text-xs text-slate-500 italic mb-2">
                Chart shows net worth progression over time. FIRE age: {results.fiAge || 'Not reached'}
              </div>
              <div className="h-48 bg-slate-50 border border-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                [Chart visualization would appear here - see web version for interactive chart]
              </div>
            </div>

            {/* 6. Table View */}
            <div className="p-4 bg-white border border-slate-300 rounded">
              <h3 className="text-sm font-black text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">Detailed Projections</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="border border-slate-300 p-1 font-bold">Age/Year</th>
                      <th className="border border-slate-300 p-1 font-bold text-right">Start NW</th>
                      <th className="border border-slate-300 p-1 font-bold text-right">Income</th>
                      <th className="border border-slate-300 p-1 font-bold text-right">Expenses</th>
                      <th className="border border-slate-300 p-1 font-bold text-right">Returns</th>
                      <th className="border border-slate-300 p-1 font-bold text-right">End NW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.projections.map((p) => (
                      <tr key={`${p.age}-${p.year}`} className={p.isRetired ? 'bg-teal-50' : ''}>
                        <td className="border border-slate-300 p-1">{p.age} ({p.year})</td>
                        <td className="border border-slate-300 p-1 text-right">{formatCompactNumber(p.openingBalance, currency)}</td>
                        <td className="border border-slate-300 p-1 text-right text-emerald-600">+{formatCompactNumber(p.income, currency)}</td>
                        <td className="border border-slate-300 p-1 text-right text-rose-600">-{formatCompactNumber(p.totalOutflow, currency)}</td>
                        <td className="border border-slate-300 p-1 text-right text-indigo-600">{p.returns > 0 ? '+' : ''}{formatCompactNumber(p.returns, currency)}</td>
                        <td className="border border-slate-300 p-1 text-right font-bold">{formatCompactNumber(p.netWorth, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. Roadmap Timeline */}
            {data.goals.length > 0 && (
              <div className="p-4 bg-white border border-slate-300 rounded">
                <h3 className="text-sm font-black text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">Roadmap Timeline</h3>
                <div className="space-y-2">
                  {data.goals.map(goal => (
                    <div key={goal.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded">
                      <span className="font-bold">{goal.name}</span>
                      <span className="text-slate-600">Target Age: {goal.targetAge}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Print Footer */}
            <div className="p-4 text-xs text-slate-500 text-center border-t border-slate-300 mt-6">
              <p>FirePulse - Privacy-first Financial Independence Calculator</p>
              <p>No data is stored. This report is generated locally on your device.</p>
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 print:hidden">
            {activeTab === 'inputs' ? (
              <aside className="lg:col-span-12 space-y-8 md:space-y-12 print:hidden">
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">

                  {/* CORE STATS */}
                  <section className="space-y-8 md:space-y-10 p-6 md:p-8 rounded-[2rem] border border-slate-200">
                    <h3 className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.5em] flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> Core Stats
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 input-grid">
                      <SliderInput
                        label="Age Now"
                        value={data.currentAge}
                        onChange={(v) => updateData('currentAge', v)}
                        min={18}
                        max={data.retirementAge - 1}
                      />
                      <SliderInput
                        label="Retire Age"
                        value={data.retirementAge}
                        onChange={(v) => updateData('retirementAge', v)}
                        min={data.currentAge + 1}
                        max={data.liveUntilAge - 1}
                      />
                      <div className="col-span-2">
                        <SliderInput
                          label="Live Until Age"
                          value={data.liveUntilAge}
                          onChange={(v) => updateData('liveUntilAge', v)}
                          min={data.retirementAge + 1}
                          max={110}
                          tooltip={longevityTooltip}
                        />
                      </div>
                      <div className="col-span-2">
                        <SliderInput
                          label="Liquid Assets"
                          value={data.currentNetWorth}
                          onChange={(v) => updateData('currentNetWorth', v)}
                          min={0}
                          max={100000000}
                          step={10000}
                          prefix={currencySymbol}
                          tooltip="Cash, stocks, bonds, mutual funds - easily convertible to cash"
                        />
                      </div>
                      <div className="col-span-2">
                        <SliderInput
                          label="Non-Liquid Assets"
                          value={data.nonLiquidAssets}
                          onChange={(v) => updateData('nonLiquidAssets', v)}
                          min={0}
                          max={100000000}
                          step={10000}
                          prefix={currencySymbol}
                          tooltip="Real estate, business equity, retirement accounts - harder to convert to cash"
                        />
                      </div>
                    </div>
                  </section>

                  {/* INCOME */}
                  <section className="space-y-8 md:space-y-10 p-6 md:p-8 rounded-[2rem] border border-slate-200">
                    <h3 className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.5em] flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span> Income
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 input-grid">
                      <div className="col-span-2">
                        <SliderInput
                          label="Monthly Income"
                          value={data.monthlyIncome}
                          onChange={(v) => updateData('monthlyIncome', v)}
                          min={0}
                          max={2000000}
                          step={500}
                          prefix={currencySymbol}
                        />
                      </div>
                      <SliderInput
                        label="Monthly Living"
                        value={data.monthlyExpenses}
                        onChange={(v) => updateData('monthlyExpenses', v)}
                        min={500}
                        max={500000}
                        step={500}
                        prefix={currencySymbol}
                      />
                      <SliderInput
                        label="Monthly Medical"
                        value={data.monthlyMedical}
                        onChange={(v) => updateData('monthlyMedical', v)}
                        min={0}
                        max={50000}
                        step={100}
                        prefix={currencySymbol}
                      />
                      <div className="col-span-2">
                        <SliderInput
                          label="Monthly Surplus"
                          value={data.monthlySavings}
                          onChange={(v) => updateData('monthlySavings', v)}
                          min={0}
                          max={data.monthlyIncome}
                          step={100}
                          prefix={currencySymbol}
                        />
                      </div>
                    </div>
                  </section>

                  {/* ESTIMATES */}
                  <section className="space-y-8 md:space-y-10 p-6 md:p-8 rounded-[2rem] border border-slate-200">
                    <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> Estimates
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 input-grid">
                      <SliderInput label="Income Growth %" value={data.incomeIncreaseRate} onChange={(v) => updateData('incomeIncreaseRate', v)} min={0} max={25} step={0.5} suffix="%" />
                      <SliderInput label="Global Inflation" value={data.inflationRate} onChange={(v) => updateData('inflationRate', v)} min={0} max={15} step={0.1} suffix="%" />
                      <SliderInput label="Medical Inflation" value={data.medicalInflation} onChange={(v) => updateData('medicalInflation', v)} min={0} max={20} step={0.1} suffix="%" />
                      <SliderInput label="Liquid Asset Return" value={data.liquidAssetReturn} onChange={(v) => updateData('liquidAssetReturn', v)} min={1} max={20} step={0.5} suffix="%" tooltip="Expected return on liquid assets (stocks, bonds, cash)" />
                      <SliderInput label="Non-Liquid Asset Return" value={data.nonLiquidAssetReturn} onChange={(v) => updateData('nonLiquidAssetReturn', v)} min={1} max={15} step={0.5} suffix="%" tooltip="Expected return on non-liquid assets (real estate, business)" />
                      <SliderInput label="Retirement Expense %" value={data.retirementExpenseMultiplier} onChange={(v) => updateData('retirementExpenseMultiplier', v)} min={50} max={120} step={1} suffix="%" tooltip="Retirement spending as % of current expenses (adjusted for inflation)" />
                      <div className="col-span-2">
                        <SliderInput label="Post-Retire Tax" value={data.retirementTaxRate} onChange={(v) => updateData('retirementTaxRate', v)} min={0} max={50} step={1} suffix="%" />
                      </div>
                    </div>
                  </section>
                </div>
              </aside>
            ) : (
              <div className="lg:col-span-12 space-y-8 md:space-y-12">

                {/* TOP ROW: ALLOCATION & VISUAL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

                  {/* ASSET ALLOCATION DISPLAY */}
                  <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm h-full">
                    <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic mb-10 md:mb-12">Asset Allocation</h2>

                    {/* Total Assets Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
                      <div className="bg-indigo-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-indigo-100">
                        <p className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Total Assets</p>
                        <h3 className="text-2xl md:text-3xl font-black text-indigo-900 tracking-tighter">{formatCurrencyCompact(currentAllocation.totalAssets, currency)}</h3>
                      </div>
                      <div className="bg-emerald-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-emerald-100">
                        <p className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Liquid</p>
                        <h3 className="text-2xl md:text-3xl font-black text-emerald-900 tracking-tighter">{formatCurrencyCompact(data.currentNetWorth, currency)}</h3>
                        <p className="text-[10px] font-bold text-emerald-600 mt-2">{currentAllocation.liquidPercentage.toFixed(1)}%</p>
                      </div>
                      <div className="bg-amber-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-amber-100">
                        <p className="text-[10px] md:text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-4">Non-Liquid</p>
                        <h3 className="text-2xl md:text-3xl font-black text-amber-900 tracking-tighter">{formatCurrencyCompact(data.nonLiquidAssets, currency)}</h3>
                        <p className="text-[10px] font-bold text-amber-600 mt-2">{currentAllocation.nonLiquidPercentage.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Liquid Asset Allocation */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Liquid Split</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {/* Equity Allocation */}
                        <div className="bg-blue-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-blue-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/20 rounded-full -mr-8 -mt-8"></div>
                          <div className="relative z-10">
                            <p className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Equity</p>
                            <h4 className="text-2xl md:text-3xl font-black text-blue-900">{currentAllocation.equity}%</h4>
                            <div className="mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${currentAllocation.equity}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Debt Allocation */}
                        <div className="bg-green-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-green-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-green-200/20 rounded-full -mr-8 -mt-8"></div>
                          <div className="relative z-10">
                            <p className="text-[10px] md:text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-2">Debt</p>
                            <h4 className="text-2xl md:text-3xl font-black text-green-900">{currentAllocation.debt}%</h4>
                            <div className="mt-4 h-2 bg-green-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${currentAllocation.debt}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Cash Allocation */}
                        <div className="bg-gray-50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-gray-200/20 rounded-full -mr-8 -mt-8"></div>
                          <div className="relative z-10">
                            <p className="text-[10px] md:text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Cash</p>
                            <h4 className="text-2xl md:text-3xl font-black text-gray-900">{currentAllocation.cash}%</h4>
                            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gray-500 transition-all duration-1000" style={{ width: `${currentAllocation.cash}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL CHART & MILESTONES */}
                  <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm h-full flex flex-col">
                    <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic mb-10 md:mb-12">Visual Projection</h2>
                    <div className="flex-1 min-h-[300px]">
                      <ProjectionChart data={results.projections} fiAge={results.fiAge} currency={currency} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
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

                {/* TABLE VIEW (Permanent) */}
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 md:mb-12 gap-6 relative z-10">
                    <h2 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.4em] italic leading-tight">Solvency Ledger</h2>
                  </div>

                  <div className="overflow-x-auto rounded-[2rem] md:rounded-[3rem] border border-slate-100 custom-scrollbar relative z-10">
                    <table className="w-full text-left text-[11px] md:text-sm font-mono min-w-[600px]">
                      <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-20">
                        <tr>
                          <th className="px-3 py-4 md:px-5 md:py-6 font-black uppercase text-slate-400">Age/Year</th>
                          <th className="px-3 py-4 md:px-5 md:py-6 font-black uppercase text-slate-400 text-right">Start NW</th>
                          <th className="px-3 py-4 md:px-5 md:py-6 font-black uppercase text-emerald-600">In / Out Breakdown</th>
                          <th className="px-3 py-4 md:px-5 md:py-6 font-black uppercase text-indigo-500 text-right">Returns</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.projections.map((p, idx) => {
                          const prev = idx > 0 ? results.projections[idx - 1] : null;
                          const incomeInc = prev && prev.income !== 0 ? (((p.income - prev.income) / prev.income) * 100) : 0;
                          const outflowInc = prev && prev.totalOutflow !== 0 ? (((p.totalOutflow - prev.totalOutflow) / prev.totalOutflow) * 100) : 0;
                          const earnIncrease = prev && prev.returns !== 0 ? (((p.returns - prev.returns) / Math.abs(prev.returns)) * 100) : 0;
                          const yearsElapsed = p.age - data.currentAge;

                          // Calculate effective return rate for this row
                          const baseReturn = (data.liquidAssetReturn + data.nonLiquidAssetReturn) / 2;
                          let effRate = baseReturn;
                          if (data.simulationMode === 'leaner') effRate -= 1;
                          else if (data.simulationMode === 'conservative') effRate -= 2;
                          else if (data.simulationMode === 'aggressive') effRate += 2;
                          const isCrashYear = data.simulationMode === 'crash' && (p.age - data.currentAge) % 10 === 0 && p.age > data.currentAge;
                          if (isCrashYear) effRate = -20;

                          return (
                            <tr key={`${p.age}-${p.year}`} className={`group transition-all hover:bg-slate-50 ${p.isRetired ? 'bg-teal-50 text-teal-800' : ''}`}>
                              <td className="px-3 py-4 md:px-5 md:py-6 font-black text-sm md:text-base whitespace-nowrap">
                                {p.age} <span className="text-[10px] font-bold opacity-40 ml-1">{p.year}</span>
                              </td>
                              <td className="px-3 py-4 md:px-5 md:py-6 opacity-60 font-medium text-right">{formatCompactNumber(p.openingBalance, currency)}</td>
                              <td className="px-3 py-4 md:px-5 md:py-6 relative">
                                <div className="flex flex-col gap-1.5">
                                  {/* INCOME HOVER */}
                                  <div className="relative group/income cursor-help">
                                    <div className="font-bold text-emerald-600 leading-none">
                                      +{formatCompactNumber(p.income, currency)} <span className="text-[8px] opacity-50 uppercase ml-1">In</span>
                                    </div>
                                    {!p.isRetired && (
                                      <div className="absolute left-0 top-full mt-2 hidden group-hover/income:block bg-slate-900 text-white text-[9px] p-3 rounded-xl shadow-2xl z-50 min-w-[180px] pointer-events-none animate-in fade-in zoom-in-95">
                                        <p className="font-black uppercase tracking-widest text-indigo-400 mb-1">Income Calculation</p>
                                        <p className="opacity-70">Initial: {formatCurrency(data.monthlyIncome * 12, currency)}/yr</p>
                                        <p className="opacity-70">Factor: (1 + {data.incomeIncreaseRate}%)^{yearsElapsed} yrs</p>
                                        <div className="mt-2 border-t border-white/10 pt-2 font-bold">
                                          = {formatCurrency(p.income, currency)} Total
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* OUTFLOW HOVER */}
                                  <div className="relative group/outflow flex flex-col text-[10px] font-bold border-l-2 border-slate-100 pl-2 gap-0.5 cursor-help">
                                    <div className="text-rose-500/80 leading-none">Reg: -{formatCompactNumber(p.livingExpenses, currency)}</div>
                                    <div className="text-rose-400 leading-none">Med: -{formatCompactNumber(p.medicalExpenses, currency)}</div>

                                    <div className="absolute left-0 top-full mt-2 hidden group-hover/outflow:block bg-slate-900 text-white text-[9px] p-3 rounded-xl shadow-2xl z-50 min-w-[200px] pointer-events-none animate-in fade-in zoom-in-95">
                                      <p className="font-black uppercase tracking-widest text-rose-400 mb-2">Expense Breakdown</p>
                                      <div className="space-y-2">
                                        <div>
                                          <p className="font-bold text-indigo-300">Regular Living:</p>
                                          <p className="opacity-70">Base: {formatCurrency(data.monthlyExpenses * 12, currency)}</p>
                                          <p className="opacity-70">Infl: (1 + {data.inflationRate}%)^{yearsElapsed} yrs</p>
                                          {p.isRetired && <p className="opacity-70">Retire Multiplier: {data.retirementExpenseMultiplier}%</p>}
                                        </div>
                                        <div className="border-t border-white/10 pt-2">
                                          <p className="font-bold text-rose-300">Medical:</p>
                                          <p className="opacity-70">Base: {formatCurrency(data.monthlyMedical * 12, currency)}</p>
                                          <p className="opacity-70">Infl: (1 + {data.medicalInflation}%)^{yearsElapsed} yrs</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {prev && (
                                    <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter mt-0.5">
                                      Growth: {incomeInc.toFixed(1)}% / {outflowInc.toFixed(1)}% YoY
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-4 md:px-5 md:py-6 text-right relative">
                                <div className="relative group/returns cursor-help">
                                  <div className={`font-bold ${p.returns >= 0 ? 'text-indigo-500' : 'text-rose-500'}`}>
                                    {p.returns > 0 ? '+' : ''}{formatCompactNumber(p.returns, currency)}
                                  </div>

                                  {/* RETURNS HOVER */}
                                  <div className="absolute right-0 top-full mt-2 hidden group-hover/returns:block bg-slate-900 text-white text-[9px] p-3 rounded-xl shadow-2xl z-50 min-w-[200px] text-left pointer-events-none animate-in fade-in zoom-in-95">
                                    <p className="font-black uppercase tracking-widest text-indigo-400 mb-2">Return Logic</p>
                                    <div className="space-y-1 opacity-80">
                                      <p>Base Return: {baseReturn.toFixed(1)}%</p>
                                      <p>Strategy ({data.simulationMode}): {effRate.toFixed(1)}%</p>
                                      {isCrashYear && <p className="text-rose-400 font-black">CRASH CYCLE: -20% Applied</p>}
                                      <div className="mt-2 border-t border-white/10 pt-2">
                                        <p className="font-bold text-white">Calculation:</p>
                                        <p>{formatCompactNumber(p.openingBalance, currency)} × {effRate.toFixed(1)}%</p>
                                        <p className="font-black text-indigo-400 mt-1">= {formatCurrency(p.returns, currency)}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {prev && (
                                    <div className="text-[9px] font-black opacity-40 uppercase tracking-tighter mt-1">
                                      {earnIncrease >= 0 ? '+' : ''}{earnIncrease.toFixed(1)}% YoY
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm">
                  <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic mb-10 md:mb-12">Roadmap Timeline</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {data.goals.map(goal => (
                      <div key={goal.id} className="p-8 md:p-10 bg-slate-50 rounded-[2rem] md:rounded-[3rem] border border-slate-100 relative space-y-10">
                        <button onClick={() => updateData('goals', data.goals.filter(g => g.id !== goal.id))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                        <h4 className="font-black text-lg md:text-xl uppercase tracking-widest text-slate-800">{goal.name}</h4>
                        <SliderInput label="Target Age" value={goal.targetAge} onChange={(v) => updateData('goals', data.goals.map(g => g.id === goal.id ? { ...g, targetAge: v } : g))} min={data.currentAge} max={data.liveUntilAge} />
                      </div>
                    ))}
                    <button onClick={() => updateData('goals', [...data.goals, { id: Math.random().toString(), name: 'New Milestone', targetAge: data.currentAge + 5, targetAmount: 20000, category: 'Other' }])} className="p-8 md:p-10 border-2 md:border-4 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all">+ Add Milestone</button>
                  </div>
                </div>
              </div>
            )}          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
