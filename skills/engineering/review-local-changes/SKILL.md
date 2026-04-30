---
name: review-local-changes
description: Review local code changes with a findings-first mindset. Use when the user asks for a review, wants risk analysis on uncommitted work, or needs likely regressions and missing test coverage identified.
---

# Review Local Changes

Review code like a pragmatic senior engineer. Prioritize defects, regressions, and missing validation over style commentary.

## Workflow

1. Inspect the changed files.
2. Understand the intended behavior before judging the implementation.
3. Identify concrete bugs, risky assumptions, and behavioral regressions.
4. Check whether tests cover the changed behavior.
5. Summarize only after listing findings.

## Review Standard

- Findings come first.
- Order findings by severity.
- Include file paths and line references when available.
- Prefer specific failure modes over vague concerns.
- If no findings exist, say that explicitly and note any residual testing gaps.

## Avoid

- Nitpicks that do not affect correctness, maintainability, or user impact.
- Rewriting the author's code unless the user asked for fixes.
- Treating missing context as a bug without stating the assumption.
