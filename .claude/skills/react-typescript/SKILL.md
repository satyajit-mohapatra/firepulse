name: react-typescript
description: TypeScript patterns, type definitions, and type safety conventions. Use when adding types, defining interfaces, or ensuring type safety across the codebase.
---

**TypeScript:** 5.7.3, Strict mode, Path aliases (@/*)

## Import Style

```tsx
// Relative imports
import { FinancialData } from '../types';
import SliderInput from '../components/SliderInput';

// Path alias (from tsconfig.json)
import { FinancialData } from '@/types';
```

## Interface Definitions

Reference: `types.ts`

```tsx
// Basic interface
interface SpouseData {
    enabled: boolean;
    currentAge: number;
    monthlyIncome: number;
}

// Nested interface
interface FinancialData {
    currentAge: number;
    spouse: SpouseData;
    goals: InvestmentGoal[];
}

// Interface with array of specific type
interface CalculationResults {
    projections: YearProjection[];
    fiAge: number | null;
    milestones: Milestone[];
}
```

## Type Unions and Literals

```tsx
// String literal union
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

// Complex union with specific options
type SimulationMode = 'leaner' | 'conservative' | 'crash' | 'aggressive';

// Union type
type Milestone = {
    name: string;
    age: number | null;
    target: number;
    reached: boolean;
};
```

## Props Pattern

```tsx
interface ComponentProps {
    data: FinancialData;
    updateData: (key: keyof FinancialData, value: any) => void;
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
}

const MyComponent: React.FC<ComponentProps> = ({ data, updateData }) => {
    return <div>{/* ... */}</div>;
};
```

## Type Organization

- Main types: `types.ts`
- Domain-specific types: `types/internationalPlanning.ts`
- Component props: Define in same file as component

## Type Safety Patterns

```tsx
// Type guard for optional values
const age = data.fiAge ?? 0;  // Fallback if null

// Type narrowing
if (data.spouse.enabled) {
    // TypeScript knows spouse fields are valid here
    const spouseAge = data.spouse.currentAge;
}

// Generic callback type
updateData: <K extends keyof T>(key: K, value: T[K]) => void
```
