---
name: troubleshooting
description: "Use this for ANY technical issue - bugs, test failures, build errors, unexpected behavior, or performance problems. Provides a systematic 4-phase debugging process that finds root causes before attempting fixes."
---

# Systematic Troubleshooting

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues. This skill provides a disciplined, scientific approach to debugging that finds and fixes root causes.

**Announce at start:** "I'm using the troubleshooting skill to systematically diagnose this issue."

## The Iron Law

```
⚠️ NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST ⚠️
```

If you haven't completed Phase 1, you cannot propose fixes. Period.

## When to Use

**Use for ANY technical issue:**
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues
- Console errors or warnings
- Type errors or lint failures

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

**Never skip because:**
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- The fix seems obvious (obvious fixes often mask real issues)

---

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

#### 1.1 Read Error Messages Carefully

```
✅ DO:
- Read the ENTIRE error message
- Read stack traces completely
- Note line numbers and file paths
- Check for error codes or links

❌ DON'T:
- Skip past errors or warnings
- Assume you know what it means
- Stop at the first line
```

**Example analysis:**
```
Error: Cannot read property 'map' of undefined
    at UserList (src/components/UserList.tsx:42:18)
    at renderWithHooks (react-dom.development.js:14985:18)

Analysis:
- Error type: TypeError (accessing property of undefined)
- Location: UserList.tsx, line 42, column 18
- The 'map' is being called on something undefined
- Need to check what variable on line 42 might be undefined
```

#### 1.2 Reproduce Consistently

| Question | Why It Matters |
|----------|----------------|
| Can you trigger it reliably? | Inconsistent = more investigation needed |
| What are the exact steps? | Documents the reproduction path |
| Does it happen every time? | Intermittent issues have different causes |
| What conditions are required? | Helps narrow scope |

**If not reproducible:** Gather more data, don't guess!

#### 1.3 Check Recent Changes

```bash
# What changed recently?
git log --oneline -10
git diff HEAD~3

# When did this start happening?
git bisect start
git bisect bad HEAD
git bisect good <known-good-commit>
```

**Look for:**
- Recent commits that touch related code
- New dependencies or version updates
- Config changes
- Environmental differences

#### 1.4 Gather Evidence (Multi-Component Systems)

**When system has multiple components, add diagnostic instrumentation:**

```
For EACH component boundary:
  → Log what data enters component
  → Log what data exits component
  → Verify environment/config propagation
  → Check state at each layer

Run once to gather evidence showing WHERE it breaks
THEN analyze evidence to identify failing component
THEN investigate that specific component
```

**Example diagnostic pattern:**
```javascript
// Add temporary logging at boundaries
console.log('=== Component Input ===', { props, state });
console.log('=== API Request ===', { endpoint, payload });
console.log('=== API Response ===', { status, data });
console.log('=== Rendered Output ===', { result });
```

#### 1.5 Trace Data Flow

**When error is deep in call stack, trace backward:**

```
Start at the error location
  ↓
Where does the bad value come from?
  ↓
What called this with the bad value?
  ↓
Keep tracing UP until you find the SOURCE
  ↓
Fix at the source, not at the symptom
```

---

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

#### 2.1 Find Working Examples

- Locate similar working code in the same codebase
- What works that's similar to what's broken?
- Look for tests that exercise similar functionality

#### 2.2 Compare Against References

- If implementing a pattern, read reference implementation COMPLETELY
- Don't skim - read every line
- Understand the pattern fully before applying

#### 2.3 Identify Differences

```
Working Code          vs.          Broken Code
─────────────────────────────────────────────────
[Feature X]                        [Feature X - broken]

List EVERY difference, however small:
1. ________________________________
2. ________________________________
3. ________________________________

Don't assume "that can't matter" - list it anyway!
```

#### 2.4 Understand Dependencies

- What other components does this need?
- What settings, config, environment?
- What assumptions does it make?
- What's the expected state when this runs?

---

### Phase 3: Hypothesis and Testing

**Apply the scientific method:**

#### 3.1 Form Single Hypothesis

```markdown
I think the root cause is: _________________________________

Because: _________________________________________________

Evidence supporting this:
- 
- 
- 
```

Write it down. Be specific, not vague.

#### 3.2 Test Minimally

```
✅ Good: Change ONE thing to test hypothesis
❌ Bad: Change multiple things at once

✅ Good: Smallest possible change
❌ Bad: "Let me also fix this while I'm here"

✅ Good: Isolate the variable
❌ Bad: Bundle fixes together
```

#### 3.3 Verify Before Continuing

