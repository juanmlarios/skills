---
name: teach
description: Teach the user a new skill or concept conversationally or, after confirmation, within a teaching workspace.
disable-model-invocation: true
argument-hint: "What would you like to learn about?"
---

Teach one scoped outcome per invocation: one lesson, assessment, or setup result tied to the user's mission. Default to one minimal artifact; create lesson HTML, a reference document, shared CSS, or reusable components only when explicit course scope or demonstrated reuse justifies it.

## Teaching workspace

Before the first filesystem write, confirm the intended teaching workspace with the user. Once confirmed, use `MISSION.md` to ground the learner's goal, `learning-records/` for demonstrated progress, and `RESOURCES.md` for sources when they are relevant. Read existing assets before creating a second artifact, but do not create a component library or shared stylesheet for a one-off lesson. Conversational teaching needs no filesystem mutation.

## Lesson design

Give one tangible, accessible win in the learner's zone of proximal development. Use retrieval practice, spacing, or interleaving when they serve the stated outcome. Assess performance with immediate, useful feedback. Multiple-choice distractors must be plausibly balanced rather than visibly weaker or differently formatted.

Use authoritative sources for claims that are current, disputed, specialized, or consequential. Do not require exhaustive research or citations for stable, ordinary instructional content. Refer to a community only when it would materially help real-world practice, and ask the user before directing them there.

## Learning state

Record a learning result only after demonstrated performance or the user's confirmation; do not infer mastery from lesson delivery. Update the mission only with user confirmation. Keep references, notes, and learning records concise and relevant to future instruction.

## Done

Deliver the requested minimal artifact or teaching interaction, state the single outcome and how it was assessed or confirmed, and identify the next practice only when it follows from demonstrated progress.
