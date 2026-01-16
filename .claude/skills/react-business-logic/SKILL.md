name: react-business-logic
description: Pure function patterns, utility functions, and business logic organization. Use when creating calculations, data transformations, or helper functions.
---

**Pattern:** Pure functions in `utils/` directory

## Utility File Structure

```
utils/
├── finance.ts                 # Core financial calculations
└── internationalCalculations.ts  # Domain-specific calculations
```

## Pure Function Pattern

Reference: `utils/finance.ts`

```tsx
import { FinancialData, CalculationResults } from '../types';

// Pure function: same inputs → same outputs, no side effects
export const calculateFIRE = (data: FinancialData): CalculationResults => {
    // Calculation logic
    const projections = calculateProjections(data);
    const fiAge = calculateFIAge(projections);

    return {
        projections,
        fiAge,
        fiNumber: data.fiNumber,
        // ...
    };
};
```

## Helper Functions

### Currency Formatting
```tsx
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

export const formatCurrencyCompact = (value: number): string => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value}`;
};

export const getCurrencySymbol = (code: string): string => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    return symbols[code] || code;
};
```

### Calculation Functions
```tsx
export const getAgeBasedAllocation = (
    currentAge: number,
    retirementAge: number
): { equity: number; debt: number; cash: number } => {
    const yearsToRetirement = Math.max(0, retirementAge - currentAge);

    if (yearsToRetirement > 20) {
        return { equity: 80, debt: 15, cash: 5 };
    }
    // ... more logic
};
```

## Static Data Pattern

Reference: `data/countries.ts`

```tsx
import { Country, CountryDatabase } from '../types/internationalPlanning';

export const COUNTRIES: CountryDatabase = {
    US: {
        code: 'US',
        name: 'United States',
        currency: 'USD',
        currencySymbol: '$',
        taxBrackets: [...],
        // ...
    },
    // ...
};
```

## When to Add Utility Functions

- **Calculations**: Any mathematical/financial computation
- **Formatting**: Currency, dates, numbers
- **Validation**: Input validation rules
- **Transformations**: Data structure conversions
- **Constants**: Reusable values (currency lists, etc.)

Do NOT add:
- React hooks or component logic
- API calls (not currently used)
- Side effects
