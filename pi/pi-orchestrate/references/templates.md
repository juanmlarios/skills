# Pi-orchestrate subagent templates

Load only before dispatching subagents. Replace placeholders and resolve every output path to an absolute path. Contracts live in `PLAN.md`; briefs repeat only the load-bearing ownership, validation, stop rule, and artifact paths.

## Compact result header

Every prose child report begins with a compact status summary; the YAML form below is preferred. An equivalent first-line summary is acceptable when it contains status, changed files, validation, findings, and next action. Formatting alone never justifies a retry when the evidence and validation are complete. A deterministic raw artifact may omit the summary when exact bytes are the contract; mark that in `PLAN.md` and validate it directly. The parent never edits a completed child artifact to add or repair formatting.

```yaml
---
status: pass | fail | blocked
changed: [path, ...]
validation: pass | fail | not-run
findings: 0
next: parent action or none
---
```

The parent reads this header first and loads the report body only for findings, failures, blockers, or integration decisions.

## Read-only discovery

```ts
subagent({
  async: true,
  context: "fresh",
  agent: "discovery",
  task: "Task T<n> in <PLAN path>#T<n>. Read-only investigation for <scope>. Do not edit project/source files; returning findings through the configured output artifact is allowed. Cite concrete evidence. If clean, state 'no findings' with evidence. Write the compact result header first.",
  output: "/absolute/path/workplans/<slug>/agents/T<n>/discovery.md",
  outputMode: "file-only",
  acceptance: {
    level: "none",
    reason: "read-only artifact; parent validates configured output"
  }
})
```

Do not add an independent reviewer for routine discovery. The parent checks deterministic evidence.

## Writer pending review

```ts
subagent({
  async: true,
  context: "fresh",
  agent: "developer",
  task: "Implement task T<n> from <PLAN path>#T<n>. Source-owned files: <paths>; the configured report is runtime-persisted and is not source ownership. Inputs: <artifact paths>. Non-goals: <items>. Approved impact evidence: <PLAN impact field>; do not rerun it for in-contract symbols. If an out-of-contract shared/exported symbol is required, stop for parent analysis and contract amendment. Run `<command>` from `<cwd>`; success proves <behavior>. Stop before unapproved product, architecture, ownership, or scope decisions. Write code, then write the compact result header and evidence report.",
  output: "/absolute/path/workplans/<slug>/agents/T<n>/worker.md",
  outputMode: "file-only",
  acceptance: {
    level: "checked",
    criteria: [
      {
        id: "scope",
        must: "Only the approved task and owned files are changed",
        evidence: ["changed-files", "diff-summary"]
      },
      {
        id: "validation",
        must: "Focused validation ran or a concrete blocker was reported",
        evidence: ["commands-run", "validation-output"]
      }
    ],
    evidence: [
      "changed-files",
      "commands-run",
      "validation-output",
      "residual-risks",
      "no-staged-files",
      "diff-summary"
    ]
  }
})
```

Use `verified` only when safe deterministic runtime verification is worth its cost. Do not apply hard tool budgets to mutation-capable children.

## Fresh integrated wave review

```ts
subagent({
  async: true,
  context: "fresh",
  agent: "code-reviewer",
  task: "Review integrated wave <Wn> against <PLAN path>. Changed files: <paths or diff range>. Worker reports: <paths>. Check correctness, regressions, scope, validation quality, and project standards. Do not edit project/source files; returning findings through the configured output artifact is allowed. Cite file:line evidence; state 'no findings' with evidence when clean. Write the compact result header first.",
  output: "/absolute/path/workplans/<slug>/agents/<Wn>/review.md",
  outputMode: "file-only",
  acceptance: {
    level: "none",
    reason: "read-only artifact; parent validates configured output"
  }
})
```

Use task-level review only for a distinct high-risk surface. Artifact-only verification uses a cheaper bounded reviewer or parent check, not the code-review lane.

## Sequential writer → reviewer chain

Use only when no parent decision or integration step is needed between delivery and review:

```ts
subagent({
  context: "fresh",
  chain: [
    {
      agent: "developer",
      task: "<writer brief>",
      output: "/absolute/path/workplans/<slug>/agents/T<n>/worker.md",
      outputMode: "file-only",
      acceptance: "checked",
      gateOn: "acceptance"
    },
    {
      agent: "code-reviewer",
      task: "<fresh review brief; read the actual diff and worker report>",
      output: "/absolute/path/workplans/<slug>/agents/T<n>/review.md",
      outputMode: "file-only",
      acceptance: {
        level: "none",
        reason: "read-only artifact; parent validates configured output"
      }
    }
  ]
})
```

The chain is sequential and keeps one writer. The parent still inspects the final diff and validation.

## Correction

While a top-level async writer is live:

```ts
subagent({ action: "steer", id: "<run-id>", message: "After the current tool returns, address <specific issue> and rerun <validation>." })
```

After pause/completion/failure, preserve context for a narrow accepted correction:

```ts
subagent({ action: "resume", id: "<run-id>", message: "Apply only accepted findings in <review path>. Raw failure: <validation path>. Rerun <command>." })
```

Use correction only for bounded accepted findings within the existing contract. Launch a fresh writer when independent re-reasoning is safer. If the fix requires redesign, changed ownership, or new impact scope, create or amend a task instead of stretching the fix round.

## Waiting

Interactive sessions normally return control and let completion wake the parent. When the current turn must receive the result:

```ts
subagent_wait({ id: "<run-id>" })
```

Use `all: true` only when intentionally draining every active run. Never replace this with sleep or status polling.
