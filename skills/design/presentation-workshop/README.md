# Presentation Workshop

An interactive skill for helping a presenter find their message, organise the story, refine the wording, and produce an editable PowerPoint using the bundled **Teal Editorial** template.

This directory is self-contained. It does not need the original Presentations checkout, its source lecture, or any global Pi configuration.

## What it does

1. **Brief:** discover the audience, desired outcome, time available, voice, and required material, one question at a time.
2. **Story:** agree a storyboard and timing before polishing slides.
3. **Content:** refine one to three slides at a time, with on-slide wording separate from speaker notes.
4. **Approval:** obtain permission to build the accepted content rather than treating planning permission as build permission.
5. **Production:** generate an editable `.pptx` with native layouts, the approved square bullets, a custom footer, speaker notes, and supplied references.
6. **Review:** render every slide, fix visual problems, and invite targeted presenter feedback.

It also supports planning-only work. A presenter can explicitly ask for a fast, single-pass draft instead of an interview.

## Files

```text
presentation-workshop/
  SKILL.md                            # Interactive agent instructions
  README.md                           # Setup and usage
  requirements.txt                    # Builder dependencies
  assets/
    Teal_Editorial_Template.potx       # Native template: 10 named layouts
    Teal_Editorial_Starter.pptx        # One example slide per layout
    Teal_Editorial_Preview.pdf         # Visual layout catalogue
  references/
    template-guide.md                 # Layout choices, limits, branding
    example-content.json              # Valid three-slide content manifest
  scripts/
    build_presentation.py             # POTX + accepted content -> PPTX
    template_support.py               # Preserves paragraph/run formatting
    test_build_presentation.py         # Regression checks
```

Keep the entire directory together when installing or copying it. Script and asset paths are resolved relative to the skill, not the caller's working directory.

## Install or load the skill

Use your agent's normal skill installation mechanism. In this source checkout the skill lives at:

```text
~/GitHub/skills/skills/design/presentation-workshop
```

For Pi, copy the whole directory into your working project's `.pi/skills/`, or add its absolute path to Pi's configured `skills` list. Run `/reload`, then:

```text
/skill:presentation-workshop Help me plan a 30-minute presentation from my notes.
```

For Claude or Codex, install/discover the directory as an Agent Skill and ask:

```text
Use presentation-workshop to help me turn these notes into a talk.
Start with the audience and help me refine the story interactively.
```

The exact command syntax depends on the host. Merely keeping this source directory in the skills repository does not automatically expose it to every agent. These instructions do not install it globally or change settings.

## Python setup

Python 3.10+ is recommended. The builder uses `python-pptx` and `lxml`; it performs no model calls and does not upload files.

In your working project, create a virtual environment if needed:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r ~/GitHub/skills/skills/design/presentation-workshop/requirements.txt
```

LibreOffice (`soffice`) and a PDF renderer such as Poppler's `pdftoppm` are needed for the separate visual-review step. Georgia should be installed for the intended appearance. Builder tests do not require LibreOffice.

## Working documents

The agent keeps the presenter's brief, accepted decisions, unresolved questions, storyboard, and detailed slide drafts in:

```text
<working-project>/presentations/<slug>/CONTENT.md
```

Once approved, accepted content is translated into `content.json` beside that document. Outputs belong in the working project or an agreed output folder, **not inside this installed skill**. Revisions use new filenames such as `talk-v1.pptx`, `talk-v2.pptx`; existing output files are never overwritten.

## Content format

Inspect the actual template fields before preparing a manifest:

```bash
python ~/GitHub/skills/skills/design/presentation-workshop/scripts/build_presentation.py --layouts
```

Top-level keys are exactly:

| Key | Value |
|---|---|
| `title` | Non-empty presentation title; also written to document metadata |
| `presenter` | Presenter name for metadata; may be empty |
| `footer` | Shared footer text; may be empty |
| `slides` | Non-empty, ordered list of slides |

Each slide has:

| Key | Value |
|---|---|
| `layout` | Exact layout name returned by `--layouts` |
| `fields` | All and only that layout's named text placeholders, with string values |
| `notes` | Optional speaker-note text |
| `sources` | Optional list of non-empty reference strings; appended to speaker notes |
| `duration_minutes` | Optional finite, non-negative number; documented in notes, not an automatic transition |

Use `\n` between bullet items or paragraphs. Do not type bullet symbols: the template supplies the symbol, size, indent, and colour. Use an empty string for an intentionally unused field. References are stored, not fetched or verified by the builder; the agent/presenter must resolve unsupported claims before approval.

See [references/example-content.json](references/example-content.json) for a complete three-slide example. It demonstrates the data format, not a required presentation structure.

## Build a presentation

```bash
python ~/GitHub/skills/skills/design/presentation-workshop/scripts/build_presentation.py \
  /absolute/path/to/my-project/presentations/my-talk/content.json \
  /absolute/path/to/my-project/presentations/my-talk/my-talk-v1.pptx
