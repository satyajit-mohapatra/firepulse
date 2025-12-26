
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialData, CalculationResults, CurrencyCode, Milestone, InvestmentGoal } from './types';
import { calculateFIRE, formatCurrency, formatCurrencyCompact, getCurrencySymbol, formatCompactNumber } from './utils/finance';
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
    annualReturn: 12,
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

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const results = useMemo(() => calculateFIRE(data), [data]);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-12 transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-6 print:hidden">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">FirePulse</h1>
              <p className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-[0.4em] mt-2">Longevity Strategy Engine</p>
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

        {/* Print Title - Only visible when printing */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-black text-slate-900 mb-2">FirePulse - Financial Independence Report</h1>
          <p className="text-sm text-slate-600">Generated on {new Date().toLocaleDateString()}</p>
          
          {/* Print Summary */}
          <div className="mt-4 p-4 bg-slate-50 border border-slate-300 rounded">
            <h2 className="text-lg font-black text-slate-800 mb-3">Financial Summary</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-bold">Current Age:</span> {data.currentAge}
              </div>
              <div>
                <span className="font-bold">Retirement Age:</span> {data.retirementAge}
              </div>
              <div>
                <span className="font-bold">Current Net Worth:</span> {formatCurrency(data.currentNetWorth, currency)}
              </div>
              <div>
                <span className="font-bold">Monthly Income:</span> {formatCurrency(data.monthlyIncome, currency)}
              </div>
              <div>
                <span className="font-bold">Monthly Expenses:</span> {formatCurrency(data.monthlyExpenses + data.monthlyMedical, currency)}
              </div>
              <div>
                <span className="font-bold">Savings Rate:</span> {savingsRate.toFixed(1)}%
              </div>
              <div>
                <span className="font-bold">FIRE Age:</span> {results.fiAge || 'Not Achievable'}
              </div>
              <div>
                <span className="font-bold">Strategy:</span> {data.simulationMode}
              </div>
            </div>
          </div>
          <hr className="my-4 border-slate-300" />
        </div>

        {/* PRIMARY DISPLAY */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          <div className="md:col-span-1 bg-indigo-600 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-80 mb-6 md:mb-8">Solvency FIRE Age</p>
            <h2 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter italic leading-none">{results.fiAge || '—'}</h2>
            <p className="text-xs md:text-sm font-black uppercase mt-8 md:mt-10 opacity-70 tracking-widest">{results.fiYear ? `Safe Retirement Year: ${results.fiYear}` : 'Capital Exhaustion Risk'}</p>
          </div>
          
          <div className="md:col-span-1 bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-6 md:mb-8">Longevity Limit</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic mono">Age {data.liveUntilAge}</h2>
            <p className={`text-[10px] font-bold uppercase mt-8 md:mt-10 tracking-widest ${results.isSolventAtEnd ? 'text-teal-600' : 'text-rose-600 animate-pulse'}`}>
              {results.isSolventAtEnd ? 'Portfolio remains solvent' : 'Warning: Portfolio exhausts'}
            </p>
          </div>

          <div className="md:col-span-1 bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-6 md:mb-8">Savings Velocity</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter italic mono">{savingsRate.toFixed(1)}%</h2>
            <p className="text-[10px] md:text-xs font-bold text-indigo-500 uppercase mt-8 md:mt-10 tracking-widest">Surplus: {formatCurrencyCompact(data.monthlySavings, currency)}/mo</p>
          </div>
        </section>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* PARAMETERS */}
          <aside className="lg:col-span-4 space-y-8 md:space-y-12 print:hidden">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-200 shadow-sm space-y-12">
              
              {/* CORE STATS */}
              <section className="space-y-8 md:space-y-10">
                <h3 className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-[0.5em] flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> Core Stats
                </h3>
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
                <SliderInput 
                  label="Live Until Age" 
                  value={data.liveUntilAge} 
                  onChange={(v) => updateData('liveUntilAge', v)} 
                  min={data.retirementAge + 1} 
                  max={110} 
                  tooltip={longevityTooltip}
                />
                <SliderInput 
                  label="Net Worth" 
                  value={data.currentNetWorth} 
                  onChange={(v) => updateData('currentNetWorth', v)} 
                  min={0} 
                  max={100000000} 
                  step={10000} 
                  prefix={currencySymbol} 
                />
              </section>

              {/* CASH FLOW */}
              <section className="space-y-8 md:space-y-10">
                <h3 className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-[0.5em] flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span> Cash Flow
                </h3>
                <SliderInput 
                  label="Monthly Income" 
                  value={data.monthlyIncome} 
                  onChange={(v) => updateData('monthlyIncome', v)} 
                  min={0} 
                  max={2000000} 
                  step={500} 
                  prefix={currencySymbol} 
                />
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
                <SliderInput 
                  label="Monthly Surplus" 
                  value={data.monthlySavings} 
                  onChange={(v) => updateData('monthlySavings', v)} 
                  min={0} 
                  max={data.monthlyIncome} 
                  step={100} 
                  prefix={currencySymbol} 
                />
              </section>

              {/* ESTIMATED / ECONOMIC ESTIMATES */}
              <section className="space-y-8 md:space-y-10">
                <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.5em] flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> Estimated
                </h3>

                <div className="space-y-3">
                  <label className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Simulation Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {strategies.map((strat) => (
                      <button
                        key={strat.id}
                        onClick={() => updateData('simulationMode', strat.id)}
                        className={`px-3 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${
                          data.simulationMode === strat.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                            : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
                        }`}
                      >
                        {strat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <SliderInput label="Income Growth %" value={data.incomeIncreaseRate} onChange={(v) => updateData('incomeIncreaseRate', v)} min={0} max={25} step={0.5} suffix="%" />
                <SliderInput label="Global Inflation" value={data.inflationRate} onChange={(v) => updateData('inflationRate', v)} min={0} max={15} step={0.1} suffix="%" />
                <SliderInput label="Medical Inflation" value={data.medicalInflation} onChange={(v) => updateData('medicalInflation', v)} min={0} max={20} step={0.1} suffix="%" />
                <SliderInput label="Est. Return" value={data.annualReturn} onChange={(v) => updateData('annualReturn', v)} min={1} max={15} step={0.5} suffix="%" />
                <SliderInput label="Post-Retire Tax" value={data.retirementTaxRate} onChange={(v) => updateData('retirementTaxRate', v)} min={0} max={50} step={1} suffix="%" />
              </section>
            </div>


          </aside>

          {/* MAIN VISUALS */}
          <main className="lg:col-span-8 space-y-8 md:space-y-12">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="hidden print:block bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800 font-medium">
                  💡 <strong>Print Tip:</strong> Use "Save as PDF" in your browser's print dialog to save this financial plan digitally.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 md:mb-12 gap-6 relative z-10">
                <h2 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.4em] italic leading-tight">Solvency Ledger</h2>
                <div className="flex gap-2 print:hidden">
                   <button onClick={() => setShowLedger(false)} className={`px-5 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${!showLedger ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-100 text-slate-500'}`}>Visual</button>
                  <button onClick={() => setShowLedger(true)} className={`px-5 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${showLedger ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-slate-100 text-slate-500'}`}>Data</button>
                </div>
              </div>

              {!showLedger ? (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 relative z-10 print:hidden">
                  <ProjectionChart data={results.projections} fiAge={results.fiAge} currency={currency} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-10 md:mt-12">
                    {results.milestones.map((m, idx) => (
                      <div key={idx} className={`p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border transition-all ${m.reached ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                          <h5 className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] ${m.reached ? 'text-teal-600' : 'text-slate-400'}`}>{m.name}</h5>
                          {m.age && <span className="text-[9px] md:text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Age {m.age}</span>}
                        </div>
                        <p className="text-xs md:text-sm font-medium text-slate-600 mb-6 md:mb-8 leading-relaxed opacity-80">{m.description}</p>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${m.reached ? 'bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.4)]' : 'bg-slate-300'}`} style={{ width: `${Math.min(100, (data.currentNetWorth / m.target) * 100)}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
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
                        let effRate = data.annualReturn;
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
                                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover/income:block bg-slate-900 text-white text-[9px] p-3 rounded-xl shadow-2xl z-50 min-w-[180px] pointer-events-none animate-in fade-in zoom-in-95">
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
                                  
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover/outflow:block bg-slate-900 text-white text-[9px] p-3 rounded-xl shadow-2xl z-50 min-w-[200px] pointer-events-none animate-in fade-in zoom-in-95">
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
                                <div className="absolute right-0 bottom-full mb-2 hidden group-hover/returns:block bg-slate-900 text-white text-[9px] p-3 rounded-xl shadow-2xl z-50 min-w-[200px] text-left pointer-events-none animate-in fade-in zoom-in-95">
                                  <p className="font-black uppercase tracking-widest text-indigo-400 mb-2">Return Logic</p>
                                  <div className="space-y-1 opacity-80">
                                    <p>Base Return: {data.annualReturn}%</p>
                                    <p>Strategy ({data.simulationMode}): {effRate - (isCrashYear ? 0 : data.annualReturn)}%</p>
                                    {isCrashYear && <p className="text-rose-400 font-black">CRASH CYCLE: -20% Applied</p>}
                                    <div className="mt-2 border-t border-white/10 pt-2">
                                      <p className="font-bold text-white">Calculation:</p>
                                      <p>{formatCompactNumber(p.openingBalance, currency)} × {effRate}%</p>
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
              )}
            </div>

            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200 shadow-sm">
              <h2 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic mb-10 md:mb-12">Roadmap Timeline</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {data.goals.map(goal => (
                  <div key={goal.id} className="p-8 md:p-10 bg-slate-50 rounded-[2rem] md:rounded-[3rem] border border-slate-100 relative space-y-10">
                    <button onClick={() => updateData('goals', data.goals.filter(g => g.id !== goal.id))} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                    <h4 className="font-black text-lg md:text-xl uppercase tracking-widest text-slate-800">{goal.name}</h4>
                    <SliderInput label="Target Age" value={goal.targetAge} onChange={(v) => updateData('goals', data.goals.map(g => g.id === goal.id ? {...g, targetAge: v} : g))} min={data.currentAge} max={data.liveUntilAge} />
                  </div>
                ))}
                <button onClick={() => updateData('goals', [...data.goals, {id: Math.random().toString(), name: 'New Milestone', targetAge: data.currentAge+5, targetAmount: 20000, category: 'Other'}])} className="p-8 md:p-10 border-2 md:border-4 border-dashed border-slate-200 rounded-[2rem] md:rounded-[3rem] text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all">+ Add Milestone</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
