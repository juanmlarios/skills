---
name: gitnexus-wiki-claude
description: Regenerate or refresh a project's gitnexus wiki using the user's
  local Claude Code CLI as the LLM (no API key required). Use when the user
  says "regenerate the wiki", "rebuild docs/wiki", "refresh the gitnexus
  wiki", "regenerate the auto-wiki", or asks to update the auto-generated
  wiki after refactors. Works in any repository that has been indexed with
  `npx gitnexus analyze`.
disable-model-invocation: true
---

# gitnexus-wiki-claude skill

Re-runs the upstream `gitnexus wiki` generator but routes its LLM calls through the local `claude` CLI, so it uses the user's existing Claude Code authentication instead of an API-key-billed provider.

## How it works

1. `scripts/run-wiki` starts a small OpenAI-compatible HTTP proxy on a random localhost port.
2. It runs `npx gitnexus wiki --provider openai --base-url http://127.0.0.1:<port>/v1 --api-key dummy-claude-routed --model <model>`.
3. Each chat-completion request becomes one `claude --print` subprocess call.
4. The proxy exits when the wiki finishes. No daemon, no persistent process, no API key.

GitNexus always writes the canonical wiki to `.gitnexus/wiki/` (the `index.html` viewer relies on it). `--out <dir>` / `--out-dir <dir>` is a copy-after-generation step, not a redirect.

## Prerequisites

Check before invoking; stop and name the missing piece otherwise:

- cwd is inside a GitNexus-indexed repo (`.gitnexus/` exists walking upward). If not, tell the user to run `npx gitnexus analyze` first.
- `claude`, `npx`, and `python3` are on `PATH`.

## Invocation

Run from the project root. Resolve the helper in this order: `./.claude/skills/gitnexus-wiki-claude/scripts/run-wiki` (project-local install) if executable, else `~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki` (global install), else stop and tell the user to install the skill.

The first positional argument is the model and defaults to `sonnet`; flags follow it. Anything not recognised is forwarded to `npx gitnexus wiki`.

```bash
run-wiki                              # sonnet, output at .gitnexus/wiki/
run-wiki haiku                        # faster
run-wiki opus                         # deeper prose
run-wiki haiku --force                # force full regeneration
run-wiki haiku --out docs/wiki        # also copy the result to docs/wiki/
run-wiki haiku --out docs/wiki --force --verbose
```

`--out` overwrites the destination, so it needs a destination the user actually named: refuse the repository root, `.git`, `.gitnexus/wiki`, or any ancestor of those. A new directory under the project root that the user supplied needs no further confirmation; replacing an existing one that the user did not name in this session does.

## Reading output

The helper forwards `gitnexus wiki` stdout. Watch for:

- **An API-key prompt.** `--api-key dummy-claude-routed` should suppress it; if it appears anyway, the proxy is not being detected — stop and investigate rather than typing a key.
- **Timing.** A small repo (~20 modules) takes 2–4 minutes; most calls take 5–15 s via `claude --print`.
- **Failures.** GitNexus prints the module name plus an error. The proxy log is `/tmp/claude-proxy.log`.

Done means: the helper exited 0, generation output shows no module errors, `.gitnexus/wiki/` is populated (plus the `--out` copy if requested). Report the output path(s) and the exit evidence. A partial wiki is not done — say what failed.

## When NOT to use this skill

- The user wants the verifier-first wiki (github.com/juanmlarios/gitnexus-wiki) — different tool, different output.
- The user wants to hand-edit one wiki page — use Edit.
- The repo isn't indexed — `npx gitnexus analyze` first.
- The user already has an API key configured for `gitnexus wiki` and prefers it — don't insist.

## Caveats

- The proxy collapses OpenAI multi-turn `messages[]` into one tagged `claude --print` prompt. GitNexus only sends system+user pairs, so nothing is lost in practice.
- Streaming is not supported (GitNexus doesn't need it). Token counts in proxy responses are estimates (chars/4), so progress bars are approximate.
- Per-call latency is bounded by `claude --print` startup (~1–2 s) plus generation; there is no batching.
