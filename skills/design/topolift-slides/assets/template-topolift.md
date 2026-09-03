---
marp: true
theme: default
paginate: true
title: TopoLift Presentation
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --tl-bg: #F4F0E8;
  --tl-bg-deep: #ECE5D5;
  --tl-card: #ECE5D5;
  --tl-ink: #0E1B2C;
  --tl-muted: #5A5347;
  --tl-accent: #8B2818;
  --tl-accent-soft: rgba(139, 40, 24, 0.12);
  --tl-hairline: #C9C0AF;
  --tl-peach: #E8A87C;
  --tl-display: 'Spectral', 'EB Garamond', Georgia, serif;
  --tl-body: 'IBM Plex Sans', -apple-system, system-ui, 'Segoe UI', sans-serif;
  --tl-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace;
  --tl-logo: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 132 30'><circle cx='15' cy='15' r='12' fill='none' stroke='rgb(14,27,44)' stroke-width='1.3'/><circle cx='15' cy='15' r='6.5' fill='none' stroke='rgb(14,27,44)' stroke-width='1.3'/><circle cx='27' cy='12' r='1.8' fill='rgb(14,27,44)'/><circle cx='15' cy='15' r='2.6' fill='rgb(139,40,24)'/><text x='38' y='20' font-family='Georgia,serif' font-size='17' font-weight='500' fill='rgb(14,27,44)'>Topo<tspan fill='rgb(139,40,24)'>Lift</tspan></text></svg>");
  --tl-topomark: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 360'><g fill='none' stroke='rgb(139,40,24)' stroke-width='0.8' opacity='0.45'><circle cx='180' cy='180' r='140'/><circle cx='180' cy='180' r='92'/><circle cx='180' cy='180' r='50'/></g><g stroke='rgb(14,27,44)' stroke-width='0.8' fill='none' opacity='0.6'><path d='M60 220 Q 140 80 260 140 T 320 260'/><path d='M80 100 Q 200 200 300 90'/><path d='M100 300 Q 180 170 280 320'/></g><g fill='rgb(14,27,44)' opacity='0.6'><circle cx='60' cy='220' r='3.5'/><circle cx='260' cy='140' r='3.5'/><circle cx='320' cy='260' r='3.5'/><circle cx='80' cy='100' r='3.5'/><circle cx='300' cy='90' r='3.5'/><circle cx='100' cy='300' r='3.5'/><circle cx='280' cy='320' r='3.5'/></g><circle cx='180' cy='180' r='5' fill='rgb(139,40,24)'/></svg>");
}

section {
  background: var(--tl-logo) bottom 22px left 64px / 112px no-repeat, var(--tl-bg);
  color: var(--tl-ink);
  font-family: var(--tl-body);
  font-weight: 400; font-size: 23px; line-height: 1.55;
  /* TOP HEADER: content slides are top-aligned so the kicker/heading sits at a
     CONSISTENT distance from the top on every slide. Without this, Marp's base
     theme centers content vertically and short slides drift their header down.
     FOOTER SAFE ZONE: padding-bottom reserves a clear band for the wordmark. */
  display: flex; flex-direction: column; justify-content: flex-start;
  padding: 40px 72px 92px; letter-spacing: .1px;
}
section img { max-height: 410px; height: auto; }
/* Title (.lead) stays vertically centered — see section.lead below. */

h1, h2, h3, h4 { font-family: var(--tl-display); color: var(--tl-ink); font-weight: 500; margin: 0; }
h1 { font-size: 50px; line-height: 1.1; letter-spacing: -.5px; margin-bottom: .35em; }
h2 { font-size: 35px; line-height: 1.15; padding-bottom: .4em; margin-bottom: .7em; border-bottom: 1px solid var(--tl-hairline); }
h3 { font-size: 24px; font-weight: 600; margin: .3em 0 .35em; }
h1 em, h2 em, h3 em { font-style: italic; font-weight: 400; color: var(--tl-accent); }

p { margin: .5em 0; }
strong { color: var(--tl-accent); font-weight: 600; }
em { font-style: italic; color: var(--tl-accent); }
a { color: var(--tl-accent); text-decoration: none; border-bottom: 1px solid var(--tl-hairline); }
a:hover { border-color: var(--tl-peach); }
ul, ol { padding-left: 1.4em; margin: .4em 0; }
li { margin: .35em 0; }
li::marker { color: var(--tl-accent); }
blockquote { border-left: 3px solid var(--tl-accent); margin: .6em 0; padding: .2em 0 .2em 1em; font-family: var(--tl-display); font-style: italic; font-size: 1.15em; }