```

The builder reads the real POTX, removes its example slides, retains the master and all ten layouts, populates editable placeholders, updates the shared footer, and adds notes. Because `python-pptx` does not directly read POTX files, only the presentation MIME type is converted **in memory**; the bundled template is unchanged.

The saved deck is reopened and checked for slide/layout counts, layout selection, exact placeholder content, and speaker notes before the output file is created. Input keys/types and output extension are validated. Invalid input and existing output files produce a non-zero exit status.

You can smoke-test the example using a new output filename in a scratch folder:

```bash
python ~/GitHub/skills/skills/design/presentation-workshop/scripts/build_presentation.py \
  ~/GitHub/skills/skills/design/presentation-workshop/references/example-content.json \
  /absolute/scratch/workshop-example-v1.pptx
```

## Render and inspect

Export a candidate using a **test-owned, isolated LibreOffice profile**, not a shared daemon/profile:

```bash
soffice -env:UserInstallation=file:///absolute/scratch/workshop-lo-profile \
  --headless --convert-to pdf --outdir /absolute/scratch \
  /absolute/scratch/workshop-example-v1.pptx

pdftoppm -png -scale-to 1200 /absolute/scratch/workshop-example-v1.pdf \
  /absolute/scratch/workshop-slide
```

Choose a scratch directory you own. Inspect every exported page for clipping, overlaps, crowded content, bullet contrast, and font substitution. Split or shorten content before reducing readability. A successful save or export does not prove the deck is visually correct.

## Tests

```bash
python ~/GitHub/skills/skills/design/presentation-workshop/scripts/test_build_presentation.py
```

The tests cover all ten layouts, content mapping, inherited placeholder geometry, notes and references, timing notes, square bullet formatting/contrast, an empty field, unchanged template bytes, malformed manifests, and overwrite protection. They use temporary output directories and do not change the bundled assets.

The portable copy was tested from outside its own directory. A sample deck was exported and visually checked. Direct Microsoft PowerPoint UI validation remains recommended before broad distribution; do not claim the Layout picker or Reset command was tested unless you actually checked it there.

## Boundaries

- This builder handles text, speaker notes, references, and the existing native template artwork. It is not a general chart, table, or illustration generator.
- It does not detect overflow, enforce the session's time budget, verify claims, or obtain presenter approval programmatically. Those are agent/presenter responsibilities in `SKILL.md`.
- The fixed-slot layouts may require moving or re-entering content when switching substantially different slide designs.
- Do not overwrite sources/templates, upload private material, commit/push, or change global agent settings without permission.

## Template provenance and updates

The design and original local skill come from [juanmlarios/Presentations](https://github.com/juanmlarios/Presentations). This package bundles neutral examples and template assets, not the original neurodivergence lecture. `template_support.py` contains only the formatting helper needed by this builder; there is no dependency on `build_template.py` or any absolute path to that checkout.

When updating the template, replace all three assets together, review `references/template-guide.md`, inspect `--layouts`, run the tests, and render a representative candidate before distributing the update. Existing asset files are used as inputs and are never modified by the talk builder.
