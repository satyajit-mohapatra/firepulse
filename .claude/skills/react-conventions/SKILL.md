name: react-conventions
description: Code style, naming conventions, and best practices for the FirePulse React project. Use when writing new code, following project patterns, or maintaining consistency.
---

## File Naming

- Components: PascalCase (`SliderInput.tsx`, `Phase1Inputs.tsx`)
- Utilities: camelCase (`finance.ts`, `formatCurrency`)
- Types: camelCase or domain-specific (`types.ts`, `internationalPlanning.ts`)
- Folders: lowercase (`components/`, `contexts/`, `utils/`)

## Component Structure

```tsx
// 1. Imports (React first, then local)
import React from 'react';
import { SomeType } from '../types';
import OtherComponent from './OtherComponent';

// 2. Props interface
interface ComponentProps {
    prop1: string;
    prop2: number;
}

// 3. Component definition
const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
    // 4. Hooks
    const [state, setState] = useState();

    // 5. Handlers
    const handleClick = () => {};

    // 6. Derived values
    const value = useMemo(() => {}, []);

    // 7. Render
    return <div>{/* JSX */}</div>;
};

// 8. Export
export default ComponentName;
```

## Import Order

1. React imports
2. Third-party libraries
3. Relative imports (closest first)
4. Type imports (if needed separately)

```tsx
import React, { useState, useMemo } from 'react';
import { LineChart, Line } from 'recharts';
import SliderInput from './SliderInput';
import { FinancialData } from '../types';
import type { SomeType } from '../types';
```

## Variable Naming

- Components/Types: PascalCase
- Functions/Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Booleans: `is*`, `has*`, `can*`

```tsx
const isLoading = false;
const MAX_ITEMS = 100;
const calculateTotal = () => {};
```

## Comment Style

```tsx
// Single-line comment

/**
 * Multi-line comment for function
 * @param data - Input data
 * @returns Calculated result
 */
export const calculateFIRE = (data: FinancialData) => {
    // ...
};
```

## TypeScript Patterns

- Use `interface` for object shapes
- Use `type` for unions, primitives, utility types
- Optional props with `?`
- Default values in function signature or component props

```tsx
interface Props {
    required: string;
    optional?: number;
}
```

## Code Style

- Use `const` by default, `let` only when reassigning
- Use arrow functions for callbacks
- Prefer template literals over string concatenation
- Use object spread for copies: `{ ...prev, [key]: value }`
- Use array spread: `[...items, newItem]`

## DO

- Use functional components
- Define prop interfaces
- Use TypeScript for all props
- Create reusable components
- Keep utilities pure

## DON'T

- Use class components
- Use `any` type (use `unknown` instead)
- Put business logic in components
- Create deeply nested component hierarchies
- Use global CSS files (use Tailwind)
