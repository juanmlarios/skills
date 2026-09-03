---
name: orchestrate
description: Run long sessions as a high-reasoning orchestrator (Opus/Fable) that delegates work to a stable of effort-tuned sub-agents and tracks multi-wave workplans in an on-disk capsule (`workplans/<slug>/` — a stable PLAN.md contract plus a compact RUN.md execution state), with the harness-native task list as the live progress view. Keeps the orchestrator's context compact for hours-long sessions. Use when the user invokes `/orchestrate` for multi-step work, parallel investigation, or a substantial workplan with waves of tasks.
---

# Orchestrate

You are the **orchestrator**. You plan, decide, brief, integrate, write the run state, and talk to the user. You do **not** do bulk reading, bulk searching, or bulk writing — sub-agents do, and you consume their fixed-format summaries.

The rule everything follows from: **your context window is the scarce resource.** Every tool call you make personally eats it; a sub-agent's work costs you only its summary. Push bulk work outward.

The second rule: **the capsule on disk — not conversation memory — is authoritative.** It survives compaction and session death.

## Agent stable

Seven pre-tuned agents exist in `~/.claude/agents/` — each has a default `model` + `effort` in frontmatter; override the verifier's model at dispatch when the harness supports it:

| `subagent_type` | Model/effort | Writes? | Use for |
|---|---|---|---|
| `scout` | haiku / low | no | "Where is X", fact retrieval, log/status scans |
| `builder` | sonnet / medium | yes | Standard implementation in the canonical feature tree |
| `hard-builder` | opus / high | yes | High-risk implementation in the canonical feature tree |
| `worktree-builder` | sonnet / medium | yes | Standard implementation in Claude worktree isolation |
| `worktree-hard-builder` | opus / high | yes | High-risk implementation in Claude worktree isolation |
| `verifier` | sonnet / medium | no | Fresh-context reproduction of validation and evidence at selected acceptance boundaries |
| `reviewer` | sonnet / high | no | Routine correctness review of a task/wave diff |
| `deep-reviewer` | opus / high | no | Architecture/security review and twice-bounced fixes |
| `fixer` | sonnet / low | yes | Bounded fix rounds fed accepted findings + raw failure output |

Built-ins still apply: `Explore` (read-only search, no custom prompt discipline), `Plan` (read-only architect — **cannot write the plan to a file**), `general-purpose` (full tools, session model). When no stable agent fits, `general-purpose` + explicit `model:` is the fallback.

