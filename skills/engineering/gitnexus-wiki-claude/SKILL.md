---
name: gitnexus-wiki-claude
description: Regenerate or refresh a project's gitnexus wiki using the user's
  local Claude Code CLI as the LLM (no API key required). Use when the user
  says "regenerate the wiki", "rebuild docs/wiki", "refresh the gitnexus
  wiki", "regenerate the auto-wiki", or asks to update the auto-generated
  wiki after refactors. Works in any repository that has been indexed with
  `npx gitnexus analyze`.
---

# gitnexus-wiki-claude skill

Regenerate the upstream GitNexus wiki while routing its OpenAI-compatible provider requests through the user's local `claude` CLI. This uses the user's existing Claude Code authentication rather than an API key.

## Preconditions and invocation

Work from the project root. Confirm the repository is indexed (`.gitnexus/` exists when walking upward) and that `claude`, `npx`, and `python3` are on `PATH`; otherwise stop with the missing prerequisite.

Resolve `run-wiki` from the executable project-local path first, then the executable global path. Its first argument is always the model, so require an explicit model before any flags:

```bash
./.claude/skills/gitnexus-wiki-claude/scripts/run-wiki sonnet [--force] [--out dir]
# or
~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki sonnet [--force] [--out dir]
```

The helper starts a temporary localhost OpenAI-compatible proxy and invokes `npx gitnexus wiki` with `--provider openai` through that local compatible proxy; each completion is served by one `claude --print` call. It is not an OpenAI account or API-key provider, and the proxy exits with the command.

GitNexus always generates the canonical wiki in `.gitnexus/wiki/`. `--out <dir>`/`--out-dir <dir>` copies that result after generation; it is not a redirect. Before invoking the helper, require an exact `--out` destination explicitly supplied by the user, resolve it, and obtain explicit authorization before it can be replaced. Reject the repository root, `.git`, `.gitnexus/wiki`, any ancestor of those paths, and any destination not explicitly supplied by the user. A new, explicitly supplied destination under the project root needs no extra replacement confirmation. Forward other arguments to `npx gitnexus wiki`.

## Evidence and done

Success requires a successful helper exit, GitNexus generation output without module errors, and the expected `.gitnexus/wiki/` output (plus the authorized `--out` copy, if requested). Report the output path(s) and exit/result evidence.

On failure, preserve the command error and affected module if shown; inspect `/tmp/claude-proxy.log` when proxy diagnostics are needed. Stop rather than claiming a partial wiki is complete.

## Boundaries

Use a different tool when the user wants the verifier-first wiki or a hand-edit to one page. Do not use this path for an unindexed repository. The proxy supports the system/user request shape GitNexus uses for wiki generation; streaming is not supported and displayed token counts are estimates.
