---
name: atlasx-mesh-worker
description: Execute AtlasX assignments from Prime over remote-pi using atlasx-workflow/v1. Use whenever a mesh message declares that protocol, Prime assigns Console or Agent-Neo work, or a worker must report acceptance, decisions, blockers, commit readiness, validation, or completion.
---

# AtlasX Mesh Worker

Use this skill together with `agent-network`: agent-network owns transport; this skill owns the AtlasX worker lifecycle.

Before handling an assignment, read:

- `$HOME/GitHub/AtlasX/Optimize/docs/atlasx-mesh-protocol.md`
- `$HOME/GitHub/AtlasX/Optimize/docs/atlasx-message-examples.md`

## Role and authority

- Your repository role comes from the current repository's `AGENTS.md`.
- Own only the accepted GitHub Issue's workplan, assigned branch/worktree, edits, validation, durable evidence, and authorized commits. Repo-wide queue, architecture, and acceptance decisions stay with Prime or the user.
- `Prime` is the user's delegated coordination session and the normal counterparty for assignments, direction, authorization, and reports. A newer direct user instruction wins.
- Do not edit another role's repository.
- Push, merge, deploy, destructive operations, shared-resource changes, secret changes, and cost-incurring actions require explicit authorization.

## On assignment

Repository implementation is assigned only from a validated GitHub Issue. Require `issue_number`, `task_id: "GH-<issue_number>"`, `validated_at_sha`, liveness evidence, current symbols/files, scope/exclusions, acceptance criteria, a negative control, stop conditions, authorization, and closure responsibility. Dated reviews and triage tables are leads, not a backlog. Discovery before issue creation may use a scoped `DISCOVERY-...` task ID but cannot authorize implementation.

1. Require `protocol: "atlasx-workflow/v1"`, `initiative_id`, `task_id`, `type: "assignment"`, the correct `owner_role` and repository, scope, acceptance criteria, and authorization.
2. If the protocol version or message type is unknown, reply `failed`; do not guess.
3. Before acceptance, read the issue and recheck it at the supplied base. If it is closed, duplicated, stale, already satisfied, or materially contradicted by the tree, send `decision_required` and pause instead of beginning implementation.
4. If the same `task_id` already exists, report its current durable state instead of starting duplicate work.
5. If a new major assignment or materially changed contract is clear and safe, reply `accepted` once, correlated with the assignment message through `re`, before substantive work. Internal tasks and duplicate delivery do not need acknowledgement.
6. If it is unclear or blocked, reply `decision_required` or `blocked` with evidence and the exact action needed.
7. Create or execute the requested repository-local workplan. Preserve existing uncommitted work and keep one writer for the repository.

## During execution

- Work only inside accepted scope and authorization.
- Keep routine reads, edits, tests, subagent activity, task progress, and minor delivery in repository-local durable state. Do not send heartbeat, per-action, per-command, per-file, or internal-task messages.
- Contact Prime only for direction or a material decision; a blocker or failure affecting delivery; commit authorization/result; publish, push, merge, deploy, or another externally visible action; a major wave/delivery milestone that changes dependencies; or final repository-level completion.
- Send `decision_required` or `blocked` to Prime before changing scope, architecture, a published contract, acceptance criteria, or another repository's work. Include viable options, consequences, a recommendation, affected scope, and whether work is paused. Prime's reply amends the contract; reasoning alone never authorizes the change.
- Report `blocked` with the cause, evidence, impact, safe actions attempted, and required action.
- Use `status` only for major wave or consolidated delivery milestones. Batch related evidence into the fewest useful messages.
- Use `initiative_id` and `task_id` on every lifecycle message. Use remote-pi `re` for direct replies; do not invent addresses or transport IDs.
- Treat `agent_send` status `received` as delivery only. Pi receives later replies as new turns; never poll or block waiting.

## Commit gate

Unless the assignment explicitly preauthorizes a local commit:

1. Send `ready_to_commit` with changed files, diff summary, validation results, risks, and the proposed commit message.
2. Wait for the assigner's `commit_authorized` decision when the assignment's `commit_mode` is `gated`; skip if `preauthorized`. See `$HOME/GitHub/AtlasX/Optimize/docs/atlasx-guardrails.md`.
3. Commit locally and report the SHA.
4. Never infer push authorization from commit authorization.

## Completion

Send Prime one consolidated `completed` message only when the repository-level assignment's acceptance criteria are met. Every implementation PR carries `Closes #<issue_number>`. Include the workplan result, changed files or artifacts, validation commands and outcomes, commit SHA and PR when required, issue closure text, risks, and deferred work. Internal task and minor wave completion stays local.

Send Prime `failed` instead when safe completion is impossible. Never go silent on an accepted task.

After the detailed Prime message is delivered, the Worker's user-visible response must be exactly one line: `Completed`, `Blocked`, or `Need Direction`. Do not expose the detailed report in the Worker session.
