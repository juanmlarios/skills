---
name: pi-handoff
description: Create a Pi-only handoff for a fresh session while preserving a boardless pi-orchestrate workplan through RUN.md. Use when invoking /skill:pi-handoff, changing Pi sessions during a long implementation, preparing for context reset, or launching a fresh Pi pickup without altering the existing handoff skill.
---

# Pi Handoff

Prepare a compact Pi-to-Pi session handoff. The active workplan capsule remains authoritative; the handoff contains only context not already on disk.

## Safety checkpoint

Before writing the handoff, resolve the exact `RUN.md` path from the supplied slug/context and use lean-ctx exclusively for repository state and edits; native tools are allowed for the temporary handoff destination outside the project root. Do not tree-scan, glob, or repeatedly read a known capsule.

1. Read `RUN.md` once in anchored mode. Update it only when the exact next action, ownership, validation/review state, blocker, or known child run ID is missing or stale. Do not patch merely to refresh a timestamp, and do not reread after a successful patch.
2. Use recorded ownership plus one focused fleet/status check only when `RUN.md` indicates a possibly live child. Do not inspect artifact-directory trees as a proxy for liveness. Do not launch a fresh session while a mutation-capable child may still own source files; wait, pause it safely, or ask the user.
3. Read-only children may finish, but record their run and output paths explicitly.
4. Prior authorization for commits, pushes, destructive git, deployments, credentials, or live-cost actions does not transfer.

## Handoff artifact

Write Markdown to a temporary OS directory, not the repository. Include:

- Goal and current user intent
- Repository/cwd and active branch
- Workplan slug and absolute `RUN.md` path
- Pi session name/file when available
- Current task and exact next action copied from `RUN.md`
- Active or paused child run IDs and report paths
- Uncommitted diff summary and ownership concerns
- Open user decisions, blockers, and residual risks
- Information needed by the next parent that is not already in `PLAN.md`, `RUN.md`, reports, or git
- Requested continuation: `pi-pickup`
- Authorizations that must be reconfirmed

Reference artifacts by path; do not duplicate task contracts, reports, logs, or the full diff. One focused repository status summary plus the single `RUN.md` read is normally sufficient; read `PLAN.md` only when the objective cannot be recovered from the handoff request or run state.

## Default behavior

Write the handoff and return its absolute path. Do not start a new session unless the user passes `--start` or `--tab`.

## Launch behavior

With `--start` or `--tab`, launch a fresh, unforked Pi in the same cwd with:

```sh
pi '/skill:pi-pickup /absolute/path/to/handoff.md'
```

Use a Warp split for `--start` and a new tab for `--tab` when available; otherwise print the exact command. Never use `--continue`, `--resume`, `--fork`, or `/clone` for the new parent. The disk capsule—not inherited conversation—is the context bridge.

## Final response

```text
Pi handoff written: <path>
Started fresh Pi pickup: <split|tab>   # only when requested
```
