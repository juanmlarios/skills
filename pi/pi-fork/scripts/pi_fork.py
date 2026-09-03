#!/usr/bin/env python3
import argparse
import json
import os
import shlex
import shutil
import subprocess
import sys
import time
from pathlib import Path


def session_from_recent(cwd: str) -> str | None:
    root = Path.home() / ".pi/agent/sessions"
    if not root.exists():
        return None
    matches: list[Path] = []
    for path in root.rglob("*.jsonl"):
        try:
            first = path.open("r", encoding="utf-8", errors="ignore").readline()
            header = json.loads(first)
        except Exception:
            continue
        if header.get("type") == "session" and header.get("cwd") == cwd and header.get("id"):
            matches.append(path)
    if not matches:
        return None
    newest = max(matches, key=lambda p: p.stat().st_mtime)
    try:
        return json.loads(newest.open("r", encoding="utf-8", errors="ignore").readline()).get("id")
    except Exception:
        return None


def applescript_quote(s: str) -> str:
    return '"' + s.replace('\\', '\\\\').replace('"', '\\"') + '"'


def main() -> int:
    parser = argparse.ArgumentParser(description="Open a fork of the current Pi session in a Warp split pane.")
    parser.add_argument("--session", help="Pi session id/path to fork. Defaults to current session detection.")
    parser.add_argument("--dry-run", action="store_true", help="Print the command without opening Warp.")
    args = parser.parse_args()

    cwd = os.getcwd()
    session = (
        args.session
        or os.environ.get("PI_SESSION_ID")
        or os.environ.get("PI_SUBAGENT_PARENT_SESSION")
        or session_from_recent(cwd)
    )
    if not session:
        print("Could not detect current Pi session. Run /session, then retry with --session <id>.", file=sys.stderr)
        return 2

    pi = shutil.which("pi")
    if not pi:
        print("pi not found on PATH.", file=sys.stderr)
        return 2
    cmd = f"cd {shlex.quote(cwd)} && {shlex.quote(pi)} --fork {shlex.quote(session)}"

    print(f"Forking Pi session: {session}")
    print(f"Command: {cmd}")
    if args.dry_run:
        return 0

    script = f'''
tell application "Warp" to activate
delay 0.2
set the clipboard to {applescript_quote(cmd)}
tell application "System Events"
  tell process "Warp"
    click menu item "Split Pane Right" of menu "Tab" of menu bar 1
    delay 2.0
    click menu item "Focus Terminal Input" of menu "Edit" of menu bar 1
    delay 0.2
    keystroke "v" using command down
    delay 0.1
    key code 36
    delay 3.0
    key code 36
  end tell
end tell
'''
    result = subprocess.run(["osascript", "-e", script], text=True, capture_output=True)
    if result.returncode != 0:
        print(result.stderr.strip() or result.stdout.strip(), file=sys.stderr)
        print("Warp automation failed. Run this manually:", file=sys.stderr)
        print(cmd, file=sys.stderr)
        return result.returncode

    time.sleep(1)
    print("Started forked Pi in Warp split pane.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
