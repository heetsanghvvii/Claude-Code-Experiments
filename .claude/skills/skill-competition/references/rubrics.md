# Rubrics, judge lenses and deliverable rules per artifact type

Scores are 1 to 10 per criterion. Weights feed `scripts/aggregate.py` (they need not sum to 1).

## website (landing page, marketing site)
Deliverable: `entry-N/index.html`, one self-contained file (inline CSS/JS; Google Fonts only external).
Render: `node scripts/render_web.mjs <dir>` -> `screenshots/<entry>-{desktop,mobile}-{fold,full}.png` + JSON report.

| Criterion | Weight |
|---|---|
| visual_design | 25 |
| copy_clarity | 20 |
| conversion | 20 |
| mobile | 15 |
| brand_fit | 10 |
| code_quality | 10 |

Judges: design director (craft, originality, hierarchy) · target user + conversion marketer · accessibility auditor (Vercel Web Interface Guidelines at `/tmp/skills/web-interface-guidelines/command.md` if present: focus, forms, contrast, reduced motion, semantics).

## deck (PPT / slides)
Deliverable: `entry-N/deck.pptx` (preferred, native PowerPoint) or `deck.html` / `deck.pdf` when the skill is HTML-native. 10 to 14 slides, 16:9. Also `entry-N/NOTES.md`.
Render: `python3 scripts/render_deck.py <dir>` -> `renders/<entry>/slide-NN.png` + `renders/<entry>-sheet.png` (contact sheet) + JSON report.

| Criterion | Weight |
|---|---|
| storyline | 25 |
| visual_design | 25 |
| clarity | 20 |
| audience_fit | 15 |
| consistency | 10 |
| editability | 5 |

`editability`: native, editable PowerPoint text and shapes score high; images of text or HTML-only decks score low (note it, do not disqualify).
Judges: presentation coach (narrative, one idea per slide, action titles) · design director (layout, type, hierarchy, consistency) · the target audience named in the brief (would this persuade me in 5 minutes?).

## document (report, one-pager, proposal)
Deliverable: `entry-N/doc.pdf` (plus source if any). Render with `render_deck.py` (treats PDF pages as slides).

| Criterion | Weight |
|---|---|
| substance | 30 |
| structure | 20 |
| clarity | 20 |
| visual_design | 15 |
| audience_fit | 15 |

Judges: domain expert · editor · target reader.

## other
Write a rubric of 5 or 6 criteria with weights into BRIEF.md before building, derived from what success means for that artifact. Always include one "audience fit" criterion and one "craft / quality" criterion.

## Universal brief violations (judges list them; aggregate shows them)
Invented testimonials, logos, statistics or customers · wrong primary CTA / title · missing required sections · external assets the brief forbids · ignoring the brand voice rules in the brief.
