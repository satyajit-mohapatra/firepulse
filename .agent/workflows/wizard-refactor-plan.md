---
description: Wizard Workflow Refactoring Implementation Plan
---

# FirePulse Wizard Refactoring - Implementation Plan

## Overview
Convert the three-tab application into a cohesive multi-phase wizard workflow with smooth transitions and polished UI/UX.

## Current State Analysis
- **Input Tab**: Contains all parameter inputs (Core Stats, Income, Estimates)
- **Result Tab**: Shows FIRE calculations, projections, charts, and asset allocations
- **International Tab**: Separate international planning module with its own sub-tabs

## Target Wizard Flow

### Phase 1: Financial Inputs
- **Core Financial Profile**
  - Age & Timeline (Current Age, Retirement Age, Life Expectancy)
  - Initial Assets (Liquid, Retirement, Real Estate)
- **Income & Expenses**
  - Monthly Income/Expenses breakdown
  - Medical, Education costs
  - Surplus/Savings rate
- **Assumptions & Estimates**
  - Growth rates, inflation, returns
  - Retirement expense multiplier
  - Tax rates

**Validation**: All required fields filled, logical age progression, positive values

### Phase 2: Domestic FIRE Results
- **Quick Summary Cards**
  - FIRE Age
  - Longevity status
  - Savings velocity
- **Asset Allocation Review**
  - Current allocation display
  - Return rate adjustments
  - Liquid asset split (Equity/Debt/Cash)
- **Projection Analysis**
  - Visual chart
  - Simulation mode selection
  - Year-by-year ledger (collapsible)
  - Milestone tracking

**Validation**: Review results, confirm simulation mode

### Phase 3: International Planning (Optional)
- **Scenario Design**
  - Choose journey type
  - Basic settings (age, life expectancy, currency risk)
- **Life Phases Configuration**
  - Work phases across countries
  - Transition periods
  - Retirement locations
- **Asset Distribution**
  - Liquid assets by country
  - Retirement accounts
  - Real estate holdings
- **International Results**
  - Cross-border projections
  - Tax efficiency analysis
  - Risk assessment
  - Recommendations

**Validation**: Phases don't overlap, assets allocated, reasonable income/expense ratios

## Technical Implementation

### Stage 1: Core Wizard Infrastructure
1. Create `WizardContext` for state management
2. Build `WizardProgress` component (visual stepper)
3. Implement `WizardNavigation` component (Next/Prev buttons)
4. Create phase validation system
5. Add transition animations (CSS/Framer Motion)

### Stage 2: Phase Components
1. Refactor Input tab → Phase 1 component
2. Refactor Results tab → Phase 2 component
3. Adapt International → Phase 3 component
4. Add phase-specific validation logic

### Stage 3: Data Persistence
1. Implement browser localStorage for draft saving
2. Add "Resume where you left off" functionality
3. Create data migration utilities
4. Add export/import for wizard state

### Stage 4: UI/UX Enhancements
1. Add field-level validation with real-time feedback
2. Implement auto-save on field blur
3. Add contextual help tooltips
4. Create mobile-optimized layouts
5. Implement keyboard navigation (Tab, Enter, Arrow keys)
6. Add ARIA labels and roles

### Stage 5: Animation & Polish
1. Phase transition animations (slide/fade)
2. Success indicators and checkmarks
3. Progress persistence visualization
4. Loading states for calculations
5. Celebration animation on completion

## File Structure
```
/components
  /wizard
    - WizardContainer.tsx          # Main wrapper
    - WizardProgress.tsx            # Progress indicator
    - WizardNavigation.tsx          # Next/Prev buttons
    - Phase1Inputs.tsx              # Financial inputs
    - Phase2Results.tsx             # Domestic FIRE results  
    - Phase3International.tsx       # International planning
  /validation
    - validators.ts                 # Validation logic
    - errorMessages.ts              # Error message templates
/contexts
  - WizardContext.tsx               # State management
/hooks
  - useWizardValidation.ts          # Validation hook
  - useWizardNavigation.ts          # Navigation logic
  - useWizardPersistence.ts         # LocalStorage integration
```

## Success Metrics
- ✅ Linear, guided workflow from start to finish
- ✅ No data loss when navigating backward
- ✅ Clear validation errors before phase progression
- ✅ Smooth animations between phases
- ✅ Mobile-responsive design
- ✅ Keyboard accessible
- ✅ Auto-save functionality
- ✅ < 3 seconds to complete phase 1
- ✅ Visual progress indicator always visible

## Migration Strategy
1. **Preserve existing functionality**: Keep all calculation logic intact
2. **Graceful degradation**: Allow reverting to tab mode via feature flag
3. **Progressive enhancement**: Add wizard features incrementally
4. **Backward compatibility**: Import/export works with old format
5. **User education**: Add brief intro overlay on first use

## Timeline
- Stage 1 (Infrastructure): 2-3 hours
- Stage 2 (Phase Components): 3-4 hours
- Stage 3 (Data Persistence): 1-2 hours
- Stage 4 (UX Polish): 2-3 hours
- Stage 5 (Animations): 1-2 hours

**Total Estimated Time**: 9-14 hours

## Next Steps
1. Create wizard infrastructure components
2. Implement Phase 1 (Inputs) with validation
3. Add progress indicator and navigation
4. Migrate Phase 2 (Results)
5. Integrate Phase 3 (International)
6. Polish and test
