import { FinancialData, CalculationResults, YearProjection, CurrencyCode, Milestone } from '../types';

/**
 * Calculates age-based asset allocation for liquid assets
 * Returns object with equity, debt, and cash percentages
 */
export const getAgeBasedAllocation = (currentAge: number, retirementAge: number): { equity: number; debt: number; cash: number } => {
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);

  if (yearsToRetirement > 20) {
    // Growth phase: 80% equity, 15% debt, 5% cash
    return { equity: 80, debt: 15, cash: 5 };
  } else if (yearsToRetirement > 10) {
    // Moderate phase: 60% equity, 30% debt, 10% cash
    return { equity: 60, debt: 30, cash: 10 };
  } else if (yearsToRetirement > 5) {
    // Conservative phase: 50% equity, 40% debt, 10% cash
    return { equity: 50, debt: 40, cash: 10 };
  } else {
    // Retirement/near retirement: 40% equity, 40% debt, 20% cash
    return { equity: 40, debt: 40, cash: 20 };
  }
};

/**
 * Calculates weighted average return based on age-based allocation and individual returns
 */
const calculateWeightedReturn = (
  liquidAssets: number,
  nonLiquidAssets: number,
  liquidReturn: number,
  nonLiquidReturn: number,
  allocation: { equity: number; debt: number; cash: number }
): number => {
  const totalAssets = liquidAssets + nonLiquidAssets;
  if (totalAssets === 0) return 0;

  // Simplified weighted average - in practice, you'd have separate returns for equity/debt/cash
  const liquidWeight = liquidAssets / totalAssets;
  const nonLiquidWeight = nonLiquidAssets / totalAssets;

  return (liquidReturn * liquidWeight) + (nonLiquidReturn * nonLiquidWeight);
};

/**
 * Simulates a full lifecycle to check if a specific retirement age is solvent until death.
 */
const checkSolvency = (data: FinancialData, testRetirementAge: number): boolean => {
  const {
    currentAge,
    liveUntilAge,
    currentNetWorth,
    nonLiquidAssets,
    monthlySavings,
    annualBonus,
    incomeIncreaseRate,
    retirementExpenseMultiplier,
    monthlyExpenses,
    monthlyMedical,
    medicalInflation,
    retirementTaxRate,
    liquidAssetReturn,
    nonLiquidAssetReturn,
    inflationRate,
    simulationMode,
    futureIncome,
    futureIncomeStartAge
  } = data;

  let liquidBalance = currentNetWorth;
  let nonLiquidBalance = nonLiquidAssets;
  let annualLiving = monthlyExpenses * 12;
  let annualMedical = monthlyMedical * 12;
  let currentSavings = monthlySavings;
  let currentBonus = annualBonus;
  const taxRate = retirementTaxRate / 100;

  for (let age = currentAge; age <= liveUntilAge; age++) {
    const isRetired = age >= testRetirementAge;

    // Get age-based allocation for liquid assets
    const allocation = getAgeBasedAllocation(age, testRetirementAge);

    let effectiveLiquidReturn = liquidAssetReturn;
    let effectiveNonLiquidReturn = nonLiquidAssetReturn;
    if (simulationMode === 'leaner') {
      effectiveLiquidReturn -= 1;
      effectiveNonLiquidReturn -= 1;
    } else if (simulationMode === 'conservative') {
      effectiveLiquidReturn -= 2;
      effectiveNonLiquidReturn -= 2;
    } else if (simulationMode === 'aggressive') {
      effectiveLiquidReturn += 2;
      effectiveNonLiquidReturn += 2;
    }

    // Cyclical crash: happens every 10 years (Year 10, 20, 30...)
    if (simulationMode === 'crash' && (age - currentAge) % 10 === 0 && age > currentAge) {
      effectiveLiquidReturn = -20;
      effectiveNonLiquidReturn = -10; // Non-liquid assets less affected by crashes
    }

    const liquidReturns = liquidBalance * (effectiveLiquidReturn / 100);
    const nonLiquidReturns = nonLiquidBalance * (effectiveNonLiquidReturn / 100);

    if (!isRetired) {
      liquidBalance += liquidReturns + (currentSavings * 12 + currentBonus);
      nonLiquidBalance += nonLiquidReturns;
      currentSavings *= (1 + incomeIncreaseRate / 100);
      currentBonus *= (1 + incomeIncreaseRate / 100);
    } else {
      const retirementLiving = annualLiving * (retirementExpenseMultiplier / 100);
      const grossWithdrawal = (retirementLiving + annualMedical) / (1 - taxRate);
      const pension = age >= futureIncomeStartAge ? (futureIncome * 12 * (1 - taxRate)) : 0;

      // Withdraw from liquid assets first
      liquidBalance += liquidReturns - grossWithdrawal + pension;
      nonLiquidBalance += nonLiquidReturns;
    }

    const totalBalance = liquidBalance + nonLiquidBalance;
    if (totalBalance < 0) return false;

    annualLiving *= (1 + inflationRate / 100);
    annualMedical *= (1 + medicalInflation / 100);
  }
  return (liquidBalance + nonLiquidBalance) >= 0;
};

