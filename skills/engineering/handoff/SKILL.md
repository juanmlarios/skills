---
name: handoff
description: Compact the current conversation into a handoff document for another agent to pick up.
argument-hint: "What will the next session be used for?"
---

Write a compact handoff document in the user's OS temporary directory, not the workspace. Use a unique temporary filename and refuse to overwrite an existing file; choose a new filename on collision. If arguments are supplied, treat them as the next session's focus.

## Handoff schema

Include only what a fresh agent needs:

- **Objective and why** — intended outcome and who or what it enables.
- **Scope** — completed, remaining, and explicitly excluded work.
- **Decisions** — made decisions and the reasons or authority behind them.
- **Verified state** — current facts grounded in an artifact, command result, or source path.
- **Validation** — commands run and their results.
- **Blockers** — exact evidence, owner/decision needed, and retry condition.
- **Next action** — one concrete, ordered action.
- **Artifacts** — path or URL references for plans, ADRs, issues, commits, diffs, and outputs; do not duplicate their content.
- **Suggested skills** — only skills relevant to the next action.

Redact secrets, credentials, personal data, and sensitive values; identify a redaction by type when it affects continuation. Keep the document short enough to scan (normally no more than one page); link to artifacts instead of expanding them. If evidence is absent, say so rather than inferring it.

Report back with the handoff file path only.
