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

Re-runs the upstream `npx gitnexus wiki` generator (the one whose narrative
output the user prefers) but routes its LLM calls through the local `claude`
CLI instead of an API-key-billed provider.

## How it works

1. A small OpenAI-compatible HTTP proxy starts on a random localhost port.
2. `npx gitnexus wiki` runs with `--provider custom --base-url http://localhost:<port>/v1`.
3. Each chat-completion request is translated into a single `claude --print`
   subprocess call — using the user's existing Claude Code authentication.
4. Proxy exits when the wiki finishes.

There is no daemon, no persistent process, and no API key. The wiki is
written to whatever path `gitnexus wiki` chooses (typically `wiki/` or
`docs/wiki/` depending on the project).

## Prerequisites

Verify before invoking:

1. cwd must be inside a gitnexus-indexed repo (`.gitnexus/` directory exists,
   walking up). If not, tell the user to run `npx gitnexus analyze` first
   and stop.
2. `claude`, `npx`, and `python3` must be on PATH. Fail loudly if not.

## Invocation

Always run from the project root:

```bash
~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki                         # default: sonnet, output at .gitnexus/wiki/
~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki haiku                   # use Haiku (faster)
~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki opus                    # use Opus (deeper prose)
~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki haiku --force           # force full regen
~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki haiku --out docs/wiki   # copy result to docs/wiki/ after
~/.claude/skills/gitnexus-wiki-claude/scripts/run-wiki haiku --out docs/wiki --force --verbose
```

`--out <dir>` (or `--out-dir <dir>`) copies the generated wiki to `<dir>` after `gitnexus wiki` finishes. Any path under the project root is fine; `<dir>` is created if missing and overwritten if it already exists. Any other args are forwarded to `npx gitnexus wiki`.

Note: `gitnexus wiki` always writes to `.gitnexus/wiki/` first — there's no output flag in the upstream tool. `--out` is a copy-after-generation step, not a redirect; the canonical copy in `.gitnexus/wiki/` stays put (the `index.html` viewer relies on it).

## Reading output

The script forwards `npx gitnexus wiki` stdout directly. Watch for:

- **First-time auth prompt**: `npx gitnexus wiki` may interactively ask for
  the LLM API key on first run if no saved config exists. With `--api-key
  dummy-claude-routed` set, the prompt is skipped — but if you see one
  anyway, the proxy isn't being detected and the user should investigate.
- **Generation timing**: typical small repo (~20 modules) ≈ 2–4 minutes.
  Most calls take 5–15 seconds via `claude --print`.
- **Failures**: if a call fails or times out, gitnexus usually prints the
  module name plus an error. The proxy log is at `/tmp/claude-proxy.log`
  for diagnostics.

## When NOT to use this skill

- The user wants the **verifier-first** wiki (the one at github.com/juanmlarios/gitnexus-wiki). Different tool, different output style.
- The user wants to hand-edit a single wiki page → use Edit, not this skill.
- The project hasn't been indexed → tell them to run `npx gitnexus analyze` first.
- The user already has an API key configured for `npx gitnexus wiki` and
  prefers that path → don't insist; this skill is for "I don't want to
  manage an API key" cases.

## Caveats

- The proxy translates OpenAI multi-turn `messages[]` to a single
  `claude --print` call. Multi-turn history collapses to one tagged user
  prompt. gitnexus only uses system+user pairs for wiki generation, so
  this is not lossy in practice.
- Streaming responses are not supported. gitnexus's wiki command does not
  require streaming.
- Token usage in proxy responses is approximated (chars/4). gitnexus's
  progress bars may show estimates rather than exact counts.
- Per-call latency is bounded by `claude --print` startup (~1–2s) plus
  generation time. No batching across requests.
