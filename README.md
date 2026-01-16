<div align="center">
  <img width="1200" height="475" alt="FirePulse Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FirePulse - Financial Independence Calculator

A privacy-first, high-performance financial independence calculator with real-time projections, multi-currency support, and international planning capabilities.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB)](https://react.dev/)

## Features

### Core FIRE Calculator
- **Dual Profile Support**: Plan for individuals and couples with separate income, retirement age, and life expectancy
- **Asset Types**: Track liquid assets, retirement accounts (401k, IRA, etc.), and non-liquid assets (real estate, business equity)
- **Expense Projections**: Model monthly expenses, medical costs, education expenses with inflation adjustments
- **Investment Returns**: Configure separate return rates for different asset classes
- **Withdrawal Strategies**: Fixed or variable withdrawal rates with multiple simulation modes (leaner, conservative, crash, aggressive)
- **Milestone Tracking**: Monitor key financial independence milestones
- **Real-time Calculations**: Instant projections as you adjust parameters

### International Planning
- **12 Countries Database**: US, India, UK, Canada, Australia, Germany, Singapore, UAE, Portugal, Mexico, Thailand, Japan
- **Tax Calculations**: Multi-tier tax brackets for accurate tax projections
- **Cost of Living Comparisons**: Relative cost of living indices across countries
- **Visa Options**: Work, retirement, and investment visa information with requirements
- **Exchange Rate Modeling**: Currency conversion and exchange rate impact analysis
- **Multi-Phase Scenarios**: Work in one country, move, retire in another
- **Retirement Account Types**: Country-specific retirement accounts (401k, IRA, NPS, PPF, Super, RRSP, ISA, etc.)
- **Tax Treaty Information**: US tax treaty status for each country

### User Experience
- **Wizard Interface**: Step-by-step guided planning process
- **Interactive Charts**: Visualize projections with Recharts
- **Multi-Currency Support**: USD, EUR, GBP, JPY, CAD, AUD, INR, BRL
- **Data Export/Import**: Save and load scenarios via JSON or CSV
- **PWA Support**: Install as a standalone application
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Eye-friendly interface for extended use

## Tech Stack

- **Frontend Framework**: React 19.2.3
- **Language**: TypeScript 5.7.3
- **Build Tool**: Vite 6.0.11
- **Styling**: TailwindCSS (via CDN)
- **Charts**: Recharts 3.6.0
- **Fonts**: Inter, JetBrains Mono

## Project Structure

```
firepulse/
├── components/           # React components
│   ├── wizard/           # Wizard interface components
│   │   ├── Phase1Inputs.tsx
│   │   ├── Phase2Results.tsx
│   │   ├── Phase3International.tsx
│   │   ├── WizardContainer.tsx
│   │   ├── WizardNavigation.tsx
│   │   └── WizardProgress.tsx
│   ├── SliderInput.tsx
│   ├── ProjectionChart.tsx
│   ├── InternationalPlanner.tsx
│   └── InternationalProjectionChart.tsx
├── contexts/             # React Context providers
│   └── WizardContext.tsx
├── data/                 # Static data
│   └── countries.ts      # Country database with tax, cost of living, visa info
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
│   └── internationalPlanning.ts
├── utils/                # Utility functions
│   ├── finance.ts        # Core FIRE calculation logic
│   └── internationalCalculations.ts
├── App.tsx               # Main application component
├── index.tsx             # Application entry point
├── index.html            # HTML template
├── manifest.json         # PWA manifest
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd firepulse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (optional):
   Create a `.env.local` file in the root directory:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Basic FIRE Calculation

1. **Input Your Details**:
   - Current age and retirement age
   - Monthly income and expected annual increase
   - Current net worth and retirement savings

2. **Configure Expenses**:
   - Monthly living expenses
   - Medical costs
   - Education expenses
   - Expected expense inflation rate

3. **Set Investment Parameters**:
   - Expected returns for liquid assets
   - Returns for retirement accounts
   - Real estate appreciation rates
   - General inflation rate

4. **Review Projections**:
   - View your projected FI age and number
   - Analyze yearly projections
   - Check milestones and solvency at retirement age

### International Planning

1. **Select Countries**:
   - Choose work location country
   - Choose retirement location country
   - View tax brackets, cost of living, and visa options

2. **Define Life Phases**:
   - Work phase: Income and savings
   - Transition phase: Relocation costs
   - Retirement phase: Withdrawals and expenses

3. **Configure Assets**:
   - Specify asset positions by country
   - Set retirement account balances
   - Include real estate holdings

4. **Analyze Results**:
   - View exchange rate impact
   - Compare tax efficiency
   - Check success probability across scenarios

## Data Models

### FinancialData
Primary data structure for FIRE calculations:
```typescript
{
  currentAge: number;
  retirementAge: number;
  liveUntilAge: number;
  monthlyIncome: number;
  incomeIncreaseRate: number;
  annualBonus: number;
  spouse: SpouseData;
  currentNetWorth: number;
  retirementAssets: number;
  nonLiquidAssets: number;
  monthlyExpenses: number;
  // ... additional fields
}
```

### Country
Country data for international planning:
```typescript
{
  code: string;
  name: string;
  currency: string;
  taxBrackets: TaxBracket[];
  capitalGainsTax: number;
  socialSecurityRate: number;
  retirementAccountTypes: string[];
  averageInflation: number;
  costOfLivingIndex: number;
  visaOptions: VisaOption[];
  exchangeRateToUSD: number;
  // ... additional fields
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## View in AI Studio

[FirePulse on AI Studio](https://ai.studio/apps/drive/1n_BVtYSr7x9UdCTAaPnDq-7AnS_L9yh3)

## Acknowledgments

- Built with modern React patterns and TypeScript for type safety
- Uses Recharts for beautiful, responsive data visualizations
- PWA-ready for offline use and installation
