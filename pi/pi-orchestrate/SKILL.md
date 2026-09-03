---
name: pi-orchestrate
description: Boardless Pi-native orchestration for long or complex implementations using pi-subagents, compact RUN.md recovery state, fresh-context reports, one-writer delivery, wave review, compaction recovery, and cold-session pickup. Use when invoking /skill:pi-orchestrate, executing a pi-workplan, resuming a long Pi implementation, or coordinating subagents without a task board.
---

# Pi Orchestrate

You are the parent Pi orchestrator. Keep decisions and final acceptance in the parent; delegate noisy or sustained work. The workplan capsule on disk—not conversation memory—is authoritative.

## Delegation threshold

Do work directly when the exact target is known and its output is needed for the next parent decision. Delegate work that is broad, noisy, parallelizable, sustained, or produces a reusable artifact. Do not spawn a child for a mechanical one-file change.

## Load selectively

- At start, resume, or after compaction, read `references/run-state.md` completely.
- Before dispatching any subagent, read `references/templates.md` completely.
- Before `worktree: true`, read `references/worktrees.md` completely.
- At project completion, read `references/close-out.md` completely.
- Do not load references before their trigger.

## Start or recover

Before reading or changing in-root workplan files, bootstrap lean-ctx and apply launch invariant 1.

1. Resolve `WORKPLAN_DIR=workplans/<slug>/` to an absolute path before any plan/state read. When a slug is supplied, do not probe for root-level `PLAN.md` or `RUN.md`.
2. Require `WORKPLAN_DIR/PLAN.md`. If `RUN.md` is absent, initialize it from the plan using `references/run-state.md`, with **Wave as the first task-table column**; never overwrite existing run state implicitly.
3. When status is `planned`, perform one structural preflight—not a re-plan. Every task needs explicit dependencies, owned files, AC/DoD, a validation command that can fail, a unique report path and format, serialized overlapping ownership, and project-required impact evidence. Stop only for an execution-blocking gap.
4. Read `RUN.md` once—use anchored mode when an update is likely—then read only the current task contract and dependencies from `PLAN.md`. When these exact paths are known, do not tree-scan the capsule, compose the plan, or reread unchanged state.
5. If status is `active` or `blocked`, reconcile with at most one fleet/status check and one focused ownership/diff/validation check before dispatch. Do not write an intermediate “reconciled/ready” checkpoint when the next action is an immediate launch; record the returned run ID in the next durable checkpoint.
6. If status is `complete`, stop unless the user explicitly asks to reopen it.
7. Suggest `/name workplan:<slug>` once for a substantial run so Pi session recovery is easy.

## Launch invariants

1. Bootstrap lean-ctx before repository work, then use it exclusively for in-root reads, search, discovery, shell, git, validation, and edits. Use `ctx_compose` for unfamiliar code understanding; exact-file contracts may go directly to `ctx_read`. Native repository tools require a stated narrow exception outside the lean-ctx root—never use them merely because they are available.
2. Run `subagent({ action: "list" })` before the first dispatch when availability is uncertain. Use `models` only after model/profile changes and `doctor` only for runtime wiring failures.
3. Use absolute unique `output` paths with `outputMode: "file-only"`. Children write only their assigned report plus explicitly owned source files.
4. Keep one source writer in the active tree. Parallelize only independent read-only work; use clean isolated worktrees for intentionally independent writers.
5. Read-only briefs say: `Do not edit project/source files; returning findings through the configured output artifact is allowed.` Require evidence-backed `no findings` when clean. Set a reason-bearing `acceptance: { level: "none", reason: "read-only artifact; parent validates configured output" }`; omission auto-infers attestation in the current runtime and can force unnecessary acceptance reports or retries.
6. A writer requests checked or verified evidence. Independent review is separate; never explicitly request `reviewed`.
7. Main-thread verification is final. Child prose, acceptance output, and review are evidence, not authority.
8. Subagents never edit `PLAN.md`, `RUN.md`, or `DECISIONS.md`; the parent is the sole state writer.
9. Impact evidence already recorded in an approved task contract is authoritative. Builders do not rerun it for in-contract symbols. If implementation requires an out-of-contract shared/exported symbol, stop; the parent runs new impact analysis and amends the contract before work continues.
10. The parent owns GitNexus indexing. Temporary isolated-worktree children never run `gnembed`, reindex, or rerun impact; they report stale-index or out-of-contract analysis needs. When the parent itself runs from a linked worktree, `gnembed` automatically pins the current branch index slot, and every subsequent GitNexus query/impact call must pass that same `branch`. For `detect_changes`, pass the linked worktree's absolute path when the MCP server was launched from another checkout.

