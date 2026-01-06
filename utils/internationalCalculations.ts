// International Financial Planning Calculation Engine
import {
    InternationalScenario,
    ScenarioResults,
    YearlyProjectionIntl,
    LifePhase,
    Recommendation,
    RelocationCosts,
} from '../types/internationalPlanning';
import {
    COUNTRIES,
    calculateTax,
    getCostOfLivingMultiplier,
    convertCurrency,
    getEffectiveTaxRate,
} from '../data/countries';

// Exchange rate simulation with volatility
const simulateExchangeRate = (
    baseRate: number,
    volatility: number,
    yearOffset: number
): number => {
    // Simple random walk with mean reversion
    const randomFactor = 1 + ((Math.random() - 0.5) * 2 * (volatility / 100));
    const meanReversion = 0.95; // Pulls back toward base rate
    return baseRate * randomFactor * Math.pow(meanReversion, yearOffset);
};

// Calculate inflation-adjusted expenses
const calculateInflationAdjustedExpense = (
    baseExpense: number,
    inflationRate: number,
    years: number
): number => {
    return baseExpense * Math.pow(1 + inflationRate / 100, years);
};

// Calculate relocation costs between countries
export const calculateRelocationCosts = (
    fromCountry: string,
    toCountry: string,
    familySize: number
): RelocationCosts => {
    const toCountryData = COUNTRIES[toCountry];

    // Base moving costs (international move)
    const movingExpenses = 15000 + (familySize - 1) * 3000;

    // Visa processing
    const visaOption = toCountryData?.visaOptions?.[0];
    const visaProcessingFees = (visaOption?.annualCost || 2000) + 500; // First year + application

    // Legal fees (immigration lawyers, document processing)
    const legalFees = 5000;

    // Temporary housing (3 months average)
    const monthlyRent = (toCountryData?.costOfLivingIndex || 50) * 20; // Rough estimate
    const temporaryHousing = monthlyRent * 3;

    // Exchange rate lock (forward contract cost)
    const exchangeRateLockCost = 1000;

    return {
        movingExpenses,
        visaProcessingFees,
        legalFees,
        temporaryHousing,
        exchangeRateLockCost,
        totalEstimate: movingExpenses + visaProcessingFees + legalFees + temporaryHousing + exchangeRateLockCost,
    };
};

// Calculate retirement account portability
export const calculateAccountPortability = (
    fromCountry: string,
    toCountry: string,
    accountType: string,
    balance: number
): { portableAmount: number; penalty: number; taxImplication: number } => {
    // Simplified portability rules
    const fromData = COUNTRIES[fromCountry];
    const toData = COUNTRIES[toCountry];

    // Check if tax treaty exists
    const hasTaxTreaty = fromData?.hasUSATaxTreaty && toData?.hasUSATaxTreaty;

    // Early withdrawal penalties
    let penalty = 0;
    if (accountType === '401k' || accountType === 'ira') {
        // Early withdrawal typically 10% before 59.5
        penalty = balance * 0.10;
    }

    // Tax implications
    let taxImplication = 0;
    if (!hasTaxTreaty) {
        // Double taxation risk
        taxImplication = balance * 0.15; // Withholding tax
    }

    const portableAmount = balance - penalty - taxImplication;

    return { portableAmount, penalty, taxImplication };
};

