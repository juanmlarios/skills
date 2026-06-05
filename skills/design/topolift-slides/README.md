# TopoLift Slides

A Claude Code / Codex skill for creating polished, on-brand **TopoLift**
presentations with [Marp](https://marp.app/).

This skill has a **single template** — the TopoLift brand theme. There is no
theme picker: every deck is TopoLift-branded and follows one set of layout
rules. See `SKILL.md` for the full instructions.

## What it does

- Builds TopoLift-branded decks from `assets/template-topolift.md` (CSS embedded,
  no external files).
- Two modes per deck: **light** (warm cream, default) or **dark** (full-deck
  navy, via a global `<!-- class: invert -->`).
- Enforces the brand layout rules on every slide (see below).
- Renders to HTML / PDF / PNG with the Marp CLI.

## The TopoLift brand

- **Type:** Spectral (serif display, italic rust emphasis), IBM Plex Sans
  (body), JetBrains Mono (labels).
- **Palette:** cream `#F4F0E8`, deep-navy `#0E1B2C`, rust `#8B2818`, peach
  `#E8A87C` (accent on dark).
- **Marks:** TopoLift wordmark footer on every slide; topology hero mark on the
  title slide. Both are pure CSS — never inline `<svg>` in slide content.
- **Helpers:** `.kicker`, `.lede`, `.sub`, `.metrics`, `.card` grid, `.pill`,
  and the optional pinned `.cap` footer caption.

## Layout rules (always enforced)

1. **Never overlap the footer** — page number + wordmark stay clear.
2. **Bottom safe margin** — a clear band (~92px) is reserved; nothing crowds it.
3. **Consistent top-header spacing** — content slides are top-aligned so the
   header sits at the same height on every slide; only the title slide centers.
4. **Figures hug their content** — size by `max-height`, keep the stack above
   the footer; multi-image slides use one consistent rectangle.
5. **Full-width body text** — body copy spans edge-to-edge; only `.lede` is narrow.
6. **Verify** — render PNG probes and check the busiest slides before delivering.

## Usage

Ask the agent (or trigger `/topolift-slides`):

```text
Create a 10-slide TopoLift deck about <topic>.
```

Render the generated `.md`:

```bash
npx @marp-team/marp-cli@latest deck.md --html --pdf --allow-local-files
# verify layout:
npx @marp-team/marp-cli@latest deck.md --images png --allow-local-files -o probe.png
```

For a dark deck, add `<!-- class: invert -->` right after the front-matter and
`<!-- _class: lead invert -->` on the title slide.

## File structure

```text
topolift-slides/
├── SKILL.md                     # Skill instructions (start here)
├── README.md                    # This file
├── assets/
│   ├── template-topolift.md     # The deck template (embedded CSS, demo slides)
│   └── theme-topolift.css       # Standalone theme (reference / --theme-set)
└── references/
    ├── marp-syntax.md           # Marp/Marpit syntax
    ├── image-patterns.md        # Image syntax patterns
    ├── advanced-features.md     # Math, emoji, fragmented lists, CLI
    ├── best-practices.md        # Slide-quality guidelines
    └── theme-css-guide.md       # How the theme CSS works
```

## Output

Decks are self-contained `.md` files with embedded CSS — ready for the Marp CLI
or the VS Code Marp extension, exportable to HTML, PDF, or PPTX.
