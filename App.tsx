
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

  const exportToCSV = () => {
    const csvData = [
      ['Parameter', 'Value', 'Category'],
      ['Current Age', data.currentAge.toString(), 'Core Stats'],
      ['Retirement Age', data.retirementAge.toString(), 'Core Stats'],
      ['Live Until Age', data.liveUntilAge.toString(), 'Core Stats'],
      ['Current Net Worth', data.currentNetWorth.toString(), 'Core Stats'],
      ['Non-Liquid Assets', data.nonLiquidAssets.toString(), 'Core Stats'],
      ['Monthly Income', data.monthlyIncome.toString(), 'Income'],
      ['Monthly Expenses', data.monthlyExpenses.toString(), 'Income'],
      ['Monthly Medical', data.monthlyMedical.toString(), 'Income'],
      ['Monthly Savings', data.monthlySavings.toString(), 'Income'],
      ['Annual Bonus', data.annualBonus.toString(), 'Income'],
      ['Income Increase Rate', data.incomeIncreaseRate.toString(), 'Estimates'],
      ['Expense Increase Rate', data.expenseIncreaseRate.toString(), 'Estimates'],
      ['Retirement Expense Multiplier', data.retirementExpenseMultiplier.toString(), 'Estimates'],
      ['Annual Expenses', data.annualExpenses.toString(), 'Estimates'],
      ['SWP Amount', data.swpAmount.toString(), 'Estimates'],
      ['Retirement Tax Rate', data.retirementTaxRate.toString(), 'Estimates'],
      ['Liquid Asset Return', data.liquidAssetReturn.toString(), 'Estimates'],
      ['Non-Liquid Asset Return', data.nonLiquidAssetReturn.toString(), 'Estimates'],
      ['Inflation Rate', data.inflationRate.toString(), 'Estimates'],
      ['Withdrawal Rate', data.withdrawalRate.toString(), 'Estimates'],
      ['Medical Inflation', data.medicalInflation.toString(), 'Estimates'],
      ['Future Income', data.futureIncome.toString(), 'Estimates'],
      ['Future Income Start Age', data.futureIncomeStartAge.toString(), 'Estimates'],
      ['Simulation Mode', data.simulationMode, 'Estimates'],
      ['Withdrawal Strategy', data.withdrawalStrategy, 'Estimates'],
      ['Currency', currency, 'Settings']
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firepulse-inputs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newData = { ...data };

      lines.forEach((line, index) => {
        if (index === 0 || !line.trim()) return; // Skip header or empty lines
        
        const [parameter, value] = line.split(',').map(cell => cell.replace(/"/g, '').trim());
        
        switch (parameter) {
          case 'Current Age':
            newData.currentAge = parseInt(value) || data.currentAge;
            break;
          case 'Retirement Age':
            newData.retirementAge = parseInt(value) || data.retirementAge;
            break;
          case 'Live Until Age':
            newData.liveUntilAge = parseInt(value) || data.liveUntilAge;
            break;
          case 'Current Net Worth':
            newData.currentNetWorth = parseFloat(value) || data.currentNetWorth;
            break;
          case 'Non-Liquid Assets':
            newData.nonLiquidAssets = parseFloat(value) || data.nonLiquidAssets;
            break;
          case 'Monthly Income':
            newData.monthlyIncome = parseFloat(value) || data.monthlyIncome;
            break;
          case 'Monthly Expenses':
            newData.monthlyExpenses = parseFloat(value) || data.monthlyExpenses;
            break;
          case 'Monthly Medical':
            newData.monthlyMedical = parseFloat(value) || data.monthlyMedical;
            break;
          case 'Monthly Savings':
            newData.monthlySavings = parseFloat(value) || data.monthlySavings;
            break;
          case 'Annual Bonus':
            newData.annualBonus = parseFloat(value) || data.annualBonus;
            break;
          case 'Income Increase Rate':
            newData.incomeIncreaseRate = parseFloat(value) || data.incomeIncreaseRate;
            break;
          case 'Expense Increase Rate':
            newData.expenseIncreaseRate = parseFloat(value) || data.expenseIncreaseRate;
            break;
          case 'Retirement Expense Multiplier':
            newData.retirementExpenseMultiplier = parseFloat(value) || data.retirementExpenseMultiplier;
            break;
          case 'Annual Expenses':
            newData.annualExpenses = parseFloat(value) || data.annualExpenses;
            break;
          case 'SWP Amount':
            newData.swpAmount = parseFloat(value) || data.swpAmount;
            break;
          case 'Retirement Tax Rate':
            newData.retirementTaxRate = parseFloat(value) || data.retirementTaxRate;
            break;
          case 'Liquid Asset Return':
            newData.liquidAssetReturn = parseFloat(value) || data.liquidAssetReturn;
            break;
          case 'Non-Liquid Asset Return':
            newData.nonLiquidAssetReturn = parseFloat(value) || data.nonLiquidAssetReturn;
            break;
          case 'Inflation Rate':
            newData.inflationRate = parseFloat(value) || data.inflationRate;
            break;
          case 'Withdrawal Rate':
            newData.withdrawalRate = parseFloat(value) || data.withdrawalRate;
            break;
          case 'Medical Inflation':
            newData.medicalInflation = parseFloat(value) || data.medicalInflation;
            break;
          case 'Future Income':
            newData.futureIncome = parseFloat(value) || data.futureIncome;
            break;
          case 'Future Income Start Age':
            newData.futureIncomeStartAge = parseInt(value) || data.futureIncomeStartAge;
            break;
          case 'Simulation Mode':
            newData.simulationMode = value as FinancialData['simulationMode'] || data.simulationMode;
            break;
          case 'Withdrawal Strategy':
            newData.withdrawalStrategy = value as FinancialData['withdrawalStrategy'] || data.withdrawalStrategy;
            break;
          case 'Currency':
            setCurrency(value as CurrencyCode || currency);
            break;
        }
      });

      setData(newData);
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
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
      <div className="flex-none bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 z-50 border-b border-white/20 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 pt-4 md:pt-6 lg:pt-8 pb-4 space-y-3 md:space-y-4">
          {/* HEADER */}
          <header className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8 print:hidden">
            <div className="flex items-center gap-6 md:gap-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl shadow-black/20 ring-2 ring-white/30 backdrop-blur-sm border border-white/20">
                <svg className="w-9 h-9 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none italic uppercase bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-lg">FirePulse</h1>
                <p className="text-[11px] md:text-[13px] font-black text-white/80 uppercase tracking-[0.3em] mt-3 bg-gradient-to-r from-white/60 to-white/40 bg-clip-text text-transparent">Longevity Strategy Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center lg:justify-end">
              <select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} className="px-5 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-sm font-bold outline-none cursor-pointer shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-300 text-white">
                {currencies.map(c => <option key={c.code} value={c.code} className="text-gray-900">{c.name}</option>)}
              </select>
              <button
                onClick={exportToCSV}
                className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400/50 rounded-2xl text-sm font-bold text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 print:hidden"
                title="Export inputs as CSV"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <label className="px-5 py-3 bg-gradient-to-r from-white/20 to-white/10 border border-white/30 rounded-2xl text-sm font-bold text-white hover:from-white/30 hover:to-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 cursor-pointer print:hidden backdrop-blur-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import
                <input
                  type="file"
                  accept=".csv"
                  onChange={importFromCSV}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => window.print()}
                className="px-5 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-sm font-bold text-white hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 print:hidden"
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
            <div className="md:col-span-1 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 p-4 md:p-6 rounded-3xl md:rounded-4xl text-white shadow-2xl shadow-purple-600/40 relative overflow-hidden group border border-white/20 backdrop-blur-xl hover:shadow-3xl hover:shadow-purple-600/50 transition-all duration-500 hover:scale-105">
              <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-10 -mt-10 md:-mr-12 md:-mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8 group-hover:scale-110 transition-transform duration-500 delay-100"></div>
              <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-2 text-white/90">Solvency FIRE Age</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter italic leading-none drop-shadow-2xl">{results.fiAge || '—'}</h2>
                <p className="text-[10px] md:text-[11px] font-bold uppercase mt-2 text-white/80 tracking-widest">{results.fiYear ? `Safe Retirement Year: ${results.fiYear}` : 'Capital Exhaustion Risk'}</p>
              </div>
            </div>

            <div className="md:col-span-1 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-4 md:p-6 rounded-3xl md:rounded-4xl text-white shadow-2xl shadow-emerald-600/40 relative overflow-hidden group border border-white/20 backdrop-blur-xl hover:shadow-3xl hover:shadow-emerald-600/50 transition-all duration-500 hover:scale-105">
              <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-10 -mt-10 md:-mr-12 md:-mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8 group-hover:scale-110 transition-transform duration-500 delay-100"></div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-2 text-white/90">Longevity Limit</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter italic mono drop-shadow-2xl">Age {data.liveUntilAge}</h2>
                <p className={`text-[10px] md:text-[11px] font-bold uppercase mt-2 tracking-widest ${results.isSolventAtEnd ? 'text-emerald-200' : 'text-pink-200 animate-pulse'}`}>
                  {results.isSolventAtEnd ? 'Portfolio remains solvent' : 'Warning: Portfolio exhausts'}
                </p>
              </div>
            </div>

            <div className="md:col-span-1 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-4 md:p-6 rounded-3xl md:rounded-4xl text-white shadow-2xl shadow-amber-600/40 relative overflow-hidden group border border-white/20 backdrop-blur-xl hover:shadow-3xl hover:shadow-amber-600/50 transition-all duration-500 hover:scale-105">
              <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full -mr-10 -mt-10 md:-mr-12 md:-mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8 group-hover:scale-110 transition-transform duration-500 delay-100"></div>
              <div className="relative z-10">
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-2 text-white/90">Savings Velocity</p>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter italic mono drop-shadow-2xl">{savingsRate.toFixed(1)}%</h2>
                <p className="text-[10px] md:text-[11px] font-bold text-amber-100 uppercase mt-2 tracking-widest">Surplus: {formatCurrencyCompact(data.monthlySavings, currency)}/mo</p>
              </div>
            </div>
          </section>

          <div className="print:hidden">
            <div className="flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl -mb-[1px] border border-white/20 shadow-inner">
              <button
                onClick={() => setActiveTab('inputs')}
                className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'inputs'
                  ? 'bg-white text-purple-700 shadow-xl border border-white/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                Input Parameters
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === 'results'
                  ? 'bg-white text-purple-700 shadow-xl border border-white/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                Results & Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 md:px-10 md:pb-10 lg:px-16 lg:pb-16 pt-0 scroll-smooth bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 border-t border-purple-200/30 -mt-px">
        <div className="w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8">
          {/* Print Layout - Always available for printing regardless of tab */}
          <div className="hidden print:block print-container">
            <div className="print-title">
              FirePulse - Financial Independence Report
              <br/>
              <span style={{fontSize: '12px', fontWeight: 'normal'}}>
                Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Summary Section */}
            <div className="print-section">
              <h3>Key Results</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem'}}>
                <div>
                  <strong>FIRE Age:</strong> {results.fiAge || 'Not reached'}
                  <br/>
                  <span style={{fontSize: '10px', color: '#666'}}>
                    {results.fiYear ? `Year: ${results.fiYear}` : 'No solution'}
                  </span>
                </div>
                <div>
                  <strong>Longevity Limit:</strong> Age {data.liveUntilAge}
                  <br/>
                  <span style={{fontSize: '10px', color: '#666'}}>
                    {results.isSolventAtEnd ? 'Portfolio solvent' : 'Portfolio exhausted'}
                  </span>
                </div>
                <div>
                  <strong>Savings Rate:</strong> {savingsRate.toFixed(1)}%
                  <br/>
                  <span style={{fontSize: '10px', color: '#666'}}>
                    {formatCurrency(data.monthlySavings, currency)}/month
                  </span>
                </div>
              </div>
            </div>

            {/* Asset Allocation */}
            <div className="print-section">
              <h3>Asset Allocation</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '10px'}}>
                <div><strong>Total Assets:</strong> {formatCurrency(currentAllocation.totalAssets, currency)}</div>
                <div><strong>Liquid Assets:</strong> {formatCurrency(data.currentNetWorth, currency)} ({currentAllocation.liquidPercentage.toFixed(1)}%)</div>
                <div><strong>Non-Liquid Assets:</strong> {formatCurrency(data.nonLiquidAssets, currency)} ({currentAllocation.nonLiquidPercentage.toFixed(1)}%)</div>
                <div><strong>Equity:</strong> {currentAllocation.equity}%</div>
                <div><strong>Debt:</strong> {currentAllocation.debt}%</div>
                <div><strong>Cash:</strong> {currentAllocation.cash}%</div>
              </div>
            </div>

            {/* Core Parameters */}
            <div className="print-section">
              <h3>Core Parameters</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '10px'}}>
                <div><strong>Current Age:</strong> {data.currentAge}</div>
                <div><strong>Retirement Age:</strong> {data.retirementAge}</div>
                <div><strong>Live Until Age:</strong> {data.liveUntilAge}</div>
                <div><strong>Net Worth:</strong> {formatCurrency(data.currentNetWorth, currency)}</div>
                <div><strong>Liquid Assets:</strong> {formatCurrency(data.currentNetWorth, currency)}</div>
                <div><strong>Non-Liquid Assets:</strong> {formatCurrency(data.nonLiquidAssets, currency)}</div>
              </div>
            </div>

            {/* Cash Flow Analysis */}
            <div className="print-section">
              <h3>Cash Flow Analysis</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '10px'}}>
                <div><strong>Monthly Income:</strong> {formatCurrency(data.monthlyIncome, currency)}</div>
                <div><strong>Monthly Living:</strong> {formatCurrency(data.monthlyExpenses, currency)}</div>
                <div><strong>Monthly Medical:</strong> {formatCurrency(data.monthlyMedical, currency)}</div>
                <div><strong>Monthly Surplus:</strong> {formatCurrency(data.monthlySavings, currency)}</div>
                <div><strong>Annual Income:</strong> {formatCurrency(data.monthlyIncome * 12, currency)}</div>
                <div><strong>Annual Expenses:</strong> {formatCurrency((data.monthlyExpenses + data.monthlyMedical) * 12, currency)}</div>
              </div>
            </div>

            {/* Investment Assumptions */}
            <div className="print-section">
              <h3>Investment Assumptions</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '10px'}}>
                <div><strong>Simulation Mode:</strong> {data.simulationMode}</div>
                <div><strong>Income Growth:</strong> {data.incomeIncreaseRate}%</div>
                <div><strong>Global Inflation:</strong> {data.inflationRate}%</div>
                <div><strong>Medical Inflation:</strong> {data.medicalInflation}%</div>
                <div><strong>Liquid Asset Return:</strong> {data.liquidAssetReturn}%</div>
                <div><strong>Non-Liquid Return:</strong> {data.nonLiquidAssetReturn}%</div>
                <div><strong>Retirement Expenses:</strong> {data.retirementExpenseMultiplier}%</div>
                <div><strong>Post-Retire Tax:</strong> {data.retirementTaxRate}%</div>
              </div>
            </div>

            {/* Projection Table */}
            <div className="print-section">
              <h3>Year-by-Year Financial Projection</h3>
              <div style={{fontSize: '9px', marginBottom: '0.5rem', fontStyle: 'italic'}}>
                Complete financial trajectory showing FIRE achievement and portfolio sustainability
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Age/Year</th>
                    <th>Start NW</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Returns</th>
                    <th>End NW</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.projections.map((p, index) => (
                    <tr key={`${p.age}-${p.year}`}>
                      <td>{p.age} ({p.year})</td>
                      <td>{formatCurrency(p.openingBalance, currency)}</td>
                      <td>+{formatCurrency(p.income, currency)}</td>
                      <td>-{formatCurrency(p.totalOutflow, currency)}</td>
                      <td>{p.returns > 0 ? '+' : ''}{formatCurrency(p.returns, currency)}</td>
                      <td><strong>{formatCurrency(p.netWorth, currency)}</strong></td>
                      <td>{p.isRetired ? 'RETIRED' : 'WORKING'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{fontSize: '9px', marginTop: '0.5rem', borderTop: '1px solid #d1d5db', paddingTop: '0.25rem'}}>
                <strong>Summary:</strong> FIRE achieved at age {results.fiAge || 'Not reached'} • Portfolio {results.isSolventAtEnd ? 'remains solvent' : 'exhausts'} by age {data.liveUntilAge}
              </div>
            </div>

            {/* Goals */}
            {data.goals.length > 0 && (
              <div className="print-section">
                <h3>Financial Goals Timeline</h3>
                {data.goals.map(goal => (
                  <div key={goal.id} style={{display: 'flex', justifyContent: 'space-between', padding: '0.25rem', borderBottom: '1px solid #e5e7eb', fontSize: '10px'}}>
                    <span><strong>{goal.name}</strong></span>
                    <span>Target Age: {goal.targetAge}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="print-footer">
              <div><strong>FirePulse - Financial Independence Calculator</strong></div>
              <div>Privacy-first calculation • No data stored • Results for informational purposes only</div>
            </div>
          </div>

          {/* CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 print:hidden">
            {activeTab === 'inputs' ? (
              <aside className="lg:col-span-12 space-y-6 md:space-y-8 print:hidden">
                <div className="bg-white/95 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/40 shadow-2xl shadow-purple-600/25 hover:shadow-3xl hover:shadow-purple-600/35 transition-all duration-500 space-y-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-[2rem] md:rounded-[3rem] pointer-events-none"></div>

                  {/* CORE STATS */}
                  <section className="space-y-6 md:space-y-8 p-6 md:p-8 rounded-[1.5rem] border border-purple-200/50 bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-purple-50/60 shadow-lg relative z-10">
                    <h3 className="text-[10px] md:text-xs font-black text-purple-700 uppercase tracking-[0.5em] flex items-center gap-3">
                      <span className="w-2 h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-600/40"></span> Core Stats
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
                  <section className="space-y-6 md:space-y-8 p-6 md:p-8 rounded-[1.5rem] border border-emerald-200/50 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-50/60 shadow-lg relative z-10">
                    <h3 className="text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-[0.5em] flex items-center gap-3">
                      <span className="w-2 h-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-lg shadow-emerald-600/40"></span> Income
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
                  <section className="space-y-6 md:space-y-8 p-6 md:p-8 rounded-[1.5rem] border border-amber-200/50 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-50/60 shadow-lg relative z-10">
                    <h3 className="text-[10px] md:text-xs font-black text-amber-700 uppercase tracking-[0.5em] flex items-center gap-3">
                      <span className="w-2 h-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full shadow-lg shadow-amber-600/40"></span> Estimates
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
              <div className="lg:col-span-12 space-y-6 md:space-y-8">

                {/* TOP ROW: ALLOCATION & VISUAL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                  {/* ASSET ALLOCATION DISPLAY */}
                  <div className="bg-white/95 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/40 shadow-2xl shadow-purple-600/25 hover:shadow-3xl hover:shadow-purple-600/35 transition-all duration-500 h-full relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-[2rem] md:rounded-[3rem] pointer-events-none"></div>
                    <h2 className="text-[10px] md:text-xs font-black text-purple-700 uppercase tracking-[0.4em] italic mb-8 md:mb-10 relative z-10">Asset Allocation</h2>

                    {/* Total Assets Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10 relative z-10">
                      <div className="bg-gradient-to-br from-purple-100/90 to-pink-100/70 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-purple-200/50 shadow-lg">
                        <p className="text-[9px] md:text-xs font-black text-purple-700 uppercase tracking-[0.2em] mb-3">Total Assets</p>
                        <h3 className="text-xl md:text-2xl font-black text-purple-900 tracking-tighter">{formatCurrencyCompact(currentAllocation.totalAssets, currency)}</h3>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-100/90 to-teal-100/70 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-emerald-200/50 shadow-lg">
                        <p className="text-[9px] md:text-xs font-black text-emerald-700 uppercase tracking-[0.2em] mb-3">Liquid</p>
                        <h3 className="text-xl md:text-2xl font-black text-emerald-900 tracking-tighter">{formatCurrencyCompact(data.currentNetWorth, currency)}</h3>
                        <p className="text-[9px] font-bold text-emerald-600 mt-2">{currentAllocation.liquidPercentage.toFixed(1)}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-100/90 to-orange-100/70 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-amber-200/50 shadow-lg">
                        <p className="text-[9px] md:text-xs font-black text-amber-700 uppercase tracking-[0.2em] mb-3">Non-Liquid</p>
                        <h3 className="text-xl md:text-2xl font-black text-amber-900 tracking-tighter">{formatCurrencyCompact(data.nonLiquidAssets, currency)}</h3>
                        <p className="text-[9px] font-bold text-amber-600 mt-2">{currentAllocation.nonLiquidPercentage.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Liquid Asset Allocation */}
                    <div className="space-y-6">
                      <h3 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Liquid Split</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {/* Equity Allocation */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-blue-100/60 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/20 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative z-10">
                            <p className="text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Equity</p>
                            <h4 className="text-2xl md:text-3xl font-black text-blue-900">{currentAllocation.equity}%</h4>
                            <div className="mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000" style={{ width: `${currentAllocation.equity}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Debt Allocation */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-green-100/60 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/20 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative z-10">
                            <p className="text-[10px] md:text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-2">Debt</p>
                            <h4 className="text-2xl md:text-3xl font-black text-green-900">{currentAllocation.debt}%</h4>
                            <div className="mt-4 h-2 bg-green-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000" style={{ width: `${currentAllocation.debt}%` }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Cash Allocation */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100/60 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gray-200/20 rounded-full -mr-10 -mt-10"></div>
                          <div className="relative z-10">
                            <p className="text-[10px] md:text-xs font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Cash</p>
                            <h4 className="text-2xl md:text-3xl font-black text-gray-900">{currentAllocation.cash}%</h4>
                            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-gray-500 to-gray-600 transition-all duration-1000" style={{ width: `${currentAllocation.cash}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VISUAL CHART & MILESTONES */}
                  <div className="bg-white/95 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/40 shadow-2xl shadow-purple-600/25 hover:shadow-3xl hover:shadow-purple-600/35 transition-all duration-500 h-full flex flex-col relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 rounded-[2rem] md:rounded-[3rem] pointer-events-none"></div>
                    
                    {/* Simulation Controls */}
                    <div className="bg-gradient-to-r from-purple-600/95 via-pink-600/95 to-purple-700/95 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-3 md:p-4 mb-6 relative z-10">
                      <div className="grid grid-cols-4 gap-3 md:gap-4">
                        {strategies.map((strat) => (
                          <button
                            key={strat.id}
                            onClick={() => updateData('simulationMode', strat.id)}
                            className={`px-3 py-2.5 rounded-lg text-[9px] md:text-xs font-black uppercase tracking-widest transition-all border-2 ${data.simulationMode === strat.id
                              ? 'bg-gradient-to-r from-white to-white/90 text-purple-700 border-white shadow-lg shadow-white/30 scale-105'
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
                <div className="bg-white/95 backdrop-blur-sm p-10 md:p-14 rounded-[2.5rem] md:rounded-[4rem] border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 md:mb-14 gap-6 relative z-10">
                    <h2 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.4em] italic leading-tight">Solvency Ledger</h2>
                  </div>

                  <div className="overflow-x-auto rounded-[2rem] md:rounded-[3rem] border border-slate-100/60 custom-scrollbar relative z-10 bg-white/50 backdrop-blur-sm">
                    <table className="w-full text-left text-[11px] md:text-sm font-mono min-w-[600px]">
                      <thead className="bg-gradient-to-b from-slate-50 to-slate-100/50 border-b border-slate-200/60 sticky top-0 z-20">
                        <tr>
                          <th className="px-4 py-4 md:px-6 md:py-6 font-black uppercase text-slate-500 tracking-wider">Age/Year</th>
                          <th className="px-4 py-4 md:px-6 md:py-6 font-black uppercase text-slate-500 text-right tracking-wider">Start NW</th>
                          <th className="px-4 py-4 md:px-6 md:py-6 font-black uppercase text-emerald-600 tracking-wider">In / Out Breakdown</th>
                          <th className="px-4 py-4 md:px-6 md:py-6 font-black uppercase text-indigo-500 text-right tracking-wider">Returns</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60">
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
                            <tr key={`${p.age}-${p.year}`} className={`group transition-all hover:bg-slate-50/60 ${p.isRetired ? 'bg-gradient-to-r from-teal-50/40 to-teal-50/20 text-teal-800' : ''}`}>
                              <td className="px-4 py-4 md:px-6 md:py-6 font-black text-sm md:text-base whitespace-nowrap">
                                {p.age} <span className="text-[10px] font-bold opacity-40 ml-1">{p.year}</span>
                              </td>
                              <td className="px-4 py-4 md:px-6 md:py-6 opacity-60 font-medium text-right">{formatCompactNumber(p.openingBalance, currency)}</td>
                              <td className="px-4 py-4 md:px-6 md:py-6 relative">
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
                              <td className="px-4 py-4 md:px-6 md:py-6 text-right relative">
                                <div className="relative group/returns cursor-help">
                                  <div className={`font-bold ${p.returns >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
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
