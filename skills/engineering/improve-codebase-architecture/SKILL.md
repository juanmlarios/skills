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

Ask which candidate the user wants to explore only when that selection would materially change the requested result; otherwise complete the supplied scope. Do not edit source, `CONTEXT.md`, or ADRs as a side effect of analysis; propose documentation changes only with user approval. Stop before implementation unless the user explicitly requests it.
