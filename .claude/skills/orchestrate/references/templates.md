# Orchestrate templates

Load before dispatching. Contracts live in `PLAN.md`; briefs repeat only the load-bearing ownership, validation, stop rule, and artifact paths. Resolve every report path to a **unique** path under `workplans/<slug>/agents/`.

## Compact result header

Every child report opens with this, so you can read the header and skip the body unless there are findings, failures, or an integration decision:

```yaml
---
status: pass | fail | blocked
changed: [path, ...]
validation: pass | fail | not-run
findings: 0
next: parent action or none
---
```

## Task contract block (in `PLAN.md`, one per task)

`/workplan` authors these; `/orchestrate` executes them without re-deriving anything.

```md
### T<n> — <title>
Wave: <e.g. "Wave A — correctness">
Depends on: <T1, T2 | none>
Agent: builder | hard-builder
Goal: <one sentence>
Scope: <what to build/change>
Non-goals: <explicitly out>
Owned files: <exact paths this task may touch>
Context: <paths, symbols, decisions, artifact links — self-contained>
Impact: <blast radius / affected callers, from the decomposition pass>
AC:
- <criterion>
DoD:
- <item>
Validation: `<command>` in <cwd> — proves <what>; real failure looks like <what>
Report: workplans/<slug>/agents/T<n>-builder.md
```

## Builder / hard-builder brief (Agent prompt)

```
Task T<n> of workplan <slug> — contract: workplans/<slug>/PLAN.md#T<n>.

GOAL: <goal + why it matters to the workplan>
ALREADY KNOWN: <findings, ruled-out approaches, decisions made>
OWNED FILES: <paths — touch nothing else>
CONTRACT: <acceptance criteria + DoD verbatim>
IMPACT (approved): <blast radius from the contract — do NOT re-run impact for these symbols.
  If you need an out-of-contract shared/exported symbol, STOP and report; I amend the contract.>
FEATURE BRANCH: <recorded feature branch>. EXPECTED WORKTREE BASE: <exact committed SHA>.
WORKTREE MODE: <feature-tree | isolated; canonical checkout: <absolute parent git root>>. In isolated
  mode use `worktree-builder` / `worktree-hard-builder`, never the MCP-based feature-tree variants.
  Before any repository read or edit, run `pwd; git rev-parse --show-toplevel;
  git rev-parse --git-dir; git rev-parse HEAD`; require cwd/top-level to be the assigned worktree,
  not the canonical checkout, and HEAD to equal the expected worktree base. That preflight is
  the only unwrapped repository Bash allowed. Thereafter invoke the wrapper from that cwd for
  every repository operation: `$HOME/.local/bin/lean-ctx-worktree read <file>`,
  `$HOME/.local/bin/lean-ctx-worktree grep <pattern>`, or
  `$HOME/.local/bin/lean-ctx-worktree -c '<shell/test/build/git command>'`. Use native
  Edit/Write for mutations. On mismatch, wrapper failure, configured lean-ctx MCP use, or direct
  repository Bash after preflight, stop blocked without further edits; never fall back.
VERIFICATION MODE: <normal | FRESH VERIFICATION REQUIRED>.
VALIDATION: normal mode runs `<command>` from <cwd> and includes real output. In fresh-verification
  mode, do not run it: write a compact receipt listing changed paths, AC addressed, unresolved items,
  and this exact pending command.
REPORT/RECEIPT: write to workplans/<slug>/agents/T<n>-builder.md, opening with the compact result
  header; return a ≤15-line summary.
DO NOT: edit PLAN.md / RUN.md / DECISIONS.md — I am the sole state writer. No commits.
  In isolated worktree mode, do not run `gnembed`, reindex GitNexus, or rerun impact; report stale-index
  or out-of-contract analysis needs to me. <task-specific exclusions>
```

## Fresh verifier brief

Use only at meaningful acceptance boundaries: code/shared surfaces, evidence-heavy claims,
authoritative multi-file docs, worker-failure recovery, or commit/wave acceptance. Do not dispatch
one for every file edit.

