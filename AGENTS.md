<claude-mem-context>
# Memory Context

# [skills] recent context, 2026-05-05 8:07am PDT

No previous sessions found.
</claude-mem-context>

## Backlog.md orchestration invariants

- The parent orchestrator is the only Backlog writer. Use the `backlog` CLI; never hand-edit task metadata.
- Fail before execution unless statuses include `Backlog`, `Ready`, `In Progress`, `In Review`, `Blocked`, and `Done`. Never disguise blocked/review/ready work with another status.
- Every mutation is transactional: exact task pre-read, CLI mutation, exact task readback, and verification of status plus dependencies, criteria/DoD, notes, blocker/artifact evidence, milestone/labels, and final summary.
- Reopening a task requires `--clear-final-summary`, unchecking every criterion/DoD item that needs revalidation, and recording the reopen reason. Stale pass evidence is a blocker.
- Blocked tasks use `Blocked` and record exact evidence, required decision/owner, retry condition, and affected dependents.
- After scope/dependency discoveries, reviewer verdicts, reopenings, exhausted retries, and before wave close, reconcile every task in the workplan slice and repair all mismatches before continuing.
- At reconciliation gates, verify the configured Backlog browser is healthy, serves this repository, and reflects representative changed tasks; restart it from the repository root only when absent or stale.
- A successful command or agent report is evidence, not completion. Do not continue until board readback, browser verification, and dependency state agree.