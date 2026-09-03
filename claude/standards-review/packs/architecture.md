# Architecture pack — deep-module review (opt-in: `--deep`)

Loaded only when standards-review is invoked with `--deep` or the user explicitly asks for architecture/refactoring-opportunity review. Merged from the retired improve-codebase-architecture skill (2026-07-16). Support material in `architecture/`: `LANGUAGE.md` (vocabulary — deep modules, locality, leverage), `DEEPENING.md`, `INTERFACE-DESIGN.md`, `CONTEXT-FORMAT.md`, `ADR-FORMAT.md`.

Unlike the other packs this one *designs improvements*, it doesn't just measure conformance. It is interactive: candidates → user picks → grilling loop.

## Heuristics

- **Deletion test:** imagine deleting the module. Complexity vanishes → it was a pass-through. Complexity reappears across N callers → it was earning its keep.
- **The interface is the test surface.**
- **One adapter = hypothetical seam. Two adapters = real seam.**
- Shallow module: interface nearly as complex as the implementation.
- Friction signals: understanding one concept requires bouncing between many small modules; pure functions extracted "for testability" while the real bugs hide in how they're called (no locality); tightly-coupled modules leaking across seams; parts untestable through their current interface.

## Process

1. **Explore.** Read the domain glossary (`CONTEXT.md`) and ADR titles first — ADRs record decisions not to re-litigate. Then GitNexus as the primary map: repo context (freshness → `gnembed` if stale) → clusters → `query` with domain terms → `context` on key symbols → `impact` upstream on proposed seams. The graph is a map, not the final authority: read the source of every candidate — current interface, invariants, error modes, tests, adapters — before presenting it.
2. **Present candidates** — numbered list; each with: files · GitNexus evidence (cluster/process/impact facts) · problem (why the architecture causes friction) · solution in plain English · benefits in terms of locality, leverage, and how tests improve. Use `CONTEXT.md` vocabulary for the domain and `architecture/LANGUAGE.md` vocabulary for the architecture. Surface ADR conflicts only when the friction justifies reopening the ADR, marked explicitly. Do NOT propose interfaces yet — ask which candidate to explore.
3. **Grilling loop** — walk the design tree with the user: constraints, dependencies, the shape of the deepened module, what sits behind the seam, which tests survive. Side effects happen inline as decisions crystallize:
   - New concept named → add it to `CONTEXT.md` (`architecture/CONTEXT-FORMAT.md`; create lazily).
   - Fuzzy term sharpened → update `CONTEXT.md` right there.
   - Candidate rejected for a load-bearing reason → offer an ADR (`architecture/ADR-FORMAT.md`) so future reviews don't re-suggest it; skip ephemeral or self-evident reasons.
   - Exploring alternative interfaces → `architecture/INTERFACE-DESIGN.md`.
