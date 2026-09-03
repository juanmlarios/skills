# Run state and recovery

Read at workplan start, resume, pickup, or after compaction. `PLAN.md` is the stable contract; `RUN.md` is the compact authoritative execution state. The orchestrator alone edits run state and decisions — sub-agents never do.

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
Starting branch: <branch name | detached@SHA | pending>
Feature branch: <branch name assigned by the project/coordinator | pending — /orchestrate asks the user once>
Base ref: <branch-point SHA or unavailable>
Worktree base: <current committed HEAD or pending>
Worktree base mode: head
Updated: <ISO timestamp>
Next action: dispatch T1

## Tasks

| Wave | Task | State | Dependencies | Agent | Report | Validation | Review |
|---|---|---|---|---|---|---|---|
| W1 | T1 | pending | — | — | — | pending | pending |

## Active ownership

None.

## Blockers / decisions needed

None.

## Recovery

1. Require the checked-out branch to match `Feature branch`.
2. Read the current task block in `PLAN.md`.
3. Check for a live background agent for any `active` task.
4. Compare the actual diff with active ownership.
5. Execute `Next action` only after reconciliation.
```

Allowed workplan status: `planned | active | blocked | complete | abandoned`.
Allowed task state: `pending | active | blocked | done | deferred`.
Validation/review are **evidence** fields (pass/fail + path), not workflow states.
`Agent` records the dispatched `subagent_type` (`builder`, `hard-builder`, `fixer`, …); `Report` records the path under `agents/`.

## Checkpoint rules

Checkpoint after:

- child dispatch (agent type, owned files, report path),
- completion/failure (result and validation artifact),
- review verdict,
- user decision or blocker,
- wave completion,
- close-out.

Use one edit for all fields changed by the event. Batch a completed task and an immediately dispatched successor into one checkpoint when no decision or ownership ambiguity lies between them. A log row is one line, ≤200 characters, and names a path under `agents/` or `validation/` for anything longer — findings, arithmetic, rulings, and retrospectives live in those files, never in `RUN.md`. The header `Status:` is one of the enum values below with nothing appended; the outcome narrative belongs in `REPORT.md`. Past capsules that ignored this grew to 100 KB and carried headers two decisions stale, so where the project defines `test_run_md_shape`, run it after every checkpoint. Do not write a "ready to dispatch" checkpoint that will be replaced seconds later by the dispatch record. The edit result is your readback — don't re-read the whole file to confirm it. Never run a shell command solely to obtain a timestamp; take it from the current turn or an existing command's output. Timestamps are recovery aids, never gates. Store pass/fail plus a path, never raw logs. Collapse completed tasks to one row and keep the file under ~5 KB.

## Decisions

Record a lasting scope or architecture decision when it is made, not during close-out reconstruction. Append to `DECISIONS.md`:

```md
## D<n> — <short decision>

Context: <why a choice was required>
Decision: <what is now authoritative>
Consequences: <constraints or follow-up created>
Alternatives: <material options rejected, or none>
```

If a decision blocks execution, also record it in `RUN.md` under `Blockers / decisions needed`, and clear that entry in the same checkpoint that resolves it. Promote only enduring decisions to the project's ADR/decision convention at close-out.

## Cold recovery

1. Load current project instructions.
2. Read `RUN.md` once (anchored when an update is likely); stop if `complete` unless explicitly reopening. Exact capsule paths make tree scans unnecessary.
3. Require the checked-out branch to match `Feature branch`. If it differs, switch only when the tree is clean enough to preserve all work; otherwise stop with the exact mismatch. Never create a second feature branch during recovery.
4. Read only the current task and dependency blocks from `PLAN.md`; do not re-read the whole plan.
5. **Check for live background agents once, before dispatching any writer.** A live writer retains ownership of its files; never dispatch a second writer for those paths. Use `TaskOutput`/`SendMessage` on a known agent; the predetermined report path under `agents/` is your evidence when the agent handle is lost.
6. Run one focused `git status` / `git diff --stat` reconciliation. If a dispatch completed, read its report header and compare claimed files with that evidence.
7. If an agent can't be resumed, treat the diff plus report as evidence and dispatch a fresh bounded replacement only once ownership is known clear.
8. Run pending validation only when state and repository disagree.
9. If the next action is an immediate dispatch, dispatch first and then write one checkpoint carrying both reconciled reality and the new dispatch. Otherwise checkpoint the exact blocker / next action.

If the session died between dispatch and recording it, the predetermined report path and the working-tree diff are the evidence — check both before declaring a task unowned.

## Compaction

The compacted summary already includes goal, progress, decisions, next steps, and file operations, but it is lossy. `RUN.md` remains authoritative. After any compaction, perform cold-recovery steps 2–6 before mutating anything.

Before an intentional handoff or manual compaction, checkpoint the exact next action and any live agents. Automatic compaction is safe precisely because every durable transition is already checkpointed. For manual compaction, focus the summary with:

```text
Preserve the active workplan path, RUN.md next action, live sub-agents,
unresolved user decisions, validation/review state, and current constraints.
Treat RUN.md as authoritative after compaction.
```

## Reopen

Reopening requires explicit user direction. Change status from `complete` or `abandoned` to `active`, state the new objective and next action, clear only the stale evidence for affected tasks, and preserve prior reports. Do not silently rewrite the original contract — amend `PLAN.md` visibly when scope changes.
