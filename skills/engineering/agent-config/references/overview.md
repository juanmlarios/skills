# Agent Config Overview

## Why This Exists

GitNexus and Context Mode solve different problems:

- GitNexus understands indexed repositories: symbols, callers, callees, execution flows, routes, impact, and refactor blast radius.
- Context Mode protects the context window: high-output commands, logs, test output, broad file analysis, raw documentation, and web/API fetches.

When both are active, overlapping hooks can waste time or produce less targeted context. The main conflict is `PreToolUse` for `Bash`, `Grep`, and broad reads. GitNexus should handle semantic code investigation first; Context Mode should handle high-output and raw context control.

## Relation To Plugins

Plugins provide capabilities: MCP tools, hooks, skills, or app integrations.

This package also versions the custom Claude and Pi subagent definitions under `assets/agents/` and installs them into their canonical user-scoped directories. It does not replace the GitNexus or Context Mode plugins; it coordinates them:

- GitNexus plugin/MCP remains the code intelligence layer.
- Context Mode plugin/MCP remains the context-budget layer.
- This skill installs the local instructions and hook dispatcher that decide which one should handle each situation.

## Relation To Skills

Skills are reusable instructions plus assets/scripts. This package is stored as a skill because it is a repeatable operational workflow:

- explain the routing model
- install shared global instructions and custom agents
- install hook assets
- patch Claude Code settings safely
- sync updates across machines or projects

## Recommended Routing

- `Grep|Glob` -> GitNexus
- `Bash` with `rg|grep` inside a `.gitnexus` repo -> GitNexus
- other high-output `Bash` -> Context Mode
- `Read|WebFetch` -> Context Mode
- `PreCompact` -> Context Mode
- `UserPromptSubmit` -> Context Mode
- `PostToolUse` git mutations -> GitNexus freshness check

## Why Generated Files Instead Of Symlinks

Symlinks make Claude and Codex read the same exact file. That is simple, but it prevents independent tool-specific instructions.

Generated files are better:

- one shared source of truth
- Claude-specific section in `CLAUDE.md`
- Codex-specific section in `AGENTS.md`
- local unmanaged notes can remain outside marker blocks
- sync script can update all targets consistently
