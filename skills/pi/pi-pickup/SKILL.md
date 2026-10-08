---
name: pi-pickup
description: Recover and continue a boardless pi-orchestrate workplan from a pi-handoff document, RUN.md path, or workplan slug. Use when invoking /skill:pi-pickup, entering a fresh Pi session, resuming after compaction or interruption, reconciling persisted subagent runs and repository diffs, or continuing long work without the existing pickup skill.
---

# Pi Pickup

Recover a boardless Pi workplan from disk, reconcile reality, and continue through `pi-orchestrate`. Do not recreate context already captured by the capsule.

## Accepted inputs

- A `pi-handoff` Markdown path
- An absolute or repository-relative `RUN.md` path
- A workplan slug resolving to `workplans/<slug>/RUN.md`

Ask for the path/slug only when it cannot be resolved unambiguously.

## Recovery

1. Read the supplied handoff when present and resolve its authoritative `RUN.md` path.
2. Load current project-local instructions before repository mutation. Use native read/search/shell/edit/write tools with verified repository paths and cwd.
3. Resolve the exact capsule paths from the handoff/slug. Read `RUN.md` once in anchored mode, then only the current task and dependency blocks from adjacent `PLAN.md`. Do not tree-scan, glob, or compose a capsule whose paths are already known.
4. Run one focused branch/status/diff check and compare changed files with recorded active ownership; do not repeat unchanged state/file reads.
5. Query saved child run IDs when available. A live mutation-capable child retains ownership; never launch a competing writer.
6. Read only newly completed report headers and referenced failure logs needed for the next decision.
7. If a saved child cannot be resumed, preserve its diff/report as evidence and launch a fresh replacement only after ownership is known clear.
8. Run pending focused validation when disk state and repository reality disagree.
9. If continuation launches immediately, dispatch first and update `RUN.md` once with reconciled state plus the returned run ID. Do not write a ready-only checkpoint.
10. Continue using `pi-orchestrate` when no user decision is required.

Do not launch a broad context-builder merely to restate the capsule. Use a narrow discovery delta only for genuinely missing evidence.

## Pickup summary

Before continuing, report briefly:

- Goal and workplan
- Current task/wave and state
- Branch/diff ownership
- Child run reconciliation
- Validation/review state
- Blockers or user decisions
- Exact next action
- Whether recovery evidence is sufficient

## Safety

Prior-session authorization never transfers for commits, pushes, destructive git, production actions, credentials, hook skipping, or live-cost actions. Current repository evidence overrides stale handoff prose. If ownership is uncertain, stop rather than risk two writers.

## Completion states

- `planned`: begin the first ready task.
- `active`: reconcile and continue.
- `blocked`: surface the blocker or ask the required user question.
- `complete`: report completion and stop unless explicitly reopened.
- `abandoned`: stop unless the user explicitly restores it.
