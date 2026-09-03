---
name: interview-me
description: Interview the user one question at a time before starting a big or fuzzy task, then write the brief; execute it only when requested or already authorized. Use when the user says "interview me", "brief me", "help me brief this", "I don't know where to start", or hands over a large task with obvious gaps in the request. Based on the interview pattern Anthropic recommends in the Claude Fable 5 field guide.
---

# Interview Me

Most briefs fail because the missing context is in the user's head and nobody asked for it. This skill pulls it out before any work starts, using the pattern Anthropic recommends: interview one question at a time, prioritising the questions whose answers would change the plan.

Source: A field guide to Claude Fable 5 (https://claude.com/blog/a-field-guide-to-claude-fable-finding-your-unknowns).

## Process

Read the available folder, named files, and related work before asking; do not spend a question on discoverable facts.

Ask zero to seven questions, one per turn. Ask only when the answer could materially change the job, why, guardrails, or done boundary. Stop as soon as remaining ambiguity cannot change the outcome; a complete brief needs no confirmation turn. Reconstruct useful answers from a ramble and ask only what remains material.

Cover, when they are not already known:

- what exists and where it lives;
- the goal, audience, and decision the output enables;
- constraints or decisions reserved for the user; and
- observable proof of done.

Before writing the brief, identify only material blind spots: unknowns that could still change the outcome. State them as assumptions or ask one further question when necessary.

Write a concise brief with job, why, guardrails, and done-means. This produces a brief only by default. Execute it only when the user asks to proceed or has already authorized execution; otherwise return the brief without an unnecessary approval loop.

A small, clear task may need zero questions: state the inferred brief and proceed only if execution is authorized.
