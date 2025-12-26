
import { FinancialData, CalculationResults, YearProjection, CurrencyCode, Milestone } from '../types';

/**
 * Simulates a full lifecycle to check if a specific retirement age is solvent until death.
 */
const checkSolvency = (data: FinancialData, testRetirementAge: number): boolean => {
  const {
    currentAge,
    liveUntilAge,
    currentNetWorth,
    monthlySavings,
    annualBonus,
    incomeIncreaseRate,
    retirementExpenseMultiplier,
    monthlyExpenses,
    monthlyMedical,
    medicalInflation,
    retirementTaxRate,
    annualReturn,
    inflationRate,
    simulationMode,
    futureIncome,
    futureIncomeStartAge
  } = data;

  let balance = currentNetWorth;
  let annualLiving = monthlyExpenses * 12;
  let annualMedical = monthlyMedical * 12;
  let currentSavings = monthlySavings;
  let currentBonus = annualBonus;
  const taxRate = retirementTaxRate / 100;

  for (let age = currentAge; age <= liveUntilAge; age++) {
    const isRetired = age >= testRetirementAge;
    
    let effectiveReturn = annualReturn;
    if (simulationMode === 'leaner') effectiveReturn -= 1;
    else if (simulationMode === 'conservative') effectiveReturn -= 2;
    else if (simulationMode === 'aggressive') effectiveReturn += 2;
    
    // Cyclical crash: happens every 10 years (Year 10, 20, 30...)
    if (simulationMode === 'crash' && (age - currentAge) % 10 === 0 && age > currentAge) {
      effectiveReturn = -20;
    }

    const returns = balance * (effectiveReturn / 100);
    
    if (!isRetired) {
      balance += returns + (currentSavings * 12 + currentBonus);
      currentSavings *= (1 + incomeIncreaseRate / 100);
      currentBonus *= (1 + incomeIncreaseRate / 100);
    } else {
      const grossWithdrawal = (annualLiving * (retirementExpenseMultiplier / 100) + annualMedical) / (1 - taxRate);
      const pension = age >= futureIncomeStartAge ? (futureIncome * 12 * (1 - taxRate)) : 0;
      balance += returns - grossWithdrawal + pension;
    }

    if (balance < 0) return false;

    annualLiving *= (1 + inflationRate / 100);
    annualMedical *= (1 + medicalInflation / 100);
  }
  return balance >= 0;
};

