---
name: skill-creator
description: "Use when creating a new skill for the .claude/skills directory. Provides templates, structure guidelines, best practices, and a checklist for writing effective, discoverable skills that follow the established format."
---

# Skill Creator

## Overview

This meta-skill guides the creation of new skills. Follow this process to create skills that are well-structured, discoverable, and effective.

**Announce at start:** "I'm using the skill-creator skill to create this new skill."

## What is a Skill?

A **skill** is a reusable reference guide for proven techniques, patterns, processes, or tools. Skills help future agents find and apply effective approaches consistently.

| Skills ARE | Skills are NOT |
|------------|----------------|
| Reusable techniques | One-off solutions |
| Patterns and processes | Project-specific conventions |
| Reference guides | Narratives about past work |
| Tool documentation | Standard practices documented elsewhere |

## When to Create a Skill

**✅ Create when:**
- Technique wasn't intuitively obvious
- You'd reference this again across projects
- Pattern applies broadly (not project-specific)
- Others would benefit from this approach
- You find yourself explaining the same thing repeatedly

**❌ Don't create for:**
- One-off solutions specific to one task
- Project-specific conventions (use CLAUDE.md instead)
- Standard practices well-documented elsewhere
- Mechanical constraints (automate with validation instead)

---

## Skill Types

### 1. Technique
Concrete method with steps to follow.
- Example: `troubleshooting`, `planning`
- Focus: Step-by-step process

### 2. Pattern  
Way of thinking about problems.
- Example: `brainstorming`
- Focus: Mental model and approach

### 3. Reference
API docs, syntax guides, tool documentation.
- Example: `frontend-design`
- Focus: Guidelines and standards

---

## Directory Structure

```
.claude/skills/
  skill-name/
    SKILL.md              # Main reference (required)
    supporting-file.*     # Only if needed (scripts, examples, etc.)
```

**Naming conventions:**
- Use lowercase with hyphens: `skill-name`
- Be descriptive but concise
- Avoid special characters

---

## SKILL.md Template

```markdown
---
name: skill-name
description: "Use when [specific triggering conditions]. [Additional context about when this skill applies]."
---

# Skill Name

## Overview

[What is this? Core principle in 1-2 sentences.]

**Announce at start:** "I'm using the [skill-name] skill to [action]."

## When to Use

[Bullet list with SYMPTOMS and use cases]
- Situation A
- Situation B
- When NOT to use

## The Process / Core Pattern

[Main content of the skill]

### Phase/Step 1: Name
[Details]

### Phase/Step 2: Name
[Details]

## Quick Reference

| Concept | Description |
|---------|-------------|
| Key 1 | Value 1 |
| Key 2 | Value 2 |

## Common Mistakes

| Mistake | Why It's Wrong | What to Do Instead |
|---------|---------------|-------------------|
| ❌ Bad | Reason | ✅ Good |

## Anti-Patterns to Avoid

- ❌ Thing to avoid
- ❌ Another thing to avoid

## Remember

[Key takeaway or memorable quote]
```

---

## YAML Frontmatter Rules

The frontmatter is **critical** for skill discovery.

```yaml
---
name: skill-name
description: "Use when [triggering conditions]. [Context about application]."
---
```

### Name Field
- Only letters, numbers, and hyphens
- No parentheses or special characters
- Lowercase with hyphens: `my-skill-name`

### Description Field
- **Max 500 characters** (aim for concise)
- **Start with "Use when..."** to focus on triggers
- Written in third person
- Describe WHEN to use, not WHAT it does
- Include symptoms and situations

**Good examples:**
```yaml
description: "Use when debugging any technical issue. Provides systematic 4-phase process for finding root causes."
description: "Use when creating implementation plans before coding. Breaks work into testable, bite-sized tasks."
description: "Use when exploring ideas before implementation. Socratic dialogue to refine requirements."
```

**Bad examples:**
```yaml
description: "A skill for debugging"  # Too vague
description: "This skill helps you debug by first analyzing..."  # Describes process, not triggers
```

---

## Content Guidelines

### 1. Structure for Scanning

Users scan, not read. Optimize for quick navigation:

```markdown
## Headers for Major Sections

### Subheaders for Steps

**Bold for key points**

| Tables | For | Quick | Reference |

- Bullets for lists
- Keep items short

1. Numbers for sequences
2. Order matters here

`Code` for commands and file names
```

### 2. Use Visual Elements

| Element | When to Use |
|---------|-------------|
| Tables | Comparisons, quick reference, checklists |
| Code blocks | Commands, examples, templates |
| Bold | Key terms, important points |
| Bullets | Lists of items, options |
| Numbers | Sequential steps |
| Emojis | Sparingly, for visual markers (✅ ❌ ⚠️) |

### 3. Include Examples

