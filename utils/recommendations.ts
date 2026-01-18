/**
 * FIRE Recommendation Engine
 * 
 * Calculates personalized recommendations for achieving financial independence
 * based on user's current financial data and goals.
 */

import { FinancialData, CurrencyCode } from '../types';

export interface FIRERecommendation {
    // Core metrics
    yearsToRetirement: number;
    requiredCorpus: number;
    futureValueCurrentSavings: number;
    gapToFill: number;
    monthlyContributionNeeded: number;
    currentMonthlySavings: number;

    // Analysis
    isOnTrack: boolean;
    shortfallMonthly: number;
    surplusMonthly: number;
    savingsRateNeeded: number;
    currentSavingsRate: number;

    // Actionable recommendations
    recommendations: RecommendationItem[];
}

export interface RecommendationItem {
    id: string;
    category: 'savings' | 'income' | 'expenses' | 'investments' | 'timeline';
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    actionSteps: string[];
}

/**
 * Calculate real rate of return (adjusted for inflation)
 */
export const calculateRealReturnRate = (
    nominalReturn: number,
    inflationRate: number
): number => {
    return ((1 + nominalReturn / 100) / (1 + inflationRate / 100)) - 1;
};

/**
 * Calculate required retirement corpus using Present Value of Annuity formula
 * This tells you how much you need at retirement to withdraw desired income each year
 */
export const calculateRequiredCorpus = (
    desiredAnnualIncome: number,
    yearsInRetirement: number,
    realReturnRate: number
): number => {
    if (realReturnRate === 0) {
        return desiredAnnualIncome * yearsInRetirement;
    }

    // PV of Annuity: A × ((1 - (1 + r)^(-n)) / r)
    return desiredAnnualIncome * ((1 - Math.pow(1 + realReturnRate, -yearsInRetirement)) / realReturnRate);
};

/**
 * Calculate future value of current savings
 */
export const calculateFutureValueSavings = (
    currentSavings: number,
    annualReturnRate: number,
    years: number
): number => {
    return currentSavings * Math.pow(1 + annualReturnRate / 100, years);
};

/**
 * Calculate monthly contribution needed using Future Value of Annuity formula
 */
export const calculateMonthlyContributionNeeded = (
    gap: number,
    annualReturnRate: number,
    years: number
): number => {
    if (gap <= 0) return 0;

    // Convert annual rate to monthly
    const monthlyRate = Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1;
    const totalMonths = years * 12;

    if (monthlyRate === 0) {
        return gap / totalMonths;
    }

    // PMT = (FV × r) / ((1 + r)^n - 1)
    return (gap * monthlyRate) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
};

/**
 * Generate personalized recommendations based on financial analysis
 */
