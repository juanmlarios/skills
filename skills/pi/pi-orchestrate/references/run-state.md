# Boardless run state and recovery

Read at workplan start, resume, pickup, or after compaction. `PLAN.md` is the stable contract; `RUN.md` is the compact authoritative execution state. The parent alone edits both run state and decisions.

## Capsule layout

```text
workplans/<slug>/
├── STRATEGY.md          # optional chosen approach
├── PLAN.md              # stable waves and task contracts
├── RUN.md               # current execution state, target <=5 KB
├── DECISIONS.md         # append-only, created only when needed
├── agents/              # unique child reports
├── validation/          # large raw outputs
└── REPORT.md            # final outcome, created at close-out
```

Do not create empty directories or optional files before they are needed.

## RUN.md template

```md
# Run State — <title>

Status: planned
Current wave: W1
Current task: none
Base ref: <git SHA or unavailable>
Updated: <ISO timestamp>
Next action: launch T1

## Tasks

| Wave | Task | State | Dependencies | Agent/run | Report | Validation | Review |
|---|---|---|---|---|---|---|---|
| W1 | T1 | pending | — | — | — | pending | pending |

## Active ownership

None.

## Blockers / decisions needed

None.

## Recovery

1. Read the current task block in `PLAN.md`.
2. Reconcile any saved run ID and report.
3. Compare the actual diff with active ownership.
4. Execute `Next action` only after reconciliation.
```

Allowed workplan status: `planned | active | blocked | complete | abandoned`.
Allowed task state: `pending | active | blocked | done | deferred`.
Validation/review are evidence fields, not workflow states.

## Checkpoint rules

Checkpoint after:

- child dispatch (run ID, owner, report path),
- completion/failure (result and validation artifact),
- review verdict,
- user decision or blocker,
- wave completion,
- close-out.

Use one anchored edit for all fields changed by the event. Batch a completed task and immediately launched successor into one checkpoint when no decision or ownership ambiguity lies between them. Do not write a “ready to launch” checkpoint that will be replaced seconds later by the run ID. The edit result is readback; do not reread the whole file merely to confirm it. Do not call `date` solely for this file; use an already available/current turn timestamp. Store pass/fail plus a path, never raw logs. Collapse completed tasks to one row.

## Decisions

Record a lasting scope or architecture decision when it is made, not during close-out reconstruction. Append to `DECISIONS.md`:

```md
## D<n> — <short decision>

Context: <why a choice was required>
Decision: <what is now authoritative>
Consequences: <constraints or follow-up created>
Alternatives: <material options rejected, or none>
```

If a decision blocks execution, also update `RUN.md` under `Blockers / decisions needed`; clear that entry in the same checkpoint after resolution. Promote only enduring decisions to project ADRs or living docs at close-out.

## Cold recovery

1. Load current project instructions.
2. Read `RUN.md` once in anchored mode; stop if complete unless explicitly reopening. Exact capsule paths make tree scans unnecessary.
3. Read only the current task and dependency blocks from `PLAN.md`; do not compose a known plan file.
4. Query saved run IDs/fleet once. A live writer retains ownership; never launch a second writer for those files.
5. Run one focused status/diff/validation reconciliation. If a run completed, read its report header and compare claimed files with that evidence.
6. If a run cannot be resumed, treat the diff/report as evidence and launch a fresh bounded replacement only after ownership is known clear.
7. Run pending validation only when state and repository disagree.
8. If the next action is immediate dispatch, launch first and update `RUN.md` once with reconciled reality plus the new run ID. Otherwise checkpoint the exact blocker/next action.

If the parent crashed between launch and recording a run ID, inspect the native fleet/artifact directories and the predetermined report path before declaring the task unowned.

`.pi-subagents/artifacts/` exists only for active-run recovery and runtime diagnostics. Durable task evidence must live at the configured `workplans/<slug>/agents/` or `validation/` paths. After project close-out persists canonical evidence and confirms no live child, remove the runtime artifact directory; completed `RUN.md` and `REPORT.md` must not depend on it.

## Compaction

Pi's default compacted summary already includes goal, progress, decisions, next steps, and file operations, but it is lossy. `RUN.md` remains authoritative. After any compaction, perform cold recovery steps 2–5 before further mutation.

For manual compaction, focus the summary with:

```text
Preserve the active workplan path, RUN.md next action, active subagent IDs,
unresolved user decisions, validation/review state, and current constraints.
Treat RUN.md as authoritative after compaction.
```

## Reopen

Reopening requires explicit user direction. Change status from `complete` or `abandoned` to `active`, state the new objective/next action, clear only stale evidence for affected tasks, and preserve prior reports. Do not silently rewrite the original contract; amend `PLAN.md` visibly when scope changes.
