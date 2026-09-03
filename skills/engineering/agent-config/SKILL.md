---
name: agent-config
description: Install and maintain reusable GitNexus + Context Mode agent instructions and Claude Code hooks across Claude Code and Codex. Use when setting up shared agent routing, syncing global AGENTS.md or CLAUDE.md files, configuring PreToolUse dispatch between GitNexus and Context Mode, or explaining how this local config package relates to skills and plugins.
---

# Agent Config

Maintain reusable GitNexus and Context Mode instructions and hooks from this version-controlled source. Generated global files are outputs, so editing them loses changes on the next sync.

## Source and generated ownership

- Edit policy in `assets/instructions/` and hook behavior in `hooks/claude/`; do not edit generated files under `$HOME/.claude`, `$HOME/.codex`, or `$HOME/.agent-instructions`.
- Keep shared policy in `assets/instructions/shared-routing.md`, tool-specific policy in its matching source file, and managed hook behavior in `hooks/claude/gitnexus-context-mode-dispatcher.cjs`.
- Sync replaces only managed marker blocks. Preserve those markers and local unmanaged notes so future syncs remain safe.

## Read-only help

For explain, inspect, or status requests, read `references/overview.md` and the relevant source or generated files, then report how the package, targets, and managed markers relate. Do not run preview, sync, or doctor unless the user explicitly requests an installation or update.

## Installation or update workflow

When the user explicitly requests an installation or update, read `references/overview.md` when the split or targets matter. Then make the source change and use this evidence-backed sequence:

```bash
node scripts/sync-agent-config.mjs --dry-run
node scripts/sync-agent-config.mjs
node scripts/doctor-agent-config.mjs
```

The preview identifies intended managed changes; sync applies them; doctor confirms the installed files, managed markers, and hooks agree with source. Report the changed source paths plus the concise preview/sync/doctor result. Restart Claude Code or Codex only when a fresh session is needed to load changed global instructions or hooks.

## Installed targets

The sync script manages `$HOME/.agent-instructions/context-gitnexus-routing.md`, `$HOME/.claude/CLAUDE.md`, `$HOME/.codex/AGENTS.md`, `$HOME/.claude/hooks/gitnexus/gitnexus-context-mode-dispatcher.cjs`, and managed settings in `$HOME/.claude/settings.json` for the dispatcher, GitNexus freshness, and Context Mode lifecycle hooks.
