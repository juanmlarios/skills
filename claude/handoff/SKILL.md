---
name: handoff
description: Compact the current conversation into a harness-agnostic handoff markdown document. With --start, optionally launch a fresh unforked Pi, Claude+Headroom, or Codex+Headroom session and direct it through the generic pickup skill.
argument-hint: "[focus for next session] [--start|--tab] [--pi|--claude-headroom|--codex-headroom|--target pi|claude-headroom|codex-headroom]"
---

# Handoff

Write a handoff document summarizing the current conversation so a fresh agent can continue work.

## Default behavior

1. Save a markdown handoff document to a temporary OS directory, not the current workspace.
2. Include:
   - Goal / user intent
   - Completed work
   - Current state and important paths/commands
   - Open decisions, blockers, risks
   - Next executable action
   - Active workplan capsule state (RUN.md, PARKED.md) when applicable
   - Relevant domain skills, kept separate from orchestration selection
   - An **Orchestration continuation** section with:
     - `Previous/current orchestration skill`: the orchestration used in this session, or `none/direct`
     - `Requested continuation`: `same-equivalent`, an exact skill name, `none/direct`, or `ask-user`
     - `Harness mapping`: Claude `orchestrate`, Codex `codex-orchestrate`, Pi `pi-orchestrate`, unless the user specified different equivalents
     - Any reason, execution constraint, or unresolved choice affecting that selection
   - Prior-session authorizations that must be reconfirmed, especially commits, pushes, destructive git, production actions, credentials, and live-cost actions
3. Record the active orchestration accurately; do not infer one merely because work is non-trivial. If no continuation approach was chosen, use `ask-user`.
4. Do not duplicate content already captured in artifacts (PRDs, plans, ADRs, issues, commits, diffs). Reference by path or URL.
5. Redact secrets, API keys, passwords, tokens, and unnecessary personal information.
6. If arguments are provided, treat non-flag text as the next-session focus and tailor the document.
7. Reply with the handoff markdown path.

No flags means exactly this default behavior: write the markdown only.

## Launch flags

Only launch a new session when the user passes `--start` or `--tab`.

- `--start`: write the markdown, then launch a fresh session in a Warp split pane.
- `--tab`: same as `--start`, but launch in a new Warp tab.
- `--pi`, `--claude-headroom`, and `--codex-headroom` select the launch target directly. `--target <target>` remains a backward-compatible alias.
- With no target selector, default to `pi`. Reject conflicting selectors before launch.
- `pi`: launch `pi '/skill:pickup <handoff-path>'`.
- `claude-headroom`: launch Claude through Headroom: `headroom wrap claude --no-proxy --no-serena --dangerously-skip-permissions '<pickup prompt>'`.
- `codex-headroom`: launch Codex through Headroom: `headroom wrap codex --no-proxy --no-serena -- '$pickup <handoff-path>'`.

Direct `claude` and `codex` targets are intentionally unsupported. Never bypass the Headroom wrapper for either harness.

Never use `--fork`, `/fork`, `/clone`, `--continue`, or any session-resume flag for launch mode. The new session must be fresh/unforked.

For Claude+Headroom, preserve this pickup prompt:

```text
Use the pickup skill to resume from the handoff markdown at <handoff-path>. Recover the current state and follow its Orchestration continuation section. If that section is missing or ambiguous, ask which orchestration approach to use before starting non-trivial work.
```

For Codex+Headroom, pass the literal skill invocation `$pickup <handoff-path>` as the initial prompt. Do not use `/pickup` or replace it with a natural-language approximation.

## Build the launch command

After creating the handoff document, normalize the direct selector or `--target` alias into `TARGET`, then set `HANDOFF_PATH` to its absolute path (`pi` when omitted):

```bash
HANDOFF_PATH="/absolute/path/to/handoff.md"
TARGET="pi" # pi | claude-headroom | codex-headroom
CMD=$(HANDOFF_PATH="$HANDOFF_PATH" TARGET="$TARGET" python3 - <<'PY'
import os, shlex, shutil
cwd = os.getcwd()
handoff = os.environ["HANDOFF_PATH"]
target = os.environ.get("TARGET") or "pi"
pi = shutil.which("pi") or "pi"
headroom = shutil.which("headroom") or "headroom"
claude_pickup = f"Use the pickup skill to resume from the handoff markdown at {handoff}. Recover the current state and follow its Orchestration continuation section. If that section is missing or ambiguous, ask which orchestration approach to use before starting non-trivial work."
codex_pickup = f"$pickup {shlex.quote(handoff)}"
if target == "pi":
    argv = [pi, f"/skill:pickup {handoff}"]
elif target == "claude-headroom":
    argv = [headroom, "wrap", "claude", "--no-proxy", "--no-serena", "--dangerously-skip-permissions", claude_pickup]
elif target == "codex-headroom":
    argv = [headroom, "wrap", "codex", "--no-proxy", "--no-serena", "--", codex_pickup]
else:
    raise SystemExit(f"unknown --target: {target}; use pi, claude-headroom, or codex-headroom")
print("cd " + shlex.quote(cwd) + " && " + " ".join(shlex.quote(x) for x in argv))
PY
)
```

Keep the final `shlex.quote` pass so `$pickup` reaches Codex literally instead of being expanded by the shell.

## Preferred launch: Warp split pane

Use for `--start`:

```bash
osascript - "$CMD" <<'OSA'
on run argv
  tell application "Warp" to activate
  delay 0.2
  set the clipboard to item 1 of argv
  tell application "System Events"
    tell process "Warp"
      click menu item "Split Pane Right" of menu "Tab" of menu bar 1
      delay 2.0
      click menu item "Focus Terminal Input" of menu "Edit" of menu bar 1
      delay 0.2
      keystroke "v" using command down
      delay 0.1
      key code 36
    end tell
  end tell
end run
OSA
```

If Warp logs/UI indicate `NotBootstrapped`, wait 2-3 seconds and press Enter again in the new pane.

## Optional launch: Warp new tab

Use only for `--tab`:

```bash
python3 - <<'PY'
import json, os
from pathlib import Path
cmd = os.environ["CMD"]
cwd = os.getcwd()
Path.home().joinpath(".warp/tab_configs").mkdir(parents=True, exist_ok=True)
Path.home().joinpath(".warp/tab_configs/handoff-pickup.toml").write_text(f'''name = "Handoff Pickup"
title = "Handoff Pickup"
color = "green"

[[panes]]
id = "main"
type = "terminal"
directory = {json.dumps(cwd)}
commands = [{json.dumps(cmd)}]
is_focused = true
''')
PY
open 'warp://tab_config/handoff-pickup'
```

## Fallback

If Warp automation fails, print the command for the user:

```bash
cd <repo-or-working-directory> && <target command from CMD>
```

## Final response when launch requested

Keep it short:

```text
Handoff written: <path>
Started fresh <pi|claude-headroom|codex-headroom> pickup session in <split pane|new tab>.
```