// Main scenario calculation
export const calculateInternationalScenario = (
    scenario: InternationalScenario
): ScenarioResults => {
    const projections: YearlyProjectionIntl[] = [];
    const recommendations: Recommendation[] = [];
    const warnings: string[] = [];

    let currentLiquidUSD = scenario.liquidAssets.reduce((sum, a) => sum + a.valueInUSD, 0);
    let currentRetirementUSD = scenario.retirementAccounts.reduce((sum, a) => sum + a.valueInUSD, 0);
    let currentRealEstateUSD = scenario.realEstateAssets.reduce(
        (sum, a) => sum + (a.valueInUSD - a.mortgageBalance * COUNTRIES[a.country]?.exchangeRateToUSD || 0),
        0
    );

    const currentYear = new Date().getFullYear();
    let fiAge: number | null = null;
    let retirementYear: number | null = null;

    // Process each year from current age to life expectancy
    for (let age = scenario.currentAge; age <= scenario.lifeExpectancy; age++) {
        const year = currentYear + (age - scenario.currentAge);
        const yearsElapsed = age - scenario.currentAge;

        // Find current life phase
        const currentPhase = scenario.phases.find(
            p => age >= p.startAge && age <= p.endAge
        ) || scenario.phases[scenario.phases.length - 1];

        const country = COUNTRIES[currentPhase.country];
        if (!country) continue;

        // Calculate income for this year
        let grossIncome = 0;
        let netIncome = 0;
        let retirementContributions = 0;

        if (currentPhase.type === 'work' && currentPhase.annualIncome) {
            const growthRate = currentPhase.incomeGrowthRate || 3;
            grossIncome = currentPhase.annualIncome * Math.pow(1 + growthRate / 100, yearsElapsed);

            // Calculate taxes
            const incomeTax = calculateTax(grossIncome, currentPhase.country);
            const socialSecurityTax = grossIncome * (country.socialSecurityRate / 100);
            const totalTax = incomeTax + socialSecurityTax;

            netIncome = grossIncome - totalTax;

            // Retirement contributions (assume max contributions)
            if (currentPhase.retirementContributions) {
                retirementContributions = currentPhase.retirementContributions.reduce(
                    (sum, c) => sum + c.annualContribution + (c.employerMatch || 0),
                    0
                );
            } else {
                // Default 10% of gross income
                retirementContributions = grossIncome * 0.10;
            }
        }

        // Calculate expenses
        const baseExpenses = currentPhase.monthlyExpenses * 12;

        // Use per-country inflation if available, otherwise fallback to database or scenario
        const countryConfig = scenario.countryConfigs[currentPhase.country];
        const localInflation = countryConfig?.inflationRate ?? country.averageInflation;

        const livingExpenses = calculateInflationAdjustedExpense(baseExpenses, localInflation, yearsElapsed);

        // Healthcare costs (increases faster with age)
        const ageHealthMultiplier = age > 60 ? 1 + ((age - 60) * 0.05) : 1;
        const healthcareCosts = (country.healthcareCostIndex * 50 * 12) * ageHealthMultiplier;

        // Convert expenses to USD for comparison
        const livingExpensesUSD = livingExpenses * country.exchangeRateToUSD;
        const healthcareCostsUSD = healthcareCosts * country.exchangeRateToUSD;

        // Passive income (from investments)
        const passiveIncome = currentLiquidUSD * 0.04; // 4% SWP

        // Calculate investment returns based on per-country config
        const liquidReturn = (countryConfig?.expectedReturnLiquid ?? (currentPhase.type === 'retirement' ? 5 : 8)) / 100;
        const retirementReturn = (countryConfig?.expectedReturnRetirement ?? 7) / 100;
        const realEstateReturn = (countryConfig?.expectedReturnRealEstate ?? 4) / 100;

        const liquidGrowth = currentLiquidUSD * liquidReturn;
        const retirementGrowth = currentRetirementUSD * retirementReturn;
        const realEstateGrowth = currentRealEstateUSD * realEstateReturn;

        // Net cash flow
        let netCashFlow = 0;
        if (currentPhase.type === 'work') {
            netCashFlow = netIncome - livingExpenses - healthcareCosts - retirementContributions;
        } else {
            // In retirement, draw from savings
            netCashFlow = passiveIncome - livingExpenses - healthcareCosts;
        }

        // Update balances
        currentLiquidUSD += liquidGrowth + (netCashFlow * country.exchangeRateToUSD);
        currentRetirementUSD += retirementGrowth + retirementContributions * country.exchangeRateToUSD;
        currentRealEstateUSD += realEstateGrowth;

        // Apply exchange rate volatility
        const exchangeRate = simulateExchangeRate(
            country.exchangeRateToUSD,
            scenario.exchangeRateVolatility,
            yearsElapsed
        );
        const exchangeRateImpact = (exchangeRate / country.exchangeRateToUSD - 1) * currentLiquidUSD;

        // Check for FI/RE milestone
        const totalNetWorthUSD = currentLiquidUSD + currentRetirementUSD + currentRealEstateUSD;
        const annualExpensesUSD = livingExpensesUSD + healthcareCostsUSD;
        const fiNumber = annualExpensesUSD * 25; // 4% rule

        if (!fiAge && totalNetWorthUSD >= fiNumber && currentPhase.type !== 'retirement') {
            fiAge = age;
            retirementYear = year;
        }

        const isSolvent = currentLiquidUSD > 0 || (currentPhase.type !== 'retirement');

        projections.push({
            year,
            age,
            phase: currentPhase.type,
            country: currentPhase.country,
            currency: country.currency,
            grossIncome,
            grossIncomeUSD: grossIncome * country.exchangeRateToUSD,
            taxPaid: grossIncome - netIncome,
            netIncome,
            passiveIncome,
            livingExpenses,
            livingExpensesUSD,
            healthcareCosts: healthcareCostsUSD,
            taxesOwed: grossIncome - netIncome,
            retirementContributions,
            investmentGrowth: liquidGrowth + retirementGrowth + realEstateGrowth,
            liquidAssetsLocal: currentLiquidUSD / country.exchangeRateToUSD,
            liquidAssetsUSD: currentLiquidUSD,
            retirementAssetsUSD: currentRetirementUSD,
            realEstateEquityUSD: currentRealEstateUSD,
            totalNetWorthUSD,
            exchangeRate,
            exchangeRateImpact,
            isSolvent,
        });

        if (!isSolvent && !warnings.includes('Portfolio depletes before life expectancy')) {
            warnings.push('Portfolio depletes before life expectancy');
        }
    }

    // Generate recommendations
    generateRecommendations(scenario, projections, recommendations, warnings);

    // Calculate success metrics
    const finalProjection = projections[projections.length - 1];
    const successProbability = calculateSuccessProbability(projections);

    return {
        projections,
        fiAge,
        retirementYear,
        requiredCorpus: projections[0] ? projections[0].livingExpensesUSD * 25 : 0,
        successProbability,
        worstCaseEndBalance: finalProjection?.totalNetWorthUSD * 0.6 || 0,
        bestCaseEndBalance: finalProjection?.totalNetWorthUSD * 1.4 || 0,
        medianEndBalance: finalProjection?.totalNetWorthUSD || 0,
        exchangeRateRisk: scenario.exchangeRateVolatility > 15 ? 'high' : scenario.exchangeRateVolatility > 8 ? 'moderate' : 'low',
        inflationRisk: scenario.inflationScenario === 'high' ? 'high' : scenario.inflationScenario === 'moderate' ? 'moderate' : 'low',
        taxEfficiency: calculateTaxEfficiency(scenario, projections),
        recommendations,
        warnings,
    };
};

