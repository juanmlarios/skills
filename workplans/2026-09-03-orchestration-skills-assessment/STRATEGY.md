# Orchestration skills assessment — `workplan` + `orchestrate` vs the native Workflow tool

Date: 2026-09-03. Evidence base: `~/GitHub/AtlasX/Pipeline/workplans/` (109 capsules, 82 RUN.md, 62 PLAN.md, 974 agent reports) and `~/.claude/projects/-Users-juan-GitHub-AtlasX-Pipeline/` (152 session logs, 796 MB). Skills under review: the *installed* `.claude/skills/orchestrate` (154 lines + 3 references; its agent stable, `FRESH VERIFICATION REQUIRED` marker, and `references/run-state.md` path are what the August capsules cite, but the file's mtime is today's repo re-org, so textual stability across August is inferred, not proven) and `skills/engineering/workplan`. "Skill-driven sessions" below means the 20 sessions with an *explicit* `/orchestrate` or `/workplan` invocation; 34 sessions had ≥5 dispatches, so description-triggered loads may be undercounted.

## Verdict

**Hybrid. Keep the skills as the spine; use Workflow for read-only repeated-N fan-out inside a task. Do not replace the capsule with Workflow.**

- Workflow cannot be the durable state: resume is same-session only, one nesting level, no integration step (no base SHA, no diff-apply). The capsule (`PLAN.md` + `RUN.md`) is the only thing that survives compaction, session death, and the Prime/Worker mesh's session bounds ("end a wave after 3–5 PRs or 4–6 h").
- Workflow is the right tool for the work the logs show being done as narrative one-offs: the 28-partition gate sweep (121 log files + a hand-written 34 KB report, `2026-08-20-sharadar-enrichment-wave/agents/T7B/`), 8× identical clean-clone triples (`2026-08-24-p4-forecaster-v2/RUN.md:64-97`), 39 citation repoints across 46 sites done inline by the parent (`2026-08-08-w3-closure`), review→adversarial-verify. The one Workflow run in the corpus (2026-08-25 standards audit, 10 scopes + refutation pass) completed cleanly.
- Workflow for **writes** hits the same broken path already documented for worktree builders: lean-ctx rooted at the canonical checkout, `artifacts/`/`.venv` gitignored so a child validates the parent's source, PYTHONPATH/pyright breakage, absolute worktree paths leaking into committed JSON. Until that tooling is fixed, anything that mutates stays on Agent + capsule.

**The defects in the logs are gate-shaped and parent-mediation-shaped, not model-shaped.** Rewriting skill prose for Opus/Fable 5 helps at the margin; the two changes that matter are (1) a machine gate on `RUN.md` shape and (2) briefs that stop relaying line anchors and pre-resolved facts.

## What the evidence shows

### 1. The orchestrator is the main worker, not the coordinator

Inside the 20 sessions that invoked `/orchestrate` or `/workplan` (parent turns only, sidechains excluded):

| Parent tool | Calls |
|---|---|
| `ctx_shell` + `Bash` | 3,124 |
| `ctx_patch` + `Edit` + `Write` | 1,299 |
| `ctx_read` + `Read` | 724 |
| `SendMessage` (mesh + agent follow-ups) | 535 |
| **`Agent` (dispatch)** | **244** |

Of the 1,299 parent edits, **903 (71%) target `workplans/`** — capsule state — vs 46 `src/`, 42 `tests/`, 71 `docs/`, 25 `backlog/`. So the parent is not mainly doing product edits; it is doing **checkpoint churn** (≈3.7 capsule edits per dispatch) plus its own shell/read work. 12,598 parent turns ÷ 244 dispatches ≈ **52 parent turns per dispatch**. The biggest sessions (turns 772–1,961) all compacted; 10 of 20 skill-driven sessions compacted at least once (68 compactions across the corpus). The skill's first rule — "your context window is the scarce resource; push bulk work outward" — is not what happens.

### 2. `RUN.md` is a narrative archive, not a state file

