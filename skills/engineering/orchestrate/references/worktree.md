# Worktree isolation

Load only when a task will run under `isolation: "worktree"`. Isolation is the only way to run two writers at once; it is also where most integration defects in past capsules came from (stale base, wrong-tree edits, gitignored dependencies, leaked absolute paths). Prefer serial builders in the feature tree unless parallel writing buys real wall-clock.

## Prerequisites — check once per project before the first isolated dispatch

Isolation is nominal unless all of these hold; if any fails, mark the task `Isolation: feature-tree` and serialize.

- `$HOME/.local/bin/lean-ctx-worktree` exists and pins reads/edits to the child's cwd. Shared lean-ctx MCP connections and unpinned CLI reads root at the parent checkout, so a child's `ctx_patch` can silently edit the canonical tree.
- The child can validate from its own tree: gitignored `artifacts/`, `.venv`, or an editable install resolving to the canonical `src/` means the child validates the parent's source, not its own. Fix by pointing tooling at the worktree (`--venvpath`, `PYTHONPATH`) or accept that validation runs in the feature tree after integration.
- Committed provenance must not contain worktree paths. If the task writes JSON/logs with absolute paths, make the writer use repo-relative paths or the clean-clone gate will fail.

## Base capture

The worktree base is the feature branch's committed `HEAD` (user settings pin `worktree.baseRef: "head"`). Before each isolated batch:

1. Require the current branch to equal `RUN.md`'s `Feature branch`.
2. `B=$(git rev-parse HEAD)`; record `Worktree base: B` in `RUN.md`.
3. Every source/config dependency the children need must already be committed in `B`. Uncommitted capsule state is fine (briefs are self-contained); uncommitted source dependencies force serial execution in the feature tree.
4. Do not advance the parent's `HEAD` while the batch runs.

## Agent lanes and preflight

Use `worktree-builder` / `worktree-hard-builder` — never the MCP-based feature-tree builders under isolation. The brief carries the canonical checkout path and the expected base SHA. The child's only unwrapped repository Bash is the preflight:

```
pwd; git rev-parse --show-toplevel; git rev-parse --git-dir; git rev-parse HEAD
```

It must show the assigned worktree, a top-level different from the canonical checkout, and `HEAD == B`. Thereafter every repository read/search/shell/test/build/git command goes through the wrapper from that cwd: `lean-ctx-worktree read <file>`, `lean-ctx-worktree grep <pattern>`, `lean-ctx-worktree -c '<command>'`. Native Edit/Write perform mutations. A mismatch, wrapper failure, configured lean-ctx MCP call, or unwrapped repository Bash after preflight is `blocked`: stop, never fall back, never integrate that delivery.

Temporary isolated children never run `gnembed`, reindex GitNexus, or rerun impact; they report stale-index or out-of-contract needs to the parent. When the parent itself runs from a linked worktree, `gnembed` pins the branch index slot and every later GitNexus call passes that `branch`; `detect_changes` takes the worktree's absolute path when the MCP server was launched elsewhere.

## Integration

Before applying a child's work: the parent still names the recorded feature branch; the child's `git rev-parse HEAD` / merge-base descends from `B`. Then diff-apply only the intended owned change onto the feature tree — never wholesale-copy files. A branch or base mismatch is stale-base drift: stop and reconcile; never merge or rerun from another branch implicitly. A branch that outlives its squash-merge produces false conflicts — delete merged worktree branches at wave close when authorized.