| Result | Next Step |
|--------|-----------|
| ✓ Hypothesis confirmed | Proceed to Phase 4 |
| ✗ Hypothesis disproved | Form NEW hypothesis (don't add more fixes!) |
| ? Inconclusive | Gather more evidence |

#### 3.4 When You Don't Know

It's okay to say:
- "I don't understand X"
- "I need to research Y"
- "Can you explain Z?"

**Don't pretend to understand.** Fake confidence leads to bad fixes.

---

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

#### 4.1 Create Failing Test Case

```typescript
// BEFORE fixing, write a test that fails due to the bug
describe('Bug Reproduction', () => {
  it('should handle the edge case correctly', () => {
    // Setup the conditions that trigger the bug
    const result = functionWithBug(triggeringInput);
    
    // Assert what SHOULD happen
    expect(result).toBe(expectedValue);
  });
});
```

Run the test - it MUST fail before you fix.

#### 4.2 Implement Single Fix

```
✅ DO:
- Address the root cause identified
- ONE change at a time
- Minimal necessary change

❌ DON'T:
- "While I'm here" improvements
- Bundled refactoring
- Unrelated cleanups
```

#### 4.3 Verify Fix

- [ ] Test passes now?
- [ ] No other tests broken?
- [ ] Issue actually resolved in UI/behavior?
- [ ] Edge cases handled?

#### 4.4 If Fix Doesn't Work

```
Fix attempt #1 failed → Return to Phase 1, re-analyze
Fix attempt #2 failed → Return to Phase 1, question assumptions
Fix attempt #3 failed → STOP! Question the architecture (see below)
```

**After 3+ failed fixes:** This indicates an architectural problem, not a bug.

#### 4.5 When 3+ Fixes Fail: Question Architecture

**Pattern indicating architectural problem:**
- Each fix reveals new problems in different places
- Fixes require "massive refactoring" to implement  
- Each fix creates new symptoms elsewhere
- You're fighting the code structure

**STOP and ask:**
- Is this pattern fundamentally sound?
- Should we refactor the architecture vs. continue patching?
- Are we sticking with a bad design through inertia?

**Discuss with the user before attempting more fixes.**

---

## Red Flags - STOP and Follow Process

If you catch yourself thinking any of these, STOP and return to Phase 1:

| Red Flag Thought | What It Really Means |
|------------------|---------------------|
| "Quick fix for now, investigate later" | You're avoiding root cause analysis |
| "Just try changing X and see if it works" | You're guessing, not diagnosing |
| "Add multiple changes, run tests" | You can't isolate what works |
| "Skip the test, I'll manually verify" | Untested fixes don't stick |
| "It's probably X, let me fix that" | "Probably" = you don't know |
| "I don't fully understand but this might work" | Recipe for new bugs |
| "One more fix attempt" (after 2+ failures) | Time to question architecture |

---

## Common Rationalizations (And Why They're Wrong)

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Often causes new bugs. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |

---

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence, trace data | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare, identify differences | Know what's different from working code |
| **3. Hypothesis** | Form theory, test minimally, verify | Confirmed hypothesis or new one |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

---

## Debugging Toolkit

### Useful Commands

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Run specific tests
npm test -- --grep "test name"

# Check for lint issues
npm run lint

# Search codebase for pattern
grep -r "searchTerm" src/

# Git blame to find who changed code
git blame path/to/file.ts

# Find when bug was introduced
git bisect start
```

### Logging Patterns

```javascript
// Trace function entry/exit
console.log('→ functionName called with:', args);
// ... function body ...
console.log('← functionName returning:', result);

// Trace state changes
console.log('State before:', JSON.stringify(state, null, 2));
// ... mutation ...
console.log('State after:', JSON.stringify(state, null, 2));

// Trace component lifecycle
useEffect(() => {
  console.log('Component mounted/updated', { props, state });
  return () => console.log('Component unmounting');
}, [deps]);
```

### Browser DevTools

- **Console**: Check for errors and warnings
- **Network**: Inspect API requests/responses
- **React DevTools**: Inspect component props/state
- **Sources**: Set breakpoints, step through code
- **Performance**: Profile rendering and identify bottlenecks

---

## Real-World Impact

From debugging sessions:

| Approach | Time to Fix | First-Time Success | New Bugs Introduced |
|----------|-------------|-------------------|---------------------|
| Systematic | 15-30 min | ~95% | Near zero |
| Random fixes | 2-3 hours | ~40% | Common |

**The process feels slower but IS faster.**

---

## Remember

> "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it." — Brian Kernighan

The goal is not to fix fast. The goal is to fix **once**.