- **39 of the 61 PLAN-bearing capsules have a RUN.md over the 5 KB target** (47 of 82 across all RUN.md, including mesh/one-shot ones the rule never governed); median 84 lines, p90 334, max 1,046 lines / 102 KB.
- **8 of 82 `Status:` lines match the enum** (`planned|active|blocked|complete|abandoned`); the rest are prose ("CLOSED — MIXED (2026-08-11, `decision-181`, PR #45). See 'Status correction — the header outlived the close'…").
- Growth is log-cell prose duplicating `agents/*.md` (sharadar: 95 KB in 120 table rows, max row 1,723 chars), inserted evidence sections (p4-forecaster-v2: 44 KB above the log), and retrospective tables (w3-closure: 23 KB in 11 rows).
- Header staleness is systemic: p4-forecaster-v2's header was two decisions behind its own tables ("the header block was never on anyone's path", `RUN.md:1019-1035`); p5-motifs says `executing` / `Next action: T7` while the body records T7 fixed-verified and the run complete; program-completion carried a blocker text that had been resolved five weeks earlier.
- The repo already enforces `test_non_run_files_do_not_assert_live_status`, `test_capsule_paths_exist`, `test_workplan_index_covers_every_capsule`, and guardrails §8 restricts RUN.md content. **The rule text exists; the gate on RUN.md itself does not.** More skill prose will not fix this.

### 3. The parent's own artifacts are a top defect source

Recurs in all three deep-read capsules:
- Mis-relayed line anchor in a brief (`_drift_provenance` at `assets/drift.py:127`, not `487-511`) — the child caught it (sharadar `RUN.md:120`).
- Four broken capsule paths committed with the gate red (sharadar `:120`, `:174`).
- `PLAN.md` naming a join input that does not exist → T3 blocked → escalate → D1 → re-dispatch (p4 `:617-653`).
- A verifier brief that was impossible to execute — the `verifier` agent has no `Bash` (p4 `:934-944`; also `console-serving-asks/REPORT.md:111-113`, `perf-remediation/REPORT.md:120-122`, "harness gap worth fixing before the next capsule").
- A false finding three independent passes agreed on because nobody searched by filename (w3 `:587-598`).
- A fixer sent to remove a correct guard on the strength of a *truncated diff* the parent read (perf-remediation `REPORT.md:104-109`).

These are the parent doing step-mediation — pre-resolving facts and passing them down — which is exactly what Anthropic's Opus 5/Fable 5 guidance says to stop. The skill's rule "concrete file paths, symbol names, line numbers — never make it search for what you already know" is where the anchors entered. `OPENING.md` item 4 reached the same conclusion independently: cite the symbol, not the line; perfect line discipline "does not converge, because the act of documenting the code is what moves it."

### 4. Worktree isolation is nominal and the feature-branch invariant is inconsistently followed

- `isolation: "worktree"` set cwd but `ctx_patch` wrote the main tree (console-serving-asks `REPORT.md:102-105`); agent types had to be remapped mid-run (`p4 RUN.md:586-591`); stale base `f754c57` (sharadar `:186`); branch outliving its squash-merge → false conflict (w3 `:634-646`).
- Of the 21 capsules that record a `Feature branch:`, **8 bound the skill's `workplan/<slug>` default and 9 bound Prime-assigned `work/…` names** (plus one-offs); 61 PLAN-bearing capsules never recorded one at all. No `workplan/` ref exists today (merged and deleted). The skill's ~20-line feature-branch section is followed in a minority of capsules and conflicts with the mesh's Prime-assigns-branch model in the rest.

### 5. Two RUN.md contracts coexist

The skill's RUN.md (task table + checkpoints) and the mesh guardrails §8 RUN.md ("only assignments, worker/worktree ownership, base commits, merge and CI-token queues, blockers, recovery") are different documents with the same name. Worker sessions invoke `/orchestrate` *inside* the mesh (one Worker2 session: 48 dispatches, 1,500 turns, 3 compactions), so the skill runs under a protocol it does not know about. Out of scope to redesign the mesh; in scope to make the skill read branch, RUN.md fields, and opening checklist from project config instead of legislating them.