**Good examples are:**
- Concrete and specific
- Focused on one language/context
- Copy-paste ready
- Annotated with comments

```javascript
// ✅ Good: Specific, annotated
function validateInput(input) {
  // Early return for invalid cases
  if (!input) return { valid: false, error: 'Input required' };
  
  // Main validation logic
  return { valid: true, data: input.trim() };
}
```

### 4. Address Anti-Patterns

Always include what NOT to do:

```markdown
## Anti-Patterns to Avoid

- ❌ Jumping straight to implementation without understanding
- ❌ Skipping the testing step
- ❌ Bundling multiple changes together

## Common Rationalizations (And Why They're Wrong)

| Excuse | Reality |
|--------|---------|
| "Too simple to need process" | Simple tasks have root causes too |
| "No time" | Systematic is faster than thrashing |
```

---

## Quality Checklist

Before finalizing any skill, verify:

### Structure
- [ ] YAML frontmatter with name and description
- [ ] Description starts with "Use when..."
- [ ] Clear ## Overview section
- [ ] Logical section organization
- [ ] Quick reference table for scanning

### Content
- [ ] Core principle stated upfront
- [ ] Step-by-step process or guidelines
- [ ] At least one concrete example
- [ ] Anti-patterns section
- [ ] Common mistakes addressed

### Discoverability
- [ ] Descriptive name
- [ ] Keywords in description
- [ ] Symptoms and triggers mentioned
- [ ] Cross-references to related skills

### Usability
- [ ] Scannable formatting (headers, tables, bullets)
- [ ] Copy-paste ready examples
- [ ] Clear success criteria
- [ ] Actionable guidance

---

## Cross-Referencing Skills

Reference other skills when relevant:

```markdown
**Related skills:**
- Use `brainstorming` skill before this to refine requirements
- Use `troubleshooting` skill if you encounter issues during implementation
```

---

## File Organization

### Self-Contained Skill (Most Common)
```
skill-name/
  SKILL.md    # Everything in one file
```

### Skill with Supporting Files
```
skill-name/
  SKILL.md           # Main reference
  examples/          # Example files
  scripts/           # Helper scripts
  templates/         # Templates to copy
```

**When to use supporting files:**
- Heavy reference (100+ lines of examples)
- Reusable scripts or utilities
- Templates that should be copied

**Keep inline when:**
- Code patterns are short (<50 lines)
- Examples are simple
- Content flows with the documentation

---

## Skill Creation Workflow

### Step 1: Identify the Need
- What problem does this skill solve?
- Is this broadly applicable or project-specific?
- Does a similar skill already exist?

### Step 2: Define the Scope
- What's in scope vs. out of scope?
- What skill type is this (technique, pattern, reference)?
- What's the core principle?

### Step 3: Draft the Structure
```markdown
# Skill Name

## Overview
[1-2 sentences]

## When to Use
[Triggers and symptoms]

## The Process
[Main content]

## Quick Reference
[Table for scanning]

## Common Mistakes
[What to avoid]
```

### Step 4: Write Content
- Start with the process/pattern
- Add examples
- Include anti-patterns
- Create quick reference table

### Step 5: Polish for Discovery
- Write compelling description
- Add keywords throughout
- Cross-reference related skills
- Format for scanning

### Step 6: Review
- Run through quality checklist
- Read from user's perspective
- Verify examples work

---

## Example: Creating a New Skill

**User request:** "Create a skill for code review"

**Step 1: Create directory and file**
```
.claude/skills/code-review/SKILL.md
```

**Step 2: Write frontmatter**
```yaml
---
name: code-review
description: "Use when reviewing code changes, PRs, or before merging. Provides systematic checklist for catching issues and ensuring quality."
---
```

**Step 3: Write content following template**
```markdown
# Code Review

## Overview

Systematic approach to reviewing code that catches bugs, ensures quality, and provides constructive feedback.

## When to Use
- Reviewing pull requests
- Before merging any changes
- When asked to check someone's code
- Self-review before committing

## The Process
...
```

---

## Common Mistakes When Creating Skills

| Mistake | Problem | Fix |
|---------|---------|-----|
| Vague description | Won't be discovered | Start with "Use when..." + specific triggers |
| No examples | Hard to apply | Add at least one concrete example |
| Wall of text | Won't be read | Use headers, tables, bullets |
| Too broad | Tries to do everything | Focus on one technique/pattern |
| Too narrow | Only applies once | Generalize or don't create skill |
| No anti-patterns | Users make same mistakes | Add "what NOT to do" section |

---

## Remember

> A skill is only as good as its discoverability. If future agents can't find it, it doesn't exist.

Focus on:
1. **Clear triggers** - When should this be used?
2. **Scannable structure** - Can users find what they need quickly?
3. **Actionable content** - Can users apply this immediately?
4. **Concrete examples** - Is there at least one copy-paste ready example?
