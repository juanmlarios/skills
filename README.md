# skills

Starter repository for personal agent skills.

## Install

After you push this repo to GitHub, install from it with:

```bash
npx skills@latest add your-github-username/skills
```

Replace `your-github-username` with your actual GitHub username. If you rename the repository, update the command to match.

## Repository Layout

The installer looks for skill folders that contain a `SKILL.md` file.

```text
skills/
  productivity/
    create-workplan/
      SKILL.md
  engineering/
    review-local-changes/
      SKILL.md
```

Each skill folder can also contain optional `scripts/`, `references/`, or `assets/` directories if the skill needs extra resources.

## Add a New Skill

1. Create a new folder under `skills/<category>/<skill-name>/`.
2. Add a `SKILL.md` file with YAML frontmatter.
3. Commit and push the changes.
4. Re-run the installer command if you want the updated skill set available locally.

## Notes

- There is no custom `skills.sh` file in this repository. The installer is the external `skills` CLI.
- The most important metadata is in each skill's `name` and `description`. Those fields determine when the skill is selected.
