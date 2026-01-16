name: react-components
description: React component patterns and templates for FirePulse. Use when creating new components, understanding component structure, or following component conventions.
---

**Component Style:** Functional components with TypeScript interfaces

## Component Template

```tsx
import React from 'react';
import { SomeType } from '../types';

interface ComponentNameProps {
    data: SomeType;
    onChange: (value: SomeType) => void;
    // Add more props as needed
}

const ComponentName: React.FC<ComponentNameProps> = ({
    data,
    onChange
}) => {
    return (
        <div className="className-here">
            {/* JSX content */}
        </div>
    );
};

export default ComponentName;
```

## Component Patterns

### Controlled Components
```tsx
// For form inputs controlled by parent state
const ControlledInput: React.FC<{
    value: number;
    onChange: (val: number) => void;
}> = ({ value, onChange }) => (
    <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input-classes"
    />
);
```

### Reusable Input Component
Reference: `components/SliderInput.tsx`

Props pattern:
- Required: `label`, `value`, `onChange`, `min`, `max`
- Optional: `step`, `prefix`, `suffix`, `tooltip`

### Wizard Components
Reference: `components/wizard/`

Pattern:
- Use `useWizard()` hook from WizardContext
- Render based on `currentStep` from context
- Pass data/change handlers down from parent

### Container Components
Reference: `components/wizard/WizardContainer.tsx`

Pattern:
- Accept all data and callbacks as props
- Use `useWizard()` for step state
- Render step-specific components via switch statement
- Include navigation/progress components

## Naming Conventions

- Component files: PascalCase (e.g., `SliderInput.tsx`, `Phase1Inputs.tsx`)
- Component names: PascalCase
- Prop interfaces: `{ComponentName}Props`
- Export: `export default ComponentName;`