## Agent routing

| Lane | Agent | Model policy | Context |
|---|---|---|---|
| Recon | `discovery` (`scout`) | `gpt-5.6-luna`, low | fresh |
| Reusable context | `context-builder` | `gpt-5.6-terra`, medium | fresh |
| Implementation | `developer` (`worker`) | `gpt-5.6-terra`, medium | fresh unless a compact fork is cheaper |
| Code/wave review | `code-reviewer` (`reviewer`) | `gpt-5.6-sol`, high | fresh |
| Decision consistency | `oracle` | `gpt-5.6-sol`, xhigh | fork, rare |

Do not review discovery reports by ritual. The parent checks deterministic artifacts. Default to one integrated fresh review per code wave; add task-level or specialist review only for security, destructive migration/data loss, public API/schema compatibility, or unusually broad risk.

Implementation defaults to Terra/medium. Override the writer to Sol/high only for concurrency, destructive or complex migration, security-sensitive work, or changes spanning at least three subsystems. A bounded accepted fix resumes the existing writer; redesign becomes a new task and contract, not a fix round.

## Execution loop

For each ready task:

1. Confirm dependencies are `done` in `RUN.md` and ownership does not overlap a live writer.
2. Launch one bounded child with the exact task heading, owned files, inputs, validation, and report path.
3. Record the returned run ID and expected report in `RUN.md` once. When a validated task completion is followed immediately by a dependency-ready launch with no parent/user decision between them, combine the completed-task evidence and new active run into this one checkpoint. If launch fails, checkpoint the completed task plus blocker instead.
4. For an explicit background-yield request, let async completion wake the session. Otherwise treat orchestration as run-to-completion: call `subagent_wait({ id })` when no independent parent work remains, then continue this loop from the completion result. Do not poll or sleep.
5. On completion, read the report header first—or validate an explicitly raw artifact directly—inspect the owned-file diff, and run the cheapest validation that proves changed behavior. If that diff output already shows the complete changed content, do not reread the same files; read only omitted, truncated, or risky hunks. Never rewrite a child artifact to retrofit formatting; resume the child for a real contract violation.
6. If the next action is a fresh wave review, launch it and update the task plus review run in one checkpoint.
7. Accept findings explicitly. Use `steer` while a child is live, `resume` for a narrow correction after pause/completion/failure, or a fresh fix writer when independent re-reasoning is safer. Cap review/fix rounds at three.
8. Mark `done` only after actual validation and required review pass. Store concise evidence paths, not logs, in `RUN.md`.

A blocked task does not stop independent ready tasks. If two tasks in one wave become blocked, treat the shared assumption, environment, or decomposition as suspect and investigate at the parent level before dispatching replacements.

Use `parallel` for a known list of independent read-only scopes, a sequential writer→reviewer `chain` only when no parent decision is needed between them, and individual launches when judgment determines the next action. Keep fan-out in the parent. A context-builder is optional and justified only when its artifact will be reused.

## Completion contract

An explicit `/pi-orchestrate` invocation is run-to-completion unless the user asks only for kickoff, status, or background yield. A progress report is a checkpoint, never a terminal response. After each dispatch, completion, review, or fix, continue to the next ready action in `RUN.md`; when waiting is the only next action, use `subagent_wait` and resume the loop in the same parent run.

Stop only when the workplan is validated `complete` and `.pi-subagents/artifacts/` has been removed, a genuine user decision is required, an external blocker prevents progress, a safety/budget limit is reached, or the user asks to stop. Ordinary child completion, wave completion, validation failure with an actionable repair, or a status update are not stopping conditions.

### Active Goal integration

