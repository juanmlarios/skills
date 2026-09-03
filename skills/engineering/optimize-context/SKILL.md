---
name: optimize-context
description: Audit the health of the agent context stack — everything injected into Claude Code / Codex / Pi sessions (CLAUDE.md/AGENTS.md files, hooks, MCP servers, skills, memory) — and report contradictions, dead references, duplication, budget bloat, volatile facts, memory rot, and unused skills, with proposed fixes. Run monthly, after any tool install/uninstall, when agents keep hitting tool-permission errors or contradictory instructions, or when sessions feel bloated. Report-only by default; applies safe mechanical repairs only with --fix and per-change approval.
---

# Optimize Context

Health-check the context stack across harnesses. Origin: the 2026-07-16 context audit (`~/GitHub/workplans/2026-07-16-context-audit/`) — this skill re-runs that assessment as repeatable checks. Each check emits PASS / WARN / FAIL with evidence. Never change anything without `--fix` plus explicit per-change approval; even then only mechanical repairs (dead entries, duplicate blocks), never rewrites of judgment content.

## Surfaces to inventory first

Claude: `~/.claude/CLAUDE.md` (+ `@includes`), `~/.claude/settings.json` (permissions, hooks, plugins, mcpServers), `~/.claude.json` (mcpServers, per-project), `~/.claude/skills/`, `~/.claude/agents/`, `~/.claude/hooks/`, `~/.claude/projects/*/memory/`, per-repo `CLAUDE.md` + `.claude/`.
Codex: `~/.codex/AGENTS.md` (+ includes), `~/.codex/config.toml` (mcp_servers, skills.config, model_providers), `~/.codex/hooks.json`, `~/.codex/skills/`, per-repo `AGENTS.md` + `.codex/`.
Pi: `~/.pi/rules/`, `~/.pi/agent/{mcp.json, skills/, pi-hermes-memory/, projects-memory/}`.
Shared: `~/.agents/skills/`, headroom (`~/.headroom/mcp_installs.json`, LaunchAgents `com.headroom.*`, proxy env), `~/.lean-ctx/config.toml`.

## Checks

### 1. Reachability (FAIL on any hit)
Every absolute path, binary, and localhost URL referenced by the surfaces above must resolve: hook commands exist and are executable; MCP server commands exist on disk; `base_url`/`ANTHROPIC_BASE_URL` proxy ports respond (headroom: 8787/8788); skill symlinks aren't dangling; paths named inside CLAUDE.md/AGENTS.md/skill files exist. This is the headroom-uninstall detector: if the proxy or `~/.headroom/bin/*` vanish, this check names every file that must be updated (settings hooks, `GitHub/.claude/settings.local.json`, codex `model_provider`, pi `models.json` + LaunchAgent).

### 2. Contradiction scan (FAIL)
Collect all directives a single session would receive (global md + includes + plugin/session-start blocks + repo md + MCP server instructions). Flag conflicts on the same topic — write policy, read policy, "use X first" tool routing, output style, review gates. Heuristic: same verb-object, different tool or opposite modality (ALWAYS/NEVER vs use-freely). Also flag: permissions.deny entries that break documented workflows (the classic: denying `Read` breaks native `Edit`).

### 3. Duplication scan (WARN)
Identical or near-identical blocks: across CLAUDE.md vs AGENTS.md in one repo; across repo copies and worktrees; appended versioned tool blocks in one file (e.g. two `lean-ctx-rules` generations); the same persona/output-style instruction from multiple sources. Tool-managed marker blocks (`<!-- gitnexus:start -->`) that a generator re-fattened after a manual trim.

### 4. Session budget (WARN >8k tokens, FAIL >15k)
Estimate startup injection per harness per repo: global md + includes + session hooks' output + plugin blocks + MCP instructions + skill descriptions + repo md. List the top-5 contributors by size. Rule: an always-loaded file carries only durable behavior; procedures belong in skills (free until invoked), episodic facts in memory.

### 5. Volatility lint (WARN)
Facts in always-loaded files that rot: symbol/relationship counts, port numbers, dates, "currently/pending/UNCOMMITTED/TODO", absolute user paths inside repo files, model names in prose, staleness-prone tables. Each should move to: tool-derived (ask at runtime), memory, or the owning generator's marker block.

### 6. Memory hygiene (WARN)
- Claude: project memory dirs whose source path no longer exists (orphans from repo moves); memories containing status-words older than 14 days; MEMORY.md entries pointing at deleted files; falsified memories (contradicted by current config — spot-check ones naming tools/hooks).
- Codex: capture pipeline row counts (`~/.codex/memories_1.sqlite`) — zero rows with the pipeline enabled = broken or decorative.
- Pi: `.recovery-*` litter in `pi-hermes-memory/` (consolidator crashes); stale entries in MEMORY.md/USER.md naming removed tools.

### 7. Skill usage (WARN)
Cross-reference the skill inventory (all locations above) against session history (`~/.claude/history.jsonl`, `~/.codex/session_index.jsonl`) for last-invoked dates. Never-used in 60 days → delete candidate. Also: the same skill installed in several locations with content drift between copies (installs are copies by policy — compare content, not link-ness); skills referencing deleted skills or dead paths.

### 8. Friction ledger
Read `~/GitHub/workplans/_context-friction.md` if it exists (a ledger of denied-tool events, dead paths, and contradictory-rule hits; anyone may append to it — the orchestration skills do not write it automatically). Summarize entries since the last report and map each to one of the checks above — recurring friction with no failing check means a check is missing; propose it.

## Output

`~/GitHub/workplans/<YYYY-MM-DD>-context-health/REPORT.md`:
1. Scoreboard — one row per check: PASS/WARN/FAIL + one-line evidence.
2. Findings by check, each with file:line evidence and a concrete proposed fix.
3. Trend vs. previous report (budget numbers, counts per check).
4. Proposed-diff section for mechanical fixes (applied only with `--fix` + approval).

Deliver the scoreboard + top findings in chat; link the report for the rest.
