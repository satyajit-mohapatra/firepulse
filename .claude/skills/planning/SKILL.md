---
name: planning
description: "Use when you have a spec, requirements, or design for a multi-step task. Creates detailed implementation plans with bite-sized tasks before touching code. Always use AFTER brainstorming."
---

# Writing Implementation Plans

## Overview

Write comprehensive implementation plans that assume the executing engineer has minimal context. Document everything they need: which files to touch, exact code to write, how to test, expected outcomes. Break work into bite-sized tasks that can be executed confidently.

**Announce at start:** "I'm using the planning skill to create the implementation plan."

**Prerequisites:** This should be run after a brainstorming session or when requirements are clear.

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## Core Principles

| Principle | Description |
|-----------|-------------|
| **DRY** | Don't Repeat Yourself - identify reusable patterns |
| **YAGNI** | You Aren't Gonna Need It - only plan what's needed |
| **TDD** | Test-Driven Development - write tests first |
| **Frequent commits** | Small, atomic commits after each task |
| **Zero ambiguity** | Exact paths, exact code, exact commands |

## Bite-Sized Task Granularity

**Each step should be one action (2-5 minutes):**

```
✅ Good granularity:
- "Create the test file with the failing test"
- "Run the test to verify it fails"  
- "Implement the minimal code to pass the test"
- "Run the test to verify it passes"
- "Commit the changes"

❌ Too coarse:
- "Implement the feature with tests"
- "Add the component and style it"
```

## Plan Document Structure

### Required Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For Agent:** Execute this plan task-by-task. Complete each step fully before moving to the next.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about the approach]

**Tech Stack:** [Key technologies, libraries, frameworks]

**Estimated Tasks:** [Number of tasks]

**Prerequisites:** 
- [ ] Design document reviewed (if applicable)
- [ ] Dependencies installed
- [ ] Development environment ready

---
```

### Task Structure Template

```markdown
### Task N: [Component/Feature Name]

**Objective:** [What this task accomplishes]

**Files:**
- Create: `exact/path/to/new-file.ts`
- Modify: `exact/path/to/existing.ts` (lines ~XX-YY)
- Test: `exact/path/to/test-file.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/path/feature.test.ts
describe('FeatureName', () => {
  it('should do specific thing', () => {
    const result = doThing(input);
    expect(result).toBe(expected);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- --grep "should do specific thing"
```

Expected output: FAIL - "doThing is not defined"

**Step 3: Implement minimal code**

```typescript
// src/path/feature.ts
export function doThing(input: InputType): OutputType {
  // Implementation here
  return expected;
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- --grep "should do specific thing"
```

Expected output: PASS

**Step 5: Commit**

```bash
git add tests/path/feature.test.ts src/path/feature.ts
git commit -m "feat: add specific feature functionality"
```

---
```

## Planning Workflow

### Step 1: Understand the Scope

- Review design document or requirements
- Identify all components/systems affected
- Note dependencies between tasks
- Estimate complexity of each piece

### Step 2: Identify the Order

**Tasks should be ordered by:**
1. Dependencies (foundation first)
2. Risk (tackle unknowns early)
3. Value (core functionality before polish)
4. Testing (tests before or alongside implementation)

### Step 3: Break Into Tasks

**For each major piece:**
- What files need to be created or modified?
- What tests verify this works?
- What's the minimal implementation?
- What edge cases need handling?

### Step 4: Write Detailed Steps

**Each step must include:**
- Exact file paths (not "the component file")
- Complete code snippets (not "add validation logic")
- Exact commands to run (not "run the tests")
- Expected outcomes (not "should work")

### Step 5: Add Checkpoints

**Insert verification points:**
```markdown
---
## 🔍 Checkpoint: Core Functionality Complete

Before continuing, verify:
- [ ] All tests for Tasks 1-3 pass
- [ ] Feature works in browser manually
- [ ] No console errors or warnings
- [ ] Code follows project conventions

If any check fails, stop and resolve before continuing.
---
```

## Commit Message Convention

Use conventional commits for clear history:

```
feat: add new feature
fix: resolve bug in feature  
refactor: restructure without changing behavior
test: add or update tests
docs: update documentation
style: formatting, no logic change
chore: maintenance tasks
```

## Execution Handoff

After saving the plan, offer execution guidance:

```markdown
---

## 📋 Plan Complete

**Saved to:** `docs/plans/YYYY-MM-DD-feature-name.md`

**Execution Options:**

1. **Sequential execution** - Execute tasks one by one, verifying each before proceeding

2. **Parallel where possible** - Identify independent tasks that can run concurrently

**Recommended approach:** Start with Task 1, verify it works, then proceed.

**First command to run:**
\`\`\`bash
# Start with this...
\`\`\`
```

## Example: Simple Feature Plan

```markdown
# Add Dark Mode Toggle Implementation Plan

> **For Agent:** Execute this plan task-by-task.

**Goal:** Add a toggle button that switches between light and dark themes

**Architecture:** CSS custom properties for theming, React state for persistence, localStorage for remembering preference

**Tech Stack:** React, TypeScript, CSS custom properties

**Estimated Tasks:** 4

---

### Task 1: Create Theme CSS Variables

**Objective:** Define CSS custom properties for both themes

**Files:**
- Modify: `src/styles/index.css` (add at top)

**Step 1: Add theme variables**

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1a1a1a;
  --accent: #3b82f6;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #f5f5f5;
  --accent: #60a5fa;
}
```

**Step 2: Verify manually**
- Open browser, inspect root element
- Confirm variables are present

**Step 3: Commit**
```bash
git add src/styles/index.css
git commit -m "feat: add CSS custom properties for theming"
```

---

### Task 2: Create ThemeToggle Component
... (continues with same detail level)
```

## Anti-Patterns to Avoid

- ❌ Vague steps: "Add the feature logic"
- ❌ Missing file paths: "Update the component"
- ❌ Assumed knowledge: "Use the standard pattern"
- ❌ Skipping tests: Going straight to implementation
- ❌ Large commits: Bundling multiple features
- ❌ No verification steps: Not checking work as you go

## Remember

- Every plan should be executable by someone with zero project context
- Complete code in the plan, not references to "add appropriate code"
- Exact commands with expected output
- DRY, YAGNI, TDD, frequent commits
- Include checkpoints to verify progress

The goal is a plan so clear that execution becomes almost mechanical - just follow the steps.
