---
name: prompt-master
description: The one skill for prompting the Claude 5 models the way Anthropic says to. Starts by interviewing the user one question at a time, then writes a new prompt, rewrites an old one, or audits a whole CLAUDE.md, skill or project-instruction file, applying the rules from Anthropic's Opus 5 guide, Fable 5 guide, best practices page and context engineering post. Strips retired instructions, rebuilds the ask as a Full Job Brief (job, why, guardrails, done-means), swaps bare rules for reasons, caps scope, length and report-back, and adds Anthropic's audit line on long runs. Use when the user says "prompt master", "write me a prompt", "fix this prompt", "upgrade my prompt for Claude 5", "audit my CLAUDE.md", "rewrite my rules", "my skill feels too strict", "brief this for me", "help me brief this", "I don't know where to start", or pastes any prompt and asks why Claude over-does or under-does the task.
---

# Prompt Master

Turn a complete user request into a prompt, brief, or instruction-file revision for Claude 5 models. Read `references/rulebook.md` and only the operation-specific references needed for the request.

## Operation

Read the supplied prompt, files, and context before asking. Ask one question at a time only for a material gap that could change the result; when the input is complete, draft directly.

For an existing prompt or instruction, use `references/retired-instructions.md` to remove obsolete scaffolding while preserving concrete safeguards. Rebuild or revise using the Full Job Brief where useful: **job**, **why**, **guardrails**, and **done-means**. A short task does not need all four sections.

For a whole instruction file, produce the review table from `references/file-audit.md` and obtain approval before editing. Preserve the file-edit approval boundary. For prompts, return one copyable block and up to five source-backed change notes; for file audits, return the review table, bucket counts, and line reduction.

## Validation and guardrails

Remove wasteful generic rechecking such as “double-check everything,” but retain or add concrete evidence appropriate to the operation: targeted tests, security checks, migration/rollback checks, artifact inspection, or command output. Keep hard rules where mistakes are expensive and explain their reason. Prefer clear positive instructions over blanket prohibitions.

Do not autonomously modify this skill or its references, and do not store examples automatically. Change standing instructions or examples only when the user explicitly asks. Keep scope, deliverable size, and report-back proportionate to the job.

## References

| Need | Reference |
|------|-----------|
| General principles | `references/rulebook.md` |
| Material interview gaps | `references/interview.md` |
| Retiring obsolete instructions | `references/retired-instructions.md` |
| Full Job Brief | `references/job-brief.md` |
| Whole-file audit | `references/file-audit.md` |
| Rule rationale | `references/rules-to-reasons.md` |
| Standing voice or format | `references/voice-and-format.md` |
