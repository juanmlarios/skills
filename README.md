# GitNexus Wiki Claude Skill

This repository contains one Codex/Claude-compatible skill:
`gitnexus-wiki-claude`.

The skill regenerates a GitNexus wiki with the upstream `npx gitnexus wiki`
command, but routes the LLM calls through the local Claude Code CLI. It is for
projects that have already been indexed with `npx gitnexus analyze` and where
the user wants wiki output without configuring a separate API key.

## Contents

```text
skills/
  engineering/
    gitnexus-wiki-claude/
      SKILL.md
      scripts/
        proxy.py
        run-wiki
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

## Usage

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