export const generateRecommendations = (
    data: FinancialData,
    analysis: Omit<FIRERecommendation, 'recommendations'>
): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];

    // 1. Critical: If severely off track (need >50% more savings)
    if (analysis.shortfallMonthly > 0) {
        const shortfallPercent = (analysis.shortfallMonthly / analysis.currentMonthlySavings) * 100;

        if (shortfallPercent > 100) {
            recommendations.push({
                id: 'critical-savings-gap',
                category: 'timeline',
                priority: 'critical',
                title: 'Significant Gap to FIRE Goal',
                description: `Your current savings rate won't meet your retirement goal. You need to save an additional ${formatCurrency(analysis.shortfallMonthly)} per month.`,
                impact: `Bridge the ${formatCurrency(analysis.gapToFill)} gap in your retirement corpus`,
                actionSteps: [
                    'Consider extending your working years by 3-5 years',
                    'Look for opportunities to increase income (promotion, side gigs)',
                    'Review and reduce discretionary expenses by 20-30%',
                    'Consider downsizing lifestyle in retirement'
                ]
            });
        } else if (shortfallPercent > 50) {
            recommendations.push({
                id: 'high-savings-gap',
                category: 'savings',
                priority: 'high',
                title: 'Increase Monthly Savings',
                description: `You need to save ${formatCurrency(analysis.monthlyContributionNeeded)} per month, but currently saving ${formatCurrency(analysis.currentMonthlySavings)}.`,
                impact: `An extra ${formatCurrency(analysis.shortfallMonthly)}/month ensures a comfortable retirement`,
                actionSteps: [
                    `Increase monthly savings by ${formatCurrency(analysis.shortfallMonthly)}`,
                    'Automate additional savings to investment accounts',
                    'Review subscriptions and recurring expenses',
                    'Consider the 50/30/20 budgeting rule'
                ]
            });
        } else {
            recommendations.push({
                id: 'moderate-savings-gap',
                category: 'savings',
                priority: 'medium',
                title: 'Fine-Tune Your Savings',
                description: `You're close! Just ${formatCurrency(analysis.shortfallMonthly)} more per month puts you on track.`,
                impact: 'Small adjustments lead to big results over time',
                actionSteps: [
                    'Cut one unnecessary expense',
                    'Redirect any raises directly to savings',
                    'Use cashback and rewards strategically'
                ]
            });
        }
    }

    // 2. If on track or ahead
    if (analysis.isOnTrack && analysis.surplusMonthly > 0) {
        recommendations.push({
            id: 'on-track-surplus',
            category: 'investments',
            priority: 'low',
            title: '🎉 You\'re On Track!',
            description: `Great news! You're saving ${formatCurrency(analysis.surplusMonthly)} more than needed per month.`,
            impact: 'You could retire even earlier or have a larger retirement cushion',
            actionSteps: [
                'Consider retiring 1-2 years earlier if desired',
                'Build a larger emergency fund (12-24 months expenses)',
                'Invest surplus in tax-advantaged accounts',
                'Consider legacy planning or charitable giving'
            ]
        });
    }

    // 3. Savings Rate Analysis
    if (analysis.currentSavingsRate < 15) {
        recommendations.push({
            id: 'low-savings-rate',
            category: 'savings',
            priority: 'high',
            title: 'Boost Your Savings Rate',
            description: `Your current savings rate is ${analysis.currentSavingsRate.toFixed(1)}%. Aim for at least 20-30% for FIRE.`,
            impact: `Every 5% increase in savings rate can reduce years to FIRE by 3-5 years`,
            actionSteps: [
                'Track all expenses for one month to identify leaks',
                'Implement the "pay yourself first" strategy',
                'Increase savings by 1% every quarter until you reach 25%+',
                'Avoid lifestyle inflation when income increases'
            ]
        });
    } else if (analysis.currentSavingsRate >= 30) {
        recommendations.push({
            id: 'excellent-savings-rate',
            category: 'savings',
            priority: 'low',
            title: '⭐ Excellent Savings Rate',
            description: `At ${analysis.currentSavingsRate.toFixed(1)}%, you're a savings superstar!`,
            impact: 'Your aggressive saving puts early retirement within reach',
            actionSteps: [
                'Ensure you\'re maximizing tax-advantaged accounts',
                'Consider diversifying into index funds for long-term growth',
                'Build skills for post-FIRE income if desired'
            ]
        });
    }

    // 4. Investment Return Optimization
    const avgReturn = (data.liquidAssetReturn + data.retirementAssetReturn) / 2;
    if (avgReturn < 8) {
        recommendations.push({
            id: 'optimize-returns',
            category: 'investments',
            priority: 'medium',
            title: 'Review Investment Strategy',
            description: `Your average return of ${avgReturn.toFixed(1)}% may be conservative for your timeline.`,
            impact: 'Even 1-2% higher returns compound significantly over decades',
            actionSteps: [
                'Consider low-cost index funds for better diversification',
                'Review asset allocation based on your risk tolerance',
                'Minimize investment fees (look for expense ratios < 0.2%)',
                'Consider tax-loss harvesting strategies'
            ]
        });
    }

    // 5. Expense Reduction Opportunities
    const totalMonthlyExpenses = data.monthlyExpenses + data.monthlyMedical + data.monthlyKidsEducation;
    const expenseToIncomeRatio = (totalMonthlyExpenses / data.monthlyIncome) * 100;

    if (expenseToIncomeRatio > 70) {
        recommendations.push({
            id: 'reduce-expenses',
            category: 'expenses',
            priority: 'high',
            title: 'High Expense Ratio',
            description: `You're spending ${expenseToIncomeRatio.toFixed(0)}% of income. Target below 60% for FIRE.`,
            impact: `Reducing expenses by 10% could accelerate FIRE by several years`,
            actionSteps: [
                'Audit your top 3 expense categories',
                'Negotiate recurring bills (insurance, phone, internet)',
                'Consider housing costs - aim for < 30% of income',
                'Use the 30-day rule for non-essential purchases'
            ]
        });
    }

    // 6. Income Growth Strategy
    if (data.incomeIncreaseRate < 3) {
        recommendations.push({
            id: 'increase-income-growth',
            category: 'income',
            priority: 'medium',
            title: 'Accelerate Income Growth',
            description: `Your expected income growth of ${data.incomeIncreaseRate}% may trail inflation.`,
            impact: 'Higher income directly increases your FIRE potential',
            actionSteps: [
                'Develop high-demand skills in your industry',
                'Request performance reviews and raises annually',
                'Consider side income streams or consulting',
                'Network and explore career advancement opportunities'
            ]
        });
    }

    // 7. Emergency Fund Check
    const emergencyFundMonths = data.currentNetWorth / totalMonthlyExpenses;
    if (emergencyFundMonths < 6) {
        recommendations.push({
            id: 'build-emergency-fund',
            category: 'savings',
            priority: 'high',
            title: 'Build Emergency Fund',
            description: `Your liquid assets cover only ${emergencyFundMonths.toFixed(1)} months of expenses.`,
            impact: 'A 6-12 month emergency fund protects your FIRE journey',
            actionSteps: [
                'Prioritize building 3 months buffer first',
                'Keep emergency funds in high-yield savings account',
                'Separate emergency fund from investment accounts',
                'Target 6-12 months of expenses before aggressive investing'
            ]
        });
    }

    // 8. Healthcare Planning
    if (data.monthlyMedical < 200 && data.currentAge > 40) {
        recommendations.push({
            id: 'healthcare-planning',
            category: 'expenses',
            priority: 'medium',
            title: 'Plan for Healthcare Costs',
            description: 'Healthcare costs typically increase with age and in retirement.',
            impact: 'Medical expenses are a leading cause of retirement plan failures',
            actionSteps: [
                'Research health insurance options for early retirees',
                'Consider HSA contributions for tax-free medical savings',
                'Budget for increasing medical costs (10-15% annually)',
                'Explore Medicare options for age 65+'
            ]
        });
    }

    // 9. Spouse Income Optimization
    if (data.spouse.enabled && data.spouse.monthlyIncome > 0) {
        const spouseContribution = (data.spouse.monthlyIncome / (data.monthlyIncome + data.spouse.monthlyIncome)) * 100;
        recommendations.push({
            id: 'dual-income-advantage',
            category: 'income',
            priority: 'low',
            title: '👫 Dual Income Advantage',
            description: `Spouse contributes ${spouseContribution.toFixed(0)}% of household income.`,
            impact: 'Dual incomes significantly accelerate FIRE timelines',
            actionSteps: [
                'Coordinate retirement account contributions',
                'Consider staggered retirement for healthcare coverage',
                'Maximize both employer 401k matches',
                'Plan for different retirement ages if applicable'
            ]
        });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations;
};

