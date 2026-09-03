# Python pack — review rules & gates

Loaded by standards-review reviewers for repos with `pyproject.toml`/`setup.py`. Merged from the retired dignified-python, python-code-quality, and python-review skills (2026-07-16). Deep references live in `python/` (see bottom) — load them on the triggers listed there, not by default.

## Hot rules (inject-me)

The distilled, empirically-violated rules — this block (or the repo's own `#hot-rules`) is what `/workplan` pastes into builder task contracts. ≤15 lines, maintained by the audit reconciliation step.

1. Modern typing only: PEP 604/585 (`X | None`, `dict[str, X]`); annotate every public function.
2. `pathlib.Path` for all path work; explicit encodings for text IO.
3. No mutable default arguments; no import-time IO, network, env mutation, or expensive computation.
4. Absolute module-level imports; inline imports need a stated circular/optional-dep/performance reason.
5. Never import an underscore-prefixed name across module boundaries — promote it first.
6. Grep before you write: extend the existing helper; no copy-paste-then-drift.
7. Every new public function has a production caller wired in the same change set, or it doesn't merge.
8. Exceptions at API/IO/third-party boundaries with chaining (`from e`); explicit precondition checks for ordinary branching; never swallow failures silently.
9. No `Any`, `cast`, `type: ignore`, or broad ignores without a boundary justification comment.
10. Behavior changes ship with focused tests; tests assert public behavior, not implementation details; parametrize over copy-paste.
11. Dead code is deleted (with its tests), never commented out or `_`-bound while docs claim the action happens.
12. Dataclasses/NamedTuples over 3+-value tuples; `logging.getLogger(__name__)` over `print` outside scripts.

## Review rules (diff + audit)

1. **Correctness & API compatibility:** changed signatures, return shapes, exceptions, side effects vs. callers and tests; mutable defaults, late-binding closures, shadowed names, incomplete branch handling — flag only with concrete risk. Public API/CLI/serialization/config/schema changes verified against callers.
2. **Typing:** precise annotations on public functions, dataclasses, protocols, complex helpers; preserve generics/optionals/unions/literals/narrowing. Type style preferences become findings only when they hide a real risk.
3. **Error handling & boundaries:** explicit cheap precondition checks for ordinary branching; exceptions where the operation is the authoritative test (IO/third-party); retry/timeout/cancellation/cleanup explicit for network, subprocess, async, file work.
4. **Imports, packaging, module design:** coherent package boundaries, no new import cycles or hidden runtime edges; `pyproject.toml`/tool config consistent with supported Python version and dependency manager.
5. **Data, IO, security:** validate untrusted input at boundaries; no unsafe deserialization or shell injection; preserve secrets redaction and structured logging; no broad globs/recursive deletes/subprocess without concrete path/argument safety.
6. **Tests:** error paths, edge cases, async behavior, public contracts touched by the diff; no brittle implementation-detail assertions; shared fakes over per-test stubs.

## Mechanical gates (audit mode; smallest applicable subset in diff mode)

Detect the runner first (`uv run` if `uv.lock`/`[tool.uv]`; else direct binary; else poetry/pdm). Skip-and-note any unconfigured tool.

- **Lint/format:** `ruff check` (+ `ruff format --check` when style churn is relevant). Autofix (`ruff check --fix`) only with user consent — it's the only mutating gate.
- **Types:** the repo's configured checker (`pyright`, `mypy`, …). Ruff is not a type checker — never make type-safety claims from it.
- **Import boundaries:** `lint-imports` when `[tool.importlinter]` exists. Report every contract KEPT or BROKEN with its rule in plain language; broken contracts grouped with line numbers. (Trust only from a cold cache: `rm -rf .grimp_cache .import_linter_cache` first.)
- **Dead code:** `vulture` (repo config; else `--min-confidence 60`, excluding venvs/caches/vendored/migrations). Findings are candidates only — apply the engine's two-source rule: call-graph evidence (GitNexus `impact` upstream) AND a dynamic-entrypoint grep (decorators, CLI/task/route registration, string dispatch, `getattr`, entry points, pytest fixtures, Pydantic validators, dunders, migrations) before any "confirmed dead" verdict.
- **Tests:** focused tests for changed code → package tests → full suite as risk justifies. After changes to shared surface, also run full-suite collection (`pytest --co -q`).

## Deep references (`python/` — load on trigger, not by default)

- `python/dignified-python-core.md` — the core style standard (always for style disputes).
- `python/references/checklists.md` — final pre-commit checklist.
- `python/references/advanced/exception-handling.md` — writing try/except, `from e`/`from None`, LBYL-vs-EAFP calls.
- `python/references/advanced/interfaces.md` — ABC vs Protocol, gateway seams.
- `python/references/advanced/typing-advanced.md` — `cast`, Literal aliases, narrowing.
- `python/references/advanced/api-design.md` — defaults, 5+-param signatures, executor usage.
- `python/references/module-design.md` — module-level code, `@cache`, inline imports.
- `python/cli-patterns.md` / `python/subprocess.md` — when the diff touches CLI or subprocess.
- `python/versions/python-3.1X.md` — after detecting `requires-python` (default 3.12).
