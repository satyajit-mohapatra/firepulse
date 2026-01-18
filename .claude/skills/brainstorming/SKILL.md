---
name: brainstorming
description: "Use this BEFORE any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design through Socratic dialogue before implementation."
---

# Brainstorming Ideas Into Designs

## Overview

Help transform rough ideas into fully formed designs and specifications through natural collaborative dialogue. This skill ensures thorough exploration of requirements before any implementation begins.

**Announce at start:** "I'm using the brainstorming skill to explore and refine this idea."

## The Process

### Phase 1: Context Gathering

**Before asking questions:**
- Review the current project state (files, docs, recent changes)
- Understand existing patterns and conventions
- Identify relevant existing components or systems

### Phase 2: Understanding the Idea

**Ask questions one at a time to refine the idea:**
- Keep questions focused and specific
- Prefer multiple choice questions when possible (easier to answer)
- Open-ended questions are fine when exploring new territory
- Only ONE question per message - break complex topics into multiple questions
- Focus on understanding: purpose, constraints, success criteria

**Key areas to explore:**
1. **Purpose** - What problem does this solve? Who benefits?
2. **Scope** - What's in scope vs. out of scope?
3. **Constraints** - Technical, time, or resource limitations?
4. **Success criteria** - How do we know when it's done well?
5. **Edge cases** - What could go wrong? What are the tricky scenarios?

### Phase 3: Exploring Approaches

**Present options, don't just ask:**
- Propose 2-3 different approaches with clear trade-offs
- Lead with your recommended option and explain why
- Include: pros, cons, complexity estimate, risks
- Be opinionated but open to feedback

**Example format:**
```
I see three approaches here:

**Option A: [Name]** (Recommended)
- Description: ...
- Pros: ...
- Cons: ...
- Why I recommend it: ...

**Option B: [Name]**
- Description: ...
- Trade-offs compared to A: ...

**Option C: [Name]**
- Description: ...
- When this would be better: ...

Which direction resonates with you?
```

### Phase 4: Presenting the Design

**Once you understand what you're building:**
- Present the design in digestible sections (200-300 words each)
- Ask after each section: "Does this look right so far?"
- Be ready to go back and clarify if something doesn't make sense

**Sections to cover:**
1. **Architecture** - High-level structure and components
2. **Data Flow** - How data moves through the system
3. **User Experience** - How users interact with this
4. **Error Handling** - What happens when things go wrong
5. **Testing Strategy** - How we verify it works

## After the Design

### Documentation

**Write the validated design to a markdown file:**
- Location: `docs/plans/YYYY-MM-DD-<topic>-design.md`
- Include all decisions made during brainstorming
- Document rejected alternatives and why
- Commit the design document to git

### Implementation Handoff

**Ask:** "Ready to move to implementation planning?"

If yes, suggest using the `planning` skill to create a detailed implementation plan.

## Key Principles

| Principle | Description |
|-----------|-------------|
| **One question at a time** | Don't overwhelm with multiple questions |
| **Multiple choice preferred** | Easier to answer than open-ended when possible |
| **YAGNI ruthlessly** | Remove unnecessary features from all designs |
| **Explore alternatives** | Always propose 2-3 approaches before settling |
| **Incremental validation** | Present design in sections, validate each |
| **Be flexible** | Go back and clarify when something doesn't make sense |
| **Document decisions** | Capture the "why" behind choices |

## Anti-Patterns to Avoid

- ❌ Jumping straight to implementation without understanding
- ❌ Asking multiple questions in one message
- ❌ Presenting only one approach without alternatives
- ❌ Ignoring existing project patterns
- ❌ Over-engineering before validating requirements
- ❌ Skipping the design documentation step

## Example Session Flow

```
User: "I want to add a recommendation feature"

Agent: "I'm using the brainstorming skill to explore this idea.
       Let me first check the current project structure...
       [Reviews files]
       
       I see this is a financial calculator app. 
       
       For the recommendation feature, which of these best describes your goal?
       A) Suggest actions based on current financial inputs
       B) Compare user's situation to benchmarks
       C) Provide personalized tips to reach FIRE faster
       D) Something else?"

User: "A - suggest actions"

Agent: "Great! Should these recommendations be:
       A) Always visible in a sidebar
       B) Shown in a popup/modal when requested
       C) Part of the results page
       D) A separate dedicated page?"

... continues with one question at a time until design is clear ...
```

Remember: The goal is to arrive at a well-understood, validated design BEFORE writing any implementation code.