code { font-family: var(--tl-mono); font-size: .85em; background: var(--tl-accent-soft); color: var(--tl-accent); padding: .08em .4em; border-radius: 4px; }
pre { background: var(--tl-ink); color: #E7E2D6; border-radius: 10px; padding: 18px 20px; font-family: var(--tl-mono); font-size: 16px; line-height: 1.5; border: 1px solid var(--tl-hairline); }
pre code { background: transparent; color: inherit; padding: 0; }

table { width: 100%; border-collapse: collapse; font-size: 19px; }
th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--tl-hairline); }
th { font-family: var(--tl-mono); font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: .6px; color: var(--tl-muted); }

section::after { content: attr(data-marpit-pagination); font-family: var(--tl-mono); font-size: 13px; color: var(--tl-muted); right: 40px; bottom: 28px; }
footer { font-family: var(--tl-mono); font-size: 13px; color: var(--tl-muted); left: 72px; bottom: 28px; letter-spacing: .5px; }
/* OPTIONAL footer caption above the wordmark — <div class="cap">…</div>. Absolutely
   pinned so it lands in the SAME spot on every slide (consistent caption spacing).
   Optional: omit the div and nothing renders. */
.cap { position: absolute; left: 72px; bottom: 56px; margin: 0; font-family: var(--tl-mono); font-size: 13px; color: var(--tl-muted); letter-spacing: .5px; text-transform: uppercase; }

.kicker { font-family: var(--tl-mono); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 2.5px; color: var(--tl-accent); margin-bottom: 14px; display: block; }
.brand { font-family: var(--tl-display); font-weight: 500; color: var(--tl-ink); }
.brand .accent { color: var(--tl-accent); }
.lede { font-family: var(--tl-display); font-weight: 400; font-size: 33px; line-height: 1.3; color: var(--tl-ink); max-width: 24ch; }
.lede em { font-style: italic; color: var(--tl-accent); }
.pill { display: inline-block; font-family: var(--tl-mono); font-size: 13px; letter-spacing: .5px; color: var(--tl-accent); background: var(--tl-accent-soft); border: 1px solid var(--tl-accent); border-radius: 999px; padding: 4px 14px; }

.metrics { display: flex; gap: 48px; margin: 14px 0; }
.metric .value { font-family: var(--tl-display); font-weight: 500; font-size: 52px; line-height: 1; color: var(--tl-accent); }
.metric .label { font-family: var(--tl-mono); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--tl-muted); margin-top: 8px; }

.grid { display: grid; gap: 18px; margin: 8px 0; }
.cols-2 { grid-template-columns: 1fr 1fr; }
.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
.card { background: var(--tl-card); border: 1px solid var(--tl-hairline); border-radius: 12px; padding: 18px 20px; }
.card .num { font-family: var(--tl-mono); font-size: 13px; color: var(--tl-accent); letter-spacing: 1px; }
.card h3 { margin: 6px 0 4px; }
.card p { margin: 0; color: var(--tl-muted); font-size: 18px; line-height: 1.4; }

section.lead { display: flex; flex-direction: column; justify-content: center; background: var(--tl-logo) bottom 22px left 64px / 112px no-repeat, var(--tl-topomark) center right 52px / 300px no-repeat, radial-gradient(680px 480px at 88% 50%, var(--tl-bg-deep) 0%, var(--tl-bg) 60%); }
section.lead h1 { font-size: 64px; max-width: 17ch; }
section.lead .lede { color: var(--tl-muted); margin-top: 10px; }

