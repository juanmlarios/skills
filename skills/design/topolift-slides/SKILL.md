---
name: topolift-slides
description: Create TopoLift-branded Marp slide decks from the single TopoLift template. Use whenever the user wants slides, a deck, or a presentation for TopoLift / topolift.ai, or wants to restyle a deck into the TopoLift brand. There is no theme selection — every deck uses the TopoLift template and must follow its layout rules (footer safe-zone, top-header alignment, pinned captions, full-width body text).
---

# TopoLift Slides

Create polished, on-brand TopoLift presentations with [Marp](https://marp.app/).

This skill has **one template** — the TopoLift brand theme. There is no theme
selection and no "pick a style" step: every deck is TopoLift-branded and must
obey the layout rules below. Your job is to structure the content well and keep
it inside the brand and layout constraints.

## When to Use This Skill

- The user asks to create slides, a deck, or a presentation for TopoLift / topolift.ai
- The user wants to turn notes, a doc, or an outline into a TopoLift deck
- The user wants to restyle or rebuild an existing deck in the TopoLift brand
- Trigger: `/topolift-slides`, "create slides", "make a deck", "make a presentation"

## Critical Layout Rules — ALWAYS enforce

These are non-negotiable and apply to **every** slide. They are baked into the
template's CSS — do not weaken them. Violating them produces an off-brand,
broken-looking deck.

1. **Never overlap the footer.** Every slide renders a footer (page number +
   the TopoLift wordmark, bottom-left). No content — text, images, tables,
   captions, diagrams — may overlap or sit on top of it.
2. **Always respect the bottom safe margin.** The template reserves a clear
   band at the bottom (`padding-bottom ≈ 92px`, ≥ 11% of slide height). Never
   reduce `padding-bottom` below ~88px and never push content into that band.
3. **Consistent top-header spacing.** Content slides are **top-aligned**
   (`justify-content: flex-start`) so the kicker/heading sits at the same
   distance from the top on every slide. Marp's base theme centers content
   vertically — which makes short slides drift their header to the middle — so
   the template overrides it. Only the **title slide** (`section.lead`) is
   vertically centered.
4. **Size figures to fit the safe area, not the whole slide.** The whole stack
   (kicker + heading + body + image + caption) must end **above** the footer
   band. Cap image height (~≤ 410px on a 720px slide) and size images by
   `max-height` so the border hugs the image — never `width: 100%`, which
   stretches a bordered box wider than the image and leaves dead space.
5. **Full-width body text.** Body copy (`.sub`, paragraphs) spans edge-to-edge
   with the same left/right margin. Only the large serif `.lede` statement line
   stays intentionally narrow.
6. **Verify before delivering.** Render PNG probes (`--images png`) and visually
   confirm on the busiest slides: nothing touches the footer, the bottom margin
   is clear, and the top header sits at the same height on a short slide and a
   full slide.

## The TopoLift Theme

Warm editorial brand modelled on [topolift.ai](https://topolift.ai/).

- **Type:** Spectral (serif display, with an italic rust emphasis word per
  heading), IBM Plex Sans (body), JetBrains Mono (labels/kickers).
- **Palette:** cream `#F4F0E8`, deep-navy ink `#0E1B2C`, rust accent `#8B2818`,
  peach `#E8A87C` (accent on dark).
- **Two modes — pick ONE per deck:**
  - **Light (default):** warm cream. Just write slides normally.
  - **Dark:** full-deck navy. Add a global `<!-- class: invert -->` directive
    right after the front-matter, and use `<!-- _class: lead invert -->` on the
    title slide. (`<!-- _class: invert -->` flips a single slide.)
- **Brand marks:** the TopoLift wordmark is a CSS background on every slide
  (footer, bottom-left); the title slide adds the topology mark as a hero
  graphic. Both are pure CSS — never paste inline `<svg>` into slide content
  (it renders as raw text in some viewers).

### Helper classes

| Class | Use |
|-------|-----|
| `.kicker` | mono uppercase section label (e.g. `01 · Ingest`) |
| `.lede` | large serif statement line (title/section slides); stays narrow |
| `.sub` | body sub-text under a heading; spans full width |
| `.metrics` / `.metric` | big-number row (`+525%` motif) |
| `.grid` + `.cols-2` / `.cols-3` + `.card` | card grids |
| `.pill` | small mono pill / tag |
| `.cap` | **optional** footer caption — a mono line pinned just above the wordmark. Absolutely positioned so it lands in the SAME spot on every slide. Omit the div and nothing renders. |

## Creating a Deck

1. **Start from the template.** Copy `assets/template-topolift.md` — it has all
   CSS embedded (no external files needed) and demonstrates the title slide,
   content slides, helper classes, and the optional caption.
2. **Title slide:** `<!-- _class: lead -->` + `<span class="kicker">` + `# H1`
   + `<div class="lede">`. The lead slide is centered (the only centered slide).
3. **Content slides:** kicker + `## H2` + content. They are top-aligned
   automatically — do not add vertical centering.
4. **One rust emphasis word per heading** via `*italics*` / `_italics_` in the
   h1/h2 (renders as the italic rust accent). Keep headings concise.
5. **Optional caption:** add `<div class="cap">short line</div>` on any slide
   for figure provenance or a one-line takeaway. It auto-pins above the footer.
6. **Images:** see `references/image-patterns.md`. Size figures per Rule 4 —
   hug the image with `max-height`, keep the whole stack above the footer band.
   For multiple images on one slide, give them an identical fixed rectangle so
   they look consistent (e.g. equal `width`/`height` + `object-fit: contain`).
7. **Body copy:** spans full width (Rule 5). 3–5 bullets per slide; break dense
   content across slides.
8. **Save** the `.md` and render (see Output). Then **verify** (Rule 6).

## Render & Output

Save the deck as a self-contained `.md` (CSS embedded). Render with Marp CLI:

```bash
npx @marp-team/marp-cli@latest deck.md --html --pdf --allow-local-files
# probes to verify layout:
npx @marp-team/marp-cli@latest deck.md --images png --allow-local-files -o probe.png
```

## Quality Checklist

Before delivering, verify:
- [ ] Built from `template-topolift.md`; CSS embedded in the file
- [ ] Title slide uses `<!-- _class: lead -->`; all other slides are top-aligned
- [ ] One mode only (all light, or all dark via global `<!-- class: invert -->`)
- [ ] **No content overlaps the footer**; bottom safe margin (≥80px) is clear
- [ ] Top header sits at the same height on a short slide and a full slide
- [ ] Figures hug their content; multi-image slides use a consistent rectangle
- [ ] Body text spans full width; only `.lede` is narrow
- [ ] Headings concise with a single rust emphasis word; 3–5 bullets per slide
- [ ] Busiest slides visually verified via a PNG probe

## Files

- `assets/template-topolift.md` — the deck template (embedded CSS, demo slides). **Start here.**
- `assets/theme-topolift.css` — the standalone theme (reference, or use via Marp `--theme-set`).
- `references/marp-syntax.md` — Marp/Marpit syntax (directives, front-matter, pagination)
- `references/image-patterns.md` — official image syntax (backgrounds, sizing, split)
- `references/advanced-features.md` — math, emoji, fragmented lists, Marp CLI, VS Code
- `references/best-practices.md` — general slide-quality guidelines
- `references/theme-css-guide.md` — how the theme CSS works (for understanding/adjusting the template)

## External Links

- Marp: https://marp.app/
- Marpit directives: https://marpit.marp.app/directives
- Marpit image syntax: https://marpit.marp.app/image-syntax
- Marp CLI: https://github.com/marp-team/marp-cli
- TopoLift: https://topolift.ai/
