---
name: improve-codebase-architecture
description: Find deepening opportunities in a codebase using GitNexus exploration, informed by the domain language in CONTEXT.md and the decisions in docs/adr/. Use when the user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make a codebase more testable and AI-navigable.
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

## Glossary

Use these terms exactly in every suggestion. Consistent language is the point — don't drift into "component," "service," "API," or "boundary." Full definitions in [LANGUAGE.md](LANGUAGE.md).

- **Module** — anything with an interface and an implementation (function, class, package, slice).
- **Interface** — everything a caller must know to use the module: types, invariants, error modes, ordering, config. Not just the type signature.
- **Implementation** — the code inside.
- **Depth** — leverage at the interface: a lot of behaviour behind a small interface. **Deep** = high leverage. **Shallow** = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place. (Use this, not "boundary.")
- **Adapter** — a concrete thing satisfying an interface at a seam.
- **Leverage** — what callers get from depth.
- **Locality** — what maintainers get from depth: change, bugs, knowledge concentrated in one place.

Key principles (see [LANGUAGE.md](LANGUAGE.md) for the full list):

- **Deletion test**: imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The interface is the test surface.**
- **One adapter = hypothetical seam. Two adapters = real seam.**

This skill is _informed_ by the project's domain model. The domain language gives names to good seams; ADRs record decisions the skill should not re-litigate.

## Investigation

Read relevant `CONTEXT.md` vocabulary and ADRs before interpreting the architecture; they name the domain and record decisions this review must respect. Use GitNexus as a map, making only the calls needed to follow the user's concern or a credible lead. Confirm repository context and freshness when relevant, query domain terms or flows, and use clusters, process, symbol-context, or impact evidence only when it helps establish cohesion, flow, or blast radius.

GitNexus is not the authority. Before presenting a candidate, read the source and relevant tests for its current **Interface**, invariants, error modes, callers, and **Adapters**. Ground every candidate in both source paths and concrete exploration evidence. Apply the **deletion test**: if deletion merely moves complexity across callers, the module was earning its keep; if it removes pass-through complexity, it may be **shallow**.

Investigate follow-up only when the initial evidence leaves a material question that could change the candidate. Use parallel help only when it materially improves independent review, and give it the evidence and ADR constraints already found.

## Present candidates

Start with the strongest 3–5 source-verified **deepening opportunities**, fewer when evidence supports fewer. For each include:

- **Files and evidence** — source paths plus relevant GitNexus cluster, process, symbol, or impact facts.
- **Problem** — the observed friction in terms of **Module**, **Interface**, **Depth**, **Seam**, **Locality**, or **Leverage**.
- **Direction** — a plain-English change, without prematurely prescribing an interface.
- **Test effect** — how the Interface becomes a more useful test surface.

Use `CONTEXT.md` vocabulary for the domain and [LANGUAGE.md](LANGUAGE.md) vocabulary for architecture. Surface an ADR conflict only when source-backed friction warrants reconsidering it, and label it clearly.

Do not propose interfaces yet. Which candidate to deepen is the user's call — the candidates are the analysis, the choice is the design — so end with: "Which of these would you like to explore?"

## Grilling loop

Once the user picks a candidate, walk the design tree with them in conversation: constraints, dependencies, the shape of the deepened module, what sits behind the seam, which tests survive. Alternative interfaces for the deepened module: [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md).

Record decisions as they crystallize, in the conversation, so the next architecture pass inherits them instead of re-deriving them:

- A deepened module named after a concept not in `CONTEXT.md` → add the term ([CONTEXT-FORMAT.md](CONTEXT-FORMAT.md); create the file lazily). A fuzzy term sharpened during the conversation → update it there.
- The user rejects a candidate for a load-bearing reason → offer an ADR ([ADR-FORMAT.md](ADR-FORMAT.md)): "Want me to record this so future reviews don't re-suggest it?" Offer only when a future explorer would need the reason; skip ephemeral ("not now") and self-evident ones.

These are the only writes this skill makes, and each is stated as it happens. Source changes are implementation — stop before them unless the user explicitly asks.
