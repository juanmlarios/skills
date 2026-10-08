---
name: pi-workplan
description: Create a boardless, executable Pi workplan capsule with stable PLAN.md task contracts and compact RUN.md recovery state. Use when invoking /skill:pi-workplan, decomposing an already-chosen implementation strategy for pi-orchestrate, preparing multi-wave subagent work, or planning long work that must survive compaction and fresh-session recovery without changing the existing workplan skill.
---

# Pi Workplan

Turn an already-chosen approach into a boardless executable workplan for `pi-orchestrate`. This is decomposition, not architecture design or execution.

## Inputs

Locate the chosen strategy in the current context or `workplans/<slug>/`. If only a goal exists, stop and request strategy/plan-mode work; do not invent architecture while decomposing it.

Use targeted discovery only to resolve contract details such as exact paths, symbols, helpers, ownership, and validation. Delegate broad reading and consume concise file-backed reports. When the strategy path/slug is supplied, read it directly; do not glob or tree-scan for alternatives.

For repository operations, use native read/search/shell/edit/write tools. Read exact supplied paths directly and limit unfamiliar-code discovery to missing contract facts.

## Outputs

Create or update only:

```text
workplans/<slug>/STRATEGY.md   # when the approved strategy exists only in context
workplans/<slug>/PLAN.md       # stable waves and task contracts
workplans/<slug>/RUN.md        # initialized boardless recovery state
```

Create `DECISIONS.md` only if a decomposition decision is actually made. Do not create source changes, child agents for implementation, empty report directories, or any task-board objects.

Before initializing `RUN.md`, read `../pi-orchestrate/references/run-state.md` completely once using the native read tool. Never overwrite an existing `RUN.md`; update the existing capsule or ask before resetting it.

## Authoring loop

1. Extract objective, constraints, boundaries, and settled decisions from the strategy.
2. Explore only missing task-contract facts. Reuse existing helpers and patterns.
3. In GitNexus-indexed repositories, run upstream impact analysis for exported/shared target symbols and record risk, callers, affected files/processes, and required tests in the owning task. If this parent is a linked worktree, refresh with `gnembed` (which auto-pins its current branch slot) and pass that `branch` to subsequent GitNexus calls. Temporary worktree builders never reindex or run impact; out-of-contract analysis returns to the parent. Overlapping blast radius means merge or serialize tasks.
4. Decompose into waves with explicit dependencies and one writer per file in a wave.
5. Draft the complete `PLAN.md` and `RUN.md` content, apply the quality gate before writing, then create each file once. Do not create an incomplete plan and repair it through several small patches.
6. Initialize `RUN.md` with `Status: planned`, one compact row per task with **Wave as the first column**, the starting wave, and the exact first action. Do not issue a standalone timestamp command; use the current turn date/time.
7. Validate cold executability from the create/patch readback plus one focused structural check. Do not reread files merely to confirm successful writes; batch any real defects into one correction patch.
8. Stop. Report the capsule path and launch command `/skill:pi-orchestrate <slug>`.

## PLAN.md shape

```md
# <title>

## Objective

## Constraints and non-goals

## Waves
- W1: T1, T2
- W2: T3 (depends on T1, T2)

## Validation contracts

## Risks and open questions

### T1 — <title>
Wave: W1
Depends on: none
Agent: discovery | developer | reviewer
Goal: <one sentence>
Scope: <exact work>
Non-goals: <explicit exclusions>
Owned files: <exact paths>
Context: <paths, symbols, decisions, existing helpers>
Impact: <risk, direct callers/processes, affected files/tests>
AC:
- <criterion>
DoD:
- <item>
Validation: `<command>` in `<cwd>` — proves <behavior>; failure looks like <signal>
Report: `workplans/<slug>/agents/T1/<role>.md`
Artifact format: prose-header | raw-exact
```

## Quality gate

Every task must have explicit dependencies, disjoint or serialized source ownership, acceptance criteria, a command that can fail under the active shell/tool policy, expected evidence, a unique report path, and a declared prose-header or raw-exact artifact format. The configured report is runtime-persisted and never belongs in `Owned files`. Choose an executable check during planning; preserve the validation exit status and required cleanup. The plan must identify user decisions that block execution rather than hiding them inside a builder brief.

## Anti-patterns

Never: re-decide architecture; duplicate strategy prose into every task; create implementation agents; use pointer-only contracts; assign overlapping parallel writers; use existence-only validation; overwrite active run state; or create tracking artifacts outside the capsule.