section.invert {
  --tl-logo: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 132 30'><circle cx='15' cy='15' r='12' fill='none' stroke='rgb(244,240,232)' stroke-width='1.3'/><circle cx='15' cy='15' r='6.5' fill='none' stroke='rgb(244,240,232)' stroke-width='1.3'/><circle cx='27' cy='12' r='1.8' fill='rgb(244,240,232)'/><circle cx='15' cy='15' r='2.6' fill='rgb(232,168,124)'/><text x='38' y='20' font-family='Georgia,serif' font-size='17' font-weight='500' fill='rgb(244,240,232)'>Topo<tspan fill='rgb(232,168,124)'>Lift</tspan></text></svg>");
  --tl-topomark: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 360 360'><g fill='none' stroke='rgb(232,168,124)' stroke-width='0.8' opacity='0.45'><circle cx='180' cy='180' r='140'/><circle cx='180' cy='180' r='92'/><circle cx='180' cy='180' r='50'/></g><g stroke='rgb(244,240,232)' stroke-width='0.8' fill='none' opacity='0.6'><path d='M60 220 Q 140 80 260 140 T 320 260'/><path d='M80 100 Q 200 200 300 90'/><path d='M100 300 Q 180 170 280 320'/></g><g fill='rgb(244,240,232)' opacity='0.6'><circle cx='60' cy='220' r='3.5'/><circle cx='260' cy='140' r='3.5'/><circle cx='320' cy='260' r='3.5'/><circle cx='80' cy='100' r='3.5'/><circle cx='300' cy='90' r='3.5'/><circle cx='100' cy='300' r='3.5'/><circle cx='280' cy='320' r='3.5'/></g><circle cx='180' cy='180' r='5' fill='rgb(232,168,124)'/></svg>");
  background: var(--tl-logo) bottom 22px left 64px / 112px no-repeat, var(--tl-ink);
  color: var(--tl-bg);
}
section.invert h1, section.invert h2, section.invert h3 { color: var(--tl-bg); border-color: rgba(244,240,232,.18); }
section.invert h1 em, section.invert h2 em, section.invert em, section.invert strong { color: var(--tl-peach); }
section.invert .kicker { color: var(--tl-peach); }
section.invert .lede { color: var(--tl-bg); }
section.invert li::marker { color: var(--tl-peach); }
section.invert .pill { color: var(--tl-peach); border-color: var(--tl-peach); background: rgba(232,168,124,.12); }
section.invert .card { background: rgba(244,240,232,.05); border-color: rgba(244,240,232,.18); }
section.invert .card p { color: rgba(244,240,232,.7); }
section.invert .metric .value { color: var(--tl-peach); }
section.invert::after { color: rgba(244,240,232,.5); }
section.lead.invert { background: var(--tl-logo) bottom 22px left 64px / 112px no-repeat, var(--tl-topomark) center right 52px / 300px no-repeat, radial-gradient(680px 480px at 88% 50%, #16263A 0%, var(--tl-ink) 60%); }
section.lead.invert .lede { color: rgba(244,240,232,.7); }
</style>

<!--
  TWO MODES — pick ONE per deck for a consistent look:
    LIGHT (default): write slides normally (this template is light mode).
    DARK: add a global  "class: invert"  HTML-comment directive right after the
          front-matter to flip the whole deck navy; use  "_class: lead invert"  on the title.
  The final slide is a one-off DARK showcase so you can see the mode; in a real deck,
  keep every slide in the same mode.
  Reusable brand mark: copy the topo-mark div from the title slide onto any slide.
-->

<!-- _class: lead -->
<!-- _paginate: false -->

<span class="kicker">TopoLift · A new layer</span>

# Your AI thinks in _tokens_. Your business runs on relationships.

<div class="lede">The structural reasoning layer that sits between your data and your AI.</div>

---

<!-- _paginate: false -->

<span class="kicker">01 — The problem</span>

# Not a model. Not a tool. A *new layer*.

<div class="lede">Where models <em>approximate</em>, TopoLift verifies. Where retrieval <em>guesses</em>, TopoLift grounds.</div>

---

## What it _changes_

<div class="grid cols-3">
<div class="card">
<span class="num">01 / Precision</span>
<h3>Act with confidence</h3>
<p>Decisions grounded in your actual operations — not generic internet patterns.</p>
</div>
<div class="card">
<span class="num">02 / Provenance</span>
<h3>Trace every output</h3>
<p>Anchored to a verifiable reasoning path — auditable, defensible, repeatable.</p>
</div>
<div class="card">
<span class="num">03 / Trust</span>
<h3>Stop the inventing</h3>
<p>Give your agents a map and they stop hallucinating terrain.</p>
</div>
</div>

---

## The lift, in _numbers_

<div class="metrics">
<div class="metric"><div class="value">+525%</div><div class="label">Structural reasoning lift</div></div>
<div class="metric"><div class="value">+111%</div><div class="label">Reasoning improvement</div></div>
<div class="metric"><div class="value">1%</div><div class="label">Critical data identified</div></div>
</div>

> Every generation of AI has been limited not by compute — but by representation.

- **Information entropy** — knowledge is real, but unmapped.
- **Context collapse** — locally correct, globally disastrous actions.
- **Discovery bottleneck** — the 1% that matters stays buried.

<!-- OPTIONAL: the .cap line is pinned just above the wordmark and lands in the
     SAME place on every slide. Drop it on any slide for a source/takeaway line. -->
<div class="cap">optional footer caption · same spot on every slide</div>

---

<!-- _class: invert -->
<!-- ↑ DARK MODE showcase. Remove this line for an all-light deck, or apply it to every slide for an all-dark deck. -->

<span class="kicker">Dark mode · Deploy</span>

# Topological certainty for the *agentic enterprise*.

<span class="pill">Design partners welcome</span>
