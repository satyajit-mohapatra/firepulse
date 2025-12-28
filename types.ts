
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR' | 'BRL';

export interface InvestmentGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetAge: number;
  category: 'Housing' | 'Education' | 'Travel' | 'Vehicle' | 'Other';
}

export interface Milestone {
  name: string;
  age: number | null;
  target: number;
  reached: boolean;
  description: string;
}

export interface FinancialData {
  currentAge: number;
  retirementAge: number;
  liveUntilAge: number;
  currentNetWorth: number;
  nonLiquidAssets: number;
  monthlyIncome: number;
  monthlySavings: number;
  annualBonus: number;
  incomeIncreaseRate: number;
  expenseIncreaseRate: number;
  retirementExpenseMultiplier: number;
  monthlyExpenses: number;
  monthlyMedical: number;
  medicalInflation: number;
  annualExpenses: number;
  swpAmount: number;
  retirementTaxRate: number;
  liquidAssetReturn: number;
  nonLiquidAssetReturn: number;
  inflationRate: number;
  withdrawalRate: number;
  futureIncome: number;
  futureIncomeStartAge: number;
  simulationMode: 'leaner' | 'conservative' | 'crash' | 'aggressive';
  withdrawalStrategy: 'fixed' | 'variable';
  goals: InvestmentGoal[];
}

export interface YearProjection {
  year: number;
  age: number;
  openingBalance: number;
  returns: number;
  netWorth: number;
  isRetired: boolean;
  income: number;
  livingExpenses: number;
  medicalExpenses: number;
  totalOutflow: number;
  fiNumber: number;
  passiveIncome: number;
  goalSpending: number;
  yearlySavings: number;
}

export interface CalculationResults {
  projections: YearProjection[];
  fiAge: number | null;
  fiYear: number | null;
  fiNumber: number;
  fiExpenses: number;
  timeToFI: number | null;
  milestones: Milestone[];
  safeWithdrawalAmount: number;
  isSolventAtEnd: boolean;
}
