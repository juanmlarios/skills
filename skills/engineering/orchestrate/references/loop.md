# The loop — per-step detail

Read when a step in the SKILL.md loop needs its full procedure. Order is a real constraint (deps before dispatch, integrate before verify, `detect_changes` before commit); this is a checklist, not a script for reasoning.

## 1. Enter

**Pickup** (`/orchestrate <slug>`, capsule exists): don't re-plan. Read `PLAN.md` and sanity-check every task block: owned files, AC, DoD, explicit deps, a validation command that can fail, disjoint ownership per wave, `Shape`, `Why`, and — in indexed repos — impact where warranted. Every path a contract cites must exist now (`test_capsule_paths_exist` if the project has it). Gaps go back to the user before executing. Then initialize `RUN.md` if absent (`templates.md` → "Seed RUN.md from PLAN.md") or reconcile it if present; stop if it says `complete` unless the user reopens.

**Plan-and-run** (no capsule): for substantial work prefer `/workplan`. For small multi-wave work, plan with the user (`AskUserQuestion` for genuine architecture/scope forks only), then write `PLAN.md` + `RUN.md` yourself before any dispatch.

**Branch.** Read `Feature branch` from `RUN.md`. Absent → ask once, record it. Present → require it checked out; switch only when the tree is clean enough to preserve all work, otherwise `blocked` with the exact mismatch.

## 2. Per task

1. Preconditions: deps `done` in `RUN.md`; recorded branch checked out; no live writer owns any of the task's files (check background agents first — a live writer keeps ownership).
2. Choose lane (`SKILL.md` → Agent stable). `Shape: fan-out` and read-only → `fanout.md`. Writing under isolation → `worktree.md` preflight, capture and persist `Worktree base`.
3. Decide fresh verification: code/shared surface, evidence-heavy claim, worker-failure recovery, wave acceptance → yes; trivial edits, temporary notes, low-risk single-file docs covered by a later wave verifier → no. For selected tasks the brief carries the literal marker `FRESH VERIFICATION REQUIRED`; that builder edits, writes a compact receipt, and stops before validation. Unselected builders run their own validation.
4. Dispatch with the full contract (`templates.md`). One checkpoint: agent type, owned files, base SHA if isolated, report/receipt path.
5. Integrate: read the report header; `git diff --stat`; targeted reads of suspicious hunks. Under isolation, confirm the parent still names the recorded branch and the child's HEAD descends from the captured base, then diff-apply only the owned change — never wholesale-copy files. A mismatch is stale-base drift: stop and reconcile.
6. Selected tasks → fresh `verifier` with a small brief (contract excerpt, owned files, receipt path, exact commands; never the builder transcript).
7. Findings → `fixer` with accepted findings + raw failure output path. `reviewer`/`deep-reviewer` only when independent correctness judgment is also needed. Max 3 fix rounds, then `blocked` with evidence.
8. Mark `done` only after you have seen the real diff and real validation output. One checkpoint; batch it with the successor's dispatch when nothing needs deciding in between.

## 3. Per wave

1. All tasks `done` or `deferred`.
2. Run the wave's validation contract; raw output to `validation/`, pass/fail + path in `RUN.md`. After changes to shared surfaces, run collection plus the broader suite, not just task filters.
3. Indexed repos: `detect_changes`; diff actual changed symbols/flows against the planned scope (union of owned files + impact). Unexplained symbols → investigate and resolve before committing.
4. Scope changes or freeze decisions → `AskUserQuestion`, append to `DECISIONS.md` as made.
5. One wave commit if authorized: stage wave-owned files by name, HEREDOC message (`templates.md` → Wave commit). Advance `Worktree base` to the new HEAD.
6. One checkpoint closing the wave and opening the next; seed the next wave into the task list; continue immediately.

## 4. Close-out

`close-out.md`: reconfirm validation, write `REPORT.md`, promote enduring decisions, reconcile living docs, sweep the capsule to its durable core, clear the task list.

## 5. Stop conditions

Close-out finished · a genuine product/architecture/security/destructive decision needs the user · the user redirects · ≥2 tasks blocked in one wave (systemic: shared assumption, environment, or decomposition is wrong — escalate). A blocker in one lane does not stop independent lanes. Tasks `active` with no live worker at pickup are recovery work: inspect artifacts, resume or redispatch.

## Recovery after compaction or in a fresh session

`RUN.md` is authoritative over conversation memory. In order: read `RUN.md` once → require the recorded branch → read only the current task block of `PLAN.md` and its deps → check for live background agents before dispatching any writer → one focused `git status` / `git diff --stat` against claimed ownership → execute `Next action`. If that action is a dispatch, dispatch first and write one checkpoint carrying both reconciled reality and the new dispatch. Full procedure: `run-state.md` → Cold recovery.
