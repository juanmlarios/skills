# Codex Adapter

Codex Desktop does not use Claude Code hooks.

Apply the routing split explicitly:

- GitNexus first for indexed code investigation.
- Context Mode for high-output commands, logs, tests, docs, broad analysis, and raw fetches.
- Native edit/write tools for file changes.

When both MCP servers are available, choose the tool by purpose rather than by habit:

- Meaning and impact: GitNexus.
- Volume and transformation: Context Mode.
