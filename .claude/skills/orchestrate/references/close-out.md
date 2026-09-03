# Workplan close-out

Runs when a wave or a whole workplan is delivered. Turns transient scratch into permanent provenance and leaves the repo clean so the next workplan starts fresh. Two depths.

## Wave close (light — between waves)

1. Confirm no live sub-agent still owns files in the wave, and every task is `done` or explicitly `deferred` in `RUN.md`.
2. Run the wave's validation contract; confirm real pass output. If the wave touched shared or widely-imported surface, add the broader collection/build/suite — a focused filter alone is not integration evidence. Save large output under `workplans/<slug>/validation/`.
3. One fresh integrated review (`reviewer`, or `deep-reviewer` at a risky boundary); disposition findings and re-run affected validation.
4. `AskUserQuestion`: any scope change, deferral, or architecture choice this wave froze? Append each to `DECISIONS.md` as `## D<n> — <choice>` with Context / Decision / Consequences / Alternatives.
5. Wave commit if authorized (stage wave-owned files by name).
6. One checkpoint in `RUN.md`: completed tasks collapsed, next wave/task, exact next action. Update the native task list to the next wave.
7. Start the next wave. **No deletion — the workplan is still active.**

## Project close (full — workplan complete)

Order matters: decisions and living-doc updates happen *before* the sweep, so nothing is lost.

1. **Verify done.** Every task `done` or explicitly `deferred`, blockers resolved or documented, no live sub-agent owning source files.
2. **Reconfirm validation.** Run the final focused and project-required validation, including broader collection/build/suite evidence for shared surfaces; record concise evidence paths. If the same validation just passed after review and nothing relevant changed since, reuse it and validate only what you changed afterwards. Run repository-required final diff/impact checks (e.g. GitNexus `detect_changes`).
3. **Guided decisions.** `AskUserQuestion` for: what's deferred to the next workplan, which architecture choices to freeze, what the post-mortem should note. Append each to `DECISIONS.md` as it's answered.
4. **Promote enduring decisions** into the project's decision convention (ADRs / `docs/decisions/` — whatever the repo already uses). Implementation-local decisions stay in the capsule.
5. **Reconcile living docs** (present tense). Dispatch a `builder`/`hard-builder` with a contract to update `docs/` — architecture to the delivered reality, roadmap items from aspiration → done, plus any new gaps discovered. Verify the diff yourself. **These docs are never archived; they must read true after this step.**
   ```
   Task: reconcile docs/ to <slug> delivery.
   OWNED FILES: <exact docs/ paths>
   CONTRACT: docs/<arch> reflects <what changed>; docs/<roadmap> moves <items> to delivered; add <new gaps>.
   VALIDATION: <link/consistency check or grep>; include real output.
   DO NOT: touch source, the workplan capsule's state files, or any other workplan.
   ```
6. **Write `REPORT.md`** in the capsule: delivered scope, changed areas, validation evidence paths, review outcome, deferrals, residual risks, the dedicated feature branch, and its branch-point SHA. This is the workplan's historical record; git history is the implementation record.
7. **Sweep the workplan folder** (from the 2026-07-20 markdown-cleanup audit — do NOT blanket-delete). In `workplans/<slug>/` keep only the durable core: `STRATEGY.md`, `PLAN.md`, `RUN.md`, `DECISIONS.md`, `REPORT.md`, close-out `VALIDATION`, `research/`, `ip/`. Delete the per-task scratch: `agents/`, `validation/` raw logs, `implementation/`, `review/`, `measurement/`, agent prompts/briefs, data artifacts, `__pycache__`. Delete the whole folder only if nothing durable remains in it.
   - **Grep before every delete** — mandatory; this check regularly overturns purge verdicts (durable docs and decisions reference into workplan folders):
     ```bash
     grep -rn "<path-or-filename>" docs CLAUDE.md AGENTS.md workplans
     ```
     A hit means keep the file, or fold its content into `REPORT.md` first, then delete.
8. **Junk sweep.** `.DS_Store`, `__pycache__`, stray `.log`/`.pyc`, ` copy.*` files, empty dirs — anywhere the workplan dropped them, plus any stray markdown outside `docs/`.
9. **Finalize state.** One checkpoint setting `RUN.md` to `Status: complete`, `Current task: none`, `Next action: none`, with the final validation/review evidence paths. Then clear or complete the native task-list entries for this workplan — it is a live view, and a finished workplan must not leave phantom rows behind.
10. **Final commit** if authorized:
    ```bash
    git add docs/ workplans/
    git commit -m "chore(<slug>): close out — docs reconciled, report written, scratch swept"
    ```
11. **Leave the feature branch intact.** Do not merge, rebase, push, delete, or switch away implicitly. Report its name and final HEAD after any authorized final commit; each further action needs its own authorization.

## What ends up where

| Artifact | Home after close-out |
|---|---|
| Delivered plan + run state | `workplans/<slug>/PLAN.md`, `RUN.md` (frozen at complete) |
| Outcome, validation, deferrals, risks | `workplans/<slug>/REPORT.md` |
| Decisions made during the run | `workplans/<slug>/DECISIONS.md`; enduring ones promoted to the project's ADR/decision convention |
| Current architecture + roadmap | `docs/` on the workplan feature branch (rewritten, living) |
| The code change | git history |
| Per-task scratch (`agents/`, raw validation logs, prompts) | deleted after the grep check (git retains) |

Do not duplicate a completed capsule into a second archive location — one home per artifact.
