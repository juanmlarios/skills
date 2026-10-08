# Codex repository tools

- Use native filesystem, search, editing and shell tools available in the current session.
- Before repository work, verify the intended root with `pwd; git rev-parse --show-toplevel` using an explicit working directory. For worktrees, verify the worktree root.
- Use absolute paths and an explicit shell cwd. Read current source before editing and preserve unrelated changes.
- Keep output focused; save complete logs when needed and summarize key evidence.
- Recover only from an explicitly supplied, verified handoff or session ID. Never guess recovery state from a global latest pointer.
- Record the repository root, task and recovery references together in handoffs. Do not stop shared services; clean up only exact test-owned processes.
- Tool availability depends on the current environment; do not assume local MCP tools exist in Cloud or remote sessions.
