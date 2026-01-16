name: react-architecture
description: FirePulse React project structure and architectural patterns. Use when understanding project layout, adding new features, or determining where to place code.
---

**Framework:** React 19.2.3 + TypeScript 5.7.3
**Build Tool:** Vite 6.0.11
**Style:** Functional components + Context API + Pure utils

## Directory Structure

```
/
├── App.tsx                       # Main app with top-level state
├── index.tsx                    # Entry point
├── types.ts                     # Main domain types (at root)
├── components/                  # React components
│   ├── InternationalPlanner.tsx
│   ├── InternationalProjectionChart.tsx
│   ├── ProjectionChart.tsx
│   ├── SliderInput.tsx         # Reusable form component
│   └── wizard/                  # Wizard feature components
│       ├── Phase1Inputs.tsx
│       ├── Phase2Results.tsx
│       ├── Phase3International.tsx
│       ├── WizardContainer.tsx
│       ├── WizardNavigation.tsx
│       └── WizardProgress.tsx
├── contexts/                    # React Context providers
│   └── WizardContext.tsx        # Wizard flow state
├── data/                        # Static data
│   └── countries.ts             # Country database
├── hooks/                       # Custom React hooks (empty)
├── types/                       # Domain-specific type definitions
│   └── internationalPlanning.ts  # International planning types
└── utils/                       # Pure business logic
    ├── finance.ts               # Financial calculations
    └── internationalCalculations.ts
```

## Architecture Principles

- **Top-level state** in `App.tsx`: FinancialData, view modes, UI states
- **Context API** for cross-cutting wizard flow (steps, navigation)
- **Pure functions** in `utils/` for all calculations
- **Feature-based components** organized by domain (wizard, charts)
- **Type safety** with TypeScript interfaces for all props and state

## Where to Put New Code

- **New feature**: Create folder under `components/` with feature components
- **Shared component**: Add to `components/` root (like SliderInput)
- **New types**: Add to `types.ts` or create domain-specific type file
- **Business logic**: Add pure function to `utils/` or appropriate utils file
- **New context**: Add to `contexts/` if state spans multiple unrelated components
- **Static data**: Add to `data/` if large dataset
