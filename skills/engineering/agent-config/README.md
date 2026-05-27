# Agent Config

Reusable GitNexus + Context Mode configuration for Claude Code and Codex.

This package exists because GitNexus and Context Mode are both useful, but they should not compete for the same investigation step.

- GitNexus should answer code meaning, symbol context, execution flow, and impact questions.
- Context Mode should protect the context window for high-output commands, logs, tests, broad reads, and raw fetches.

The package stores the policy, hook dispatcher, and install/sync script in one version-controlled place.

## What It Installs

```text
/Users/juan/.agent-instructions/context-gitnexus-routing.md
/Users/juan/.claude/CLAUDE.md
/Users/juan/.codex/AGENTS.md
/Users/juan/.claude/hooks/gitnexus/gitnexus-context-mode-dispatcher.cjs
```

It also patches `/Users/juan/.claude/settings.json` to enable:

- custom `PreToolUse` dispatcher
- GitNexus `PostToolUse` freshness check
- Context Mode `SessionStart`
- Context Mode `PreCompact`
- Context Mode `UserPromptSubmit`

## Why It Is A Skill

Skills package repeatable agent behavior with assets and scripts. This one packages an operations workflow: install shared instructions, configure hooks, and explain the routing contract.

## How It Relates To Plugins

This does not replace plugins.

- GitNexus plugin/MCP provides code intelligence.
- Context Mode plugin/MCP provides context protection.
- This package coordinates them with instructions and hook routing.

## Sync

From this directory:

```bash
node scripts/sync-agent-config.mjs
```

Preview changes:

```bash
node scripts/sync-agent-config.mjs --dry-run
```

Restart Claude Code after hook changes. Start a new Codex session after global instruction changes.

## Verify

Check whether Claude Code, Claude for Mac local-agent state, and Codex are wired as expected:

```bash
node scripts/doctor-agent-config.mjs
```

This does not prove a future model will choose the correct tool every time. It verifies the configuration that makes the desired routing available:

- shared instruction files present
- Claude Code hook dispatcher present
- Codex MCP servers present
- Claude local-agent Context Mode plugin enabled
- Claude user-state GitNexus MCP present
