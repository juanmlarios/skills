---
name: gitnexus-ollama-index
description: Prepare a local Ollama embedding model and run GitNexus indexing or reindexing with embeddings. Use when the user asks to index a local project with GitNexus embeddings, reindex after code changes, force rebuild corrupt GitNexus data, verify or warm the Ollama embedding model before `gitnexus analyze --embeddings`, or explicitly remove and rebuild a GitNexus index.
---

# GitNexus Ollama Index

## Overview

Use this skill to make GitNexus embedding indexing repeatable: verify Ollama is reachable, warm the configured embedding model with a small embedding request, then run `gitnexus analyze --embeddings` for the target project.

The default model is `qwen3-embedding:0.6b`. The helper warms it through Ollama's `/api/embed` endpoint with a tiny text input and `keep_alive`; do not use a promptless `ollama run` as the primary warmup path because embedding requests are text-input driven and promptless runs can become interactive.

## Quick Start

Run from the project root unless the user provides a target path:

```bash
./.claude/skills/gitnexus-ollama-index/scripts/gitnexus-ollama-index
```

If the skill is installed globally:

```bash
~/.claude/skills/gitnexus-ollama-index/scripts/gitnexus-ollama-index
```

When working inside this source repository, the helper lives at:

```bash
skills/engineering/gitnexus-ollama-index/scripts/gitnexus-ollama-index
```

## Workflow

1. Resolve the target project from the user's request. If none is given, use the current working directory.
2. Verify `ollama`, `gitnexus`, and `python3` are on `PATH`.
3. Run the helper script from the target project root or pass the target path as the final argument.
4. Use normal indexing first:

```bash
gitnexus-ollama-index /path/to/project
```

5. If the user asks for a full rebuild or the previous index appears stale/corrupt, add `--force`:

```bash
gitnexus-ollama-index --force /path/to/project
```

6. Only remove an index when the user explicitly asks for remove/reset cleanup:

```bash
gitnexus-ollama-index --remove SecureLift-Agents --force /path/to/project
```

`--remove <target>` runs `gitnexus remove <target> --force` before indexing. Never infer this step from a generic "reindex" request.

## Helper Options

```bash
gitnexus-ollama-index [options] [path]

Options:
  --model <name>        Ollama embedding model. Default: qwen3-embedding:0.6b
  --keep-alive <value>  Ollama keep_alive value. Default: 30m
  --host <url>          Ollama host. Default: ${OLLAMA_HOST:-http://127.0.0.1:11434}
  --name <alias>        Forwarded to gitnexus analyze --name <alias>
  --force              Run gitnexus analyze --embeddings --force
  --remove <target>    Explicitly remove an index before analyzing
  --warm-only          Check and warm Ollama, then stop before GitNexus indexing
  --dry-run            Print intended commands without starting Ollama or indexing
  --verbose            Print detailed progress
```

The helper starts `ollama serve` when `/api/version` is unreachable. It logs that background server to `/tmp/gitnexus-ollama-index-ollama.log`.

If `ollama show <model>` fails, stop and tell the user to install the model:

```bash
ollama pull qwen3-embedding:0.6b
```

Do not pull models automatically.

## Failure Handling

- If `gitnexus analyze --embeddings` fails and `--force` was not used, retry with `--force` only when the user asked for a force rebuild or the failure looks like stale/corrupt index data.
- If forced analyze still fails, report the error and recommend explicit reset cleanup: `gitnexus-ollama-index --remove <repo-name-or-path> --force <path>`.
- Preserve the distinction between GitNexus' embedding backend and the Ollama warmup preflight. If `gitnexus doctor` reports a non-Ollama backend, state that the skill warmed Ollama but GitNexus may not be consuming it.