### 6. Lessons stored at close-out are not read at opening

`OPENING.md`'s own thesis: "Nobody reads a closed capsule's REPORT while opening a new one." The same two defects fired in consecutive capsules (`closeadj-remedy` → `q-sensitivity-volatility`); `git add -A` swept 1,179 lines of another lane's work. The skill's close-out promotes decisions; nothing in `/workplan` reads the project's opening checklist.

### 7. Capsule hygiene is fine

The 47 PLAN-less directories are one-shot investigations that state their own stop condition (`FINDINGS.md`-only halts, `CHARTER.md` stubs, artifact dumps) — not skipped `/workplan` runs. No action.

## Proposed changes

### A. Process / gates (highest leverage, no skill prose needed)

1. **`test_run_md_shape`** in the project's doc-currency suite: size ≤ 5 KB (the skill's own target; if 5 KB proves too tight for 15-task capsules, raise the cap in the test, not by prose), `Status:` ∈ enum, every log row ≤ 200 chars and carries a path (evidence lives in `agents/` or `validation/`), no `##` sections other than Tasks / Active ownership / Blockers / Recovery / Log. `/orchestrate` runs it at every checkpoint; `/workplan` runs it in Done-means.
2. **Contract preflight before dispatch**: run the existing `test_capsule_paths_exist` (and a symbol-exists check for `Context:` symbols) on the task block. Fixes the "PLAN.md names a nonexistent input" class at the source.
3. **`verifier` agent gets `Bash`** (`~/.claude/agents/verifier.md`, one line). Reported three times as a harness gap. Keep `ctx_patch` — it is how the verifier writes its own report, which was the other half of the same complaint; a verifier with no write path forces heredocs or orchestrator transcription.
4. **Worktree tooling is a prerequisite, not a skill rule.** Until `lean-ctx-worktree` + venv/PYTHONPATH + gitignored `artifacts/` are solved in the project, `/workplan` marks every writing task `Isolation: feature-tree` and `/orchestrate` serializes writers. The 40 lines of worktree caveats move out of SKILL.md into `references/worktree.md` (or the project's `docs/standards-review.config.md`) and are loaded only when a task says `Isolation: worktree`.

### B. `workplan` skill

5. Task contract gains three fields:
   - `Why:` — who it's for / what it enables (Anthropic rule 3).
   - `Shape: judgment | fan-out` — with `fan-out` naming the list (partitions, heads, files, scopes) and per-item check. `/orchestrate` runs `fan-out` tasks via Workflow when read-only, via serialized builder when they write.
   - `Report-back:` — cap (default: compact result header + ≤3 bullets + report path). Rule 8.
6. `Context:` cites **symbols and owned scope, never line numbers**; children resolve anchors themselves. Delete "line numbers" from the brief guidance in both skills.
7. Read the project's opening checklist (`workplans/OPENING.md` or configured path) when present and carry applicable items into task contracts as guardrails.
8. Restore the pointer to `orchestrate/references/run-state.md` (the uncommitted diff removed it and claims a "local contract" that does not exist); restore the "`/orchestrate` binds the branch once" coupling — but as *reads branch from RUN.md/project config*, not as `workplan/<slug>` default.
9. Keep the uncommitted tightening that is correct: impact only when warranted; hot rules only when applicable; "Done means" replacing "Quality bar".

### C. `orchestrate` skill (installed `.claude/skills/orchestrate`, not the 26-line library fork)

10. Rewrite the top as a Full Job Brief (job / why / guardrails / done-means, ~40 lines). Keep the loop as an **ordered checklist in `references/loop.md`** — order is a real constraint (deps done → dispatch → integrate → verify → checkpoint; `detect_changes` before commit) and the retired-instructions list explicitly keeps checklists where order matters. Do not delete it as the library fork did.
11. Add Anthropic's audit line **verbatim** to the builder/verifier brief templates and to the final-report rule ("Before reporting progress, audit each claim against a tool result from this session…"). The skill currently paraphrases it in three places; the published result is for the exact text.
12. Say "mark done only after real diff + real validation output" **once** (currently three places: loop step 3, Verify-then-report, Keep in the parent). Keep the verifier/fixer lanes — those are concrete artifact checks, not generic rechecking.
13. Replace "concrete paths, symbol names, line numbers" in *Briefing sub-agents* with: goal + why, owned scope, symbols, decisions already made, report-back cap. Children look up their own anchors.
14. Replace the feature-branch invariant with: "Branch is a capsule field. Read `Feature branch` from `RUN.md`; if absent, ask once and record it. Never create, switch, merge, or delete branches beyond that." Delete default naming.
15. Add a **fan-out section** (`references/fanout.md`): when a task is `Shape: fan-out` and read-only, author a Workflow script (pipeline over the list, schema-typed returns, adversarial verify for findings); persist the returned JSON under `validation/`, one RUN.md row, no per-item log rows. Templates for: N-partition gate sweep, N-scope review + refutation, N-file census. Ready-made scripts save to `.claude/workflows/` and are invoked by name from later capsules.
16. RUN.md rules move from prose to the gate in A1; the skill keeps three lines: "checkpoint after events, one edit per event, evidence by path — `test_run_md_shape` enforces the rest."
17. Bare `Never…` lines get their reason in the same sentence (rules→reasons); no CRITICAL/MUST exists today — `FRESH VERIFICATION REQUIRED` is a protocol token, not emphasis, and stays.
18. Bound the "Keep in the parent" bullet "Single-file targeted edits" ("≤ 5 lines, ≤ 1 file, no validation needed"). The larger lever is checkpoint churn: 903 capsule-state edits in 20 sessions means "one edit per event, batch adjacent events" is not happening — A1's gate plus a single `checkpoint` helper (one call writes header + row + log line) removes most of those turns.

### D. Library hygiene (from the earlier review)

19. Make `.claude/skills/orchestrate` + `handoff` canonical; delete or regenerate the `skills/engineering/orchestrate` (26-line) and `skills/engineering/handoff` forks. Re-install `pickup` and `workplan` alongside them; the handoff→pickup `Orchestration continuation` contract only exists in the installed handoff.

## Boundaries

- No edits to the AtlasX mesh protocol, guardrails, or Prime/Worker roles. Where the skill and the mesh disagree, the skill defers to project config.
- No change to the capsule layout (`PLAN.md` / `RUN.md` / `DECISIONS.md` / `agents/` / `validation/` / `REPORT.md`).
- Workflow is not adopted for writes until the worktree tooling prerequisites in A4 are met in the target repo.

## Rulings (owner, 2026-09-03)

1. `test_run_md_shape` is project-specific; the skills run it when the project defines it.
2. Branch: read from `RUN.md`; if the coordinator did not supply one, `/orchestrate` asks the user once.
3. Fan-out verification: the in-workflow refutation stage is the verification for read-only fan-outs; one fresh verifier over the aggregate only when the result feeds a wave commit or a user decision.

## Status

Implemented directly on 2026-09-03 (not via `/workplan`): B5–B9, C10–C18, D19. Canonical content now lives in `skills/engineering/{orchestrate,workplan,pickup,handoff}`; the repo no longer carries `.claude/skills` or `.pi/skills`, and installs are copies made by `npx skills add … --copy` (re-run after edits). Red-team findings: `REDTEAM.md`. **Not done, handed off:** A1/A2 are project gates (AtlasX owns them); A3 (`verifier` gets `Bash`) belongs to the live `agent-config` lane — the managed source is `skills/engineering/agent-config/assets/agents/claude/verifier.md`, one `tools:` line; A4 worktree prerequisites are documented in `orchestrate/references/worktree.md` but must be met per project.
