---
name: orchestrate
description: Run long sessions as an Opus-driven orchestrator that delegates searches to Haiku sub-agents and implementation/deep-research work to Sonnet sub-agents. Keeps the orchestrator's context window compact so the session can run for hours without compaction. Use when the user invokes `/orchestrate` to start a session that will involve multi-step work, parallel investigation, planning + implementation, or anything where context bloat would otherwise force an early compact.
---

# Orchestrate

Coordinate multi-step work while retaining enough direct understanding to make decisions, set guardrails, and integrate evidence. Delegate independent breadth or implementation when it reduces risk or context pressure; execute a small, known, low-risk task directly.

## Risk-based execution

Choose phases only when they reduce a real risk: unclear requirements, unfamiliar behavior, broad blast radius, independent investigation, or costly validation. A phase should state its outcome, owner, changed surface, evidence of progress, and stop condition. Do not add a plan, spike, review, or model-routing ritual merely because the task is multi-step.

Brief delegated work with the objective and why, known facts, owned paths, constraints, expected evidence, and whether it may mutate. The orchestrator remains responsible for understanding material findings and deciding the next action; delegation does not transfer accountability.

After any mutation, inspect one artifact-backed result—the diff, changed file, generated artifact, or targeted command output—before reporting progress. Reuse that inspection as evidence rather than rereading it through a duplicate verification routine. Run validation proportionate to the change and report actual command results.

## Progress, retries, and review

Report concise progress only with evidence: completed outcome, changed paths or artifact, validation state, and next action. Bound retries: retry only when new evidence suggests a different outcome; otherwise stop, record the blocker, owner, and decision or condition needed to resume. Review findings require source or artifact confirmation before a fix; one focused review pass plus one fix/recheck pass is normally enough unless evidence identifies a new issue.

Stop when the requested outcome and its evidence are complete, when authorization is required, or when a blocker cannot be resolved from available evidence. Never commit, push, perform destructive operations, bypass hooks, or act on production/shared systems without explicit current-session authorization.

## Final report

Return the outcome, changed paths/artifacts, validation results, unresolved risks or blockers, and the next action only when work remains. Keep tool/model mechanics in existing references when they are needed; do not create volatile routing documentation speculatively.
