---
name: agent-config
description: Maintain shared coding-agent instruction templates and managed Claude/Pi agents. Use when syncing agent-config or changing its global policy source.
---

# Agent Config

## Ownership

- Shared preferences live in `assets/instructions/shared-routing.md`; client-specific tools live in `claude.md` and `codex.md` beside it.
- Managed agent definitions live in `assets/agents/{claude,pi}/`.
- Sync replaces only managed instruction blocks, preserving text outside them. Existing unmanaged Claude instructions are preserved.
- Hooks, plugin settings and MCP registrations are user-owned and are never installed or modified by sync. Do not reintroduce retired integrations.

## Read-only requests

Read relevant source and installed files, then report. Do not run sync for an explanation or audit.

## Approved changes

Update the owning source first. For instruction-only updates:

```bash
node scripts/test-agent-config.mjs
node scripts/sync-agent-config.mjs --instructions-only --dry-run
node scripts/sync-agent-config.mjs --instructions-only
node scripts/doctor-agent-config.mjs --instructions-only
```

Omit `--instructions-only` only when agent installation or updates are also authorized. Sync refuses to overwrite unmanaged same-named agents; ask before adopting them with `--force-agents`.

Start a fresh client session after instruction changes. Verify app personalization separately rather than assuming an independent copy or automatic synchronization. See `references/overview.md` for installed targets.
