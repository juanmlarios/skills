# Skills

This repository contains Codex/Claude-compatible skills for GitNexus-assisted
engineering workflows.

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