export const calculateFIRE = (data: FinancialData): CalculationResults => {
  const {
    currentAge,
    retirementAge,
    liveUntilAge,
    currentNetWorth,
    monthlyIncome,
    monthlySavings: initialMonthlySavings,
    annualBonus: initialAnnualBonus,
    incomeIncreaseRate,
    retirementExpenseMultiplier,
    monthlyExpenses: initialMonthlyLiving,
    monthlyMedical: initialMonthlyMedical,
    medicalInflation,
    swpAmount: initialSwpAmount,
    retirementTaxRate,
    annualReturn,
    inflationRate,
    withdrawalRate,
    futureIncome,
    futureIncomeStartAge,
    simulationMode,
    goals
  } = data;

  let fiAge: number | null = null;
  for (let testAge = currentAge; testAge <= liveUntilAge; testAge++) {
    if (checkSolvency(data, testAge)) {
      fiAge = testAge;
      break;
    }
  }

  const taxRateDecimal = retirementTaxRate / 100;
  const projections: YearProjection[] = [];
  let currentBalance = currentNetWorth;
  let currentAnnualLiving = initialMonthlyLiving * 12;
  let currentAnnualMedical = initialMonthlyMedical * 12;
  let currentMonthlyIncome = monthlyIncome;
  let currentMonthlySavings = initialMonthlySavings;
  let currentAnnualBonus = initialAnnualBonus;
  
  const currentYear = new Date().getFullYear();

  for (let age = currentAge; age <= liveUntilAge; age++) {
    const year = currentYear + (age - currentAge);
    const openingBalanceForYear = currentBalance;
    const isRetired = age >= retirementAge;
    
    if (age === retirementAge) {
      currentAnnualLiving *= (retirementExpenseMultiplier / 100);
    }

    const goalsThisYear = goals.filter(g => g.targetAge === age);
    const totalGoalCost = goalsThisYear.reduce((sum, g) => sum + g.targetAmount, 0);
    currentBalance -= totalGoalCost;

    let effectiveReturnRate = annualReturn;
    if (simulationMode === 'leaner') effectiveReturnRate -= 1;
    else if (simulationMode === 'conservative') effectiveReturnRate -= 2;
    else if (simulationMode === 'aggressive') effectiveReturnRate += 2;
    
    if (simulationMode === 'crash' && (age - currentAge) % 10 === 0 && age > currentAge) {
      effectiveReturnRate = -20;
    }

    const investmentReturns = currentBalance * (effectiveReturnRate / 100);
    const totalOutflowNet = isRetired ? (currentAnnualLiving + currentAnnualMedical) : 0;
    const grossNeeded = totalOutflowNet / (1 - taxRateDecimal);
    const hasFutureIncome = age >= futureIncomeStartAge;
    const yearlyFutureIncomeNet = hasFutureIncome ? (futureIncome * 12 * (1 - taxRateDecimal)) : 0;

    const yearlyIncome = !isRetired ? (currentMonthlyIncome * 12 + currentAnnualBonus) : 0;
    const yearlySavings = !isRetired ? (currentMonthlySavings * 12 + currentAnnualBonus) : 0;

    if (!isRetired) {
      currentBalance = currentBalance + investmentReturns + yearlySavings;
      currentMonthlyIncome *= (1 + incomeIncreaseRate / 100);
      currentMonthlySavings *= (1 + incomeIncreaseRate / 100);
      currentAnnualBonus *= (1 + incomeIncreaseRate / 100);
    } else {
      currentBalance = currentBalance + investmentReturns - grossNeeded + yearlyFutureIncomeNet;
    }

    const dynamicFiNumber = ( (currentAnnualLiving + currentAnnualMedical) / (1 - taxRateDecimal) ) / (withdrawalRate / 100);

    projections.push({
      year,
      age,
      openingBalance: Math.round(openingBalanceForYear),
      returns: Math.round(investmentReturns),
      netWorth: Math.max(0, Math.round(currentBalance)),
      isRetired,
      income: Math.round(yearlyIncome),
      livingExpenses: Math.round(currentAnnualLiving),
      medicalExpenses: Math.round(currentAnnualMedical),
      totalOutflow: Math.round(isRetired ? grossNeeded : (currentAnnualLiving + currentAnnualMedical)),
      fiNumber: Math.round(dynamicFiNumber),
      passiveIncome: Math.round(isRetired ? (grossNeeded * (1 - taxRateDecimal) + yearlyFutureIncomeNet) : 0),
      goalSpending: totalGoalCost,
      yearlySavings: Math.round(yearlySavings)
    });

    currentAnnualLiving *= (1 + inflationRate / 100);
    currentAnnualMedical *= (1 + medicalInflation / 100);
    
    if (currentBalance < -1000000000) break;
  }

  const baseFiNumber = ((initialMonthlyLiving + initialMonthlyMedical) * 12 / (1 - taxRateDecimal)) / (withdrawalRate / 100);

  let milestones: Milestone[] = [
    { name: 'Lean FI', age: null, target: baseFiNumber * 0.75, reached: false, description: 'Basic expenses covered.' },
    { name: 'FIRE', age: null, target: baseFiNumber, reached: false, description: 'Core independence goal.' },
    { name: 'Fat FIRE', age: null, target: baseFiNumber * 1.5, reached: false, description: 'Luxury lifestyle comfort.' },
  ];

  milestones.forEach(m => {
    const projection = projections.find(p => p.netWorth >= m.target);
    if (projection) {
      m.reached = true;
      m.age = projection.age;
    }
  });

  return {
    projections,
    fiAge,
    fiYear: fiAge ? currentYear + (fiAge - currentAge) : null,
    fiNumber: baseFiNumber,
    fiExpenses: (initialMonthlyLiving + initialMonthlyMedical) * 12,
    timeToFI: fiAge !== null ? fiAge - currentAge : null,
    milestones,
    safeWithdrawalAmount: initialSwpAmount,
    isSolventAtEnd: currentBalance >= 0
  };
};

export const formatCurrency = (value: number, currency: CurrencyCode = 'USD'): string => {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompactNumber = (value: number, currency: CurrencyCode): string => {
  if (value === 0) return '0';
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (currency === 'INR') {
    if (absValue >= 10000000) return `${sign}${(absValue / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}Cr`;
    if (absValue >= 100000) return `${sign}${(absValue / 100000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}L`;
    if (absValue >= 1000) return `${sign}${(absValue / 1000).toLocaleString('en-IN', { maximumFractionDigits: 0 })}K`;
    return value.toLocaleString('en-IN');
  } else {
    if (absValue >= 1000000) return `${sign}${(absValue / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
    if (absValue >= 1000) return `${sign}${(absValue / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}K`;
    return value.toLocaleString('en-US');
  }
};

export const formatCurrencyCompact = (value: number, currency: CurrencyCode): string => {
  const symbol = getCurrencySymbol(currency);
  const compactValue = formatCompactNumber(value, currency);
  return `${symbol}${compactValue}`;
};

export const getCurrencySymbol = (currency: CurrencyCode): string => {
  return (0).toLocaleString('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).replace(/\d/g, '').trim();
};
