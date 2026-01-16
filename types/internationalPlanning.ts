// International Financial Planning Types

export interface Country {
    code: string;
    name: string;
    currency: string;
    currencySymbol: string;
    taxBrackets: TaxBracket[];
    capitalGainsTax: number;
    socialSecurityRate: number;
    retirementAccountTypes: string[];
    averageInflation: number;
    costOfLivingIndex: number; // Relative to US = 100
    visaOptions: VisaOption[];
    exchangeRateToUSD: number;
    hasUSATaxTreaty: boolean;
    pensionWithdrawalAge: number;
    healthcareCostIndex: number; // Monthly cost relative to US
}

export interface TaxBracket {
    minIncome: number;
    maxIncome: number | null;
    rate: number;
}

export interface VisaOption {
    name: string;
    type: 'work' | 'retirement' | 'investment' | 'family';
    minInvestment?: number;
    annualCost: number;
    processingTime: string;
    pathToResidency: boolean;
    requirements: string[];
}

export type ScenarioType =
    | 'work-retire' // Work in A, Retire in B
    | 'work-move-retire' // Work in A, Move to B, Retire in B
    | 'work-move-work-retire'; // Work in A, Move to B, Work in B, Retire in C

export interface LifePhase {
    id: string;
    type: 'work' | 'transition' | 'retirement';
    country: string;
    startAge: number;
    endAge: number;

    // Primary person work settings
    annualIncome?: number; // Total or primary
    annualIncomePrimary?: number;
    incomeGrowthRate?: number;
    incomeGrowthRatePrimary?: number;
    primaryIsWorking?: boolean; // Can override - primary may stop while spouse works

    // Spouse work settings (independent from primary)
    annualIncomeSpouse?: number;
    incomeGrowthRateSpouse?: number;
    spouseIsWorking?: boolean; // Spouse can work even in retirement phase
    spouseWorkStartAge?: number; // Auto-synced but overridable
    spouseWorkEndAge?: number; // Spouse's retirement age for this phase

    // Shared settings
    monthlyExpenses: number;
    taxableIncome?: number;
    retirementContributions?: RetirementContribution[];
    bulkExpenses?: IntlBulkExpense[];
}

export interface IntlBulkExpense {
    id: string;
    name: string;
    amount: number;
    age: number;
    category: 'general' | 'education' | 'relocation' | 'other';
}

export interface RetirementContribution {
    accountType: '401k' | 'ira' | 'roth-ira' | 'pension' | 'nps' | 'ppf' | 'epf' | 'super' | 'rrsp' | 'isa';
    annualContribution: number;
    employerMatch?: number;
    currentBalance: number;
    expectedReturn: number;
    earlyWithdrawalPenalty: number;
    withdrawalAge: number;
}

export interface RelocationCosts {
    movingExpenses: number;
    visaProcessingFees: number;
    legalFees: number;
    temporaryHousing: number;
    exchangeRateLockCost: number;
    totalEstimate: number;
}

export interface CountryConfig {
    inflationRate: number;
    expectedReturnLiquid: number;
    expectedReturnRetirement: number;
    expectedReturnRealEstate: number;
}

export interface InternationalScenario {
    id: string;
    name: string;
    type: ScenarioType;
    phases: LifePhase[];
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;

    // Spouse info (optional, for spouse age tracking)
    spouseEnabled?: boolean;
    spouseCurrentAge?: number;
    spouseRetirementAge?: number;
    spouseLiveUntilAge?: number;

    // Asset positions
    liquidAssets: AssetPosition[];
    retirementAccounts: RetirementAccountPosition[];
    realEstateAssets: RealEstateAsset[];

    // Per-country configurations
    countryConfigs: Record<string, CountryConfig>;

    // Risk parameters
    exchangeRateVolatility: number; // 0-30%
    inflationScenario: 'low' | 'moderate' | 'high';

    // Calculated fields
    totalRelocationCosts?: number;
    projectedNetWorth?: number;
    successProbability?: number;
}

export interface AssetPosition {
    country: string;
    currency: string;
    currentValue: number;
    valueInUSD: number;
    assetType: 'cash' | 'stocks' | 'bonds' | 'mixed';
    expectedReturn: number;
    taxEfficient: boolean;
}

export interface RetirementAccountPosition {
    country: string;
    accountType: string;
    currentBalance: number;
    valueInUSD: number;
    vestingPercentage: number;
    portableToCountries: string[];
    earlyWithdrawalPenalty: number;
    withdrawalAge: number;
    expectedReturn: number;
}

export interface RealEstateAsset {
    country: string;
    propertyType: 'primary' | 'rental' | 'investment';
    currentValue: number;
    valueInUSD: number;
    mortgageBalance: number;
    monthlyRentalIncome?: number;
    appreciationRate: number;
}

export interface YearlyProjectionIntl {
    year: number;
    age: number;
    spouseAge?: number; // Spouse's age for this year (calculated from year offset)
    phase: 'work' | 'transition' | 'retirement';
    country: string;
    currency: string;

    // Income
    grossIncome: number;
    grossIncomeUSD: number;
    primaryIncome?: number;
    spouseIncome?: number;
    taxPaid: number;
    netIncome: number;
    passiveIncome: number;

    // Expenses
    livingExpenses: number;
    livingExpensesUSD: number;
    healthcareCosts: number;
    taxesOwed: number;

    // Savings & Investments
    retirementContributions: number;
    investmentGrowth: number;

    // Portfolio
    liquidAssetsLocal: number;
    liquidAssetsUSD: number;
    retirementAssetsUSD: number;
    realEstateEquityUSD: number;
    totalNetWorthUSD: number;

    // Exchange rate
    exchangeRate: number;
    exchangeRateImpact: number;

    // Flags
    isSolvent: boolean;
    milestoneReached?: string;
}

export interface ScenarioResults {
    projections: YearlyProjectionIntl[];
    fiAge: number | null;
    retirementYear: number | null;
    requiredCorpus: number;

    // Success metrics
    successProbability: number;
    worstCaseEndBalance: number;
    bestCaseEndBalance: number;
    medianEndBalance: number;

    // Risk analysis
    exchangeRateRisk: 'low' | 'moderate' | 'high';
    inflationRisk: 'low' | 'moderate' | 'high';
    taxEfficiency: number; // 0-100

    // Recommendations
    recommendations: Recommendation[];
    warnings: string[];
}

export interface Recommendation {
    category: 'tax' | 'investment' | 'timing' | 'location' | 'retirement-account';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    potentialSaving?: number;
}

// Pre-defined country data
export interface CountryDatabase {
    [code: string]: Country;
}
