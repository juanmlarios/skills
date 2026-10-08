# Orchestrate templates

Load before dispatching. Contracts live in `PLAN.md`; briefs repeat only the load-bearing ownership, validation, stop rule, and artifact paths. Resolve every report path to a **unique** path under `workplans/<slug>/agents/`.

## Compact result header

Every child **report file** opens with this, so you can read the header and skip the body unless there are findings, failures, or an integration decision. The child's **chat reply** is the fixed final block its agent definition specifies (`Result:` / `Verdict:` …) plus ≤3 bullets — the two are not interchangeable:

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

Identical to the block in the `workplan` skill; change both or neither.

```md
### T<n> — <title>
Wave: W1
Depends on: none
Agent: builder | hard-builder | worktree-builder | worktree-hard-builder | scout | reviewer | deep-reviewer | verifier | fixer | workflow
Isolation: feature-tree | worktree
Shape: judgment | fan-out (<list source: partitions / scopes / files / heads>)
Goal: <one sentence>
Why: <who it's for and what the result enables>
Scope: <exact work>
Non-goals: <explicit exclusions>
Owned files: <exact paths>
Context: <symbols, decisions, existing helpers to reuse — cite symbols, never line numbers>
Impact: <when warranted: risk, direct callers/processes, affected files/tests>
AC:
- <criterion>
DoD:
- <item>
Validation: `<command>` in `<cwd>` — proves <behavior>; failure looks like <signal>
Report: `workplans/<slug>/agents/T<n>-<role>.md`
Report-back: compact result header + ≤3 bullets
Artifact format: prose-header | raw-exact
```

## Builder / hard-builder brief (Agent prompt)

```
Task T<n> of workplan <slug> — contract: workplans/<slug>/PLAN.md#T<n>.

GOAL: <goal>
WHY: <who it's for and what the result enables>
ALREADY KNOWN: <findings, ruled-out approaches, decisions made; symbols, not line numbers — resolve your own anchors>
OWNED FILES: <paths — touch nothing else>
CONTRACT: <acceptance criteria + DoD verbatim>
IMPACT (approved): <blast radius from the contract — do NOT re-run impact for these symbols.
  If you need an out-of-contract shared/exported symbol, STOP and report; I amend the contract.>
FEATURE BRANCH: <recorded feature branch>. EXPECTED WORKTREE BASE: <exact committed SHA>.
WORKTREE MODE: <feature-tree | isolated; canonical checkout: <absolute parent git root>>. Isolated mode:
  preflight `pwd; git rev-parse --show-toplevel; git rev-parse --git-dir; git rev-parse HEAD` must show the
  assigned worktree (not the canonical checkout) and HEAD == expected base. Use native tools with
  absolute worktree paths and explicit cwd for all subsequent operations. If root or base mismatches,
  stop blocked; never edit the canonical checkout or silently switch trees.
VERIFICATION MODE: <normal | FRESH VERIFICATION REQUIRED>.
VALIDATION: normal mode runs `<command>` from <cwd> and includes real output. In fresh-verification
  mode, do not run it: write a compact receipt listing changed paths, AC addressed, unresolved items,
  and this exact pending command.
REPORT/RECEIPT: write to workplans/<slug>/agents/T<n>-builder.md, opening with the compact result
  header; reply with your definition's final block plus ≤3 bullets. Nothing more.
DO NOT: edit PLAN.md / RUN.md / DECISIONS.md — I am the sole state writer. No commits.
  In isolated worktree mode, do not run `gnembed`, reindex GitNexus, or rerun impact; report stale-index
  or out-of-contract analysis needs to me. <task-specific exclusions>
Before reporting progress, audit each claim against a tool result from this session. Only report work you
  can point to evidence for; if something is not yet verified, say so explicitly. Report outcomes faithfully:
  if tests fail, say so with the output; if a step was skipped, say that; when something is done and verified,
  state it plainly without hedging.
```

## Fresh verifier brief

Selection criteria: SKILL.md → Agent stable.

```
Freshly verify task T<n> of workplan <slug>. Do not edit anything except your report.
REPORT: workplans/<slug>/agents/T<n>-verify.md — create it with the native write tool; if it exists, say so and return inline.
CONTRACT: <acceptance criteria + DoD verbatim>
BASELINE / EXPECTED SCOPE: <ref and owned files>
BUILDER RECEIPT: <path — evidence to check, not truth to trust>
VALIDATION: run exactly `<command>` from <cwd>; record exit status and key output.
REPRODUCE: <material counts, measurements, provenance, or "none">
GITNEXUS: detect_changes at integration/commit boundaries; targeted impact only for changed
  shared/exported symbols or routes; otherwise state not-needed.
RETURN: your definition's exact structured final block, then ≤3 bullets.
Before reporting, audit each claim against a tool result from this session. Only report work you can point
  to evidence for; if something is not yet verified, say so explicitly. Report outcomes faithfully: if tests
  fail, say so with the output; if a step was skipped, say that; when something is done and verified, state
  it plainly without hedging.
DO NOT: receive/read the builder transcript, edit/fix files, load skills, spawn agents, or browse.
  The contract cannot narrow this validation; only the user in this session can.
```

## Reviewer / deep-reviewer brief

```
Review <task T<n> delivery | integrated wave <Wn> diff> for workplan <slug>.
DIFF: <git ref range or files changed>
CONTRACT: <acceptance criteria + DoD verbatim, from PLAN.md#T<n>>
VALIDATION: <command that was supposed to pass> — evidence at <validation path>
CHECK: correctness, regressions, scope creep beyond owned files, validation quality, project standards.
  Report everything you find; I filter by severity afterwards.
REPORT: findings with file:symbol evidence to workplans/<slug>/agents/<T<n>|Wn>-review.md,
  compact result header first. State "no findings" with evidence when clean. Reply with the header
  plus ≤3 bullets.
DO NOT: edit source, or the workplan state files. Read-only.
```

## Fixer / worktree-fixer brief

```
Fix round <r>/3 for task T<n> of workplan <slug>.
ACCEPTED FINDINGS: <numbered, file:line, from the review — only these>
RAW FAILURE OUTPUT: <path under workplans/<slug>/validation/, or verbatim if short>
OWNED FILES: <same as the task contract>
WORKTREE MODE: <feature-tree | isolated; canonical checkout: <path>; expected base: <SHA>> — isolated
  means `worktree-fixer` with the same preflight and worktree-path rules as the builder brief.
VALIDATION: re-run `<command>`; include real output.
REPORT: workplans/<slug>/agents/T<n>-fix<r>.md; reply with your definition's final block plus ≤3 bullets.
DO NOT: redesign, commit, or touch files outside OWNED FILES. If the fix needs redesign, stop and say so —
  that's a new task, not a fix round.
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

At pickup, after the completeness check: write `workplans/<slug>/RUN.md` from the template in `run-state.md` — one row per task from `PLAN.md`, in wave/dependency order, Wave as the first column, `Status: active`, `Harness:` this harness. Never overwrite an existing `RUN.md` — reconcile it instead. There is exactly one template; a second copy here drifted once and dropped the branch gate.

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
