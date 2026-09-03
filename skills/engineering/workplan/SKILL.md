---
name: workplan
description: Turn an already-chosen implementation approach into a boardless executable workplan capsule — decompose the strategy into waves of sub-agent-sized tasks with self-contained contracts and validation, and write PLAN.md plus an initialized RUN.md under workplans/<slug>/. Consumes a high-level strategy (from plan mode or existing workplans/<slug>/ docs); it does not re-decide architecture. Produces the handoff artifact that /orchestrate executes. Can be pointed at an existing workplans/<slug>/ to decompose in place, or start fresh. Use when the user invokes `/workplan`, points it at a slug, or wants to convert a strategy/approach into a runnable plan.
---

# Workplan

**The job.** Take an already-decided approach and write the capsule `/orchestrate` will execute cold: `PLAN.md` (waves + self-contained task contracts) and an initialized `RUN.md` under `workplans/<slug>/`.

**Why.** The orchestrator that runs this may be a different session with no memory of the strategy. Every fact a builder needs has to be in its contract; every ambiguity left here becomes a blocked task, an escalation, and a re-dispatch later.

**Guardrails.**
- Architecture, analysis, and the chosen approach are inputs. Do not re-decide them, and do not execute — no builders, no product code.
- Touch only `workplans/<slug>/{STRATEGY,PLAN,RUN,DECISIONS}.md`. Never overwrite an existing `RUN.md`; resetting one needs explicit user approval.
- Make decomposition calls yourself. Ask only when the answer would change task boundaries or ownership.

**Done means** — the single completion contract at the end of this file. Report the capsule path and tell the user to run `/orchestrate <slug>`; a `planned` capsule is already parked.

## Resolve the capsule and strategy

Resolve `workplans/<slug>/` from the repository root. The slug must be a non-empty relative path under `workplans/`; reject absolute paths, `..` traversal, and any resolved path that escapes `workplans/`.

When the capsule already exists, inspect `RUN.md` status and ownership before changing it:
- `planned`: refine in place.
- `active` or `blocked`: reconcile live writers and require explicit authority to replan; never edit capsule state while another writer owns it.
- `complete`: stop unless the user explicitly asked to reopen.

Locate the chosen approach:
- **Existing capsule**: read `STRATEGY.md` if present, otherwise `PLAN.md`. Decompose into that capsule; never create a second one for the same slug.
- **In context**: persist the approved strategy to `workplans/<slug>/STRATEGY.md` only when it exists solely in context.
- **On disk**: read the existing capsule docs directly.

If no approach exists yet, stop and say so — that's plan-mode/strategy work. A bare goal ("decompose the god modules") is not an approach.

If the project has an opening checklist (`workplans/OPENING.md` or the path project instructions name), read it before decomposing: its items are defects earlier capsules paid for, and they belong in task guardrails now rather than in a close-out report nobody reads.

Read the load-bearing strategy and source files needed for sound task boundaries. Delegate only broad or noisy discovery that materially improves contracts; consume focused summaries rather than duplicating their search.

## What you produce

```text
workplans/<slug>/STRATEGY.md   # only when the approved strategy exists solely in context
workplans/<slug>/PLAN.md       # stable waves + task contracts
workplans/<slug>/RUN.md        # initialized recovery state
workplans/<slug>/DECISIONS.md  # only for merge / serialization / ownership / sequencing / validation decisions
```

No empty directories, no report scaffolding, no task-board objects. Do not duplicate settled architecture from the strategy into `DECISIONS.md`.

## The authoring loop

