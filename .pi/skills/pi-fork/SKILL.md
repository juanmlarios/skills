---
name: pi-fork
description: Fork the current Pi conversation into a fresh Pi session opened in a new Warp split pane. Use when the user asks to fork this Pi session, launch a forked session, or open a Pi fork in split pane.
argument-hint: "[--session <session-id>]"
---

# Pi Fork

Fork the current Pi session into a new Warp split pane and start Pi there.

## Behavior

- Launches a **forked** Pi session using `pi --fork <session-id>`.
- Opens it in a Warp split pane, not a new window or tab.
- Uses the current working directory.
- Does not edit project files.

## Usage

Run the helper script from this skill directory:

```bash
python3 "$HOME/.pi/agent/skills/pi-fork/scripts/pi_fork.py"
```

If the user provides a session id explicitly:

```bash
python3 "$HOME/.pi/agent/skills/pi-fork/scripts/pi_fork.py" --session <session-id>
```

## Session detection

The helper detects the source session in this order:

1. `--session <id>` argument
2. `$PI_SESSION_ID`
3. `$PI_SUBAGENT_PARENT_SESSION`
4. Most recently modified Pi session JSONL whose header `cwd` matches the current directory

If detection is ambiguous or fails, ask the user to run `/session` and retry with `--session <id>`.

## Notes

Warp can ignore Enter immediately after creating a split pane while the pane is still bootstrapping. The helper presses Enter, waits, then presses Enter again. This is intentional.
