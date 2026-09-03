# Fan-out tasks — the Workflow tool

Load when a task is `Shape: fan-out`: the same read-only check over a named list of N similar items (partitions, scopes, files, heads, PRs). Past capsules ran these as N narrative one-off dispatches or inline in the parent — a 28-partition gate sweep produced 121 log files and a hand-written 34 KB report; 8 clean-clone triples became 100 lines of RUN.md. A Workflow script runs the list deterministically, returns typed JSON, and costs the parent one dispatch and one RUN.md row.

The Workflow tool's own permission dialog is the opt-in; nothing in this reference or in `/orchestrate` authorizes a run. Load the `workflow-authoring` skill before writing a script.

## Boundaries

- **Read-only only.** Workflow agents mutate only under `isolation: 'worktree'`, and there is no integration step (no base capture, no diff-apply). Until the prerequisites in `worktree.md` hold, a fan-out that writes is N serialized builder dispatches, not a workflow.
- **Not durable state.** Resume is same-session only. The capsule stays authoritative: the script's return value is persisted under `workplans/<slug>/validation/<task>.json` and `RUN.md` gets one row with pass/fail + that path.
- **One nesting level.** Keep the fan-out at the parent; a workflow cannot dispatch another workflow inside a child.

## Verification of fan-out results

The adversarial refutation stage inside the workflow *is* the verification for a read-only fan-out — do not also dispatch a per-task `verifier`. Dispatch one fresh `verifier` over the aggregated JSON (spot-check k items, reproduce the counts) only when the result feeds a wave commit or a user decision. A dropped item (null return) is a failure of coverage, not an absence of findings: any `dropped > 0` makes the task `fail` in `RUN.md` until the items are re-run. Refute per finding, not per item, and log every all-null verdict — silence must never read as coverage.

## Shape of a script

```js
export const meta = {
  name: '<slug>-<task>',
  description: '<one line, shown in the permission dialog>',
  phases: [{ title: 'Check' }, { title: 'Refute' }],
}
const ITEMS = args.items            // list source named in the contract
const CHECK = { type: 'object', required: ['item', 'pass', 'evidence'], properties: {
  item: { type: 'string' }, pass: { type: 'boolean' }, evidence: { type: 'string' }, findings: { type: 'array' } } }
const VERDICT = { type: 'object', required: ['refuted', 'reason'], properties: { refuted: { type: 'boolean' }, reason: { type: 'string' } } }

const results = await pipeline(
  ITEMS,
  item => agent(`${args.brief}\nITEM: ${item}\nREAD-ONLY. Return the check result.`, { label: `check:${item}`, phase: 'Check', schema: CHECK, effort: 'low' }),
  (r, item) => r && r.findings?.length
    ? pipeline(r.findings, f =>
        parallel(Array.from({ length: 2 }, () => () =>
          agent(`Try to refute this finding for ${item}: ${JSON.stringify(f)}. Refute only with a concrete reason; if you cannot, refuted=false.`, { phase: 'Refute', schema: VERDICT })))
        .then(vs => {
          const live = vs.filter(Boolean)
          if (!live.length) log(`refute stage returned no verdicts for ${item}: ${JSON.stringify(f).slice(0, 80)}`)
          return { ...f, confirmed: live.length > 0 && live.filter(v => !v.refuted).length >= 1, verdicts: live }
        }))
      .then(findings => ({ ...r, findings }))
    : r,
)
const dropped = results.filter(r => !r).length
if (dropped) log(`${dropped} of ${ITEMS.length} items returned null — coverage incomplete`)
return { status: dropped ? 'fail' : 'pass', items: ITEMS.length, dropped, results: results.filter(Boolean) }
```

Pass the list and the brief via `args`; timestamps too (`Date.now()` is unavailable). Default to `pipeline()`; use `parallel()` only when a later stage needs all prior results at once (dedup, early exit).

## Templates by task type

- **N-partition / N-head gate sweep** — items = partitions; check = run the gate command via `ctx_shell`, return exit + key lines; no refute stage needed (the gate output is the evidence); persist `{item, exit, path}`.
- **N-scope review + refutation** — items = scopes with owned paths; check = review lens returning findings with `file:symbol`; refute = 2 skeptics per finding; keep findings with ≥1 non-refuted vote. Ask for everything and filter afterwards — "only report high-severity" makes the model report less.
- **N-file census** — items = files; check = extract the fact (headers, citations, links) with a path per claim; no refute; a completeness critic agent at the end asks what was missed.

Save reusable scripts under the project's `.claude/workflows/` and invoke by `name` from later capsules; the script path is recorded in the task's `Context:`.
