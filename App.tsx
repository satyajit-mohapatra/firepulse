
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialData, CalculationResults, CurrencyCode, Milestone, InvestmentGoal } from './types';
import { calculateFIRE, formatCurrency, formatCurrencyCompact, getCurrencySymbol, formatCompactNumber, getAgeBasedAllocation, currencies } from './utils/finance';
import SliderInput from './components/SliderInput';
import ProjectionChart from './components/ProjectionChart';
import { WizardProvider } from './contexts/WizardContext';
import WizardContainer from './components/wizard/WizardContainer';
import Phase3International from './components/wizard/Phase3International';
import FAQ from './components/FAQ';
import ThemeToggle from './components/ThemeToggle';
import { InternationalScenario, ScenarioResults } from './types/internationalPlanning';
import { calculateInternationalScenario, createDefaultScenario } from './utils/internationalCalculations';
import { useWizardPersistence } from './hooks/useWizardPersistence';


const DEFAULT_FINANCIAL_DATA: FinancialData = {
  // Primary Person
  currentAge: 44,
  retirementAge: 55,
  liveUntilAge: 90,
  monthlyIncome: 6000,
  incomeIncreaseRate: 5,
  annualBonus: 0,

  // Spouse (disabled by default)
  spouse: {
    enabled: false,
    currentAge: 42,
    retirementAge: 55,
    liveUntilAge: 92,
    monthlyIncome: 4000,
    incomeIncreaseRate: 5,
    annualBonus: 0,
  },

  // Family Assets (shared)
  currentNetWorth: 100000, // Liquid assets
  retirementAssets: 200000, // 401k, IRA, retirement accounts
  nonLiquidAssets: 100000, // Real estate, business equity

  // Family Expenses
  monthlySavings: 2400,
  expenseIncreaseRate: 3,
  retirementExpenseMultiplier: 85,
  monthlyExpenses: 3100,
  monthlyMedical: 500,
  monthlyKidsEducation: 0,
  medicalInflation: 15,
  annualExpenses: 60000,
  swpAmount: 5000,
  retirementTaxRate: 24,

  // Investment Returns
  liquidAssetReturn: 12,
  retirementAssetReturn: 10, // Higher returns, typically stock-heavy portfolios
  nonLiquidAssetReturn: 5, // Real estate appreciation
  inflationRate: 8,
  withdrawalRate: 4,

  // Future Income
  futureIncome: 0,
  futureIncomeStartAge: 65,

  // Simulation Settings
  simulationMode: 'leaner',
  withdrawalStrategy: 'fixed',
  goals: [],
  bulkExpenses: []
};

