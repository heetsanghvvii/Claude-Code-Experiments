# Entry notes

## Direction (3 lines)
- A calm, editorial "private concierge" deck: deep green and warm paper with a brass accent, Times New Roman headlines over Arial body text, hairline rules, and no robot or AI imagery.
- The story runs as a narrative: portals are a numbers game, warm conversations work, Knock's 4 steps, a real first message, why it is not spam, packages, the offer, how success is measured, the pilot, then one ask.
- An arched door drawn in native shapes opens the deck closed and ends it open, tying back to "Knock on the right door". The close asks for one action: pick 5 students for the free pilot.

## Skill steps followed
1. Read SKILL.md. Ran the attribution guard (exit 0). Read routing.md and picked Generate PPTX, ordinary explicit Quick (quick-generate.md). The brief stood in for every approval gate.
2. Read the planning batch: plan-core, canvas-formats, modes and visual-styles indexes, image-renderings index, icon README, chart and table vocabularies. Settled the direction in context only: mode `narrative`, style `editorial`, canvas ppt169, reading mode balanced, no images (no AI, no web), no icons, speaker notes off.
3. Read the execution core: shared-standards-core, executor-base, semantic-svg, preset-shape-vocabulary, native-shape-authoring, executor-structure and topology-assembly (the step and timeline pages carry `order`).
4. Ran `project_manager.py init --quick-generate`. Wrote 12 flat SVG pages by hand. Native presets (homePlate, chevron, round2SameRect, wedgeRoundRectCallout) came from `preset_shape_svg.py render-batch`.
5. Ran the early checker after P05 and the final lockless checker (`--quick-generate --canonical-authoring --stage final --json`): 12 of 12 pages pass, no warnings. Reviewed the carrier receipt: icons 0 and filters 0 are deliberate, because the editorial style separates content with rules and tints rather than shadows.
6. Exported with `svg_to_pptx.py --quick-generate --no-notes`. Rendered the deck, reviewed it, fixed everything in one batch, checked and exported again, then confirmed with a second render.

## Problems
- The session was interrupted after the first export. I resumed from the SVGs and export already in this folder instead of starting a clean Quick run (the profile prefers a restart). Only the self-check fixes were added afterwards.
- LibreOffice centres `wrap="none"` auto-fit text boxes, so left-aligned titles drifted when the fallback font was wider or narrower than estimated. A small python-pptx post-pass on the exported file set those boxes to `wrap="square"` and widened them toward their alignment side. Text, fonts and positions are unchanged, and everything stays editable.
- This machine has no Georgia, and its fallback (DejaVu Serif) is much wider, which pushed the sample message past its speech bubble. I switched the serif to Times New Roman, which has a metric-compatible fallback (Liberation Serif), so the PowerPoint and LibreOffice renders match.
- The page-number ornament (a small outlined rectangle) looked like a missing-glyph box. I replaced it with a short brass rule. I also raised two small text lines (packages footer, slide 3 caption) and gave the cover subtitle more space.
- All content follows the brief. Nothing is invented: no customers, statistics, logos or testimonials. The application grid on slide 2 is labelled as an illustration, not data.
