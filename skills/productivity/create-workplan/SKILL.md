---
name: create-workplan
description: Create a short, execution-ready workplan for a coding task. Use when the user asks to plan a feature, break down implementation steps, or turn a rough idea into a practical sequence of work.
---

# Create Workplan

Produce a concise workplan that a coding agent can execute without unnecessary ceremony.

## Workflow

1. Restate the goal in one sentence.
2. Identify the constraints that matter.
3. Split the work into small phases with concrete outputs.
4. Call out risks, unknowns, and validation steps.
5. Keep the plan short enough that it can be scanned quickly.

## Output Shape

Use this structure unless the user requests a different format:

```md
## Goal

## Constraints

## Plan
1. ...
2. ...
3. ...

## Validation

## Risks
```

## Guidance

- Prefer implementation steps over analysis-heavy prose.
- Surface blockers early instead of hiding them inside the plan.
- Do not invent requirements that the user did not ask for.
- If the task is trivial, collapse the workplan into a few direct steps.
