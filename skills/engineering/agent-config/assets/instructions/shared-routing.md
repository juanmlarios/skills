# GitNexus + Context Mode Routing

Shared global instructions for Claude Code, Codex, and other repo agents.

## Priority

1. Project `AGENTS.md` / `CLAUDE.md` rules still apply.
2. If a repository is indexed by GitNexus or contains `.gitnexus/`, use GitNexus first for code investigation.
3. Use Context Mode for context-budget protection, high-output work, and broad analysis.
4. Use native edit/write tools for file creation and modification.

## Code Investigation

In indexed repositories:

- Use GitNexus `query` to find relevant symbols, flows, routes, and concepts.
- Use GitNexus `context` for callers, callees, process participation, and symbol detail.
- Use GitNexus `impact` before editing a function, class, method, route handler, or exported symbol.
- Use GitNexus `detect_changes` before commit or before saying a refactor is complete.
- Do not start with broad grep/search when GitNexus can answer the question.

GitNexus is the semantic repo navigator. Prefer it for code meaning, dependency questions, execution flow, blast radius, and refactor safety.

## Context Mode

Use Context Mode when output may exceed 20 lines or requires analysis:

- tests, builds, logs, and diagnostics
- broad file summaries
- multi-file reads for analysis
- repo searches where GitNexus is unavailable or not enough
- web/API/documentation fetching
- count/filter/compare/parse/transform tasks

Think in code:

- Use `ctx_batch_execute` for related investigations.
- Use `ctx_execute` for processing, counting, filtering, comparison, and command output control.
- Print only the answer.
- Do not load raw logs, raw HTML, or large command output into chat.

## Reads And Writes

- Reading to edit a specific file: native read is OK.
- Reading to analyze many files: Context Mode.
- Creating or modifying files: native edit/write tools only.
- Do not use Context Mode, shell heredocs, `node -e`, or Python scripts to write files.
- Do not use `curl` or `wget` directly. Fetch through Context Mode and summarize.

## Routing Split

Recommended automatic hook ownership:

- `Grep|Glob` -> GitNexus
- `Bash` with `rg|grep` inside a `.gitnexus` repo -> GitNexus
- Other `Bash` that may be high-output -> Context Mode
- `Read|WebFetch` -> Context Mode
- `PreCompact` -> Context Mode
- `UserPromptSubmit` -> Context Mode
- `PostToolUse` for git mutations -> GitNexus index freshness check

If hooks are unavailable, follow the same split manually.

## Context Mode Commands

When user says:

- `ctx stats`, `ctx-stats`, `/ctx-stats`, or asks context savings: call Context Mode stats and show full output.
- `ctx doctor`, `ctx-doctor`, `/ctx-doctor`: call Context Mode doctor and show checklist.
- `ctx upgrade`, `ctx-upgrade`, `/ctx-upgrade`: call Context Mode upgrade, run returned command, show checklist, and tell user to restart.
- `ctx purge project`, `ctx-purge project`, `/ctx-purge project`: warn irreversible, then call purge with `{ confirm: true, scope: "project" }` if user confirms.
- `ctx purge session`, `ctx-purge session`, `/ctx-purge session`: purge only the current/target session with `{ confirm: true, scope: "session" }` or `{ confirm: true, sessionId: "<uuid>" }` when a session id is provided.
- Bare `ctx purge`, `ctx-purge`, or `/ctx-purge`: ask whether to purge `session` or `project`; do not use bare `{ confirm: true }`.

After `/clear` or `/compact`: knowledge base is preserved. Tell user: `context-mode knowledge base preserved. Use ctx purge to start fresh.`

## Output Style

Terse. Technical. No filler.

For completed work, return:

- Actions taken
- Files changed
- Key findings or validation

Write large artifacts to files. Return file path plus one-line description.