/**
 * Main function to calculate FIRE recommendations
 */
export const calculateFIRERecommendations = (data: FinancialData): FIRERecommendation => {
    // Step 1: Calculate years to retirement
    const yearsToRetirement = Math.max(0, data.retirementAge - data.currentAge);

    // Step 2: Calculate years in retirement
    const yearsInRetirement = Math.max(0, data.liveUntilAge - data.retirementAge);

    // Step 3: Calculate real rate of return (adjusted for inflation)
    const avgNominalReturn = (data.liquidAssetReturn + data.retirementAssetReturn) / 2;
    const realReturnRate = calculateRealReturnRate(avgNominalReturn, data.inflationRate);

    // Step 4: Calculate desired annual income in retirement
    const currentAnnualExpenses = (data.monthlyExpenses + data.monthlyMedical + data.monthlyKidsEducation) * 12;
    const desiredAnnualIncome = currentAnnualExpenses * (data.retirementExpenseMultiplier / 100);

    // Step 5: Calculate required retirement corpus
    const requiredCorpus = calculateRequiredCorpus(desiredAnnualIncome, yearsInRetirement, realReturnRate);

    // Step 6: Calculate current total savings
    const currentSavings = data.currentNetWorth + data.retirementAssets + data.nonLiquidAssets;

    // Step 7: Calculate future value of current savings
    const futureValueCurrentSavings = calculateFutureValueSavings(currentSavings, avgNominalReturn, yearsToRetirement);

    // Step 8: Calculate gap to fill
    const gapToFill = Math.max(0, requiredCorpus - futureValueCurrentSavings);

    // Step 9: Calculate monthly contribution needed
    const monthlyContributionNeeded = yearsToRetirement > 0
        ? calculateMonthlyContributionNeeded(gapToFill, avgNominalReturn, yearsToRetirement)
        : gapToFill;

    // Step 10: Calculate current monthly savings
    let currentMonthlySavings = data.monthlySavings + (data.annualBonus / 12);
    if (data.spouse.enabled) {
        currentMonthlySavings += (data.spouse.annualBonus / 12);
    }

    // Step 11: Determine if on track
    const isOnTrack = currentMonthlySavings >= monthlyContributionNeeded;
    const shortfallMonthly = Math.max(0, monthlyContributionNeeded - currentMonthlySavings);
    const surplusMonthly = Math.max(0, currentMonthlySavings - monthlyContributionNeeded);

    // Step 12: Calculate savings rates
    let totalMonthlyIncome = data.monthlyIncome + (data.annualBonus / 12);
    if (data.spouse.enabled) {
        totalMonthlyIncome += data.spouse.monthlyIncome + (data.spouse.annualBonus / 12);
    }

    const currentSavingsRate = totalMonthlyIncome > 0 ? (currentMonthlySavings / totalMonthlyIncome) * 100 : 0;
    const savingsRateNeeded = totalMonthlyIncome > 0 ? (monthlyContributionNeeded / totalMonthlyIncome) * 100 : 0;

    // Build analysis object
    const analysis: Omit<FIRERecommendation, 'recommendations'> = {
        yearsToRetirement,
        requiredCorpus,
        futureValueCurrentSavings,
        gapToFill,
        monthlyContributionNeeded,
        currentMonthlySavings,
        isOnTrack,
        shortfallMonthly,
        surplusMonthly,
        savingsRateNeeded,
        currentSavingsRate
    };

    // Step 13: Generate recommendations
    const recommendations = generateRecommendations(data, analysis);

    return {
        ...analysis,
        recommendations
    };
};

/**
 * Simple currency formatter for recommendations
 */
function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
}
