name: react-state-management
description: State management patterns using useState and Context API. Use when managing component state, creating context providers, or updating top-level application state.
---

**Approach:** useState + Context API (no external state library)

## Component-Level State

```tsx
import { useState } from 'react';

const MyComponent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<Item[]>([]);

    return <div>{/* ... */}</div>;
};
```

## Context API Pattern

Reference: `contexts/WizardContext.tsx`

### Creating a Context

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface ContextType {
    currentStep: number;
    setStep: (step: number) => void;
}

const MyContext = createContext<ContextType | undefined>(undefined);

export const MyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(1);

    return (
        <MyContext.Provider value={{ currentStep, setStep: setCurrentStep }}>
            {children}
        </MyContext.Provider>
    );
};

export const useMyContext = () => {
    const context = useContext(MyContext);
    if (context === undefined) {
        throw new Error('useMyContext must be used within a MyProvider');
    }
    return context;
};
```

### Using Context

```tsx
import { useMyContext } from '../contexts/MyContext';

const MyComponent = () => {
    const { currentStep, setStep } = useMyContext();
    return <div>Step {currentStep}</div>;
};
```

## Top-Level State Pattern

Reference: `App.tsx`

Pattern:
- Main state objects at top (FinancialData, view modes, UI toggles)
- Derived state via `useMemo`
- Update functions passed down as props

```tsx
const App = () => {
    const [data, setData] = useState<FinancialData>({ /* initial */ });
    const [viewMode, setViewMode] = useState<'simple' | 'advanced'>('simple');

    const updateData = (key: keyof FinancialData, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    // Derived state
    const results = useMemo(() => calculateFIRE(data), [data]);

    return <ChildComponent data={data} updateData={updateData} results={results} />;
};
```

## State Updates

```tsx
// Object update (immutable)
setData(prev => ({ ...prev, [key]: value }));

// Array: add item
setItems(prev => [...prev, newItem]);

// Array: remove item
setItems(prev => prev.filter(item => item.id !== id));

// Array: update item
setItems(prev => prev.map(item =>
    item.id === id ? { ...item, [key]: value } : item
));
```