export const calculateFIRE = (data: FinancialData): CalculationResults => {
  const {
    currentAge,
    retirementAge,
    liveUntilAge,
    currentNetWorth,
    nonLiquidAssets,
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
    liquidAssetReturn,
    nonLiquidAssetReturn,
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
  let liquidBalance = currentNetWorth;
  let nonLiquidBalance = nonLiquidAssets;
  let currentAnnualLiving = initialMonthlyLiving * 12;
  let currentAnnualMedical = initialMonthlyMedical * 12;
  let currentMonthlyIncome = monthlyIncome;
  let currentMonthlySavings = initialMonthlySavings;
  let currentAnnualBonus = initialAnnualBonus;

  const currentYear = new Date().getFullYear();

  for (let age = currentAge; age <= liveUntilAge; age++) {
    const year = currentYear + (age - currentAge);
    const openingLiquidBalance = liquidBalance;
    const openingNonLiquidBalance = nonLiquidBalance;
    const isRetired = age >= retirementAge;

    // Get age-based allocation
    const allocation = getAgeBasedAllocation(age, retirementAge);

    const goalsThisYear = goals.filter(g => g.targetAge === age);
    const totalGoalCost = goalsThisYear.reduce((sum, g) => sum + g.targetAmount, 0);
    liquidBalance -= totalGoalCost; // Goals paid from liquid assets

    let effectiveLiquidReturn = liquidAssetReturn;
    let effectiveNonLiquidReturn = nonLiquidAssetReturn;
    if (simulationMode === 'leaner') {
      effectiveLiquidReturn -= 1;
      effectiveNonLiquidReturn -= 1;
    } else if (simulationMode === 'conservative') {
      effectiveLiquidReturn -= 2;
      effectiveNonLiquidReturn -= 2;
    } else if (simulationMode === 'aggressive') {
      effectiveLiquidReturn += 2;
      effectiveNonLiquidReturn += 2;
    }

    if (simulationMode === 'crash' && (age - currentAge) % 10 === 0 && age > currentAge) {
      effectiveLiquidReturn = -20;
      effectiveNonLiquidReturn = -10;
    }

    const liquidReturns = liquidBalance * (effectiveLiquidReturn / 100);
    const nonLiquidReturns = nonLiquidBalance * (effectiveNonLiquidReturn / 100);

    const retirementLiving = currentAnnualLiving * (retirementExpenseMultiplier / 100);
    const totalOutflowNet = isRetired ? (retirementLiving + currentAnnualMedical) : 0;
    const grossNeeded = totalOutflowNet / (1 - taxRateDecimal);
    const hasFutureIncome = age >= futureIncomeStartAge;
    const yearlyFutureIncomeNet = hasFutureIncome ? (futureIncome * 12 * (1 - taxRateDecimal)) : 0;

    const yearlyIncome = !isRetired ? (currentMonthlyIncome * 12 + currentAnnualBonus) : 0;
    const yearlySavings = !isRetired ? (currentMonthlySavings * 12 + currentAnnualBonus) : 0;

    if (!isRetired) {
      liquidBalance += liquidReturns + yearlySavings;
      nonLiquidBalance += nonLiquidReturns;
      currentMonthlyIncome *= (1 + incomeIncreaseRate / 100);
      currentMonthlySavings *= (1 + incomeIncreaseRate / 100);
      currentAnnualBonus *= (1 + incomeIncreaseRate / 100);
    } else {
      liquidBalance += liquidReturns - grossNeeded + yearlyFutureIncomeNet;
      nonLiquidBalance += nonLiquidReturns;
    }

    const totalBalance = liquidBalance + nonLiquidBalance;
    const dynamicFiNumber = ((retirementLiving + currentAnnualMedical) / (1 - taxRateDecimal)) / (withdrawalRate / 100);

    projections.push({
      year,
      age,
      openingBalance: Math.round(openingLiquidBalance + openingNonLiquidBalance),
      returns: Math.round(liquidReturns + nonLiquidReturns),
      netWorth: Math.max(0, Math.round(totalBalance)),
      isRetired,
      income: Math.round(yearlyIncome),
      livingExpenses: Math.round(isRetired ? retirementLiving : currentAnnualLiving),
      medicalExpenses: Math.round(currentAnnualMedical),
      totalOutflow: Math.round(isRetired ? grossNeeded : (currentAnnualLiving + currentAnnualMedical)),
      fiNumber: Math.round(dynamicFiNumber),
      passiveIncome: Math.round(isRetired ? (grossNeeded * (1 - taxRateDecimal) + yearlyFutureIncomeNet) : 0),
      goalSpending: totalGoalCost,
      yearlySavings: Math.round(yearlySavings)
    });

    currentAnnualLiving *= (1 + inflationRate / 100);
    currentAnnualMedical *= (1 + medicalInflation / 100);

    if (totalBalance < -1000000000) break;
  }

  const baseFiNumber = ((initialMonthlyLiving * 12 * (retirementExpenseMultiplier / 100) + initialMonthlyMedical * 12) / (1 - taxRateDecimal)) / (withdrawalRate / 100);

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
    fiExpenses: (initialMonthlyLiving * 12 * (retirementExpenseMultiplier / 100)) + initialMonthlyMedical * 12,
    timeToFI: fiAge !== null ? fiAge - currentAge : null,
    milestones,
    safeWithdrawalAmount: initialSwpAmount,
    isSolventAtEnd: (liquidBalance + nonLiquidBalance) >= 0
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