// Calculate success probability based on solvency
const calculateSuccessProbability = (projections: YearlyProjectionIntl[]): number => {
    const solventYears = projections.filter(p => p.isSolvent).length;
    return (solventYears / projections.length) * 100;
};

// Calculate tax efficiency score
const calculateTaxEfficiency = (
    scenario: InternationalScenario,
    projections: YearlyProjectionIntl[]
): number => {
    const totalIncome = projections.reduce((sum, p) => sum + p.grossIncomeUSD, 0);
    const totalTax = projections.reduce((sum, p) => sum + p.taxPaid * COUNTRIES[p.country]?.exchangeRateToUSD || 0, 0);

    const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

    // Score: lower effective rate = higher efficiency
    // US average is ~22%, so score relative to that
    return Math.max(0, Math.min(100, 100 - (effectiveRate - 15) * 3));
};

// Generate recommendations based on analysis
const generateRecommendations = (
    scenario: InternationalScenario,
    projections: YearlyProjectionIntl[],
    recommendations: Recommendation[],
    warnings: string[]
): void => {
    // Tax optimization recommendations
    const workPhases = scenario.phases.filter(p => p.type === 'work');
    const retirementPhase = scenario.phases.find(p => p.type === 'retirement');

    if (workPhases.length > 0 && retirementPhase) {
        const workCountry = COUNTRIES[workPhases[0].country];
        const retireCountry = COUNTRIES[retirementPhase.country];

        // Check for tax-advantaged retirement locations
        if (retireCountry && retireCountry.code === 'AE') {
            recommendations.push({
                category: 'tax',
                priority: 'high',
                title: 'Zero Income Tax Retirement',
                description: 'UAE has no personal income tax. Ensure 401k/IRA withdrawals are structured to minimize US withholding.',
                potentialSaving: projections.reduce((sum, p) => sum + p.taxPaid, 0) * 0.3,
            });
        }

        if (retireCountry && retireCountry.code === 'PT') {
            recommendations.push({
                category: 'tax',
                priority: 'high',
                title: 'NHR Tax Regime',
                description: 'Portugal\'s Non-Habitual Resident regime offers 10 years of reduced taxes on foreign pension income.',
                potentialSaving: projections.reduce((sum, p) => sum + p.taxPaid, 0) * 0.2,
            });
        }

        // Cost of living arbitrage
        if (retireCountry && workCountry && retireCountry.costOfLivingIndex < workCountry.costOfLivingIndex * 0.6) {
            const savings = workCountry.costOfLivingIndex - retireCountry.costOfLivingIndex;
            recommendations.push({
                category: 'location',
                priority: 'high',
                title: 'Geographic Arbitrage Opportunity',
                description: `Retiring in ${retireCountry.name} vs ${workCountry.name} reduces living costs by ~${Math.round(100 - (retireCountry.costOfLivingIndex / workCountry.costOfLivingIndex) * 100)}%`,
                potentialSaving: projections.filter(p => p.phase === 'retirement').reduce((sum, p) => sum + p.livingExpensesUSD, 0) * 0.3,
            });
        }
    }

    // Retirement account recommendations
    const usAccounts = scenario.retirementAccounts.filter(a => a.country === 'US');
    if (usAccounts.length > 0 && retirementPhase?.country !== 'US') {
        recommendations.push({
            category: 'retirement-account',
            priority: 'medium',
            title: 'US Retirement Account Strategy',
            description: 'Consider Roth conversion ladder before leaving US to minimize future tax liability on retirement withdrawals.',
            potentialSaving: usAccounts.reduce((sum, a) => sum + a.currentBalance * 0.15, 0),
        });
    }

    // Timing recommendations
    const transitionPhase = scenario.phases.find(p => p.type === 'transition');
    if (!transitionPhase && scenario.phases.length > 1) {
        recommendations.push({
            category: 'timing',
            priority: 'medium',
            title: 'Add Transition Buffer',
            description: 'Consider adding a 6-12 month transition phase to account for relocation costs, job search, and settling in.',
        });
    }

    // Exchange rate warnings
    const exchangeRisk = scenario.exchangeRateVolatility;
    if (exchangeRisk > 15) {
        warnings.push(`High exchange rate volatility (${exchangeRisk}%) could significantly impact retirement corpus`);
        recommendations.push({
            category: 'investment',
            priority: 'high',
            title: 'Currency Hedging',
            description: 'Consider hedging 30-50% of retirement assets to reduce exchange rate risk.',
        });
    }
};

