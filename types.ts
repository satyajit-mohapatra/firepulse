
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR' | 'BRL';

export interface InvestmentGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetAge: number;
  category: 'Housing' | 'Education' | 'Travel' | 'Vehicle' | 'Other';
}

export interface BulkExpense {
  id: string;
  name: string;
  amount: number;
  age: number;
  category: 'General' | 'Education' | 'Travel' | 'Vehicle' | 'Other';
}

export interface Milestone {
  name: string;
  age: number | null;
  target: number;
  reached: boolean;
  description: string;
}

// Spouse Profile
export interface SpouseData {
  enabled: boolean;
  currentAge: number;
  retirementAge: number;
  liveUntilAge: number;
  monthlyIncome: number;
  incomeIncreaseRate: number;
  annualBonus: number;
}

export interface FinancialData {
  // Primary Person
  currentAge: number;
  retirementAge: number;
  liveUntilAge: number;
  monthlyIncome: number;
  incomeIncreaseRate: number;
  annualBonus: number;

  // Spouse (optional)
  spouse: SpouseData;

  // Family Assets (shared)
  currentNetWorth: number; // Family Liquid assets - cash, stocks, bonds (fully accessible)
  retirementAssets: number; // Family Retirement accounts - 401k, IRA (locked until retirement)
  nonLiquidAssets: number; // Family Non-liquid assets - real estate, business equity

  // Family Expenses
  monthlySavings: number;
  expenseIncreaseRate: number;
  retirementExpenseMultiplier: number;
  monthlyExpenses: number;
  monthlyMedical: number;
  monthlyKidsEducation: number;
  medicalInflation: number;
  annualExpenses: number;
  swpAmount: number;
  retirementTaxRate: number;

  // Investment Returns
  liquidAssetReturn: number;
  retirementAssetReturn: number; // Return on retirement accounts (typically higher)
  nonLiquidAssetReturn: number; // Return on real estate, business equity
  inflationRate: number;
  withdrawalRate: number;

  // Future Income
  futureIncome: number;
  futureIncomeStartAge: number;

  // Simulation Settings
  simulationMode: 'leaner' | 'conservative' | 'crash' | 'aggressive';
  withdrawalStrategy: 'fixed' | 'variable';
  goals: InvestmentGoal[];
  bulkExpenses: BulkExpense[];
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
  kidsEducationExpenses: number;
  bulkExpenses: number;
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