const App: React.FC = () => {
  const { loadState } = useWizardPersistence();
  const persistedState = useMemo(() => loadState(), [loadState]);

  const [viewMode, setViewMode] = useState<'simple' | 'advanced'>(
    persistedState?.uiMode === 'advanced' ? 'advanced' : 'simple'
  );
  const [data, setData] = useState<FinancialData>(persistedState?.data || DEFAULT_FINANCIAL_DATA);

  const [currency, setCurrency] = useState<CurrencyCode>(persistedState?.currency || 'USD');
  const [showLedger, setShowLedger] = useState(false);
  const [showLongevityTable, setShowLongevityTable] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [importPreview, setImportPreview] = useState<{ data: Partial<FinancialData>, errors: string[], source: 'csv' | 'json' } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  // International Planning State
  const [uiMode, setUiMode] = useState<'basic' | 'advanced'>(persistedState?.uiMode || 'basic');
  const [internationalScenario, setInternationalScenario] = useState<InternationalScenario>(persistedState?.internationalScenario || (() => createDefaultScenario('work-retire')));

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);
  const results = useMemo(() => calculateFIRE(data), [data]);
  const internationalResults = useMemo(() => calculateInternationalScenario(internationalScenario, data.simulationMode), [internationalScenario, data.simulationMode]);

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
      // Calculate total family income (primary + spouse if enabled)
      const totalFamilyIncome = newData.monthlyIncome + (newData.spouse.enabled ? newData.spouse.monthlyIncome : 0);

      if (key === 'monthlyIncome' || key === 'monthlyExpenses' || key === 'monthlyMedical' || key === 'monthlyKidsEducation') {
        newData.monthlySavings = Math.max(0, totalFamilyIncome - (newData.monthlyExpenses + newData.monthlyMedical + newData.monthlyKidsEducation));
      } else if (key === 'monthlySavings') {
        // When adjusting savings, adjust primary income
        newData.monthlyIncome = newData.monthlySavings + newData.monthlyExpenses + newData.monthlyMedical + newData.monthlyKidsEducation - (newData.spouse.enabled ? newData.spouse.monthlyIncome : 0);
      }
      return newData;
    });
  };

  // Update spouse data helper
  const updateSpouseData = (key: keyof FinancialData['spouse'], value: any) => {
    setData(prev => {
      const newSpouse = { ...prev.spouse, [key]: value };
      let newData = { ...prev, spouse: newSpouse };

      // Recalculate family savings when spouse enabled/income changes
      if (key === 'enabled' || key === 'monthlyIncome') {
        const totalFamilyIncome = newData.monthlyIncome + (newSpouse.enabled ? newSpouse.monthlyIncome : 0);
        newData.monthlySavings = Math.max(0, totalFamilyIncome - (newData.monthlyExpenses + newData.monthlyMedical + newData.monthlyKidsEducation));
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
        viewMode,
        uiMode
      },
      financialData: data,
      internationalScenario: internationalScenario,
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
  const parseJSONData = (text: string): {
    data: Partial<FinancialData>,
    errors: string[],
    currency?: CurrencyCode,
    internationalScenario?: InternationalScenario,
    uiMode?: 'basic' | 'advanced'
  } => {
    const errors: string[] = [];

    try {
      const parsed = JSON.parse(text);

      // Check if it's a FirePulse export
      if (parsed.metadata?.application === 'FirePulse' && parsed.financialData) {
        return {
          data: parsed.financialData,
          internationalScenario: parsed.internationalScenario,
          uiMode: parsed.settings?.uiMode,
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
          if (result.internationalScenario) {
            (result.data as any)._importScenario = result.internationalScenario;
          }
          if (result.uiMode) {
            (result.data as any)._importUiMode = result.uiMode;
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

    // Apply international scenario if present
    if ((importPreview.data as any)._importScenario) {
      setInternationalScenario((importPreview.data as any)._importScenario);
      delete (newData as any)._importScenario;
    }

    // Apply UI mode if present
    if ((importPreview.data as any)._importUiMode) {
      setUiMode((importPreview.data as any)._importUiMode);
      // Also update viewMode if appropriate
      setViewMode((importPreview.data as any)._importUiMode === 'advanced' ? 'advanced' : 'simple');
      delete (newData as any)._importUiMode;
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
    <WizardProvider initialStep={persistedState?.step as any}>
      <div className="h-screen flex flex-col overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--fp-bg-primary)', color: 'var(--fp-text-primary)' }}>
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

              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 lg:gap-4 w-full lg:w-auto">
                {/* Theme Toggle */}
                <ThemeToggle />

                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-white transition-all duration-300 shadow-xl hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-md group"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </div>
                    <span className="uppercase tracking-widest">Actions</span>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showExportMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                      <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 py-3 min-w-[240px] sm:min-w-[280px] z-50 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">

                        {/* Knowledge Base Section */}
                        <div className="px-4 py-2 mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General</span>
                        </div>
                        <button
                          onClick={() => { setShowFAQ(true); setShowExportMenu(false); }}
                          className="w-full px-5 py-3 text-left hover:bg-indigo-50 flex items-center gap-4 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">Knowledge Base</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Learn everything about FIRE</div>
                          </div>
                        </button>

                        <div className="h-px bg-slate-100 my-2" />

                        {/* Data Management Section */}
                        <div className="px-4 py-2 mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Management</span>
                        </div>

                        <label className="w-full px-5 py-3 text-left hover:bg-emerald-50 flex items-center gap-4 transition-all group cursor-pointer">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">Import Data</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Load CSV or JSON file</div>
                          </div>
                          <input
                            type="file"
                            accept=".csv,.json"
                            onChange={(e) => { handleFileImport(e); setShowExportMenu(false); }}
                            className="hidden"
                          />
                        </label>

                        <div className="h-px bg-slate-100 my-2" />

                        {/* Export Section */}
                        <div className="px-4 py-2 mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Export Options</span>
                        </div>

                        <button
                          onClick={exportToCSV}
                          className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center gap-4 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <span className="text-lg">📊</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">Export to CSV</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Spreadsheet compatible</div>
                          </div>
                        </button>

                        <button
                          onClick={exportToJSON}
                          className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center gap-4 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <span className="text-lg">📋</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">Export to JSON</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Full application state</div>
                          </div>
                        </button>

                        <button
                          onClick={exportToPDF}
                          className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center gap-4 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <span className="text-lg">📄</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">Print PDF Report</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Downloadable document</div>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>
          </div>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 md:px-10 md:pb-10 lg:px-16 lg:pb-16 pt-4 sm:pt-6 scroll-smooth relative" style={{ backgroundColor: 'var(--fp-bg-primary)' }}>
          {/* Animated gradient background */}
          <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[40%] -right-[20%] w-[70%] h-[70%] rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full opacity-15 blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', animationDelay: '1s' }} />
          </div>
          <div className="w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 relative z-10">
            {/* Print Layout - Always available for printing regardless of tab */}
            <div className="hidden print:block print-container">
              {/* Enhanced Colorful Print Header */}
              <div className="print-title print-header-gradient">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🔥 FirePulse</span>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#6366f1', marginTop: '4px' }}>
                      Your Personalized Financial Independence Report
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600 }}>📅 Generated: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div>⏰ {new Date().toLocaleTimeString()}</div>
                    <div style={{ marginTop: '4px', fontWeight: 600, color: '#6366f1' }}>Mode: {viewMode === 'simple' ? '🎯 Simple Calculator' : '🌍 Advanced International'}</div>
                  </div>
                </div>
                <div style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)', height: '4px', borderRadius: '2px', marginTop: '8px' }}></div>
              </div>

              {/* What is FIRE? - Educational Section for Beginners */}
              <div className="print-section print-info-box" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '2px solid #93c5fd' }}>
                <h3 style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>💡</span> Understanding FIRE (Financial Independence, Retire Early)
                </h3>
                <div style={{ fontSize: '11px', color: '#1e40af', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '8px' }}>
                    <strong>FIRE</strong> is a movement focused on extreme savings and investment that allows you to retire far earlier than traditional methods would allow.
                    The goal is to accumulate enough assets that the returns from your investments can cover your living expenses indefinitely.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                    <div style={{ background: 'white', padding: '8px', borderRadius: '6px', border: '1px solid #93c5fd' }}>
                      <strong style={{ color: '#2563eb' }}>🎯 FI Number:</strong> The amount you need saved to live off investment returns. Typically 25× your annual expenses.
                    </div>
                    <div style={{ background: 'white', padding: '8px', borderRadius: '6px', border: '1px solid #93c5fd' }}>
                      <strong style={{ color: '#2563eb' }}>📊 4% Rule:</strong> You can safely withdraw 4% of your portfolio annually without running out of money for 30+ years.
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Summary - Hero Section with Enhanced Colors */}
              <div className="print-section print-hero" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', border: '3px solid #6366f1', borderRadius: '12px' }}>
                <h3 style={{ color: '#4f46e5', marginBottom: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📊</span> Your FIRE Dashboard
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  {/* FIRE Age Card */}
                  <div style={{ textAlign: 'center', padding: '16px', background: results.fiAge ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)', borderRadius: '10px', border: results.fiAge ? '2px solid #22c55e' : '2px solid #ef4444' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: results.fiAge ? '#15803d' : '#dc2626' }}>
                      {results.fiAge || '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: results.fiAge ? '#166534' : '#991b1b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>🎂 FIRE Age</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                      {results.fiAge ? `Age when you become financially free` : 'Not achievable with current plan'}
                    </div>
                  </div>

                  {/* Time to FI Card */}
                  <div style={{ textAlign: 'center', padding: '16px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', borderRadius: '10px', border: '2px solid #8b5cf6' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#7c3aed' }}>
                      {results.timeToFI ? `${results.timeToFI}y` : '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#5b21b6', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>⏳ Time to FI</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                      Years until financial independence
                    </div>
                  </div>

                  {/* Savings Rate Card */}
                  <div style={{ textAlign: 'center', padding: '16px', background: savingsRate >= 50 ? 'linear-gradient(135deg, #cffafe, #a5f3fc)' : savingsRate >= 25 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'linear-gradient(135deg, #fee2e2, #fecaca)', borderRadius: '10px', border: savingsRate >= 50 ? '2px solid #06b6d4' : savingsRate >= 25 ? '2px solid #f59e0b' : '2px solid #ef4444' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: savingsRate >= 50 ? '#0891b2' : savingsRate >= 25 ? '#d97706' : '#dc2626' }}>
                      {savingsRate.toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '11px', color: savingsRate >= 50 ? '#155e75' : savingsRate >= 25 ? '#92400e' : '#991b1b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>💰 Savings Rate</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                      {savingsRate >= 50 ? 'Excellent! Aggressive FIRE path' : savingsRate >= 25 ? 'Good! Standard FIRE timeline' : 'Consider increasing savings'}
                    </div>
                  </div>

                  {/* Solvency Status Card */}
                  <div style={{ textAlign: 'center', padding: '16px', background: results.isSolventAtEnd ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)', borderRadius: '10px', border: results.isSolventAtEnd ? '2px solid #22c55e' : '2px solid #ef4444' }}>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: results.isSolventAtEnd ? '#15803d' : '#dc2626' }}>
                      {results.isSolventAtEnd ? '✅' : '⚠️'}
                    </div>
                    <div style={{ fontSize: '11px', color: results.isSolventAtEnd ? '#166534' : '#991b1b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>🏦 Solvency</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
                      {results.isSolventAtEnd ? `Money lasts through age ${data.liveUntilAge}` : `Portfolio may deplete before ${data.liveUntilAge}`}
                    </div>
                  </div>
                </div>

                {/* Key Insights with Icons */}
                <div style={{ marginTop: '16px', padding: '14px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', borderRadius: '10px', border: '1px solid #a5b4fc' }}>
                  <div style={{ fontWeight: 800, color: '#4338ca', marginBottom: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🔑</span> Key Insights & What They Mean
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '10px', color: '#374151' }}>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #6366f1' }}>
                      <strong style={{ color: '#4338ca' }}>💵 FI Number Target:</strong> {formatCurrency(results.fiNumber, currency)}
                      <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>This is 25× your annual expenses—the magic number for financial freedom!</div>
                    </div>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #22c55e' }}>
                      <strong style={{ color: '#15803d' }}>🏧 Safe Withdrawal:</strong> {formatCurrency(results.safeWithdrawalAmount, currency)}/year
                      <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>At {data.withdrawalRate}% rate, this is what you can safely spend annually in retirement</div>
                    </div>
                    <div style={{ background: 'white', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #8b5cf6' }}>
                      <strong style={{ color: '#6d28d9' }}>📈 Current Progress:</strong> {formatCurrency(currentAllocation.totalAssets, currency)} ({((currentAllocation.totalAssets / results.fiNumber) * 100).toFixed(1)}%)
                      <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>You're {((currentAllocation.totalAssets / results.fiNumber) * 100).toFixed(1)}% of the way to your FI goal!</div>
                    </div>
                    {results.fiAge && (
                      <div style={{ background: 'white', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                        <strong style={{ color: '#d97706' }}>🌴 Freedom Years:</strong> {data.liveUntilAge - results.fiAge} years
                        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>Years of financial freedom to enjoy after reaching FIRE!</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Asset Allocation - Visual & Colorful */}
              <div className="print-section" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', borderRadius: '10px' }}>
                <h3 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🥧</span> Your Asset Allocation
                  <span style={{ fontSize: '10px', fontWeight: 400, color: '#64748b' }}>(How your money is distributed)</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', fontSize: '11px' }}>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #86efac', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>💼</div>
                    <div style={{ fontWeight: 800, color: '#166534', fontSize: '14px' }}>{formatCurrency(currentAllocation.totalAssets, currency)}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>TOTAL ASSETS</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Everything you own combined</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #86efac', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>💵</div>
                    <div style={{ fontWeight: 800, color: '#0891b2', fontSize: '14px' }}>{formatCurrency(data.currentNetWorth, currency)}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>LIQUID ({currentAllocation.liquidPercentage.toFixed(0)}%)</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Cash & easily accessible funds</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #86efac', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>🏦</div>
                    <div style={{ fontWeight: 800, color: '#7c3aed', fontSize: '14px' }}>{formatCurrency(data.retirementAssets, currency)}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>401K/IRA ({currentAllocation.retirementPercentage.toFixed(0)}%)</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Tax-advantaged retirement accounts</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #86efac', textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', marginBottom: '4px' }}>🏠</div>
                    <div style={{ fontWeight: 800, color: '#ea580c', fontSize: '14px' }}>{formatCurrency(data.nonLiquidAssets, currency)}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>REAL ESTATE ({currentAllocation.nonLiquidPercentage.toFixed(0)}%)</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Property & non-liquid assets</div>
                  </div>
                </div>
              </div>

              {/* Personal Profile - Core Parameters */}
              <div className="print-section" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #fbbf24', borderRadius: '10px' }}>
                <h3 style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>👤</span> Your Profile & Life Timeline
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '11px' }}>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span>🎂</span><strong style={{ color: '#92400e' }}>Current Age:</strong>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706' }}>{data.currentAge} years</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Your starting point on the FIRE journey</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span>🏖️</span><strong style={{ color: '#92400e' }}>Planned Retirement:</strong>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706' }}>{data.retirementAge} years</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>When you plan to stop working full-time</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span>⏳</span><strong style={{ color: '#92400e' }}>Plan Until Age:</strong>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#d97706' }}>{data.liveUntilAge} years</div>
                    <div style={{ fontSize: '9px', color: '#64748b' }}>Planning horizon (be conservative!)</div>
                  </div>
                </div>
                <div style={{ marginTop: '10px', padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #fbbf24', fontSize: '10px', color: '#92400e' }}>
                  <strong>💡 Pro Tip:</strong> Plan for a longer life expectancy than you expect. Many financial plans fail because people outlive their savings!
                </div>
              </div>

              {/* Cash Flow Analysis */}
              <div className="print-section" style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', border: '2px solid #818cf8', borderRadius: '10px' }}>
                <h3 style={{ color: '#4338ca', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>💸</span> Monthly Cash Flow Analysis
                  <span style={{ fontSize: '10px', fontWeight: 400, color: '#64748b' }}>(Money in vs. money out)</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {/* Income Side */}
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '2px solid #22c55e' }}>
                    <div style={{ fontWeight: 800, color: '#166534', marginBottom: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📈</span> INCOME (Money Coming In)
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: '#f0fdf4', borderRadius: '4px' }}>
                        <span>💼 Monthly Income:</span>
                        <strong style={{ color: '#15803d' }}>{formatCurrency(data.monthlyIncome, currency)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: '#f0fdf4', borderRadius: '4px' }}>
                        <span>📅 Annual Income:</span>
                        <strong style={{ color: '#15803d' }}>{formatCurrency(data.monthlyIncome * 12, currency)}</strong>
                      </div>
                    </div>
                  </div>
                  {/* Expenses Side */}
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '2px solid #ef4444' }}>
                    <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📉</span> EXPENSES (Money Going Out)
                    </div>
                    <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: '#fef2f2', borderRadius: '4px' }}>
                        <span>🏠 Living Expenses:</span>
                        <strong style={{ color: '#dc2626' }}>{formatCurrency(data.monthlyExpenses, currency)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: '#fef2f2', borderRadius: '4px' }}>
                        <span>🏥 Medical:</span>
                        <strong style={{ color: '#dc2626' }}>{formatCurrency(data.monthlyMedical, currency)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', background: '#fef2f2', borderRadius: '4px' }}>
                        <span>📚 Education:</span>
                        <strong style={{ color: '#dc2626' }}>{formatCurrency(data.monthlyKidsEducation, currency)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Net Savings Row */}
                <div style={{ marginTop: '12px', padding: '12px', background: data.monthlySavings > 0 ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)', borderRadius: '8px', border: data.monthlySavings > 0 ? '2px solid #22c55e' : '2px solid #ef4444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '12px', color: data.monthlySavings > 0 ? '#166534' : '#991b1b' }}>
                      {data.monthlySavings > 0 ? '✅' : '⚠️'} Monthly Surplus (What you save)
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      {data.monthlySavings > 0 ? 'Great! This money grows your wealth' : 'Warning: You\'re spending more than you earn'}
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: data.monthlySavings > 0 ? '#15803d' : '#dc2626' }}>
                    {formatCurrency(data.monthlySavings, currency)}
                  </div>
                </div>
              </div>

              {/* Investment Assumptions - Educational */}
              <div className="print-section" style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', border: '2px solid #f472b6', borderRadius: '10px' }}>
                <h3 style={{ color: '#9d174d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>⚙️</span> Planning Assumptions
                  <span style={{ fontSize: '10px', fontWeight: 400, color: '#64748b' }}>(The rates we used for calculations)</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '10px' }}>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #f472b6' }}>
                    <div style={{ fontWeight: 700, color: '#9d174d', marginBottom: '6px' }}>📈 Growth Rates</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Income Growth:</span><strong>{data.incomeIncreaseRate}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Liquid Return:</span><strong>{data.liquidAssetReturn}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Retirement Return:</span><strong>{data.retirementAssetReturn}%</strong>
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #f472b6' }}>
                    <div style={{ fontWeight: 700, color: '#9d174d', marginBottom: '6px' }}>📉 Inflation Factors</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>General Inflation:</span><strong>{data.inflationRate}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Medical Inflation:</span><strong>{data.medicalInflation}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Real Estate Return:</span><strong>{data.nonLiquidAssetReturn}%</strong>
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #f472b6' }}>
                    <div style={{ fontWeight: 700, color: '#9d174d', marginBottom: '6px' }}>🎯 Retirement Settings</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Expense Level:</span><strong>{data.retirementExpenseMultiplier}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Tax Rate:</span><strong>{data.retirementTaxRate}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Simulation:</span><strong style={{ textTransform: 'capitalize' }}>{data.simulationMode}</strong>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '10px', padding: '8px 12px', background: 'white', borderRadius: '6px', border: '1px solid #f472b6', fontSize: '10px', color: '#9d174d' }}>
                  <strong>📖 Understanding these numbers:</strong> Returns are based on historical averages. Inflation erodes your purchasing power over time.
                  Being conservative (lower returns, higher inflation) is safer for planning.
                </div>
              </div>

              {/* Projection Table - Enhanced */}
              <div className="print-section" style={{ border: '2px solid #94a3b8', borderRadius: '10px' }}>
                <h3 style={{ color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>📅</span> Year-by-Year Financial Projection
                </h3>
                <div style={{ fontSize: '10px', marginBottom: '8px', padding: '8px', background: '#f1f5f9', borderRadius: '6px', color: '#475569' }}>
                  <strong>📊 How to read this table:</strong> Each row shows your financial status at that age.
                  <strong style={{ color: '#22c55e' }}> Green WORKING</strong> = still earning income.
                  <strong style={{ color: '#8b5cf6' }}> Purple RETIRED</strong> = living off investments.
                  Watch how your net worth changes over time!
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', color: 'white' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>Age/Year</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Start Balance</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Income</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Expenses</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>Investment Returns</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>End Balance</th>
                      <th style={{ padding: '8px', textAlign: 'center', borderRadius: '0 6px 0 0' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.projections.map((p, index) => (
                      <tr key={`${p.age}-${p.year}`} style={{ background: index % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{p.age} ({p.year})</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#64748b' }}>{formatCurrency(p.openingBalance, currency)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#22c55e', fontWeight: 600 }}>+{formatCurrency(p.income, currency)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#ef4444' }}>-{formatCurrency(p.totalOutflow, currency)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: p.returns > 0 ? '#6366f1' : '#ef4444', fontWeight: 600 }}>{p.returns > 0 ? '+' : ''}{formatCurrency(p.returns, currency)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, color: p.netWorth > 0 ? '#0f172a' : '#dc2626' }}>{formatCurrency(p.netWorth, currency)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '8px', fontWeight: 700, background: p.isRetired ? '#ede9fe' : '#dcfce7', color: p.isRetired ? '#7c3aed' : '#15803d' }}>
                            {p.isRetired ? '🏖️ RETIRED' : '💼 WORKING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: '10px', padding: '10px', background: results.isSolventAtEnd ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)', borderRadius: '8px', border: results.isSolventAtEnd ? '2px solid #22c55e' : '2px solid #ef4444', fontSize: '11px' }}>
                  <strong style={{ color: results.isSolventAtEnd ? '#166534' : '#991b1b' }}>
                    {results.isSolventAtEnd ? '🎉 Good News!' : '⚠️ Warning!'}
                  </strong>
                  <span style={{ marginLeft: '8px', color: results.isSolventAtEnd ? '#166534' : '#991b1b' }}>
                    FIRE achieved at age {results.fiAge || 'Not reached'} •
                    Portfolio {results.isSolventAtEnd ? 'remains solvent and will last' : 'may not last'} through age {data.liveUntilAge}
                  </span>
                </div>
              </div>

              {/* Goals */}
              {data.goals.length > 0 && (
                <div className="print-section" style={{ background: 'linear-gradient(135deg, #fef9c3, #fef08a)', border: '2px solid #facc15', borderRadius: '10px' }}>
                  <h3 style={{ color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🎯</span> Your Financial Goals Timeline
                  </h3>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {data.goals.map((goal, index) => (
                      <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #facc15' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>🎯</span>
                          <strong style={{ color: '#854d0e' }}>{goal.name}</strong>
                        </div>
                        <div style={{ background: '#fef08a', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: '#854d0e' }}>
                          Age {goal.targetAge}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items & Next Steps */}
              <div className="print-section" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', border: '2px solid #3b82f6', borderRadius: '10px' }}>
                <h3 style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🚀</span> Recommended Next Steps
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '11px' }}>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>📈 To Accelerate Your FIRE Journey:</div>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: '#374151', lineHeight: '1.6' }}>
                      <li>Increase savings rate by even 1-2%</li>
                      <li>Look for ways to reduce monthly expenses</li>
                      <li>Consider side income opportunities</li>
                      <li>Maximize tax-advantaged accounts</li>
                    </ul>
                  </div>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>🛡️ To Protect Your Plan:</div>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: '#374151', lineHeight: '1.6' }}>
                      <li>Build 6-month emergency fund</li>
                      <li>Review insurance coverage</li>
                      <li>Diversify your investments</li>
                      <li>Update this plan annually</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Enhanced Footer */}
              <div className="print-footer" style={{ background: 'linear-gradient(90deg, #f1f5f9, #e2e8f0)', padding: '16px', borderRadius: '10px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '14px' }}>🔥 FirePulse - Financial Independence Calculator</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Privacy-first • No data stored • All calculations run locally</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '9px', color: '#94a3b8' }}>
                    <div>Report generated on {new Date().toLocaleDateString()}</div>
                    <div style={{ marginTop: '2px' }}>⚠️ For informational purposes only. Consult a financial advisor.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* WIZARD CONTENT AREA */}
            <div className="flex-1 flex flex-col min-h-0 print:hidden">
              <WizardContainer
                data={data}
                results={results}
                currency={currency}
                currencySymbol={currencySymbol}
                updateData={updateData}
                updateSpouseData={updateSpouseData}
                currentAllocation={currentAllocation}
                savingsRate={savingsRate}
                longevityTooltip={longevityTooltip}
                setCurrency={setCurrency}
                uiMode={uiMode}
                setUiMode={setUiMode}
                internationalScenario={internationalScenario}
                setInternationalScenario={setInternationalScenario}
                internationalResults={internationalResults}
              />
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

      {showFAQ && <FAQ onClose={() => setShowFAQ(false)} />}
    </WizardProvider>
  );
};

export default App;