1. **Ingest the strategy** — objective, boundaries, settled architecture, opening-checklist items that apply.
2. **Gather contract detail** — read load-bearing files directly; use read-only exploration for breadth such as exact paths, symbols, callers, or reusable helpers. Record symbols, not line numbers: a line cited now is stale by dispatch, and builders resolve their own anchors.
3. **Analyze impact when warranted** — run GitNexus impact when project instructions require it, when shared/exported symbols or caller overlap affect decomposition, or when blast radius is unclear; record risk, callers, affected files, and tests in the contract. Overlap means merge or serialize. Do not run impact merely because an index exists. From a linked worktree, refresh with `gnembed`, retain its branch slot, and pass that `branch` to later calls; temporary worktree builders never reindex or run impact.
4. **Record decomposition decisions** — append qualifying merge, serialization, ownership, sequencing, or validation decisions to `DECISIONS.md` as Context / Decision / Consequences / Alternatives.
5. **Decompose** — waves of sub-agent-sized tasks with self-contained contracts. Mark each task's **Shape**: `judgment` (one builder, one contract) or `fan-out` (the same read-only check over a named list of N items — partitions, scopes, files, heads; `/orchestrate` runs these through the Workflow tool, so name the list source and the per-item check). Include only repository hot rules applicable to the task unless the repository requires verbatim inclusion. One writer per file per wave; merge or serialize overlapping ownership.
6. **Write `PLAN.md`** — objective, constraints, waves, task contracts, risks, open questions; enough for `/orchestrate` to launch cold.
7. **Initialize or refine `RUN.md`** — shape and field names come from `~/.claude/skills/orchestrate/references/run-state.md`; the two skills share one contract. For a new capsule: `Status: planned`, one compact row per task with **Wave as the first column**, the starting wave, and the exact next action. Record `Starting branch` and `Base ref` when available. `Feature branch` is a capsule field the project or its coordinator may assign: record it if known, otherwise `pending` — `/orchestrate` asks the user once if it is still absent. `/workplan` never creates or switches branches.
8. **Verify Done means, then stop.**

## Task contract (in `PLAN.md`, one per task)

Identical to the block in `~/.claude/skills/orchestrate/references/templates.md`; change both or neither.

```md
### T<n> — <title>
Wave: W1
Depends on: none
Agent: builder | hard-builder | scout | reviewer
Shape: judgment | fan-out (<list source: partitions / scopes / files / heads>)
Goal: <one sentence>
Why: <who it's for and what the result enables>
Scope: <exact work>
Non-goals: <explicit exclusions>
Owned files: <exact paths>
Context: <symbols, decisions, existing helpers to reuse — cite symbols, never line numbers>
Impact: <when warranted: risk, direct callers/processes, affected files/tests>
AC:
- <criterion>
DoD:
- <item>
Validation: `<command>` in `<cwd>` — proves <behavior>; failure looks like <signal>
Report: `workplans/<slug>/agents/T<n>-<role>.md`
Report-back: compact result header + ≤3 bullets
Artifact format: prose-header | raw-exact
```

`PLAN.md` around the contracts: `# <title>`, `## Objective`, `## Constraints and non-goals`, `## Waves` (`- W1: T1, T2` / `- W2: T3 (depends on T1, T2)`), `## Validation contracts`, `## Risks and open questions`, then the task blocks.

## Done means

- Capsule paths resolved safely; only the allowed capsule files changed; no `RUN.md` implicitly overwritten.
- Every task has explicit dependencies, a Shape, a Why, applicable hot rules and opening-checklist guardrails, disjoint or serialized file ownership, AC, DoD, and a validation command that can fail (no bare existence checks).
- Every path cited in a contract exists on disk now, or is named rather than pathed ("a diff report under this task's agents directory"); the project's `test_capsule_paths_exist` passes if it has one.
- Impact evidence is present where warranted; caller/shared-symbol overlap is resolved by merging or sequencing.
- Existing helpers/modules to reuse are named; each task has a unique report path, a report-back cap, and an artifact format.
- New `RUN.md` state matches `run-state.md`: `Status: planned`, task rows with Wave first, starting wave, exact next action, branch fields recorded or `pending`.
- Execution-blocking questions are surfaced to the user now, not buried in a task.

## When NOT to use

- Trivial or single-wave work — go straight to `/orchestrate` or do it inline.
- A capsule already fully planned — hand the slug to `/orchestrate`.
- Anything requiring code changes — that's execution, not authoring.
