---
name: standards-review
description: >-
  The single code-review skill. Two modes: AUDIT — multi-agent review of a repo against its engineering standards (structure, dead code, redundancy, readability, testability, language best practices) with adversarial verification and a dated report; DIFF — compact findings-first review of uncommitted changes before commit/merge. Stack packs (python, react, csharp; architecture via --deep) are auto-selected from the repo's stack, so one skill serves Python, React/frontend, and C#/.NET repos. Reads per-repo facts from docs/standards-review.config.md; bootstraps it on first run. Use for any code review, standards audit, quality sweep, python/frontend/backend review, or review of local/uncommitted changes. Report-only: never applies fixes.
---

# Standards Review (single review engine)

Audit a repo — or review a diff — against its own engineering standards. All repo-specific facts live in the repo (`docs/standards-review.config.md` + `docs/ENGINEERING-STANDARDS.md`); all stack-specific review rules live in this skill's `packs/`. The engine below is stack-agnostic.

## Ground rules

- **READ-ONLY review.** Reviewers never modify files. The main loop writes only reports (and, in bootstrap mode, the standards/config docs).
- **ADRs override standards.** Read the repo's ADR titles first; never report ADR-sanctioned patterns as findings.
- Use the repo's domain vocabulary (CONTEXT.md if present).
- Findings are reported, never auto-fixed.
- **The code graph is a map, not an authority.** Use GitNexus wherever it's cheaper or more complete than grep (below), but no finding or verdict rests on graph output alone: every finding cites read source, and every "dead/unused" verdict also checks dynamic wiring the graph can't see.

## Stack packs

Select packs before any review work:

1. If `docs/standards-review.config.md` names packs, use those.
2. Otherwise detect: `pyproject.toml`/`setup.py` → `packs/python.md` · `package.json` with a react dependency → `packs/react.md` · `*.csproj`/`*.sln` → `packs/csharp.md`. Multi-stack repos load multiple packs.
3. `--deep` (or an explicit architecture-review request) additionally loads `packs/architecture.md`.

Packs are loaded by the **sub-agent reviewers** (each reviewer prompt names the pack file(s) to read), not held in the parent context. Each pack opens with a `## Hot rules` section — the distilled, empirically-violated rules that also feed task contracts at workplan time (see Feedback loop).

## Code intelligence (GitNexus)

If the repo is indexed (config lists it, or `.gitnexus/` exists):

- **Freshness gate (step 0).** A stale index *manufactures* false positives. Check `gitnexus://repo/<name>/context` freshness; if stale, run `gnembed` before the fan-out. If the index can't be refreshed or the server is down, proceed grep-only and record that in the report — never mix conclusions from a stale graph into findings.
- **Reviewer orientation.** Reviewers start with `query({query: <concept>})` / clusters / processes to map their scope's execution flows before reading — replaces broad exploratory grep, not source reading. Every finding still quotes the actual file:line.
- **Dead-code/orphan verdicts (mandatory two-source rule).** Any "no callers / production-dead / unwired" claim needs BOTH: (1) call-graph evidence — `context`/`impact` upstream — and (2) a dynamic-wiring check the graph cannot see: decorator registration, entry points, string-based dispatch, config/yaml references, re-exports. One source alone is insufficient in either direction.
- **Blast radius on confirmed highs.** Before the report, run `impact({target, direction: "upstream"})` on each confirmed high's symbol and attach direct-caller count + risk level to its remediation recommendation.
- **Verifiers** get the same tools and the same two-source rule; a refutation ("actually has a caller") names the caller.

## Mode selection

- User asks to review uncommitted/local/staged changes, or a diff before commit/merge → **Diff mode**.
- Otherwise: `docs/standards-review.config.md` exists → **Audit mode**; missing → **Bootstrap mode** (which ends by creating it).

## Diff mode (compact, findings-first)

Scope: `git diff --cached` + `git diff` + untracked files intended for commit. Exclude generated artifacts, lockfiles, caches, vendored code, snapshots.

1. Load the matching pack(s); read the repo's standards doc and config if present.
2. Context before judgment: in indexed repos use `detect_changes({scope: "all"})` (or `"staged"`), then `context`/`impact` on non-trivial changed symbols before making blast-radius, caller-compatibility, or coverage claims.
3. Apply the pack's review rules + the repo's standards. Project-local conventions override pack style guidance when deliberate and consistent.
4. Validation: run the pack's validation gates on the changed scope (smallest command that can prove or falsify a concern; the repo's own entrypoints — make/tox/npm scripts — win over fallbacks). Treat tool output as supporting evidence, not automatic findings — confirm each issue in code.
5. Every finding: severity (`high|medium|low`), confidence, file:line or symbol, why it matters (concrete risk), concrete fix.
6. Output (compact): `Findings` (severity-ordered, max 10) · `Validation notes` · `Architectural concerns` (max 3) · `Test gaps` (max 5) · `Cleanup items` (max 5) · `Risk verdict: High|Medium|Low Risk` · `Merge gate` (exact blockers). If evidence is weak, no finding. State `No findings` explicitly. No changes in scope → say so and stop.

## Audit mode

### 1. Mechanical gates
First the freshness gate, then the gate commands from the config plus the loaded packs' mechanical gates (lint, type-check, dead-code scan, test census). Record counts for the trend table vs. the previous report.