When a Pi Goal is active, preserve the same execution loop across automatic continuation turns. Treat Goal prompts as continuation ownership, not as permission to bypass the workplan contract.

- Call `goal_complete` only after `RUN.md` is `complete`, required review and validation pass, and close-out evidence exists.
- Call `goal_blocked` only for a true impasse that satisfies the Goal extension's blocker contract; ordinary failures with an actionable next step remain active work.
- Never end a turn merely to announce progress. Checkpoint `RUN.md`, then dispatch, validate, repair, or wait on the next action.
- Goal mode is optional runtime support. `/pi-orchestrate` must retain the same run-to-completion behavior when no Goal extension is active.

## Durable checkpoints

Update `RUN.md` only after meaningful events: dispatch, child completion/failure, review verdict, user decision/blocker, wave completion, or close-out. Batch adjacent state changes into one anchored patch when no decision or ownership ambiguity lies between them. Do not issue standalone shell calls only to obtain a timestamp; update it opportunistically from an existing command/result or use the current turn time. Timestamps are recovery aids, never gates. Keep the file under roughly 5 KB by collapsing completed tasks to one row and linking reports/logs.

Record architecture or scope decisions append-only in `DECISIONS.md`; promote enduring decisions to project ADRs/docs at close-out. Do not maintain a duplicate event log—Pi session JSONL and git history already provide chronology.

## Compaction and session recovery

Pi compaction is lossy even though full JSONL history remains. Never depend on the compacted summary for execution state. After compaction, reload `RUN.md`, the current task block, saved run status, and the current diff before continuing.

Before an intentional handoff or manual compaction, checkpoint the exact next action and any active run IDs. Automatic compaction is safe because every durable transition is already checkpointed. Use `pi-handoff` for a new session; use `/skill:pi-pickup` or `/skill:pi-orchestrate <slug>` to recover.

## Async supervision

- For run-to-completion orchestration, call `subagent_wait` when no independent parent work remains, consume the result, and continue until a Completion contract stop condition is met.
- Return control with live work only when the user explicitly requests kickoff, status-only, or background yield; record the exact active run and next action first.
- Use status/fleet/transcript views for lifecycle evidence, not repeated polling. Check fleet ownership during cold recovery and once before close-out; after an unambiguous `subagent_wait` completion, do not immediately request the same status again.
- Save large failure output under `WORKPLAN_DIR/validation/`; point the next brief to it instead of pasting it into parent context.
- Never launch a replacement writer while ownership of an earlier live writer is uncertain.

## Verification and safety

Writer briefs name exact commands, cwd, what success proves, and acceptable blockers. During planned-state preflight, confirm validation is executable under the active lean-ctx shell/tool policy; translate a blocked form once to an equivalent recorded check instead of trial-and-retry. Prefer behavioral probes over existence checks. Focused validation proves the task behavior; changes to shared or widely imported surfaces also require the project-appropriate broader collection, build, or suite so filters cannot hide cross-module breakage. The parent owns that integration gate. Reuse a just-passed validation result when no relevant source or environment changed; close-out should recheck only the state/docs it subsequently changed. Parent checks `git diff --stat`, risky hunks, focused validation, then broader gates explicitly required by current project instructions or the plan. Do not probe GitNexus merely because its tools are installed.

Never commit, push, perform destructive git, skip hooks, deploy, spend live-cost resources, or use credentials without explicit current-session authorization.

## Anti-patterns

Never: parallel writers in one tree; temporary-worktree children reindexing GitNexus; pointer-only briefs without ownership/validation; reviewer-per-artifact ceremony; full logs in parent context; hard tool budgets on mutation-capable children; silent validation; unbounded fix loops; source edits by reviewers; parent rewrites of child reports; unanchored `ctx_patch` edits; exact-contract compose calls; duplicate unchanged state/file/reference reads; standalone timestamp calls; ready-only checkpoints immediately overwritten after launch; retrying known-blocked commands; duplicate post-wait/final fleet checks; deleting runtime artifacts before every child stops and canonical evidence is persisted; declaring completion while `.pi-subagents/artifacts/` remains; stale `RUN.md`; trusting compaction memory over disk; or success without inspecting the actual diff.