// Create a default scenario
export const createDefaultScenario = (type: 'work-retire' | 'work-move-retire' | 'work-move-work-retire'): InternationalScenario => {
    const baseScenario: InternationalScenario = {
        id: `scenario-${Date.now()}`,
        name: 'New International Plan',
        type,
        currentAge: 35,
        lifeExpectancy: 90,
        phases: [],
        liquidAssets: [{
            country: 'US',
            currency: 'USD',
            currentValue: 100000,
            valueInUSD: 100000,
            assetType: 'mixed',
            expectedReturn: 7,
            taxEfficient: false,
        }],
        retirementAccounts: [{
            country: 'US',
            accountType: '401k',
            currentBalance: 200000,
            valueInUSD: 200000,
            vestingPercentage: 100,
            portableToCountries: ['US'],
            earlyWithdrawalPenalty: 10,
            withdrawalAge: 59.5,
            expectedReturn: 8,
        }],
        realEstateAssets: [],
        countryConfigs: {
            US: {
                inflationRate: 3.0,
                expectedReturnLiquid: 8,
                expectedReturnRetirement: 7,
                expectedReturnRealEstate: 4
            },
            IN: {
                inflationRate: 6.0,
                expectedReturnLiquid: 12,
                expectedReturnRetirement: 10,
                expectedReturnRealEstate: 7
            }
        },
        exchangeRateVolatility: 10,
        inflationScenario: 'moderate',
    };

    switch (type) {
        case 'work-retire':
            baseScenario.phases = [
                {
                    id: 'work-1',
                    type: 'work',
                    country: 'US',
                    startAge: 35,
                    endAge: 55,
                    annualIncome: 150000,
                    incomeGrowthRate: 3,
                    monthlyExpenses: 5000,
                },
                {
                    id: 'retire-1',
                    type: 'retirement',
                    country: 'IN',
                    startAge: 56,
                    endAge: 90,
                    monthlyExpenses: 125000, // ~1.5L INR per month is a more realistic upper-middle class retirement
                },
            ];
            break;

        case 'work-move-retire':
            baseScenario.phases = [
                {
                    id: 'work-1',
                    type: 'work',
                    country: 'US',
                    startAge: 35,
                    endAge: 50,
                    annualIncome: 150000,
                    incomeGrowthRate: 3,
                    monthlyExpenses: 5000,
                },
                {
                    id: 'transition-1',
                    type: 'transition',
                    country: 'IN',
                    startAge: 51,
                    endAge: 51,
                    monthlyExpenses: 8000,
                },
                {
                    id: 'work-2',
                    type: 'work',
                    country: 'IN',
                    startAge: 52,
                    endAge: 60,
                    annualIncome: 80000,
                    incomeGrowthRate: 2,
                    monthlyExpenses: 3000,
                },
                {
                    id: 'retire-1',
                    type: 'retirement',
                    country: 'IN',
                    startAge: 61,
                    endAge: 90,
                    monthlyExpenses: 2500,
                },
            ];
            break;

        case 'work-move-work-retire':
            baseScenario.phases = [
                {
                    id: 'work-1',
                    type: 'work',
                    country: 'US',
                    startAge: 35,
                    endAge: 45,
                    annualIncome: 150000,
                    incomeGrowthRate: 3,
                    monthlyExpenses: 5000,
                },
                {
                    id: 'transition-1',
                    type: 'transition',
                    country: 'SG',
                    startAge: 46,
                    endAge: 46,
                    monthlyExpenses: 10000,
                },
                {
                    id: 'work-2',
                    type: 'work',
                    country: 'SG',
                    startAge: 47,
                    endAge: 55,
                    annualIncome: 200000,
                    incomeGrowthRate: 2,
                    monthlyExpenses: 6000,
                },
                {
                    id: 'transition-2',
                    type: 'transition',
                    country: 'TH',
                    startAge: 56,
                    endAge: 56,
                    monthlyExpenses: 5000,
                },
                {
                    id: 'retire-1',
                    type: 'retirement',
                    country: 'TH',
                    startAge: 57,
                    endAge: 90,
                    monthlyExpenses: 2000,
                },
            ];
            break;
    }

    return baseScenario;
};

