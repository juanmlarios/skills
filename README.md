# Skills

This repository contains Codex/Claude-compatible skills for GitNexus-assisted
engineering workflows, plus presentation and design tooling.

## Skills

### `gitnexus-wiki-claude`

Regenerates a GitNexus wiki with the upstream `npx gitnexus wiki` command, but
routes the LLM calls through the local Claude Code CLI. It is for projects that
have already been indexed with `npx gitnexus analyze` and where the user wants
wiki output without configuring a separate API key.

### `improve-codebase-architecture`

Finds deepening opportunities in a codebase using GitNexus exploration,
project domain language from `CONTEXT.md`, and decisions from `docs/adr/`.
Use it when you want to improve architecture, find refactoring opportunities,
consolidate tightly-coupled modules, or make a codebase more testable and
AI-navigable.

The skill uses GitNexus to inspect repo context, clusters, execution flows,
symbol context, and upstream impact before proposing architecture candidates.
It keeps the recommendations framed in terms of modules, interfaces, seams,
adapters, depth, leverage, and locality.

### `agent-config`

Installs and maintains custom Claude/Pi agents, shared GitNexus + Context Mode
instructions, and Claude Code hooks. Use it to keep agent roles and routing
policy reproducible across machines.

### `orchestrate`

Runs long Claude Code sessions as an Opus-driven orchestrator that delegates
searches to Haiku sub-agents and implementation / deep-research work to Sonnet
sub-agents. Keeps the orchestrator's context window compact so the session can
run for hours without hitting compaction. Use it at the start of any session
that will involve multi-step work, parallel investigation, planning plus
implementation, or anything where context bloat would otherwise force an early
compact. Trigger with `/orchestrate`.

### `teach`

Teaches the user a new skill or concept in a workspace, using missions,
resources, lessons, references, and learning records to keep learning stateful.

### `topolift-slides`

