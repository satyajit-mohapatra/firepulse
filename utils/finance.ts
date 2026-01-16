import { FinancialData, CalculationResults, YearProjection, CurrencyCode, Milestone } from '../types';

export const currencies: { code: CurrencyCode; name: string }[] = [
  { code: 'USD', name: 'USD ($)' },
  { code: 'EUR', name: 'EUR (€)' },
  { code: 'GBP', name: 'GBP (£)' },
  { code: 'JPY', name: 'JPY (¥)' },
  { code: 'CAD', name: 'CAD (C$)' },
  { code: 'AUD', name: 'AUD (A$)' },
  { code: 'INR', name: 'INR (₹)' },
  { code: 'BRL', name: 'BRL (R$)' },
];

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
 * Estimates FIRE Age (Financial Independence Age) - the earliest age you could potentially 
 * stop working and sustain your lifestyle indefinitely.
 * 
 * This is DIFFERENT from Retirement Age:
 * - Retirement Age: When you PLAN to stop working
 * - FIRE Age: When you COULD stop working (have enough to sustain expenses)
 * 
 * Uses simplified 4% safe withdrawal rate calculation with compound growth.
 */
export const estimateFIREAge = (data: {
  currentAge: number;
  currentNetWorth: number;
  retirementAssets: number;
  nonLiquidAssets: number;
  monthlyExpenses: number;
  monthlyMedical: number;
  monthlyKidsEducation: number;
  monthlySavings: number;
  monthlyIncome: number;
  annualBonus: number;
  retirementExpenseMultiplier: number;
  withdrawalRate: number;
  liquidAssetReturn: number;
  incomeIncreaseRate: number;
  inflationRate: number;
  liveUntilAge: number;
  spouse?: {
    enabled: boolean;
    monthlyIncome: number;
    annualBonus: number;
  };
}): { fiAge: number | null; yearsToFI: number | null; fiNumber: number } => {
  const {
    currentAge,
    currentNetWorth,
    retirementAssets,
    nonLiquidAssets,
    monthlyExpenses,
    monthlyMedical,
    monthlyKidsEducation,
    monthlySavings,
    monthlyIncome,
    annualBonus,
    retirementExpenseMultiplier,
    withdrawalRate,
    liquidAssetReturn,
    incomeIncreaseRate,
    inflationRate,
    liveUntilAge,
    spouse,
  } = data;

  // Calculate annual retirement expenses
  const annualRetirementExpenses =
    (monthlyExpenses * 12 * (retirementExpenseMultiplier / 100)) +
    (monthlyMedical * 12) +
    (monthlyKidsEducation * 12);

  // FIRE number = annual expenses / withdrawal rate
  const fiNumber = annualRetirementExpenses / (withdrawalRate / 100);

  // Simulate retirement at each potential FIRE age and check if portfolio lasts until death
  const checkSolvencyAtTestAge = (testRetirementAge: number): boolean => {
    let totalAssets = currentNetWorth + retirementAssets + nonLiquidAssets;
    let annualSavings = monthlySavings * 12 + annualBonus;

    // Add spouse savings if enabled
    if (spouse?.enabled) {
      const spouseIncome = spouse.monthlyIncome * 12 + spouse.annualBonus;
      const primaryIncome = monthlyIncome * 12 + annualBonus;
      if (primaryIncome > 0) {
        const savingsRatio = (monthlySavings * 12) / primaryIncome;
        annualSavings += spouseIncome * Math.min(savingsRatio, 0.5);
      }
    }

    const avgReturn = liquidAssetReturn / 100;
    const incomeGrowth = incomeIncreaseRate / 100;
    const inflation = inflationRate / 100;

    let projectedSavings = annualSavings;
    let projectedExpenses = annualRetirementExpenses;

    // Simulate each year from current age to death
    for (let age = currentAge; age <= liveUntilAge; age++) {
      const isRetired = age >= testRetirementAge;

      if (!isRetired) {
        // Working phase: grow savings by return rate and add new savings
        projectedSavings *= (1 + incomeGrowth);
        totalAssets = totalAssets * (1 + avgReturn) + projectedSavings;
      } else {
        // Retirement phase: grow by return, withdraw expenses
        totalAssets = totalAssets * (1 + avgReturn) - projectedExpenses;
      }

      // Inflate expenses for next year
      projectedExpenses *= (1 + inflation);

      // If we run out of money, this test age doesn't work
      if (totalAssets < 0) {
        return false;
      }
    }

    // If we made it to liveUntilAge with positive balance, this test age works
    return totalAssets >= 0;
  };

  // Total current assets - check if already at FI
  const totalAssets = currentNetWorth + retirementAssets + nonLiquidAssets;
  if (checkSolvencyAtTestAge(currentAge)) {
    return { fiAge: currentAge, yearsToFI: 0, fiNumber };
  }

  // Find the EARLIEST age at which retiring would result in solvency until death
  for (let testAge = currentAge + 1; testAge <= liveUntilAge; testAge++) {
    if (checkSolvencyAtTestAge(testAge)) {
      return {
        fiAge: testAge,
        yearsToFI: testAge - currentAge,
        fiNumber
      };
    }
  }

  // Could not reach FI within planning horizon
  return { fiAge: null, yearsToFI: null, fiNumber };
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
 * Accounts for both primary and spouse income when spouse is enabled.
 */
const checkSolvency = (data: FinancialData, testRetirementAge: number): boolean => {
  const {
    currentAge,
    liveUntilAge,
    currentNetWorth,
    retirementAssets,
    nonLiquidAssets,
    monthlyIncome,
    monthlySavings,
    annualBonus,
    incomeIncreaseRate,
    retirementExpenseMultiplier,
    monthlyExpenses,
    monthlyMedical,
    monthlyKidsEducation,
    medicalInflation,
    retirementTaxRate,
    liquidAssetReturn,
    retirementAssetReturn,
    nonLiquidAssetReturn,
    inflationRate,
    simulationMode,
    futureIncome,
    futureIncomeStartAge,
    spouse,
    bulkExpenses = []
  } = data;

  // Use longer planning horizon if spouse is enabled
  const planningHorizon = spouse.enabled
    ? Math.max(liveUntilAge, spouse.liveUntilAge + (currentAge - spouse.currentAge))
    : liveUntilAge;

  let liquidBalance = currentNetWorth;
  let retirementBalance = retirementAssets;
  let nonLiquidBalance = nonLiquidAssets;
  let annualLiving = monthlyExpenses * 12;
  let annualMedical = monthlyMedical * 12;
  let annualKidsEducation = monthlyKidsEducation * 12;

  // Track individual incomes
  let currentPrimaryIncome = monthlyIncome * 12;
  let currentSpouseIncome = spouse.enabled ? spouse.monthlyIncome * 12 : 0;
  let currentBonus = annualBonus;
  let currentSpouseBonus = spouse.enabled ? spouse.annualBonus : 0;

  const taxRate = retirementTaxRate / 100;

  for (let age = currentAge; age <= planningHorizon; age++) {
    const yearOffset = age - currentAge;
    const spouseAge = spouse.enabled ? spouse.currentAge + yearOffset : 0;

    // Bulk expenses this year
    const bulkThisYear = bulkExpenses
      .filter(e => e.age === age)
      .reduce((sum, e) => sum + e.amount, 0);
    liquidBalance -= bulkThisYear;

    const goalsThisYear = data.goals.filter(g => g.targetAge === age);
    const totalGoalCost = goalsThisYear.reduce((sum, g) => sum + g.targetAmount, 0);
    liquidBalance -= totalGoalCost;

    // Determine retirement status for each person
    const primaryRetired = age >= testRetirementAge;
    const spouseRetired = spouse.enabled ? spouseAge >= spouse.retirementAge : true;
    const bothRetired = primaryRetired && spouseRetired;

    let effectiveLiquidReturn = liquidAssetReturn;
    let effectiveRetirementReturn = retirementAssetReturn;
    let effectiveNonLiquidReturn = nonLiquidAssetReturn;
    if (simulationMode === 'leaner') {
      effectiveLiquidReturn -= 1;
      effectiveRetirementReturn -= 1;
      effectiveNonLiquidReturn -= 0.5;
    } else if (simulationMode === 'conservative') {
      effectiveLiquidReturn -= 2;
      effectiveRetirementReturn -= 2;
      effectiveNonLiquidReturn -= 1;
    } else if (simulationMode === 'aggressive') {
      effectiveLiquidReturn += 2;
      effectiveRetirementReturn += 2;
      effectiveNonLiquidReturn += 1;
    }

    // Cyclical crash: happens every 10 years
    if (simulationMode === 'crash' && yearOffset % 10 === 0 && age > currentAge) {
      effectiveLiquidReturn = -20;
      effectiveRetirementReturn = -20;
      effectiveNonLiquidReturn = -5;
    }

    const liquidReturns = liquidBalance * (effectiveLiquidReturn / 100);
    const retirementReturns = retirementBalance * (effectiveRetirementReturn / 100);
    const nonLiquidReturns = nonLiquidBalance * (effectiveNonLiquidReturn / 100);

    // Calculate total family income
    const yearlySavings =
      (!primaryRetired ? currentPrimaryIncome + currentBonus : 0) +
      (!spouseRetired ? currentSpouseIncome + currentSpouseBonus : 0) -
      (bothRetired ? 0 : (annualLiving + annualMedical + annualKidsEducation));

    if (!bothRetired) {
      // At least one person working
      liquidBalance += liquidReturns + Math.max(0, yearlySavings);
      retirementBalance += retirementReturns;
      nonLiquidBalance += nonLiquidReturns;

      // Income growth
      if (!primaryRetired) {
        currentPrimaryIncome *= (1 + incomeIncreaseRate / 100);
        currentBonus *= (1 + incomeIncreaseRate / 100);
      }
      if (!spouseRetired && spouse.enabled) {
        currentSpouseIncome *= (1 + spouse.incomeIncreaseRate / 100);
        currentSpouseBonus *= (1 + spouse.incomeIncreaseRate / 100);
      }
    } else {
      // Both retired
      if (age === testRetirementAge && retirementBalance > 0) {
        liquidBalance += retirementBalance;
        retirementBalance = 0;
      }

      const retirementLiving = annualLiving * (retirementExpenseMultiplier / 100);
      const grossWithdrawal = (retirementLiving + annualMedical + annualKidsEducation) / (1 - taxRate);
      const pension = age >= futureIncomeStartAge ? (futureIncome * 12 * (1 - taxRate)) : 0;

      liquidBalance += liquidReturns - grossWithdrawal + pension;
      nonLiquidBalance += nonLiquidReturns;
    }

    const totalBalance = liquidBalance + retirementBalance + nonLiquidBalance;
    if (totalBalance < 0) return false;

    annualLiving *= (1 + inflationRate / 100);
    annualMedical *= (1 + medicalInflation / 100);
    annualKidsEducation *= (1 + inflationRate / 100);
  }
  return (liquidBalance + retirementBalance + nonLiquidBalance) >= 0;
};

export const calculateFIRE = (data: FinancialData): CalculationResults => {
  const {
    currentAge,
    retirementAge,
    liveUntilAge,
    currentNetWorth,
    retirementAssets,
    nonLiquidAssets,
    monthlyIncome,
    monthlySavings: initialMonthlySavings,
    annualBonus: initialAnnualBonus,
    incomeIncreaseRate,
    retirementExpenseMultiplier,
    monthlyExpenses: initialMonthlyLiving,
    monthlyMedical: initialMonthlyMedical,
    monthlyKidsEducation: initialMonthlyKidsEducation,
    medicalInflation,
    swpAmount: initialSwpAmount,
    retirementTaxRate,
    liquidAssetReturn,
    retirementAssetReturn,
    nonLiquidAssetReturn,
    inflationRate,
    withdrawalRate,
    futureIncome,
    futureIncomeStartAge,
    simulationMode,
    goals,
    spouse,
    bulkExpenses = []
  } = data;

  // Use longer planning horizon if spouse is enabled
  const planningHorizon = spouse.enabled
    ? Math.max(liveUntilAge, spouse.liveUntilAge + (currentAge - spouse.currentAge))
    : liveUntilAge;

  let fiAge: number | null = null;
  for (let testAge = currentAge; testAge <= planningHorizon; testAge++) {
    if (checkSolvency(data, testAge)) {
      fiAge = testAge;
      break;
    }
  }

  const taxRateDecimal = retirementTaxRate / 100;
  const projections: YearProjection[] = [];
  let liquidBalance = currentNetWorth;
  let retirementBalance = retirementAssets;
  let nonLiquidBalance = nonLiquidAssets;
  let currentAnnualLiving = initialMonthlyLiving * 12;
  let currentAnnualMedical = initialMonthlyMedical * 12;
  let currentAnnualKidsEducation = initialMonthlyKidsEducation * 12;

  // Track individual incomes
  let currentPrimaryIncome = monthlyIncome * 12;
  let currentSpouseIncome = spouse.enabled ? spouse.monthlyIncome * 12 : 0;
  let currentMonthlySavings = initialMonthlySavings;
  let currentAnnualBonus = initialAnnualBonus;
  let currentSpouseBonus = spouse.enabled ? spouse.annualBonus : 0;

  const currentYear = new Date().getFullYear();

  for (let age = currentAge; age <= planningHorizon; age++) {
    const year = currentYear + (age - currentAge);
    const yearOffset = age - currentAge;
    const spouseAge = spouse.enabled ? spouse.currentAge + yearOffset : 0;
    const openingLiquidBalance = liquidBalance;
    const openingRetirementBalance = retirementBalance;
    const openingNonLiquidBalance = nonLiquidBalance;

    // Bulk expenses this year
    const bulkThisYear = bulkExpenses
      .filter(e => e.age === age)
      .reduce((sum, e) => sum + e.amount, 0);
    liquidBalance -= bulkThisYear;

    // Determine retirement status for each person
    const primaryRetired = age >= retirementAge;
    const spouseRetired = spouse.enabled ? spouseAge >= spouse.retirementAge : true;
    const bothRetired = primaryRetired && spouseRetired;

    const goalsThisYear = goals.filter(g => g.targetAge === age);
    const totalGoalCost = goalsThisYear.reduce((sum, g) => sum + g.targetAmount, 0);
    liquidBalance -= totalGoalCost;

    let effectiveLiquidReturn = liquidAssetReturn;
    let effectiveRetirementReturn = retirementAssetReturn;
    let effectiveNonLiquidReturn = nonLiquidAssetReturn;
    if (simulationMode === 'leaner') {
      effectiveLiquidReturn -= 1;
      effectiveRetirementReturn -= 1;
      effectiveNonLiquidReturn -= 0.5;
    } else if (simulationMode === 'conservative') {
      effectiveLiquidReturn -= 2;
      effectiveRetirementReturn -= 2;
      effectiveNonLiquidReturn -= 1;
    } else if (simulationMode === 'aggressive') {
      effectiveLiquidReturn += 2;
      effectiveRetirementReturn += 2;
      effectiveNonLiquidReturn += 1;
    }

    if (simulationMode === 'crash' && yearOffset % 10 === 0 && age > currentAge) {
      effectiveLiquidReturn = -20;
      effectiveRetirementReturn = -20;
      effectiveNonLiquidReturn = -5;
    }

    const liquidReturns = liquidBalance * (effectiveLiquidReturn / 100);
    const retirementReturns = retirementBalance * (effectiveRetirementReturn / 100);
    const nonLiquidReturns = nonLiquidBalance * (effectiveNonLiquidReturn / 100);

    const retirementLiving = currentAnnualLiving * (retirementExpenseMultiplier / 100);

    // Calculate total family income
    const primaryYearlyIncome = !primaryRetired ? currentPrimaryIncome + currentAnnualBonus : 0;
    const spouseYearlyIncome = spouse.enabled && !spouseRetired ? currentSpouseIncome + currentSpouseBonus : 0;
    const totalFamilyIncome = primaryYearlyIncome + spouseYearlyIncome;

    // Calculate working phase expenses
    const workingPhaseExpenses = currentAnnualLiving + currentAnnualMedical + currentAnnualKidsEducation;
    const yearlySavings = !bothRetired ? Math.max(0, totalFamilyIncome - workingPhaseExpenses) : 0;

    const totalOutflowNet = bothRetired ? (retirementLiving + currentAnnualMedical + currentAnnualKidsEducation) : workingPhaseExpenses;
    const grossNeeded = bothRetired ? totalOutflowNet / (1 - taxRateDecimal) : 0;
    const hasFutureIncome = age >= futureIncomeStartAge;
    const yearlyFutureIncomeNet = hasFutureIncome ? (futureIncome * 12 * (1 - taxRateDecimal)) : 0;

    if (!bothRetired) {
      // At least one person working
      liquidBalance += liquidReturns + yearlySavings;
      retirementBalance += retirementReturns;
      nonLiquidBalance += nonLiquidReturns;

      // Income growth for those still working
      if (!primaryRetired) {
        currentPrimaryIncome *= (1 + incomeIncreaseRate / 100);
        currentAnnualBonus *= (1 + incomeIncreaseRate / 100);
      }
      if (spouse.enabled && !spouseRetired) {
        currentSpouseIncome *= (1 + spouse.incomeIncreaseRate / 100);
        currentSpouseBonus *= (1 + spouse.incomeIncreaseRate / 100);
      }
      // Only grow savings if at least one is working
      currentMonthlySavings *= (1 + incomeIncreaseRate / 100);
    } else {
      // Both retired
      if (age === retirementAge && retirementBalance > 0) {
        liquidBalance += retirementBalance;
        retirementBalance = 0;
      }

      liquidBalance += liquidReturns - grossNeeded + yearlyFutureIncomeNet;
      nonLiquidBalance += nonLiquidReturns;
    }

    const totalBalance = liquidBalance + retirementBalance + nonLiquidBalance;
    const dynamicFiNumber = ((retirementLiving + currentAnnualMedical + currentAnnualKidsEducation) / (1 - taxRateDecimal)) / (withdrawalRate / 100);

    projections.push({
      year,
      age,
      openingBalance: Math.round(openingLiquidBalance + openingRetirementBalance + openingNonLiquidBalance),
      returns: Math.round(liquidReturns + retirementReturns + nonLiquidReturns),
      netWorth: Math.max(0, Math.round(totalBalance)),
      isRetired: bothRetired,
      income: Math.round(totalFamilyIncome),
      livingExpenses: Math.round(bothRetired ? retirementLiving : currentAnnualLiving),
      medicalExpenses: Math.round(currentAnnualMedical),
      kidsEducationExpenses: Math.round(currentAnnualKidsEducation),
      bulkExpenses: Math.round(bulkThisYear),
      totalOutflow: Math.round(bothRetired ? grossNeeded : workingPhaseExpenses),
      fiNumber: Math.round(dynamicFiNumber),
      passiveIncome: Math.round(bothRetired ? (grossNeeded * (1 - taxRateDecimal) + yearlyFutureIncomeNet) : 0),
      goalSpending: totalGoalCost,
      yearlySavings: Math.round(yearlySavings)
    });

    currentAnnualLiving *= (1 + inflationRate / 100);
    currentAnnualMedical *= (1 + medicalInflation / 100);
    currentAnnualKidsEducation *= (1 + inflationRate / 100);

    if (totalBalance < -1000000000) break;
  }

  const baseFiNumber = ((initialMonthlyLiving * 12 * (retirementExpenseMultiplier / 100) + initialMonthlyMedical * 12 + initialMonthlyKidsEducation * 12) / (1 - taxRateDecimal)) / (withdrawalRate / 100);

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
    fiExpenses: (initialMonthlyLiving * 12 * (retirementExpenseMultiplier / 100)) + initialMonthlyMedical * 12 + initialMonthlyKidsEducation * 12,
    timeToFI: fiAge !== null ? fiAge - currentAge : null,
    milestones,
    safeWithdrawalAmount: initialSwpAmount,
    isSolventAtEnd: (liquidBalance + retirementBalance + nonLiquidBalance) >= 0
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
