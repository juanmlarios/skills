# Claude Code Adapter

Claude Code can run hooks from `/Users/juan/.claude/settings.json`.

Use the installed dispatcher for `PreToolUse`. It routes semantic code search to GitNexus and high-output/raw context work to Context Mode.

Hook policy:

- Keep GitNexus `PostToolUse` for git mutation freshness checks.
- Keep Context Mode `SessionStart`, `PreCompact`, and `UserPromptSubmit`.
- Do not also register Context Mode's default `PreToolUse` directly unless the dispatcher is removed.

Restart Claude Code after hook configuration changes.