```
Freshly verify task T<n> of workplan <slug>. Do not edit anything.
CONTRACT: <acceptance criteria + DoD verbatim>
BASELINE / EXPECTED SCOPE: <ref and owned files>
BUILDER RECEIPT: <path — evidence to check, not truth to trust>
VALIDATION: run exactly `<command>` from <cwd>; record exit status and key output.
REPRODUCE: <material counts, measurements, provenance, or "none">
GITNEXUS: detect_changes at integration/commit boundaries; targeted impact only for changed
  shared/exported symbols or routes; otherwise state not-needed.
RETURN: the verifier's exact structured final block. The orchestrator persists it to
  workplans/<slug>/agents/T<n>-verify.md.
DO NOT: receive/read the builder transcript, edit/fix files, load skills, spawn agents, or browse.
```

## Reviewer / deep-reviewer brief

```
Review <task T<n> delivery | integrated wave <Wn> diff> for workplan <slug>.
DIFF: <git ref range or files changed>
CONTRACT: <acceptance criteria + DoD verbatim, from PLAN.md#T<n>>
VALIDATION: <command that was supposed to pass> — evidence at <validation path>
CHECK: correctness, regressions, scope creep beyond owned files, validation quality, project standards.
REPORT: findings with file:line evidence to workplans/<slug>/agents/<T<n>|Wn>-review.md,
  compact result header first. State "no findings" with evidence when clean.
DO NOT: edit source, or the workplan state files. Read-only.
```

## Fixer brief

```
Fix round <n>/3 for task T<n> of workplan <slug>.
ACCEPTED FINDINGS: <numbered, file:line, from the review — only these>
RAW FAILURE OUTPUT: <path under workplans/<slug>/validation/, or verbatim if short>
OWNED FILES: <same as the task contract>
VALIDATION: re-run `<command>`; include real output.
REPORT: workplans/<slug>/agents/T<n>-fix<n>.md
DO NOT: redesign. If the fix needs redesign, stop and say so — that's a new task, not a fix round.
```

## Scout brief

```
Recon for workplan <slug>: <the exact question>.
LOOK IN: <paths / symbols / commands to run>
RETURN: <the fact, the path, or the short list> — no analysis, no recommendations.
REPORT: workplans/<slug>/agents/<topic>-scout.md if the answer is longer than ~20 lines;
  otherwise just return it inline.
DO NOT: edit anything. Read-only.
```

## Seed RUN.md from PLAN.md

At pickup, after the completeness check: write `workplans/<slug>/RUN.md` with one row per task from `PLAN.md`, in wave/dependency order, with **Wave as the first column**. Never overwrite an existing `RUN.md` — reconcile it instead.

```md
# Run State — <workplan title>

Status: active
Current wave: <W1 name>
Current task: none
Starting branch: <branch name | detached@SHA>
Feature branch: <workplan/slug>
Base ref: <branch-point SHA>
Worktree base: <current committed HEAD>
Worktree base mode: head
Updated: <turn timestamp>
Next action: dispatch T1 (builder)

## Tasks

| Wave | Task | State | Dependencies | Agent | Report | Validation | Review |
|---|---|---|---|---|---|---|---|
| W1 | T1 | pending | — | — | — | pending | pending |
| W1 | T2 | pending | T1 | — | — | pending | pending |

## Active ownership

None.

## Blockers / decisions needed

None.

## Recovery

1. Read the current task block in `PLAN.md`.
2. Check for a live background agent for any `active` task.
3. Compare the actual diff with active ownership.
4. Execute `Next action` only after reconciliation.
```

Then mirror the first wave's tasks into the native task list (`TaskCreate`) — live view only; `RUN.md` stays the authority.

## PLAN.md skeleton (when you're authoring it yourself)

```md
# <workplan title>
## Objective
## Waves
- Wave 1: <tasks, dependencies>
- Wave 2: ...
## Validation contracts (per wave)
## Risk register
## Open questions
## Task contracts
### T1 — ...
```

Decisions are **not** kept here — append them to `DECISIONS.md` as they're made.

## Wave commit

```bash
git add <wave-owned source files by name> <intentional capsule artifacts>
git commit -m "$(cat <<'EOF'
feat(<slug>): wave N — <what the wave delivered>

<task ids and one-line outcomes>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```
