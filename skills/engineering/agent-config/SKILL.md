---
name: agent-config
description: Install and maintain reusable GitNexus + Context Mode agent instructions and Claude Code hooks across Claude Code and Codex. Use when setting up shared agent routing, syncing global AGENTS.md or CLAUDE.md files, configuring PreToolUse dispatch between GitNexus and Context Mode, or explaining how this local config package relates to skills and plugins.
---

# Agent Config

Use this skill when the user wants reusable agent setup across projects and tools.

## Purpose

This skill packages global agent policy and hook configuration so the same GitNexus + Context Mode routing can be reused from one version-controlled location.

It is not itself a Claude/Codex plugin. It is a local configuration kit:

- source instruction files
- Claude Code hook assets
- sync/install scripts
- docs explaining why the split exists

## Workflow

1. Read `references/overview.md` for the conceptual model.
2. Edit source files under `assets/instructions/` or `hooks/claude/`.
3. Run `scripts/sync-agent-config.mjs` to generate local global instruction files and hook files.
4. Restart Claude Code or Codex when hook/global instruction loading needs a fresh session.

## Installed Targets

The sync script writes:

- `/Users/juan/.agent-instructions/context-gitnexus-routing.md`
- `/Users/juan/.claude/CLAUDE.md`
- `/Users/juan/.codex/AGENTS.md`
- `/Users/juan/.claude/hooks/gitnexus/gitnexus-context-mode-dispatcher.cjs`

It also patches `/Users/juan/.claude/settings.json` to enable:

- custom `PreToolUse` dispatcher
- GitNexus `PostToolUse` freshness hook
- Context Mode `SessionStart`
- Context Mode `PreCompact`
- Context Mode `UserPromptSubmit`

## Commands

From this skill directory:

```bash
node scripts/sync-agent-config.mjs
```

Dry run:

```bash
node scripts/sync-agent-config.mjs --dry-run
```

Verify:

```bash
node scripts/doctor-agent-config.mjs
```

## Editing Rules

- Edit the source files in this skill, not generated files in `~/.claude`, `~/.codex`, or `~/.agent-instructions`.
- Keep shared policy in `assets/instructions/shared-routing.md`.
- Keep Claude-specific guidance in `assets/instructions/claude.md`.
- Keep Codex-specific guidance in `assets/instructions/codex.md`.
- Keep hook behavior in `hooks/claude/gitnexus-context-mode-dispatcher.cjs`.

Generated files contain marker blocks so future syncs can replace managed sections without deleting local unmanaged notes.
