---
name: performance-review
description: >-
  Whole-repo performance and efficiency review: algorithmic complexity in math/statistical
  modules, NumPy vectorization, pandas anti-patterns, sampling/simulation cost, parallelism
  candidates, I/O batching, and slow tests. Multi-agent fan-out with adversarial verification
  and a dated report, modeled on standards-review. Findings are two-tier: mechanical
  (bit-identical, freely recommendable) vs method-changing (statistical hypotheses requiring
  estimand-first workup and methodology sign-off — never apply-me fixes). Reads per-repo facts
  from docs/performance-review.config.md; bootstraps it on first run. Report-only: never
  applies fixes. Use for "performance review", "find bottlenecks", "efficiency sweep",
  "why is this slow", "optimize the pipeline/tests".
---

# Performance Review (whole-repo efficiency engine)

Sweep a repo for performance bottlenecks and inefficiencies — algorithmic, numerical,
dataframe, sampling, parallelism, I/O, and test cost. All repo-specific facts live in the repo
(`docs/performance-review.config.md`); the engine below is repo-agnostic. Reuses the
standards-review machinery: fan-out reviewers, adversarial verifiers, dated report.

## Ground rules

- **READ-ONLY review.** Reviewers never modify files. The main loop writes only reports (and,
  on first run, the config doc).