// Format currency with proper symbols
export const formatIntlCurrency = (amount: number, currencyCode: string): string => {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return `${currencyCode} ${amount.toLocaleString()}`;
    }
};

// Format compact numbers
export const formatIntlCompact = (amount: number, currencyCode: string = 'USD'): string => {
    if (amount === 0) return '0';
    const absValue = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (currencyCode === 'INR') {
        if (absValue >= 10000000) return `${sign}${(absValue / 10000000).toFixed(1)}Cr`;
        if (absValue >= 100000) return `${sign}${(absValue / 100000).toFixed(1)}L`;
        if (absValue >= 1000) return `${sign}${(absValue / 1000).toFixed(0)}K`;
        return amount.toLocaleString('en-IN');
    } else {
        if (absValue >= 1000000) return `${sign}${(absValue / 1000000).toFixed(1)}M`;
        if (absValue >= 1000) return `${sign}${(absValue / 1000).toFixed(0)}K`;
        return amount.toLocaleString('en-US');
    }
};
// Calculate lifestyle matching expense in a new country based on PPP
export const calculateLifestyleMatch = (
    baseExpenses: number,
    fromCountryCode: string,
    toCountryCode: string
): number => {
    const from = COUNTRIES[fromCountryCode];
    const to = COUNTRIES[toCountryCode];

    if (!from || !to) return baseExpenses;

    // USD value of base expenses
    const baseExpensesUSD = baseExpenses * from.exchangeRateToUSD;

    // PPP adjustment (how many USD needed in 'to' country to match 'from' country lifestyle)
    const matchedExpensesUSD = baseExpensesUSD * (to.costOfLivingIndex / from.costOfLivingIndex);

    // Convert USD back to 'to' country local currency
    return matchedExpensesUSD / to.exchangeRateToUSD;
};
