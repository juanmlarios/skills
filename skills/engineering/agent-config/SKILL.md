---
name: agent-config
description: Install and maintain reusable Claude and Pi subagents, GitNexus + Context Mode instructions, and Claude Code hooks. Use when syncing custom agents, global AGENTS.md or CLAUDE.md files, shared routing, or Claude hook configuration across machines.
---

# Agent Config

Maintain reusable GitNexus and Context Mode instructions and hooks from this version-controlled source. Generated global files are outputs, so editing them loses changes on the next sync.

## Source and generated ownership

- Edit policy in `assets/instructions/`, agent definitions in `assets/agents/{claude,pi}/`, and hook behavior in `hooks/claude/`; installed files under `$HOME` are generated outputs.
- Keep shared policy in `assets/instructions/shared-routing.md`, tool-specific policy in its matching source file, and managed hook behavior in `hooks/claude/gitnexus-context-mode-dispatcher.cjs`.
- Sync replaces managed marker blocks and managed agent files. It refuses to overwrite an unmanaged agent filename unless the user explicitly reruns it with `--force-agents`.

## Read-only help

For explain, inspect, or status requests, read `references/overview.md` and the relevant source or generated files, then report how the package, targets, and managed markers relate. Do not run preview, sync, or doctor unless the user explicitly requests an installation or update.

## Installation or update workflow

When the user explicitly requests an installation or update, read `references/overview.md` when the split or targets matter. Then make the source change and use this evidence-backed sequence:

```bash
node scripts/sync-agent-config.mjs --dry-run
node scripts/sync-agent-config.mjs
node scripts/doctor-agent-config.mjs
```

The preview identifies intended managed changes; sync applies them; doctor confirms installed instructions, agents, markers, and hooks agree with source. If existing agent filenames are unmanaged, stop and ask before using `--force-agents` to adopt them. Restart Claude Code, Pi, or Codex when a fresh session is needed to load changes.

## Installed targets

The sync script installs Claude agents to `$HOME/.claude/agents/`, Pi agents to `$HOME/.pi/agent/agents/`, and manages the existing instruction, dispatcher, and Claude settings targets.