- **Measured, not asserted.** Every finding carries cost evidence: a timing, a profile sample,
  or a complexity argument with the real corpus n (from the config's corpus-scale facts).
  "This looks slow" is not a finding.
- **Severity = cost × frequency.** A hot-path production asset outweighs a one-off script at
  equal cost. The config's hot-paths list defines frequency weight; a finding states which
  weight it used.
- **Preservation claim required.** Every recommendation states what stays identical:
  `bit-identical` (mechanical), or `property-tests-pass` (statistically identical claim, tests
  named), or `method-changing` (tier 2 below).
- **ADRs and the repo's standards override this skill.** If the repo's standards doc constrains
  a remedy class (e.g. "moving property-test simulations out of the gate is a standards
  amendment"), findings recommend within that constraint and say so.
- Findings are reported, never auto-fixed.

## Two-tier finding classification (mandatory)

Every finding is tagged tier-1 or tier-2. A report that omits the tier on any finding is
incomplete.

- **Tier 1 — Mechanical.** The optimized code provably produces identical output: same bytes,
  same floats, same ordering (or the repo's property tests demonstrably pin the claim).
  Examples: vectorizing a loop over the same arithmetic, parallelizing an embarrassingly
  parallel axis with deterministic reassembly, batching I/O round trips, caching a pure
  recomputation, column-subset reads. Freely recommendable with a concrete fix.
- **Tier 2 — Method-changing.** The remedy changes *what is computed*, not just how fast:
  approximate nearest neighbors, subsampling, fewer bootstrap/simulation replicates, looser
  convergence tolerances, lower float precision on a served value, a different estimator or
  sampler. These are **hypotheses, not instructions**: the report tags each with the
  statistical surface it touches and the repo's methodology-review process it must enter
  (estimand declaration, measurement on real data, sign-off). The skill never presents a
  tier-2 remedy as an apply-me fix, however large the speedup.

If a tier is genuinely ambiguous (e.g. float32 intermediates that *should* round-trip), the
finding is tier 2. Ambiguity resolves toward the stricter tier.

## Review dimensions

Reviewers hunt exactly these; the config's scope partition assigns modules to reviewers.

1. **Algorithmic complexity (math modules).** Nested/pairwise loops where the algorithm class
   admits better: brute-force neighbor search vs KDTree/BallTree/NN indexes; dense matrices
   where sparsity is high; O(n²) scans an index or sort removes; invariants recomputed inside
   loops that a cache hoists (cite the repo's existing cache precedents from the config);
   graph algorithms recomputed per-call on an unchanged graph.
2. **NumPy vectorization.** Python-level loops over arrays; `np.append`/`np.concatenate` or
   list-append-then-convert inside loops; unneeded `.copy()`; missed broadcasting; boolean-mask
   chains that fuse; dtype width (float64 where float32 suffices for non-served intermediates —
   tier 2 if the value is served); repeated `np.where`/fancy-indexing that a single pass covers.
3. **Pandas patterns.** `iterrows`/`itertuples`/row-wise `apply` where a vectorized op exists;
   concat-in-loop (quadratic); `groupby().apply()` where a built-in agg or `transform` exists;
   object dtypes on numeric/categorical columns; chained indexing and copy churn; whole-frame
   ops where a column subset suffices; merge keys without categorical/index optimization.
4. **Sampling & statistical instruments.** Bootstrap/permutation/simulation loops: vectorize
   the replicate axis; RNG `Generator` created once and reused, not per-replicate; replicate
   counts vs the precision actually needed (tier 2); convergence tolerances (tier 2); analytic
   forms where a simulation approximates a known closed form (tier 2 — estimator change);
   sequential/e-process updates that batch.
5. **Parallelism.** Embarrassingly parallel axes (rows, replicates, partitions, domains) with
   deterministic reassembly — the repo's own prior parallelization (config names it) sets the
   template and the acceptance bar: measured speedup + bit-identical output. Flag also the
   inverse: parallelism overhead on tiny inputs.
6. **I/O & stores.** Per-row round trips to databases/vector stores vs batched writes/reads;
   full-file reads (parquet/CSV) where column or row-group subsets suffice; repeated artifact
   reads inside one asset body; cache layers present but bypassed (measure hit rates where
   cheap); serialization in hot loops.
7. **Tests.** Slow-test census (`pytest --durations`); simulation-heavy property tests —
   recommend same-power shrinking or replicate-axis vectorization, never silently weakening
   the statistical claim they guard (that is tier 2 plus a standards question); redundant
   parametrization (same code path, no new branch); per-test fixtures that should be
   session-scoped; missing/misconfigured test parallelism.

## Mode selection

- `docs/performance-review.config.md` exists → **Audit mode**.
- Missing → **Bootstrap mode** (ends by creating it).
- User asks about a specific module/diff → **Focused mode**: same rules, one reviewer, no
  fan-out, findings inline in chat.

## Audit mode

### 1. Mechanical gates

Run and record counts for the trend table vs the previous report:

- `ruff check --select PERF,NPY,C4 --no-cache <source roots>` — perflint/numpy/comprehension
  selectors, run regardless of the repo's pinned config (candidates only: every hit is
  confirmed in code before it becomes a finding, and hits in cold paths are dropped).
- `pytest <unit tree> --durations=25 <repo's parallel flags>` — slow-test census.
- Profile the config's representative workload (py-spy sample or cProfile) → top-N cumulative
  functions. This is reviewer orientation, not findings: it tells reviewers where time
  actually goes so complexity findings concentrate on hot paths.

If the profile workload can't run (missing data, credentials), proceed without it and record
that in the report — complexity findings then require an explicit frequency argument instead.

### 2. Fan out

One reviewer agent per scope from the config, structured output:
`{scope_summary, findings[{file, line, title, severity, tier, dimension, cost_evidence,
frequency_weight, preservation_claim, recommendation}], profile_notes[]}`.

Every reviewer prompt includes: repo path, its file scope, the dimensions above, the config's
corpus-scale facts and hot-paths list, the profile top-N (if available), READ-ONLY, "cite
file:line and quote the loop/expression; fewer well-evidenced findings over volume", and the
tier rules verbatim.

If the repo has a code graph (GitNexus indexed), reviewers may use `query`/`context` to find
callers and hot paths — but frequency claims still cite the config's hot-paths list or the
profile, not graph output alone.

### 3. Adversarial verification

Pipe each scope's high findings (cap ~6/scope) into verifiers: "Try to REFUTE this by reading
the code and, where cheap, by timing it: is the loop actually hot? is the input actually
large? does the vectorized form actually produce identical output (dtype, NaN handling,
ordering)? is this already cached/parked?" Include the config's false-positive traps verbatim.
Schema: `{real, adjusted_severity, adjusted_tier, note}`.

Universal verifier traps (add the config's on top):

- A loop over ≤~1k items that runs once per pipeline invocation is noise, not a finding.
- Vectorized ≠ identical: NaN propagation, integer overflow, float summation order, and empty
  edge cases differ; a tier-1 claim the verifier can't confirm demotes to tier 2.
- Staged/parked surfaces (config names the registry) may be intentionally unoptimized.
- Test simulations may be sized by a statistical power requirement, not carelessness — check
  the property the test guards before recommending fewer replicates.

### 4. Report

Write `workplans/<today>-performance-review/REVIEW-REPORT.md` + `findings-full.json`:

1. Trend table (gate counts, top-10 slowest tests, profile top-N vs previous report).
2. Verdict — 3–5 sentences: where the time goes, and whether it's algorithmic, numerical, or I/O.
3. Confirmed highs with verification verdicts, each showing tier + preservation claim +
   cost evidence.
4. **Tier-2 hypothesis queue** — its own section, explicitly routed to the repo's methodology
   process, never mixed into the fix list.
5. One-line index of medium/low.
6. Remediation phases ordered by measured-cost-reduction per effort, tier-1 first. Each phase
   names its acceptance evidence (e.g. "bit-identical on partition X, wall-clock before/after").

Deliver verdict + highs + tier-2 queue in chat; link the report for the rest.

## Bootstrap mode (first run in a repo)

1. **Scout inline:** stack + numeric libraries in use (import census); source line counts;
   corpus-scale facts (row counts, partition sizes — from configs/docs, or ask); existing perf
   precedents (prior parallelization/caching commits); the repo's standards constraints on
   remedies; test-suite serial/parallel timings if documented.
2. **Partition scopes** ~3–15k source lines per reviewer, grouping by dimension affinity
   (math-heavy modules together, dataframe-heavy together, I/O/store adapters together, tests
   as their own scope).
3. Run the audit fan-out + verification.
4. **Author `docs/performance-review.config.md`** (format below) from what was found, seeding
   verifier traps with the false positives this run's verification refuted.
5. Report as in audit mode, plus "what was created and where".

## Config file format (`docs/performance-review.config.md`)

```markdown
# performance-review config
baseline_report: workplans/<date>-performance-review/REVIEW-REPORT.md
source_root: <path>
standards_doc: <path, for remedy constraints>

## Corpus-scale facts
- <unit>: <real n reviewers must use in complexity arguments>

## Hot paths (frequency weights)
- hot: <modules/assets that run per-partition or per-build>
- warm: <run per-wave or per-onboarding>
- cold: <one-off scripts, parked surfaces>

## Profile workload
- <command that runs a representative build, or 'none (reason)'>

## Gate commands
- <shell command per gate>

## Scope partition
1. <name> — <paths> (<dimension emphasis>)
...

## Remedy constraints (from the repo's standards)
- <constraint the report must respect, with rule number>

## Verifier false-positive traps
- <trap, phrased as an instruction to the verifier>

## Perf precedents
- <prior optimization commits that set the template + acceptance bar>
```
