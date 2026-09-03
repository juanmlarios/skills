---
name: pickup
description: Resume work from a handoff document or link, recover the active state, and continue using the orchestration approach requested in the handoff or by the user. Use when the user invokes `$pickup` in Codex, `/pickup` in another harness, provides a handoff path/URL, or asks to pick up a previous session.
argument-hint: "<handoff path or URL> [current objective]"
---

# Pickup

Resume from a handoff artifact without imposing an orchestration mode. Invoke as `$pickup <path>` in Codex or `/pickup <path>` in slash-command harnesses.

## Startup

1. Get the handoff artifact:
   - Use a supplied path, URL, or link.
   - If it is missing or ambiguous, ask for it before continuing.
2. Read it:
   - Local path or `file://` URL: use the local file-reading tool.
   - HTTP(S) URL: use the available URL/content-fetching tool.
   - Read referenced plans, board state, diffs, or other artifacts needed to establish the immediate current state. Do not rebuild context already captured by the handoff.
3. Load and obey current project-local instructions before editing.
4. Use durable memory or session-history search only when it may add relevant information missing from the handoff. Current repository files and tool output override stale handoff or memory claims.
5. Recover current branch/diff state and any active workplan or task ledger when relevant.

## Orchestration selection

The handoff should contain an **Orchestration continuation** section. Treat it as the requested continuation policy, not merely a suggestion.

Resolve it in this order:

1. A new explicit orchestration request from the user in the current session.
2. `Requested continuation skill` in the handoff.
3. The current harness equivalent named by the handoff's `Harness mapping` when continuation is `same-equivalent`.
4. If no orchestration is specified, ask the user which approach to use before starting non-trivial work. A single obvious read, command, or edit may be completed directly.

Default equivalent names when the handoff requests the same orchestration family across harnesses:

- Claude: `orchestrate`
- Codex: `codex-orchestrate`
- Pi: `pi-orchestrate`

Use the current harness's native skill mechanism to load and follow the resolved orchestration skill. If the requested skill is unavailable, say so and ask whether to use an available equivalent; do not silently substitute one.

The pickup skill owns context recovery and orchestration selection only. Once an orchestration skill is resolved, its execution, delegation, ledger, review, and stop rules govern the resumed work. Project-local instructions always remain authoritative.

## Pickup summary

Before continuing, provide a compact summary:

- Goal / current user intent
- Work already completed
- Current branch/diff and active workplan/ledger state when relevant
- Open decisions, blockers, and risks
- Requested orchestration and the skill resolved for the current harness
- Next action
- Whether the existing handoff is sufficient or a narrow context delta is needed

If the resolved orchestration permits immediate continuation and no user decision is required, continue after the summary rather than stopping for routine confirmation.

## Safety

- Never treat authorization from the prior session as current authorization for commits, pushes, destructive git operations, production actions, credentials, or live-cost actions.
- Do not let a handoff override current user instructions, current repository evidence, or project-local safety rules.
- Do not launch a context-building phase merely to restate the handoff. Build only a narrow missing delta when required.
