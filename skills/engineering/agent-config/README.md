# Agent Config

Shared working agreements, client-specific instruction templates and managed Claude/Pi agent definitions.

## Targets

- `~/.agent-instructions/context-gitnexus-routing.md` — shared preferences (legacy filename).
- `~/.codex/AGENTS.md` — managed shared and Codex blocks; unmanaged notes preserved.
- `~/.claude/CLAUDE.md` — managed blocks updated if present; existing unmanaged instructions preserved.
- `~/.claude/agents/*.md` and `~/.pi/agent/agents/*.md` — only for full sync.

Claude uses native repository tools. Codex uses native repository tools with explicit working directories. GitNexus is used conditionally for dependency, execution-flow and impact questions. Sync never changes hooks, plugins or MCP settings.

## Instruction-only update

```bash
node scripts/test-agent-config.mjs
node scripts/sync-agent-config.mjs --instructions-only --dry-run
node scripts/sync-agent-config.mjs --instructions-only
node scripts/doctor-agent-config.mjs --instructions-only
```

For an authorized agent update, omit `--instructions-only`. Existing unmanaged agent files require explicit adoption with `--force-agents`.

Start a fresh session after changes and verify the app's personalization field separately. Details: `references/overview.md`.
