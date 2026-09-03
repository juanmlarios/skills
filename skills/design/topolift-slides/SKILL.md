---
name: topolift-slides
description: Create TopoLift-branded Marp slide decks from the single TopoLift template. Use whenever the user wants slides, a deck, or a presentation for TopoLift / topolift.ai, or wants to restyle a deck into the TopoLift brand. There is no theme selection — every deck uses the TopoLift template and must follow its layout rules (footer safe-zone, top-header alignment, pinned captions, full-width body text).
---

# TopoLift Slides

Create an on-brand TopoLift Marp deck from `assets/template-topolift.md`.

## Deck contract

Before authoring, establish the audience, intended outcome, source material, duration, slide budget, and output paths. Ask only for missing constraints that could change the deck. Let the content determine the layout: narrative, comparison, metrics, image, and grid slides are all valid when they communicate the outcome.

## Brand and layout guardrails

- Use one mode per deck: light by default, or dark with the documented `invert` directive.
- Content slides, including dark `section.invert` slides, are top-aligned. Only `section.lead` is vertically centered.
- Preserve the footer safe zone: `92px` bottom padding by default and never below `88px`. Keep all content, captions, tables, and figures above it.
- Use the wordmark and topology mark supplied by CSS; do not paste inline SVG into slide content.
- Keep body copy full width; `.lede` alone is intentionally narrow. Fit figures within the safe area and use `max-height` rather than stretching them to full width.

Use concise headings with rust emphasis where appropriate, but do not force a layout, bullet count, or visual motif when the source calls for a clearer alternative.

## Build and inspect

Copy the self-contained template, save the requested Markdown deck and render outputs, then render PNG probes for the busiest slides. Use an installed or project-pinned Marp CLI when available; only otherwise use the normal package resolution:

```bash
marp deck.md --html --pdf --allow-local-files
marp deck.md --images png --allow-local-files -o probe.png
```

Inspect rendered PNGs before delivery for footer clearance, the `92px`/`88px` safe area, readable content, correct title-only centering, and intact brand marks. Report the deck and rendered output paths.

## Files

- `assets/template-topolift.md` — embedded, self-contained starting template
- `assets/theme-topolift.css` — standalone theme
- `references/image-patterns.md` — image layouts
- `references/marp-syntax.md` — Marp directives and syntax
