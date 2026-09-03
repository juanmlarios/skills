---
name: workplan
description: Turn an already-chosen implementation approach into a boardless executable workplan capsule — decompose the strategy into waves of sub-agent-sized tasks with self-contained contracts and validation, and write PLAN.md plus an initialized RUN.md under workplans/<slug>/. Consumes a high-level strategy (from plan mode or existing workplans/<slug>/ docs); it does not re-decide architecture. Produces the handoff artifact that /orchestrate executes. Can be pointed at an existing workplans/<slug>/ to decompose in place, or start fresh. Use when the user invokes `/workplan`, points it at a slug, or wants to convert a strategy/approach into a runnable plan.
---

# Workplan

You take an **already-decided implementation approach** and turn it into a **boardless executable workplan capsule** — a decomposition, not a strategy. Architecture, analysis, and the chosen approach are **inputs** (produced upstream in plan mode or sitting in `workplans/<slug>/`). You decompose that approach into waves and task contracts, and write it down as a **capsule** — `PLAN.md` + an initialized `RUN.md`. You do **not** re-decide architecture, and you do **not** execute — no builders, no code changes. Execution is `/orchestrate`'s job; your output is the artifact it picks up.

## Input: a strategy

You need a chosen approach — locate it:
- **Existing capsule** (`/workplan <slug>` pointed at a workplan already in progress): read what's there first — `STRATEGY.md` if present, otherwise `PLAN.md`. Decompose **into that capsule**; never create a second one for the same slug.
- **In context** (plan mode just ran this session): persist the approved strategy to `workplans/<slug>/STRATEGY.md` before decomposing — the file is the durable record. Only write it when the approved strategy exists solely in context; skip it if a strategy doc is already on disk.
- **On disk** (`/workplan <slug>`, fresh session): read the existing `workplans/<slug>/` docs directly.

If no approach exists yet, stop and say so — that's plan-mode/strategy work, not this skill. Don't invent architecture here. If the strategy is only a *goal* ("decompose the god modules") rather than a decided approach, say so and send the user to plan mode first — decomposing an undecided architecture is inventing it.

Your context window is scarce. Delegate bulk reading/searching to a read-only exploration agent (`Explore`/`scout`) — you consume fixed-format summaries and synthesize the plan. Never bulk-read the codebase yourself.

## What you produce

A **workplan capsule** under `workplans/<slug>/` — create or update only:

```text
workplans/<slug>/STRATEGY.md   # only when the approved strategy exists solely in context
workplans/<slug>/PLAN.md       # stable waves + task contracts
workplans/<slug>/RUN.md        # initialized boardless recovery state
```

Create `DECISIONS.md` only if a real decomposition decision is made. Nothing else: no empty directories, no report scaffolding ahead of need, no task-board objects of any kind.

**Never overwrite an existing `RUN.md`.** If one exists, update it in place or ask the user before resetting it.

## The authoring loop

1. **Ingest the strategy** — read the chosen approach (see *Input* above). Extract the objective, boundaries, and the architecture decisions already made. Ask the user only to resolve a decomposition ambiguity the strategy genuinely left open — not to reopen settled architecture.
2. **Targeted exploration** — dispatch a read-only exploration agent (parallel, if more than one gap) *only to pin contract-level detail* the strategy left at the module level: exact paths, symbols, line numbers, existing helpers to reuse. Delegate breadth; hold only the conclusions. You are filling in task contracts, not re-mapping the architecture.
3. **Impact analysis (GitNexus-indexed repos)** — run `impact({target, direction: "upstream"})` once per task's target symbols, here at decomposition time. The blast radius — affected files, direct callers, risk level, tests that must pass — goes into that task's contract; builders do **not** re-run impact for in-contract symbols. If this parent is running from a linked worktree, refresh with `gnembed` (which auto-pins the current branch slot) and pass that same `branch` to GitNexus calls. Out-of-contract impact returns to the parent; temporary worktree builders never reindex or run impact. Blast-radius **overlap between two tasks is a decomposition signal**: merge them into one task, or sequence them with explicit ownership — never leave two parallel writers sharing a symbol. Where the repo being planned isn't GitNexus-indexed, skip this step; don't legislate tooling that isn't there.
4. **Record decisions as they're made** — each architecture/scope choice that sticks gets appended to `workplans/<slug>/DECISIONS.md`: Context / Decision / Consequences / Alternatives. These outlive the capsule.
5. **Decompose** — break the work into **waves** (milestones) of **sub-agent-sized tasks**. Each task gets a self-contained contract (goal, scope, non-goals, owned files, context, AC, DoD), a **blast radius** (from step 3, in indexed repos), the repo's **hot rules** (paste the `docs/standards-review.config.md#hot-rules` block verbatim if the repo has one — this is the only standards content builders carry), and a **validation contract** (exact command, cwd, what pass proves, what real failure looks like — never a bare existence check). One writer per file across a wave — overlapping ownership means merge the tasks or serialize them.
6. **Write `PLAN.md`** — objective, waves, one task-contract block per task (shape below), risks, open questions. Complete enough that `/orchestrate` can launch each task cold with no re-derivation.
7. **Initialize `RUN.md`** — `Status: planned`, one compact row per task with **Wave as the first column**, the starting wave, and the exact next action (e.g. "launch T1"). Record `Starting branch` and `Base ref` when available; set `Feature branch: pending creation by /orchestrate`, `Worktree base: pending`, and `Worktree base mode: head`. `/workplan` never creates or switches branches; `/orchestrate` binds the dedicated `workplan/<slug>` branch exactly once at first execution. This is the recovery state the executing orchestrator reads first; its canonical reference is `~/.claude/skills/orchestrate/references/run-state.md` — same capsule layout, same RUN.md shape.
8. **Stop.** Tell the user the capsule path and: run `/orchestrate <slug>` to execute. A capsule whose `RUN.md` status is `planned` is simply parked — nothing further to do to "park" it.

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
Agent: builder | reviewer | scout
Goal: <one sentence>
Scope: <exact work>
Non-goals: <explicit exclusions>
Owned files: <exact paths>
Context: <paths, symbols, decisions, existing helpers to reuse>
Impact: <risk, direct callers/processes, affected files/tests — GitNexus-indexed repos>
AC:
- <criterion>
DoD:
- <item>
Validation: `<command>` in `<cwd>` — proves <behavior>; failure looks like <signal>
Report: `workplans/<slug>/agents/T1/<role>.md`
Artifact format: prose-header | raw-exact
```

## Quality bar for the handoff

`/orchestrate` should be able to run the capsule cold. Before you stop, check:
- Every task has explicit dependencies, and each wave's tasks have disjoint file ownership or are serialized.
- Every task has AC, DoD, and a validation command that **can actually fail** — no bare existence checks.
- In indexed repos, every task carries its blast radius, and shared-symbol overlaps across tasks are resolved (merged or sequenced).
- Reuse checked: you named existing helpers/modules to extend, not re-implement (grep-before-write is the single most common defect class).
- Each task has a unique report path under `workplans/<slug>/agents/` and a declared artifact format.
- `RUN.md` is initialized (`Status: planned`, task rows with Wave as the first column, starting wave, next action) and does not overwrite a pre-existing one.
- Open questions that block execution are surfaced to the user now, not buried inside a task's context and deferred.

## When NOT to use

- Trivial or single-wave work you'd just run directly — go straight to `/orchestrate` or do it inline.
- A capsule already fully planned — hand the slug to `/orchestrate`; don't re-author.
- Anything requiring code changes — that's execution, not authoring; you never write product code here.