Creates on-brand **TopoLift** [Marp](https://marp.app/) slide decks from a
single template — there is no theme selection. Use it to build a presentation,
turn notes or a doc into a TopoLift deck, or restyle an existing deck into the
brand. Trigger with `/topolift-slides` or phrases like "create slides" /
"make a deck".

The TopoLift theme is a warm editorial design modelled on
[topolift.ai](https://topolift.ai/): Spectral serif display with italic rust
emphasis, IBM Plex Sans body, JetBrains Mono labels, a cream/navy/rust palette,
and the topology brand mark. It has two modes — light (cream) by default or a
full-deck dark (navy) treatment via a global `<!-- class: invert -->`.

Every deck the skill produces respects these baked-in layout rules
(`SKILL.md` → "Critical Layout Rules"):

- **Footer safe zone** — no content (text, image, table, caption) ever overlaps
  or crowds the bottom footer; a clear bottom margin is always reserved.
- **Consistent top-header spacing** — content slides are top-aligned so the
  kicker/heading sits at the same height on every slide (Marp's base theme
  centers content vertically, which makes short slides drift; only the title
  slide stays centered).
- **Optional pinned caption** — a `.cap` line above the wordmark, absolutely
  positioned so it lands in the exact same spot on every slide.
- **Full-width body text** — body copy spans edge-to-edge with symmetric
  left/right margins; only the large serif `.lede` stays intentionally narrow.

## Contents

```text
skills/
  engineering/
    gitnexus-wiki-claude/
      SKILL.md
      scripts/
        proxy.py
        run-wiki
    improve-codebase-architecture/
      SKILL.md
      DEEPENING.md
      INTERFACE-DESIGN.md
      LANGUAGE.md
    agent-config/
      SKILL.md
      README.md
      assets/
        agents/       # Claude and Pi custom agent definitions
        instructions/
      hooks/
        claude/
      scripts/
        sync-agent-config.mjs
    orchestrate/
      SKILL.md
  productivity/
    teach/
      SKILL.md
      GLOSSARY-FORMAT.md
      LEARNING-RECORD-FORMAT.md
      MISSION-FORMAT.md
      RESOURCES-FORMAT.md
  design/
    topolift-slides/
      SKILL.md
      README.md
      assets/        # template-topolift.md + theme-topolift.css
      references/    # marp syntax, image patterns, best practices, theme guides
```

## Install

Install the skill from this repository with the skills CLI.

For a project-local install:

```bash
npx skills@latest add juanmlarios/skills
```

For a global install:

```bash
npx skills@latest add juanmlarios/skills -g
```

After installing `agent-config`, run its sync script to install the Claude/Pi
agents, shared instructions, and Claude Code hooks. Project-local installs use `./.claude/...`
from the target project root; global installs use `~/.claude/...`.

## Usage: `gitnexus-wiki-claude`

Run the helper script from the root of the repository whose wiki you want to
refresh:

If you installed the skill into the current project:

```bash
./.claude/skills/gitnexus-wiki-claude/scripts/run-wiki
```

If you installed the skill globally:

```bash
~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki
```

Common options:

```bash
./.claude/skills/gitnexus-wiki-claude/scripts/run-wiki haiku
./.claude/skills/gitnexus-wiki-claude/scripts/run-wiki opus
./.claude/skills/gitnexus-wiki-claude/scripts/run-wiki sonnet --force
./.claude/skills/gitnexus-wiki-claude/scripts/run-wiki haiku --out docs/wiki
```

`--out <dir>` copies the generated wiki from `.gitnexus/wiki/` to another
directory after generation finishes.

If you see `no such file or directory: ~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki`,
the skill was probably installed project-locally. Run the `./.claude/...`
command from that project root, or reinstall with `-g` for the global path.

## Requirements

- A GitNexus-indexed project: run `npx gitnexus analyze` first if `.gitnexus/`
  does not exist.
- `claude`, `npx`, and `python3` available on `PATH`.
- Claude Code already authenticated locally.

## How It Works

`scripts/run-wiki` starts a small OpenAI-compatible localhost proxy, invokes
`npx gitnexus wiki` against that proxy, and forwards each chat-completion
request to `claude --print`. The proxy exits when the wiki command completes.

No daemon is left running and no API key is required.

## Usage: `improve-codebase-architecture`

Ask Codex or Claude to use the skill while working in a GitNexus-indexed
project:

```text
Use the improve-codebase-architecture skill to find deepening opportunities in this codebase.
```

The target project should have been analyzed with GitNexus:

```bash
npx gitnexus analyze
```

The skill first reads `CONTEXT.md` and relevant ADRs, then uses GitNexus repo
context, clusters, process traces, symbol context, and impact analysis to build
an evidence-backed list of architecture candidates. It asks which candidate to
explore before proposing concrete interfaces.

## Usage: `agent-config`

If you installed the skill into the current project, preview and then apply the
shared routing policy and Claude Code hook configuration from that project root:

```bash
node ./.claude/skills/agent-config/scripts/sync-agent-config.mjs --dry-run
node ./.claude/skills/agent-config/scripts/sync-agent-config.mjs
```

If you installed the skill globally:

```bash
node ~/.claude/skills/agent-config/scripts/sync-agent-config.mjs --dry-run
node ~/.claude/skills/agent-config/scripts/sync-agent-config.mjs
```

If you are developing directly from this source checkout:

```bash
node ~/GitHub/skills/skills/engineering/agent-config/scripts/sync-agent-config.mjs --dry-run
node ~/GitHub/skills/skills/engineering/agent-config/scripts/sync-agent-config.mjs
```

The script installs Claude agents in `~/.claude/agents/`, Pi agents in
`~/.pi/agent/agents/`, writes global instruction files, copies the custom
`PreToolUse` dispatcher, and patches Claude Code settings. It refuses to replace
same-named unmanaged agents unless you explicitly add `--force-agents`.

Verify the installed configuration:

```bash
node ./.claude/skills/agent-config/scripts/doctor-agent-config.mjs
node ~/.claude/skills/agent-config/scripts/doctor-agent-config.mjs
node ~/GitHub/skills/skills/engineering/agent-config/scripts/doctor-agent-config.mjs
```

Use the path that matches how you installed the skill. Restart Claude Code after
hook changes, and start a new Codex session after global instruction changes.

## Usage: `orchestrate`

`orchestrate` is an Opus-driven session pattern. The skill itself is just a
`SKILL.md` — no scripts, no hooks. It activates when you invoke `/orchestrate`
in Claude Code (or ask Codex to use the skill by name) at the start of a long
session.

The pattern, in one line: **Opus drives, Haiku searches, Sonnet implements.**

Once activated, the orchestrating model (you want this to be Opus) will:

- Push searches, file lookups, and "where is X" questions to Haiku sub-agents
  (typically the `Explore` agent type).
- Push implementation, multi-file edits, code review, and deep research to
  Sonnet sub-agents (typically `general-purpose` with `model: "sonnet"`).
- Keep its own context window lean for orchestration, planning, decisions, and
  user conversation — letting the session run for hours without compaction.

The skill also codifies the supporting workflow patterns we keep using:

- Plan → Spike → Implement → Review → Commit phasing.
- Brief sub-agents like a smart colleague who just walked into the room
  (self-contained prompts with file paths, prior findings, and explicit "write
  the code, don't just plan" framing when implementation is wanted).
- Verify-then-summarize after any sub-agent writes code (spot-check the diff,
  run tests).
- Authorization gates for commits, pushes, destructive git operations, hook
  skipping, and production actions.
- Parallel dispatch — when multiple sub-agents have independent work, send them
  in one message with multiple `Agent` tool-use blocks.

There is nothing to run. Activate the skill, then describe the work; the
orchestrating model will set up sub-agents instead of doing the bulk work
itself.

## Usage: `topolift-slides`

Ask Claude or Codex to build a deck, or trigger with `/topolift-slides`:

```text
Create a 10-slide TopoLift deck about <topic>.
```

The skill builds from the single TopoLift template, structures the content, and
writes a self-contained `.md` with embedded CSS — no external files needed.
Render it with the Marp CLI:

```bash
npx @marp-team/marp-cli@latest deck.md --html --pdf --allow-local-files
```

For the TopoLift brand theme, start a dark deck by adding a global
`<!-- class: invert -->` directive right after the front-matter (and
`<!-- _class: lead invert -->` on the title slide). The layout rules — footer
safe-zone, top-header alignment, optional pinned `.cap` caption, and full-width
body text — are part of the theme, so every deck inherits them automatically.

When iterating, render PNG probes (`--images png`) and visually verify the
busiest slides: nothing should touch the footer, and the top header should sit
at the same height on a short slide and a full one.
