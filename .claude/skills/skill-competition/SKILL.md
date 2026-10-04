---
name: skill-competition
description: Run a fully autonomous, blind competition between design/creation skills (internal and from GitHub) that each build the same brief, then score them with independent judges and report a winner. Use when the user asks to "compare skills", "run a competition", "find the best skill for X", "have agents compete", or wants the best website, landing page, PPT/deck, document or other artifact produced by pitting several skills against each other. Runs start to finish with no user intervention and ends with outputs plus a final scoreboard.
---

# Skill Competition (autopilot)

Several skills build the same thing from one brief. Renders are judged blind by independent judges with different lenses. The output is a scoreboard, every entry, and the winner. **Never stop to ask the user anything.** Every decision below has a default; take it, note it in the report, keep going. Invoking this skill is the user's opt-in to running a multi-agent Workflow.

## 0. Frame (inline, 2 minutes)

Decide from the request and conversation, without asking:
- **type**: `website`, `deck`, `document`, or `other`.
- **subject**: what is being made and for whom. If unstated, use the project's current product and its main audience.
- **workdir**: `<repo>/competitions/<type>-<short-slug>/` (create it).
- **size**: 6 to 10 contestants, 3 judges. Fewer only if fewer viable skills exist.

## 1. Brief (inline)

Write `<workdir>/BRIEF.md`: product, audience, brand voice, the exact content/sections required, the primary call to action or title, what must NOT be invented (testimonials, stats, logos), and the technical deliverable rules for the type from [references/rubrics.md](references/rubrics.md). The brief must be complete enough that a builder never needs to ask. Copy the rubric criteria and weights into the brief's last section.

## 2. Discover contestants (inline)

**Internal**: `ListSkills` with type keywords; skills synced under `~/.claude/skills/synced/*/`; bundled skills (`/mnt/skills/examples/`); project skills in `.claude/skills/`; built-ins invocable via the Skill tool (for example `artifact-design`, `artifact-diagramming`, `canvas-design`, `theme-factory`, `pptx`, `web-artifacts-builder`).

**External**: `WebSearch` (2 or 3 queries, e.g. "github claude skill <type> SKILL.md stars") plus any repos the user named. Prefer high stars, recent commits and real SKILL.md files. Clone shallow into `/tmp/skills/<owner>_<repo>` (`git clone --depth 1`).

Shortlist to the size limit. Mix: official/internal, the most-starred community skills, and at least one that takes a different approach (spec-first, style preset, motion-first, etc.). Style variants of one repo count as separate contestants only if clearly different.

## 3. Vet every external skill (inline, mandatory)

For each shortlisted repo: read the main SKILL.md fully, and grep its scripts for `curl|wget|urlopen|requests\.|subprocess|os\.system|child_process|eval|exec|base64|token|api_key`. Then decide:
- Exclude any skill that exfiltrates data, runs obfuscated code, or needs credentials you do not have for its core path.
- Allowed with restrictions: skills whose helpers download binaries (tell the builder not to run them; use the skill's documented fallback), call paid image/LLM APIs (tell the builder not to), or depend on blocked sites (tell the builder to work offline from the local files).
- Skills with "ask the user" or blocking approval gates: allowed; the builder treats the brief as the approval.
Write the per-contestant instruction (`how`): where the skill lives, what to read, restrictions, and output format. Record vetting notes for the report.

Check the environment once. For decks, `soffice` needs Impress: if a test pptx fails with "source file could not be loaded", run `apt-get install -y libreoffice-impress`; `pip install python-pptx` for pptx-building skills. Check which external hosts load (fonts, CDNs) and whether the renderer works (`render_web.mjs` with a tiny test page, or `render_deck.py` with a tiny pptx). Put the allowed external hosts into the brief.

## 4. Run the competition (Workflow)

Call the Workflow tool with the script in [references/workflow-template.js](references/workflow-template.js) (pass it inline as `script`) and `args`:

```json
{
  "root": "<workdir>",
  "type": "website | deck | document | other",
  "deliverable": "index.html | deck.pptx (or deck.html/deck.pdf if HTML-native) | doc.pdf",
  "renderHint": "how a builder can render its own output for the self-check",
  "renderCmd": "node <skill_dir>/scripts/render_web.mjs .   OR   python3 <skill_dir>/scripts/render_deck.py .",
  "viewInstructions": "exact files each judge must open per entry (screenshots or renders/<entry>-sheet.png plus slides)",
  "criteria": { "from references/rubrics.md": 0 },
  "contestants": [{ "id": "entry-1", "skill": "name (source)", "how": "per-contestant instruction from step 3" }],
  "lenses": [{ "key": "short-name", "lens": "who this judge is and what they weigh" }]
}
```

Rules: entry ids are anonymous and assigned in shuffled order (not grouped by source). Judges never see skill names, NOTES.md or design-spec files. Three judges, distinct lenses from the rubric. Run it in the background and continue with other work; do not poll.

If the workflow fails part-way, fix the script and resume with `resumeFromRunId` (completed agents return cached results). A builder that fails or returns nothing is recorded as DNF; never block on it.

## 4b. Show every output on the user's screen (mandatory)

The user must see each output in this conversation as soon as it exists, without asking:
- **As builds finish** (any builder report, background agent notification, or the workflow's Build phase completing): immediately call `SendUserFile` with the finished deliverables, `display: "render"`, `status: "proactive"`. Websites: `entry-N/index.html`. Decks: the contact sheet `renders/entry-N-sheet.png` once rendered, plus `entry-N/deck.pdf` or `deck.pptx` (`display: "attach"` for .pptx). Caption with entry ids only, never skill names (judging is still blind).
- **After rendering**: send the screenshots or contact sheets in one batch so the user can compare side by side.
- **After scoring**: send `scoreboard.md`, `REPORT.md` and the winner's deliverable again, now with skill names revealed.
- One `SendUserFile` call per batch (up to the whole field at once); never resend an unchanged file.

## 5. Score (inline)

Save the workflow result to `<workdir>/results.json` (must include `mapping`, `criteria`, `judgements`) and run:

```bash
python3 <skill_dir>/scripts/aggregate.py <workdir>/results.json <workdir>
```

This writes `scoreboard.md` and `scoreboard.json` (weighted mean across judges; ties go to the entry the judges agree on most).

## 6. Report (inline, then done)

1. Write `<workdir>/REPORT.md`: scoreboard, winner and why (quote the judges' strengths), runner-up ideas worth grafting (from `best_ideas_to_graft`), DNFs and vetting restrictions, cost notes, and paths to every entry and render.
2. Publish one private Artifact page showing the scoreboard and the top entries' renders (follow the artifact-design guidance; embed images or link them). Skip only if publishing is unavailable.
3. Commit the workdir (entries, renders, scoreboard, report; not cloned skill repos or node_modules) and push to the session's branch.
4. Send the files (step 4b, scoring batch) and one short message: winner, top 3 with scores, the artifact link, and what you would do next (for example: polish the winner with the runners-up's best ideas). Do not wait for a reply.

## Defaults when unsure

| Question | Default |
|---|---|
| Too many viable skills | Keep the top by stars plus all internal ones, max 10 |
| Skill needs a blocked network resource | Run it offline from local files; note it |
| Builder asks a question mid-run | It must not; brief wins; if it stalls, mark DNF |
| Judges disagree wildly | Report the spread; the scoreboard already penalises disagreement in ties |
| No renderer for the type | Judges read the source files; note lower confidence |