### 2. Fan out via Workflow
The user invoking this skill is the multi-agent opt-in. Pattern — pipeline, no barrier between review and verify:

- One `agent()` per scope from the config, with structured output: `{scope_summary, findings[{file, line, title, severity, dimension, detail, recommendation, standard: "<rule # violated, or 'new-class'>"}], standards_suggestions[]}`.
- Every reviewer prompt includes: repo path, its file scope, the pack file(s) to read, "read <standards doc> and cite the rule number each finding violates", the repo's existing enforcement (don't re-report what a linter/contract already gates unless violated), READ-ONLY, "cite file:line evidence; fewer well-evidenced findings over volume", and any extra dimensions from the config.
- Pipe each scope's high findings (cap ~6/scope) into adversarial verifiers: "Try to REFUTE this by reading the code — cited lines, callers, tests, framework wiring." Include the config's false-positive traps verbatim. Schema: `{real, adjusted_severity, note}`.

Universal verifier traps (add the config's on top): decorator/entry-point registration means zero static callers ≠ dead; staged work may be registered in workplans; "eager connection" claims usually ignore lazy clients.

### 3. Report
Write `workplans/<today>-standards-review/REVIEW-REPORT.md` + `findings-full.json`:
1. Trend table (gate counts vs. previous report).
2. Verdict — 3–5 sentences; is debt shrinking?
3. Confirmed highs with verification verdicts (note refuted claims — they calibrate trust).
4. New debt vs. known backlog, keyed by standards rule number; repeatedly-violated rules mean the standard needs better enforcement — say so.
5. One-line index of medium/low.
6. Remediation phases ordered by risk-reduction per effort: correctness/safety → deletions → consolidations → decompositions → coverage.

### 4. Hot-rules reconciliation (feedback loop)
Reconcile the repo config's `hot-rules` section against this run's findings: a violation class seen in ≥2 consecutive reports gets promoted into hot-rules; a rule with no findings for 3 consecutive reports rotates out. Hot-rules stays ≤15 lines — it is the only standards content injected into writing agents' task contracts (`/workplan`), so it must stay small and current. Propose the update in the report; apply it to the config with user approval.

If reviewers surface a defect class no rule covers, propose new rule text in the report; amend the standards doc only with user approval. Deliver verdict + highs + remediation summary in chat; link the report for the rest.

## Bootstrap mode (first run in a repo)

Goal: derive the repo's standards from its own observed conventions — never import another repo's rules.

1. **Scout inline:** tree + per-package line counts; largest files; language/framework stack (this also selects the packs); existing governance (pyproject/lint configs, import contracts, CI, AGENTS.md/CLAUDE.md rules, ADR titles, test markers). Existing governance is consolidated, not replaced.
2. **Partition scopes:** ~3–15k source lines per reviewer, split by subsystem; plus one testability reviewer for the test tree, one whole-repo dead-code+redundancy sweep, one whole-repo standards-consistency sweep (its `standards_suggestions` — dominant convention per area + the rule to lock in, quantified with grep counts — drive the standards doc). Add repo-specific dimensions the repo's own docs declare non-negotiable (e.g. domain-agnosticism).
3. **Run the same fan-out + adversarial verification as audit mode** (reviewers get the governance summary + pack(s) instead of a standards doc, and are told to flag which conventions to lock in).
4. **Author, from evidence:**
   - `docs/ENGINEERING-STANDARDS.md` — numbered, enforceable rules; each traces to observed convention or found defect. Sections: layering, single-source-of-truth (named canonical owner modules), no-orphan wiring rule, language standards, scripts/packaging, testing, tooling gate (definition of done).
   - `docs/standards-review.config.md` — standards path, packs, scope partition, gate commands, verifier traps (seed with the false positives your verification pass just refuted), baseline report path, extra dimensions, initial hot-rules (seed from the pack's hot rules + this run's confirmed findings).
   - Baseline `workplans/<today>-code-review/REVIEW-REPORT.md` + `findings-full.json`.
   - Wire-in: standards pointer + ~10 non-negotiables at the top of AGENTS.md (outside any tool-managed marker blocks).
   - Lint pins: if the repo has no lint config, pin one matching observed conventions. If it already pins one, propose extensions in the report instead of editing it.
5. Report as in audit mode, plus "what was created and where".

## Config file format (`docs/standards-review.config.md`)

```markdown
# standards-review config
standards_doc: docs/ENGINEERING-STANDARDS.md
baseline_report: workplans/<date>-.../REVIEW-REPORT.md
source_root: <path reviewers treat as repo root>
packs: <python | react | csharp | architecture, comma-separated>

## Hot rules
<!-- ≤15 lines; maintained by the reconciliation step; injected into /workplan task contracts -->
- <rule agents actually violate here>

## Gate commands
- <shell command per gate>

## Scope partition
1. <name> — <paths> (<extra attention notes>)
...

## Extra dimensions
- <dimension>: <definition + default severity>

## Verifier false-positive traps
- <trap, phrased as an instruction to the verifier>

## Code intelligence
- gitnexus_repo: <indexed repo name, or 'none'>
- freshness: <how to check/refresh, e.g. `gnembed` from source_root>
- dynamic_wiring: <the registration mechanisms invisible to the call graph in THIS repo — what the two-source dead-code rule must grep for>
```