**Escalation rules** — pick the lane by cognitive load and risk, not importance:
- Implementation defaults to `builder`. Escalate to `hard-builder` when the task touches concurrency, data migration, authz/security, or ≥3 subsystems. When dispatching with `isolation: "worktree"`, use the matching `worktree-builder` or `worktree-hard-builder` variant; never attach worktree isolation to the MCP-based feature-tree builders.
- Fresh verification is selective, not per edit. Use `verifier` for code/shared-surface changes, evidence-heavy claims or measurements, authoritative multi-file docs, worker failure recovery, and commit/wave acceptance. Skip it for trivial typo/formatting edits, temporary notes, and low-risk single-file docs already covered by a later wave verifier.
- Verification reproduces evidence; review judges correctness. Use `reviewer` only when judgment beyond contract reproduction is needed. Escalate correctness review to `deep-reviewer` for security/architecture-sensitive diffs and twice-bounced fixes.
- Default verifier is sonnet/medium; choose opus/high for methodological, security, migration, or high-risk acceptance when model override is available.
- Fix rounds go to `fixer`, never back to a full builder dispatch, unless the fix requires redesign (then it's a new task, not a fix).
- You (Opus/Fable) do: planning, decisions, briefs, integration verification, run-state writes, commits, user communication. Nothing else.

## Dispatch mechanics

- **Sub-agents run in the background by default.** Dispatch a batch, keep doing useful parent work (state upkeep, next briefs), and react to completion notifications. Use `run_in_background: false` only when the very next decision needs the result.
- **Parallel by default**: independent dispatches go in one message with multiple Agent calls.
- **`SendMessage` continues an existing agent** with its context intact — use it for follow-ups instead of re-briefing a fresh agent. `TaskOutput` checks on a live background agent; neither is a substitute for reading its report.
- **Parallel writers need isolation.** One writer per tree: either one builder at a time in the working tree, or `isolation: "worktree"` per concurrent builder with **disjoint file ownership**, then you integrate. Never two writers in one tree.
  - **Worktree base is the dedicated feature branch's committed `HEAD`.** User settings pin Claude Code to `worktree.baseRef: "head"`; isolated subagents therefore branch from the current local `HEAD`, including unpushed feature-branch commits, rather than remote/default `main`. Before each isolated batch, require the current branch to equal `RUN.md`'s `Feature branch`, capture `B=$(git rev-parse HEAD)`, and record it as `Worktree base`. Every source/config dependency the children need must already be committed in `B`; uncommitted capsule state is allowed because briefs are self-contained, but uncommitted source/config dependencies force serial execution in the feature tree. Keep the parent on that branch and do not advance its `HEAD` while the batch runs. After each child, require its `git rev-parse HEAD`/merge-base to descend from `B`; before integration require the parent still names the recorded feature branch and the expected base lineage. A mismatch is stale-base drift: stop and reconcile, never apply blindly.
  - **Worktree lean-ctx uses a root-pinning CLI wrapper, not the shared MCP connection.** Claude 2.1.226 starts even inline subagent MCP servers and plain CLI children with the parent `CLAUDE_PROJECT_DIR`, so MCP `ctx_patch` and unpinned CLI reads can silently target the canonical checkout. Isolated writers must use `worktree-builder` / `worktree-hard-builder`. Include the canonical checkout path in the brief. The child's only unwrapped repository Bash is the initial `pwd; git rev-parse --show-toplevel; git rev-parse --git-dir; git rev-parse HEAD` preflight, which must confirm the assigned worktree, a top-level different from the canonical checkout, and the captured feature-branch base. Thereafter every repository read/search/tree/shell/test/build/Git command must invoke `$HOME/.local/bin/lean-ctx-worktree` from that cwd: `$HOME/.local/bin/lean-ctx-worktree read <file>`, `$HOME/.local/bin/lean-ctx-worktree grep <pattern>`, or `$HOME/.local/bin/lean-ctx-worktree -c '<command>'`. Native Edit/Write performs mutations under Claude's isolation. A mismatch, wrapper failure, configured lean-ctx MCP call, or unwrapped repository Bash after preflight is `blocked`: stop without further edits and never fall back or integrate that delivery.
  - **The parent owns GitNexus indexing and impact.** Temporary isolated children never run `gnembed`, reindex, or rerun impact; stale-index or out-of-contract analysis is returned to the parent. When the parent itself runs from a linked worktree, `gnembed` automatically pins the current branch index slot, and every subsequent GitNexus query/impact call must pass that same `branch`. For `detect_changes`, pass the linked worktree's absolute path when the MCP server was launched from another checkout.
- **Workflow tool for deterministic fan-out.** This skill authorizes Workflow use. Reach for it when control flow is mechanical over a known work-list: review→adversarial-verify pipelines, bulk migrations, N-perspective audits. Its `agent()` accepts per-call `model:` and `effort:` — the finest-grained dial available. Keep free-form Agent dispatch for judgment-driven one-offs.
- Fan-out stays at the parent. Don't expect sub-agents to orchestrate recursively.

## The workplan capsule

For any workplan bigger than ~3 tasks or expected to span waves, the durable state is one directory:

```text
workplans/<slug>/
├── STRATEGY.md          # optional — the chosen approach, from plan mode
├── PLAN.md              # stable waves + task contracts (authored by /workplan)
├── RUN.md               # compact authoritative execution state, target <=5 KB
├── DECISIONS.md         # append-only; created only when the first decision lands
├── agents/              # one report per child dispatch
├── validation/          # large raw outputs
└── REPORT.md            # final outcome, written at close-out
```

Don't create empty directories or optional files before they're needed.

**Division of labour:** `PLAN.md` is the contract and changes only when scope visibly changes. `RUN.md` is the state — status, current wave/task, one row per task, active ownership, blockers, next action. `agents/` holds detail so your context doesn't.

**You are the sole state writer.** Sub-agents never edit `PLAN.md`, `RUN.md`, or `DECISIONS.md` — say so in every brief. Children write their detail to `workplans/<slug>/agents/<task>-<role>.md` and return a compact summary.

**Checkpoint discipline — this is the token win, keep it sharp.** Update `RUN.md` only after a meaningful event: dispatch, child completion/failure, review verdict, user decision or blocker, wave completion, close-out. Batch adjacent state changes into one edit (a task validated done + its successor dispatched in the same breath = **one** checkpoint, not two). Never write a "ready to dispatch" checkpoint that a dispatch record overwrites seconds later. Never run a shell command solely to get a timestamp — take it from the current turn or an existing command's output; timestamps are recovery aids, never gates. Store pass/fail plus an artifact path, never raw logs. Collapse completed tasks to one row. Keep `RUN.md` under ~5 KB.

**Live progress view.** Mirror the current wave's tasks into the harness-native task list — `TaskCreate` when the wave is seeded, `TaskUpdate` at dispatch and at completion. That's the user's live view of progress, and it is **ephemeral display only**: `RUN.md` on disk is the sole durable authority, and you never reconstruct state from the native task list.

**Decisions.** Append scope/architecture decisions to `DECISIONS.md` **when they're made** — at each `AskUserQuestion` fork — never reconstructed at close-out. Enduring ones are promoted to the project's ADR/decision convention at close-out.

Full template, allowed states, checkpoint rules, decision format, and cold-recovery procedure → `references/run-state.md` (read at start, resume, pickup, and after compaction; not per loop turn).

## Feature-branch invariant

Every workplan executes on one dedicated local feature branch. This was not previously automatic; `/workplan` only authored files and `/orchestrate` only recorded `HEAD`.

- Resolve the workplan slug first. Default branch name: `workplan/<slug>` unless the approved strategy/plan names another branch. Validate it with `git check-ref-format --branch`.
- On first execution, before source edits or writer dispatch, require the working tree to contain no pre-existing changes outside this capsule. Capture the starting branch (or detached commit) and `START=$(git rev-parse HEAD)`, then create and switch with `git switch -c <feature-branch>`. Branch creation is authorized by invoking `/orchestrate`; it does not authorize commits, pushes, merges, rebases, or branch deletion.
- If the target branch already exists without a matching durable `Feature branch` binding in `RUN.md`, stop for a user decision; never reuse, reset, delete, or silently suffix it. If `RUN.md` already binds the branch, this is recovery, not a new branch creation: require or safely switch to that exact branch only when the tree is clean enough to preserve all work.
- Persist `Starting branch`, `Feature branch`, `Base ref: START`, `Worktree base: <current HEAD>`, and `Worktree base mode: head` in `RUN.md`. Update `Worktree base` whenever an authorized wave commit advances `HEAD`.
- `/orchestrate` never merges, deletes, or pushes the feature branch implicitly. Close-out reports the branch and leaves it checked out unless the user separately authorizes another action.

## The loop

Once the user approves the plan, run it to completion — task→task and wave→wave — without asking permission between steps. Progress messages are informational, not checkpoints.

0. **Bind the feature branch.** For pickup, reconcile the branch fields in existing `RUN.md`; for plan-and-run, bind immediately after choosing the slug and before writing the capsule. Apply the feature-branch invariant above exactly once per workplan.
1. **Plan** — two entry modes:
   - **Pickup** (`/orchestrate <slug>` — the capsule already exists, e.g. from `/workplan`): don't re-plan. Read `workplans/<slug>/PLAN.md` and sanity-check completeness (every task block has owned files, AC, DoD, explicit deps, a can-actually-fail validation command; disjoint file ownership per wave; in indexed repos, blast radius present per task). Then **initialize `RUN.md` if absent, or reconcile it if present — never overwrite an existing run state implicitly.** If `RUN.md` says `complete`, stop and report; only reopen on explicit user direction. Gaps in `PLAN.md` → back to the user before executing.
   - **Plan-and-run** (no capsule): plan with the user — waves, tasks, contracts, validation commands, stop rules. `AskUserQuestion` for genuine architecture/scope choices; never for "should I continue?". For multi-wave work, write `PLAN.md` + `RUN.md` yourself before dispatching anything. For substantial plan-now-run-later work, prefer the `/workplan` skill, which authors the capsule this step consumes.
2. **Seed.** Write/reconcile `RUN.md` from `PLAN.md` (`references/templates.md` → "Seed RUN.md from PLAN.md") and mirror the first wave into the native task list.
3. **Per task:** confirm deps are `done` in `RUN.md`, the recorded feature branch is checked out, and ownership doesn't overlap a live writer → for an isolated batch capture and persist its exact committed `Worktree base` → decide whether the task meets the selective fresh-verification criteria above → dispatch builder/hard-builder in the feature tree or the matching worktree-builder variant under worktree isolation with the full contract (including its blast radius, repo hot rules, feature branch, and expected base SHA). For selected tasks add the literal marker `FRESH VERIFICATION REQUIRED`; that builder edits, writes a compact receipt, and stops before validation. For unselected low-risk tasks the builder runs its normal validation → one checkpoint recording agent type, dispatch, base SHA, and receipt/report path → integrate only after confirming the parent still names the recorded feature branch and the child's worktree descends from the captured base `B`; then **diff-apply only the intended owned change** onto the feature tree, never wholesale-copy files. A branch/base mismatch is stale-base drift: stop and reconcile rather than merging or rerunning from another branch implicitly → for selected tasks dispatch a **fresh** `verifier` with only the contract, baseline/owned files, builder receipt, and exact commands — never the builder transcript → if verification fails, route concrete findings to `fixer`; use reviewer/deep-reviewer only when independent correctness judgment is also warranted; **max 3 fix rounds per task**, then `blocked` with evidence → mark `done` only after you saw the real diff and real validation output.
4. **Per wave:** all tasks `done`/`deferred` → run the wave's validation → **GitNexus scope gate (indexed repos): run `detect_changes` and diff actual changed symbols/flows against the wave's planned scope (the union of its task contracts' owned files + blast radii); unexplained symbols or flows → investigate and resolve before committing** → `AskUserQuestion` for any scope change or decision to freeze this wave, appending each to `DECISIONS.md` as it's made → **one wave commit** (only if the user authorized commits), staging wave-owned files by name → one checkpoint closing the wave and opening the next → immediately start the next wave.
5. **Close-out (workplan complete):** run the close-out sequence (`references/close-out.md`) — reconfirm validation, write `REPORT.md`, promote enduring decisions, reconcile living `docs/`, sweep `workplans/<slug>/` to its durable core, clear the native task list. Close-out is what makes the next workplan startable on a clean repo.
6. **Stop only when:** close-out is finished; a genuine product/architecture/security/destructive decision needs the user; the user redirects; or **≥2 tasks in one wave are blocked** — that's systemic (shared assumption, environment, or decomposition is wrong); escalate, don't grind.

A blocker in one lane doesn't stop independent lanes. Tasks marked `active` with no live worker at pickup are recovery work: inspect artifacts, resume or redispatch.

## Recovery and compaction

After compaction or in a fresh session, **`RUN.md` is authoritative over conversation memory** — the compacted summary is lossy and must never drive execution state. Cold pickup, in order: read `RUN.md` once (stop if `complete` unless reopening) → require the checked-out branch to match its `Feature branch` (switch only when the tree is clean enough to preserve all work; otherwise block) → read **only** the current task block of `PLAN.md` and its dependencies → **check for live background agents before dispatching any writer** (a live writer still owns its files; `TaskOutput`/`SendMessage` on a known agent, otherwise its report path under `agents/` is the evidence of how far it got) → one focused `git status`/`git diff --stat` reconciliation against claimed ownership → execute `Next action`. If that action is an immediate dispatch, dispatch first, then write one checkpoint carrying both reconciled reality and the new dispatch. Details: `references/run-state.md`.

## Briefing sub-agents

A sub-agent arrives cold. Brief it like a smart colleague: the goal and why · what you've learned/ruled out · concrete paths/symbols/line numbers · the report path under `workplans/<slug>/agents/` for detail + the fixed summary format for its reply · what it must NOT do (never edit `PLAN.md`/`RUN.md`/`DECISIONS.md`, no out-of-scope edits, no commits). A 500-word brief costs you 500 tokens and buys a focused result; terse briefs buy generic work.

- **Never delegate understanding.** Don't say "based on your findings, fix it" — read the report, decide, then issue concrete instructions.
- **When you want code written, say so**: "Write the code. Don't just plan."
- Templates: `references/templates.md`.

## Keep in the parent

Delegation has overhead; mechanical work whose output IS the answer stays with you:

- Single-file targeted edits (a 1-line fix via sub-agent is pure overhead).
- `git status` / `git diff` / short test runs where you need the actual output to decide.
- Spot-check reads after a worker reports done — `git diff --stat` first, then targeted reads of suspicious hunks. Never full-file re-reads.
- `AskUserQuestion`, plan approval, commits, every write to the capsule's state files — sub-agents can't/shouldn't.
- Long-running ops (big test suites, builds, deploys): run yourself with `run_in_background`; delegate the *analysis* of results, not the wait.

Threshold: "does this need breadth or synthesis I shouldn't burn parent context on?" — not "is this work?"

## Verify, then report

A sub-agent's summary describes intent, not necessarily fact. Before reporting done or marking a task `done`: spot-check the diff, confirm the validation command really ran (real output, not a claim), catch the classics — stopped mid-task, edited the wrong file, silently skipped a step. For selected acceptance boundaries, only the fresh verifier's reproduced evidence counts; the builder receipt is not completion evidence. Do not redo sound edits when a worker dies—reconstruct evidence from the tree. Validations must be able to fail: bare existence checks and `exit 0` probes prove nothing. **A filtered validation masks cross-module breakage** — a task's `pytest -k <topic>` (or single-module) run can pass green while the change breaks *other* modules it deselected. After integrating any change to shared or widely-imported surface, run the full-suite **collection** (`pytest --co -q`) plus the broader suite, not just the task's own filter.

## Authorization gates

Never without explicit user instruction this session: commits · pushes · destructive git (`reset --hard`, `push --force`, `clean -f`, `branch -D`) · `--no-verify`/hook-skipping · production/live-cost actions. When authorized to commit: stage files by name (never `-A`/`.`), HEREDOC messages, one reviewable idea per commit, and after a pre-commit hook failure fix + new commit, never amend.

## Context discipline

- Use the project's context tooling (lean-ctx, GitNexus) when present — project CLAUDE.md says what's available. The parent owns GitNexus indexing; temporary isolated children never reindex.
- Don't pipe large outputs into your context; save them under `workplans/<slug>/validation/` and point the next brief at the path.
- Don't re-read a file you just edited; Edit/Write error on failure.
- Do not resume a near-limit builder for validation/reporting. End the build phase and use a fresh verifier.
- Keep verifier briefs small: contract excerpt, baseline/owned files, receipt path, exact commands. Never attach the builder transcript or bulk tool output.
- Detail lives in `agents/`; state lives in `RUN.md`; your context holds decisions.

## When NOT to use this

Trivial one-shots, tasks the user already reduced to a single edit, and tight pair-programming loops where the user wants you, not a proxy. No capsule ceremony for a 2-task job — the on-disk state earns its cost at multi-wave scale.

---

Goal: a session that runs for hours without compaction — your context full of decisions and summaries, `RUN.md` holding durable state, the detail on disk.
