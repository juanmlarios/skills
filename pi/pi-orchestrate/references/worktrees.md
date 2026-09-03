# Pi-subagents worktree writers

Load only before `worktree: true`.

## Preconditions

1. Writers have disjoint ownership and can be validated independently.
2. The entire git working tree is clean; current pi-subagents rejects dirty worktree launches.
3. Every dependency is committed because temporary worktrees see committed refs only.
4. GitNexus indexing and impact remain parent-owned. Temporary worktree children must not run `gnembed`, reindex, or rerun impact; they report stale-index or out-of-contract analysis needs. If the parent itself is a linked worktree, its `gnembed` call auto-pins the current branch slot and later GitNexus calls must pass that `branch`.
5. Capture the exact base before launch:

```bash
BASE=$(git rev-parse HEAD)
git status --porcelain
```

Any status output means do not launch worktree writers. Run serially in the active tree or first obtain authorization to commit the dependencies.

## Launch

```ts
subagent({
  async: true,
  context: "fresh",
  concurrency: 2,
  worktree: true,
  tasks: [
    { agent: "developer", task: "Implement slice A. Owned files: <paths>. Validate with <command>." },
    { agent: "developer", task: "Implement slice B. Owned files: <paths>. Validate with <command>." }
  ]
})
```

Do not expect the temporary worktrees to remain after completion.

## Integrate from the handoff manifest

Current pi-subagents returns `parallelHandoff.path`. Read that versioned JSON manifest instead of scraping combined child prose. For every accepted child verify:

- `groups[].baseCommit` equals the captured `$BASE`.
- child status is completed and its patch has `changed: true` when changes were expected.
- `patch.path`, diff stat, files changed, and ownership match the assigned slice.
- cleanup records show `worktreeRemoved` and `branchRemoved`; report partial cleanup errors.

Apply the intended patch to the current HEAD, review it, and validate it. Never copy whole files from a worktree because that can revert changes made after the worktree was cut. Run GitNexus scope checks from the parent; pass `worktree: <absolute-parent-worktree-path>` to `detect_changes` when its MCP server was launched from another checkout.

Typical integration:

```bash
git apply --3way <patch-path>
git diff --stat
git diff -- <owned-paths>
<focused-validation-command>
```

If the base is wrong, ownership overlaps, or the patch does not apply cleanly, do not improvise a merge. Discard that slice and rerun serially from the current active tree.
