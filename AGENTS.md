<claude-mem-context>
# Memory Context

# [skills] recent context, 2026-05-04 1:24pm PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 36 obs (14,213t read) | 233,223t work | 94% savings

### Apr 30, 2026
400 9:36a ✅ README.md Updated to Reflect Current Skills
401 9:37a 🔵 Skills Repo Structure: One Active Skill, Two Deleted, README Stale
402 " ✅ README.md Rewritten to Document gitnexus-wiki-claude Skill
446 12:26p 🔵 User Inquired About "Working with Dbt Mesh" Skill Origin
447 " 🔵 dbt Mesh Skill Located in ~/.agents/skills, Not in GitHub/skills Repo
448 12:27p 🔵 dbt Mesh SKILL.md Content: Author is dbt-labs, Not User-Invocable, Installed Apr 11
449 " 🔵 dbt Mesh Skill Origin Confirmed: Bulk Install from dbt-labs/dbt-agent-skills on Apr 11
787 6:46p 🔵 gitnexus-wiki-claude skill run script missing or broken on macOS
788 " 🔵 gitnexus-wiki-claude skill architecture and install path mismatch root cause
789 6:47p 🔵 gitnexus-wiki-claude scripts NOT committed to git — root cause of install failure
790 " 🔵 Local path install copies scripts correctly; GitHub remote install would fail due to untracked files
791 6:48p ✅ README.md and SKILL.md updated to clarify project-local vs global install paths
792 6:50p ✅ SKILL.md invocation section updated with auto-detect resolution order for run-wiki path
### May 1, 2026
812 11:43a 🔵 improve-codebase-architecture skill structure identified
813 " 🔵 improve-codebase-architecture skill full content documented
814 " 🔵 GitNexus skills surveyed for improve-codebase-architecture integration
815 " 🟣 improve-codebase-architecture SKILL.md updated to use GitNexus exploration
816 11:44a 🔵 SKILL.md write appeared to succeed but file retained original content
817 " 🟣 SKILL.md GitNexus patch successfully applied on second attempt
818 " 🟣 INTERFACE-DESIGN.md updated to incorporate GitNexus evidence into sub-agent briefs
819 " 🔵 improve-codebase-architecture directory is untracked — git diff shows no changes
820 " 🟣 Both SKILL.md and INTERFACE-DESIGN.md confirmed updated with GitNexus integration
821 11:52a ⚖️ Proposal to Integrate GitNexus into improve-codebase-architecture Skill
822 " 🔵 Skills Repository Structure at /Users/juan/GitHub/skills
823 " ✅ README.md Updated to Document improve-codebase-architecture Skill
### May 4, 2026
1490 1:12p ⚖️ New Skill Planned: Ollama + GitNexus Index Automation
1491 " 🔵 Skills Repo Structure and Conventions Confirmed
1492 " 🔵 Ollama CLI: Model Load Check and Embedding Invocation Patterns
1493 " 🔵 Ollama REST API: keep_alive Parameter Enables Persistent Model Loading
1494 " 🔵 Tool Locations and Environment Confirmed for New Skill
1495 1:13p 🔵 ollama run Has --keepalive Flag; gitnexus CLI Flags Confirmed
1496 " 🔵 Ollama /api/embed Confirmed as Current Embedding Endpoint with keep_alive
1497 " 🔵 Canonical Ollama Model Preload: POST /api/generate with keep_alive and No Prompt
1498 1:14p 🔵 GitNexus Uses Local ONNX Embeddings — Not Ollama — by Default
1499 1:22p 🔵 GitNexus CLI Skill Requirements: Ollama Model Pre-flight + Indexed Reanalysis
1500 " ⚖️ GitNexus CLI Skill Design: Manual Remove Recovery + Script + Skill Shape

Access 233k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>