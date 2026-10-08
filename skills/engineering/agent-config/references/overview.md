# Agent Config Overview

## Policy layers

Global shared preferences cover scope, evidence, safety and concise reporting. Client adapters cover only their tool boundaries. Repository setup, tests and domain conventions belong in project instructions; detailed recovery and deployment workflows belong in skills.

Claude and Codex use native repository tools. GitNexus is useful for code relationships when a usable index exists, but graph findings must be checked against source. No fixed output threshold requires a special middleware workflow.

## Generated ownership

The sync script writes shared preferences to `~/.agent-instructions/context-gitnexus-routing.md` (a legacy filename) and updates named `agent-config` marker blocks in Codex instructions. Text outside those blocks remains unchanged. Existing unmanaged Claude instructions remain untouched; a missing file may be initialized from the shared and Claude templates.

Full sync additionally installs managed Claude and Pi agents. Use `--instructions-only` to avoid agent changes. Conflicts with unmanaged agent files stop full sync before writes unless adoption was explicitly requested.

Hooks, plugins, MCP registrations, models and session data are outside this script's ownership. It does not install routing dispatchers or middleware. Adding or removing a tool requires a separately authorized configuration change.

## Verification

Run the isolated-home regression check, preview the intended sync, apply only the authorized scope, then run doctor with the same scope. Doctor exits nonzero on failures. Start a fresh session to load changed instructions; verify desktop personalization independently. The scripts cannot prove what an already-running conversation has loaded.
