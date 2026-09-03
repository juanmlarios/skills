# Boardless workplan close-out

Load only at wave or project completion.

## Wave close

1. Confirm no mutation-capable child still owns files in the wave with one fleet/ownership check. Do not repeat it after close-out unless another child is launched.
2. Run the wave validation contract and save large output under `validation/`. If the wave changed shared or widely imported surfaces, also run the project-appropriate broader collection, build, or suite; a focused filter alone is insufficient integration evidence.
3. Run one fresh integrated review when the wave changes code and risk warrants it.
4. Disposition findings and rerun affected validation.
5. Record accepted scope/architecture choices in `DECISIONS.md`.
6. Update `RUN.md`: completed tasks, next wave/task, exact next action.
7. Commit only when explicitly authorized; stage wave-owned paths by name.

Do not delete reports or logs while the workplan is active.

## Project close

1. Confirm every task is `done` or explicitly `deferred`, with blockers resolved or documented.
2. Confirm no live child owns source files.
3. Run final focused and project-required validation; include broader collection/build/suite evidence for shared surfaces and save concise evidence paths. If the same validation just passed after review and no relevant source/environment changed, reuse it and validate only subsequently changed state/docs.
4. Run repository-required final diff/impact checks such as GitNexus detect_changes.
5. Reconcile living `docs/` to delivered reality when needed.
6. Promote enduring decisions from `DECISIONS.md` into project ADRs or living docs; leave implementation-local decisions in the capsule.
7. Write `REPORT.md` with delivered scope, changed areas, validation, review, deferrals, and residual risks.
8. After canonical task reports, validation evidence, and `REPORT.md` are safely persisted—and only after every child has stopped—remove `.pi-subagents/artifacts/`. It is transient orchestration state, never durable project evidence. Never stage or commit it; if an earlier run already tracked it, retain the resulting deletions so the repository stops carrying it. Do not remove it from an active, blocked, paused, or handed-off run.
9. Set `RUN.md` to `Status: complete`, `Current task: none`, `Next action: none`, and record final validation/review paths in one anchored patch. Its edit evidence is readback; use one lightweight state/report check rather than rerunning unchanged behavior. The final check must include `test ! -e .pi-subagents/artifacts` so close-out fails if runtime artifacts remain.
10. Optionally remove other bulky scratch or raw logs only after confirming no retained document references them. Keep `STRATEGY.md`, `PLAN.md`, `RUN.md`, `DECISIONS.md` when present, and `REPORT.md`.
11. Commit only when explicitly authorized.

The workplan directory is the historical record. Git history is the implementation record. Do not move or duplicate completed capsules into another archive.
