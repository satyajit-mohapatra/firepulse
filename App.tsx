
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialData, CalculationResults, CurrencyCode, Milestone, InvestmentGoal } from './types';
import { calculateFIRE, formatCurrency, formatCurrencyCompact, getCurrencySymbol, formatCompactNumber, getAgeBasedAllocation, currencies } from './utils/finance';
import SliderInput from './components/SliderInput';
import ProjectionChart from './components/ProjectionChart';
import { WizardProvider } from './contexts/WizardContext';
import WizardContainer from './components/wizard/WizardContainer';
import Phase3International from './components/wizard/Phase3International';



const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple');
  const [data, setData] = useState<FinancialData>({
    currentAge: 44,
    retirementAge: 55,
    liveUntilAge: 90,
    currentNetWorth: 100000, // Liquid assets
    retirementAssets: 200000, // 401k, IRA, retirement accounts
    nonLiquidAssets: 100000, // Real estate, business equity
    monthlyIncome: 6000,
    monthlySavings: 2400,
    annualBonus: 0,
    incomeIncreaseRate: 5,
    expenseIncreaseRate: 3,
    retirementExpenseMultiplier: 85,
    monthlyExpenses: 3100,
    monthlyMedical: 500,
    monthlyKidsEducation: 0,
    medicalInflation: 15,
    annualExpenses: 60000,
    swpAmount: 5000,
    retirementTaxRate: 24,
    liquidAssetReturn: 12,
    retirementAssetReturn: 10, // Higher returns, typically stock-heavy portfolios
    nonLiquidAssetReturn: 5, // Real estate appreciation
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<{ data: Partial<FinancialData>, errors: string[], source: 'csv' | 'json' } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const results = useMemo(() => calculateFIRE(data), [data]);

  // Calculate current asset allocation
  const currentAllocation = useMemo(() => {
    const allocation = getAgeBasedAllocation(data.currentAge, data.retirementAge);
    const totalAssets = data.currentNetWorth + data.retirementAssets + data.nonLiquidAssets;
    const liquidPercentage = totalAssets > 0 ? (data.currentNetWorth / totalAssets) * 100 : 0;
    const retirementPercentage = totalAssets > 0 ? (data.retirementAssets / totalAssets) * 100 : 0;
    const nonLiquidPercentage = totalAssets > 0 ? (data.nonLiquidAssets / totalAssets) * 100 : 0;

    return {
      ...allocation,
      liquidPercentage,
      retirementPercentage,
      nonLiquidPercentage,
      totalAssets
    };
  }, [data.currentAge, data.retirementAge, data.currentNetWorth, data.retirementAssets, data.nonLiquidAssets]);

  const updateData = (key: keyof FinancialData, value: any) => {
    setData(prev => {
      const newData = { ...prev, [key]: value };
      if (key === 'monthlyIncome' || key === 'monthlyExpenses' || key === 'monthlyMedical' || key === 'monthlyKidsEducation') {
        newData.monthlySavings = Math.max(0, newData.monthlyIncome - (newData.monthlyExpenses + newData.monthlyMedical + newData.monthlyKidsEducation));
      } else if (key === 'monthlySavings') {
        newData.monthlyIncome = newData.monthlySavings + newData.monthlyExpenses + newData.monthlyMedical + newData.monthlyKidsEducation;
      }
      return newData;
    });
  };

  // Toast helper function
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const exportToCSV = () => {
    const csvData = [
      ['# FirePulse Export', '', ''],
      ['# Generated', new Date().toISOString(), ''],
      ['# Version', '1.0', ''],
      ['', '', ''],
      ['Parameter', 'Value', 'Category'],
      ['Current Age', data.currentAge.toString(), 'Core Stats'],
      ['Retirement Age', data.retirementAge.toString(), 'Core Stats'],
      ['Live Until Age', data.liveUntilAge.toString(), 'Core Stats'],
      ['Current Net Worth', data.currentNetWorth.toString(), 'Assets - Liquid'],
      ['Retirement Assets', data.retirementAssets.toString(), 'Assets - Retirement'],
      ['Non-Liquid Assets', data.nonLiquidAssets.toString(), 'Assets - Non-Liquid'],
      ['Monthly Income', data.monthlyIncome.toString(), 'Income'],
      ['Monthly Expenses', data.monthlyExpenses.toString(), 'Income'],
      ['Monthly Medical', data.monthlyMedical.toString(), 'Income'],
      ['Monthly Kids Education', data.monthlyKidsEducation.toString(), 'Income'],
      ['Monthly Savings', data.monthlySavings.toString(), 'Income'],
      ['Annual Bonus', data.annualBonus.toString(), 'Income'],
      ['Income Increase Rate', data.incomeIncreaseRate.toString(), 'Estimates'],
      ['Expense Increase Rate', data.expenseIncreaseRate.toString(), 'Estimates'],
      ['Retirement Expense Multiplier', data.retirementExpenseMultiplier.toString(), 'Estimates'],
      ['Annual Expenses', data.annualExpenses.toString(), 'Estimates'],
      ['SWP Amount', data.swpAmount.toString(), 'Estimates'],
      ['Retirement Tax Rate', data.retirementTaxRate.toString(), 'Estimates'],
      ['Liquid Asset Return', data.liquidAssetReturn.toString(), 'Returns'],
      ['Retirement Asset Return', data.retirementAssetReturn.toString(), 'Returns'],
      ['Non-Liquid Asset Return', data.nonLiquidAssetReturn.toString(), 'Returns'],
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
    link.download = `firepulse-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showToast('success', 'Successfully exported to CSV!');
  };

  const exportToJSON = () => {
    const exportData = {
      metadata: {
        application: 'FirePulse',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        exportType: 'full'
      },
      settings: {
        currency,
        viewMode
      },
      financialData: data,
      calculatedResults: {
        fiAge: results.fiAge,
        fiYear: results.fiYear,
        fiNumber: results.fiNumber,
        timeToFI: results.timeToFI,
        isSolventAtEnd: results.isSolventAtEnd,
        safeWithdrawalAmount: results.safeWithdrawalAmount
      }
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firepulse-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    showToast('success', 'Successfully exported to JSON!');
  };

  const exportToPDF = () => {
    setShowExportMenu(false);
    showToast('info', 'Opening print dialog for PDF export...');
    setTimeout(() => window.print(), 300);
  };

  // Parse and validate CSV data
  const parseCSVData = (text: string): { data: Partial<FinancialData>, errors: string[], fieldCount: number } => {
    const lines = text.split('\n');
    const newData: Partial<FinancialData> = {};
    const errors: string[] = [];
    let fieldCount = 0;

    lines.forEach((line, index) => {
      if (!line.trim() || line.startsWith('#') || line.startsWith('"#')) return;

      const [parameter, value] = line.split(',').map(cell => cell.replace(/"/g, '').trim());

      if (parameter === 'Parameter') return; // Skip header

      try {
        switch (parameter) {
          case 'Current Age':
            const age = parseInt(value);
            if (age < 18 || age > 100) errors.push(`Current Age ${value} is out of range (18-100)`);
            else { newData.currentAge = age; fieldCount++; }
            break;
          case 'Retirement Age':
            const retAge = parseInt(value);
            if (retAge < 30 || retAge > 100) errors.push(`Retirement Age ${value} is out of range (30-100)`);
            else { newData.retirementAge = retAge; fieldCount++; }
            break;
          case 'Live Until Age':
            const liveAge = parseInt(value);
            if (liveAge < 50 || liveAge > 120) errors.push(`Live Until Age ${value} is out of range (50-120)`);
            else { newData.liveUntilAge = liveAge; fieldCount++; }
            break;
          case 'Current Net Worth':
            newData.currentNetWorth = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Retirement Assets':
            newData.retirementAssets = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Non-Liquid Assets':
            newData.nonLiquidAssets = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Monthly Income':
            newData.monthlyIncome = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Monthly Expenses':
            newData.monthlyExpenses = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Monthly Medical':
            newData.monthlyMedical = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Monthly Kids Education':
            newData.monthlyKidsEducation = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Monthly Savings':
            newData.monthlySavings = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Annual Bonus':
            newData.annualBonus = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Income Increase Rate':
            newData.incomeIncreaseRate = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Expense Increase Rate':
            newData.expenseIncreaseRate = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Retirement Expense Multiplier':
            newData.retirementExpenseMultiplier = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Annual Expenses':
            newData.annualExpenses = parseFloat(value) || 0; fieldCount++;
            break;
          case 'SWP Amount':
            newData.swpAmount = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Retirement Tax Rate':
            newData.retirementTaxRate = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Liquid Asset Return':
            newData.liquidAssetReturn = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Retirement Asset Return':
            newData.retirementAssetReturn = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Non-Liquid Asset Return':
            newData.nonLiquidAssetReturn = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Inflation Rate':
            newData.inflationRate = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Withdrawal Rate':
            newData.withdrawalRate = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Medical Inflation':
            newData.medicalInflation = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Future Income':
            newData.futureIncome = parseFloat(value) || 0; fieldCount++;
            break;
          case 'Future Income Start Age':
            newData.futureIncomeStartAge = parseInt(value) || 65; fieldCount++;
            break;
          case 'Simulation Mode':
            if (['leaner', 'conservative', 'crash', 'aggressive'].includes(value)) {
              newData.simulationMode = value as FinancialData['simulationMode']; fieldCount++;
            } else {
              errors.push(`Invalid Simulation Mode: ${value}`);
            }
            break;
          case 'Withdrawal Strategy':
            if (['fixed', 'variable'].includes(value)) {
              newData.withdrawalStrategy = value as FinancialData['withdrawalStrategy']; fieldCount++;
            } else {
              errors.push(`Invalid Withdrawal Strategy: ${value}`);
            }
            break;
        }
      } catch (err) {
        errors.push(`Error parsing ${parameter}: ${value}`);
      }
    });

    return { data: newData, errors, fieldCount };
  };

  // Parse and validate JSON data
  const parseJSONData = (text: string): { data: Partial<FinancialData>, errors: string[], currency?: CurrencyCode } => {
    const errors: string[] = [];

    try {
      const parsed = JSON.parse(text);

      // Check if it's a FirePulse export
      if (parsed.metadata?.application === 'FirePulse' && parsed.financialData) {
        return {
          data: parsed.financialData,
          errors: [],
          currency: parsed.settings?.currency
        };
      }

      // Try to interpret as raw financial data
      if (parsed.currentAge !== undefined || parsed.monthlyIncome !== undefined) {
        return { data: parsed, errors: [] };
      }

      errors.push('JSON file does not contain recognizable FirePulse data');
      return { data: {}, errors };
    } catch (err) {
      errors.push('Invalid JSON format');
      return { data: {}, errors };
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const isJSON = file.name.endsWith('.json') || text.trim().startsWith('{');

      if (isJSON) {
        const result = parseJSONData(text);
        if (result.errors.length === 0 && Object.keys(result.data).length > 0) {
          setImportPreview({ data: result.data, errors: [], source: 'json' });
          if (result.currency) {
            // Store currency in preview for later application
            (result.data as any)._importCurrency = result.currency;
          }
          setShowImportModal(true);
        } else {
          showToast('error', result.errors.join(', ') || 'Failed to parse JSON file');
        }
      } else {
        const result = parseCSVData(text);
        if (result.fieldCount > 0) {
          setImportPreview({ data: result.data, errors: result.errors, source: 'csv' });
          setShowImportModal(true);
        } else {
          showToast('error', 'No valid data found in CSV file');
        }
      }
    };

    reader.onerror = () => {
      showToast('error', 'Failed to read file');
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const applyImportedData = () => {
    if (!importPreview) return;

    const newData = { ...data, ...importPreview.data };

    // Apply currency if present
    if ((importPreview.data as any)._importCurrency) {
      setCurrency((importPreview.data as any)._importCurrency);
      delete (newData as any)._importCurrency;
    }

    setData(newData);
    setShowImportModal(false);
    setImportPreview(null);
    showToast('success', `Successfully imported ${Object.keys(importPreview.data).length} fields from ${importPreview.source.toUpperCase()}!`);
  };

  const cancelImport = () => {
    setShowImportModal(false);
    setImportPreview(null);
  };




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
    <WizardProvider>
      <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden transition-colors duration-500">
        {/* FIXED TOP SECTION */}
        <div className="flex-none bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 z-50 border-b border-white/20 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10 pt-2 sm:pt-3 md:pt-4 lg:pt-6 pb-2 sm:pb-3 md:pb-4 space-y-2 sm:space-y-3 md:space-y-4">
            {/* HEADER */}
            <header className="flex flex-col lg:flex-row justify-between items-center gap-2 sm:gap-3 lg:gap-8 print:hidden">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 lg:gap-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-14 lg:w-16 lg:h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl shadow-black/20 ring-2 ring-white/30 backdrop-blur-sm border border-white/20">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:w-8 lg:w-10 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div className="text-center lg:text-left">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-black tracking-tighter text-white leading-none italic uppercase bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-lg">FirePulse</h1>
                  <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[11px] font-black text-white/80 uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] mt-1 sm:mt-1.5 md:mt-2 bg-gradient-to-r from-white/60 to-white/40 bg-clip-text text-transparent">Longevity Strategy Engine</p>
                </div>
              </div>

              {/* VIEW SWITCHER */}
              <div className="hidden md:flex bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/20 print:hidden shadow-inner">
                <button
                  onClick={() => setViewMode('simple')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${viewMode === 'simple'
                    ? 'bg-white text-indigo-700 shadow-md transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setViewMode('advanced')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${viewMode === 'advanced'
                    ? 'bg-white text-indigo-700 shadow-md transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  Advanced
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 lg:gap-4 w-full lg:w-auto">

                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 sm:gap-2 lg:gap-4 w-full sm:w-auto">
                  {/* Export Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 lg:px-5 lg:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400/50 rounded-lg sm:rounded-xl lg:rounded-2xl text-[10px] sm:text-xs font-bold text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 print:hidden"
                      title="Export data"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">Export</span>
                      <span className="sm:hidden">📥</span>
                      <svg className="w-2 h-2 sm:w-3 sm:h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showExportMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 min-w-[160px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button
                            onClick={exportToCSV}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors"
                          >
                            <span className="text-lg">📊</span>
                            <div>
                              <div className="font-semibold">CSV Format</div>
                              <div className="text-xs text-slate-400">Spreadsheet compatible</div>
                            </div>
                          </button>
                          <button
                            onClick={exportToJSON}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors"
                          >
                            <span className="text-lg">📋</span>
                            <div>
                              <div className="font-semibold">JSON Format</div>
                              <div className="text-xs text-slate-400">Full data with metadata</div>
                            </div>
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                          <button
                            onClick={exportToPDF}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-3 transition-colors"
                          >
                            <span className="text-lg">📄</span>
                            <div>
                              <div className="font-semibold">PDF Report</div>
                              <div className="text-xs text-slate-400">Print-ready document</div>
                            </div>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Import Button */}
                  <label className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 lg:px-5 lg:py-3 bg-gradient-to-r from-white/20 to-white/10 border border-white/30 rounded-lg sm:rounded-xl lg:rounded-2xl text-[10px] sm:text-xs font-bold text-white hover:from-white/30 hover:to-white/20 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer print:hidden backdrop-blur-md">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="hidden sm:inline">Import</span>
                    <span className="sm:hidden">📤</span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>

                  {/* Print Button */}
                  <button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 lg:px-5 lg:py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg sm:rounded-xl lg:rounded-2xl text-[10px] sm:text-xs font-bold text-white hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 print:hidden"
                    title="Print or Save as PDF"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span className="hidden sm:inline">Print</span>
                    <span className="sm:hidden">🖨️</span>
                  </button>
                </div>
              </div>
            </header>
          </div>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 md:px-10 md:pb-10 lg:px-16 lg:pb-16 pt-0 scroll-smooth bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 border-t border-purple-200/30 -mt-px">
          <div className="w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8">
            {/* Print Layout - Always available for printing regardless of tab */}
            <div className="hidden print:block print-container">
              {/* Enhanced Print Header */}
              <div className="print-title" style={{ borderBottom: '3px solid #4f46e5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>🔥 FirePulse</span>
                    <span style={{ fontSize: '14px', fontWeight: 400, marginLeft: '12px', color: '#6366f1' }}>
                      Financial Independence Report
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
                    <div>Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</div>
                    <div>Mode: {viewMode === 'simple' ? 'Simple Calculator' : 'Advanced International Planning'}</div>
                  </div>
                </div>
              </div>

              {/* Executive Summary - Hero Section */}
              <div className="print-section" style={{ backgroundColor: '#f8fafc', border: '2px solid #e2e8f0' }}>
                <h3 style={{ color: '#4f46e5', marginBottom: '12px' }}>📊 Executive Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: results.fiAge ? '#10b981' : '#ef4444' }}>
                      {results.fiAge || '—'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>FIRE Age</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#6366f1' }}>
                      {results.timeToFI ? `${results.timeToFI}y` : '—'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Time to FI</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: '#8b5cf6' }}>
                      {savingsRate.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Savings Rate</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: results.isSolventAtEnd ? '#10b981' : '#ef4444' }}>
                      {results.isSolventAtEnd ? '✓' : '✗'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Solvent at {data.liveUntilAge}</div>
                  </div>
                </div>

                {/* Key Insights */}
                <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '6px', fontSize: '10px' }}>
                  <strong style={{ color: '#1d4ed8' }}>Key Insights:</strong>
                  <ul style={{ margin: '6px 0 0 16px', padding: 0, color: '#374151' }}>
                    <li>FI Number Target: {formatCurrency(results.fiNumber, currency)} (25x annual expenses)</li>
                    <li>Safe Withdrawal Amount: {formatCurrency(results.safeWithdrawalAmount, currency)}/year at {data.withdrawalRate}% rate</li>
                    <li>Total Current Assets: {formatCurrency(currentAllocation.totalAssets, currency)} ({((currentAllocation.totalAssets / results.fiNumber) * 100).toFixed(1)}% of FI target)</li>
                    {results.fiAge && <li>Years of freedom after FIRE: {data.liveUntilAge - results.fiAge} years</li>}
                  </ul>
                </div>
              </div>

              {/* Asset Allocation */}
              <div className="print-section">
                <h3>Asset Allocation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '10px' }}>
                  <div><strong>Total Assets:</strong> {formatCurrency(currentAllocation.totalAssets, currency)}</div>
                  <div><strong>Liquid Assets:</strong> {formatCurrency(data.currentNetWorth, currency)} ({currentAllocation.liquidPercentage.toFixed(1)}%)</div>
                  <div><strong>Retirement (401k/IRA):</strong> {formatCurrency(data.retirementAssets, currency)} ({currentAllocation.retirementPercentage.toFixed(1)}%)</div>
                  <div><strong>Real Estate:</strong> {formatCurrency(data.nonLiquidAssets, currency)} ({currentAllocation.nonLiquidPercentage.toFixed(1)}%)</div>
                </div>
              </div>

              {/* Core Parameters */}
              <div className="print-section">
                <h3>Core Parameters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '10px' }}>
                  <div><strong>Current Age:</strong> {data.currentAge}</div>
                  <div><strong>Retirement Age:</strong> {data.retirementAge}</div>
                  <div><strong>Live Until Age:</strong> {data.liveUntilAge}</div>
                  <div><strong>Liquid Assets:</strong> {formatCurrency(data.currentNetWorth, currency)}</div>
                  <div><strong>Retirement Assets:</strong> {formatCurrency(data.retirementAssets, currency)}</div>
                  <div><strong>Real Estate:</strong> {formatCurrency(data.nonLiquidAssets, currency)}</div>
                </div>
              </div>

              {/* Cash Flow Analysis */}
              <div className="print-section">
                <h3>Cash Flow Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '10px' }}>
                  <div><strong>Monthly Income:</strong> {formatCurrency(data.monthlyIncome, currency)}</div>
                  <div><strong>Monthly Living:</strong> {formatCurrency(data.monthlyExpenses, currency)}</div>
                  <div><strong>Monthly Medical:</strong> {formatCurrency(data.monthlyMedical, currency)}</div>
                  <div><strong>Monthly Kids Education:</strong> {formatCurrency(data.monthlyKidsEducation, currency)}</div>
                  <div><strong>Monthly Surplus:</strong> {formatCurrency(data.monthlySavings, currency)}</div>
                  <div><strong>Annual Income:</strong> {formatCurrency(data.monthlyIncome * 12, currency)}</div>
                  <div><strong>Annual Expenses:</strong> {formatCurrency((data.monthlyExpenses + data.monthlyMedical + data.monthlyKidsEducation) * 12, currency)}</div>
                </div>
              </div>

              {/* Investment Assumptions */}
              <div className="print-section">
                <h3>Investment Assumptions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '10px' }}>
                  <div><strong>Simulation Mode:</strong> {data.simulationMode}</div>
                  <div><strong>Income Growth:</strong> {data.incomeIncreaseRate}%</div>
                  <div><strong>Global Inflation:</strong> {data.inflationRate}%</div>
                  <div><strong>Medical Inflation:</strong> {data.medicalInflation}%</div>
                  <div><strong>Liquid Asset Return:</strong> {data.liquidAssetReturn}%</div>
                  <div><strong>Retirement Return:</strong> {data.retirementAssetReturn}%</div>
                  <div><strong>Real Estate Return:</strong> {data.nonLiquidAssetReturn}%</div>
                  <div><strong>Retirement Expenses:</strong> {data.retirementExpenseMultiplier}%</div>
                  <div><strong>Post-Retire Tax:</strong> {data.retirementTaxRate}%</div>
                </div>
              </div>

              {/* Projection Table */}
              <div className="print-section">
                <h3>Year-by-Year Financial Projection</h3>
                <div style={{ fontSize: '9px', marginBottom: '0.5rem', fontStyle: 'italic' }}>
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
                <div style={{ fontSize: '9px', marginTop: '0.5rem', borderTop: '1px solid #d1d5db', paddingTop: '0.25rem' }}>
                  <strong>Summary:</strong> FIRE achieved at age {results.fiAge || 'Not reached'} • Portfolio {results.isSolventAtEnd ? 'remains solvent' : 'exhausts'} by age {data.liveUntilAge}
                </div>
              </div>

              {/* Goals */}
              {data.goals.length > 0 && (
                <div className="print-section">
                  <h3>Financial Goals Timeline</h3>
                  {data.goals.map(goal => (
                    <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem', borderBottom: '1px solid #e5e7eb', fontSize: '10px' }}>
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

            {/* WIZARD CONTENT AREA */}
            <div className="flex-1 flex flex-col min-h-0 print:hidden">
              {viewMode === 'simple' ? (
                <WizardContainer
                  data={data}
                  results={results}
                  currency={currency}
                  currencySymbol={currencySymbol}
                  updateData={updateData}
                  currentAllocation={currentAllocation}
                  savingsRate={savingsRate}
                  longevityTooltip={longevityTooltip}
                  setCurrency={setCurrency}
                />
              ) : (
                <div className="overflow-hidden rounded-xl">
                  <Phase3International data={data} currency={currency} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportModal && importPreview && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">{importPreview.source === 'json' ? '📋' : '📊'}</span>
                Import Preview - {importPreview.source.toUpperCase()}
              </h3>
              <p className="text-white/70 text-sm mt-1">Review the data before applying</p>
            </div>

            <div className="px-6 py-4 overflow-y-auto max-h-[50vh]">
              {importPreview.errors.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 text-sm mb-1 flex items-center gap-2">
                    <span>⚠️</span> Validation Warnings
                  </h4>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {importPreview.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold text-slate-700 text-sm">Data to Import ({Object.keys(importPreview.data).length} fields)</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(importPreview.data)
                    .filter(([key]) => !key.startsWith('_'))
                    .slice(0, 20)
                    .map(([key, value]) => (
                      <div key={key} className="bg-slate-50 rounded-lg px-3 py-2 flex justify-between items-center">
                        <span className="text-slate-500 truncate">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-mono font-semibold text-indigo-600 ml-2">
                          {typeof value === 'number' ? value.toLocaleString() : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
                {Object.keys(importPreview.data).length > 20 && (
                  <p className="text-xs text-slate-400 text-center mt-2">
                    +{Object.keys(importPreview.data).length - 20} more fields
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={cancelImport}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyImportedData}
                className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>✓</span> Apply Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${toastMessage.type === 'success'
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
          : toastMessage.type === 'error'
            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
          }`}>
          <span className="text-xl">
            {toastMessage.type === 'success' ? '✅' : toastMessage.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="font-semibold text-sm">{toastMessage.message}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </WizardProvider>
  );
};

export default App;
