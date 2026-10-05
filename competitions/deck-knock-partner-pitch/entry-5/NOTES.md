# Entry 5 notes

## Direction (3 lines)
Private-concierge feel: deep evergreen and brass on white, Georgia headlines with Arial body, a hand-drawn door as the single recurring motif.
Consulting-style SCR spine (problem, what works, why students do not do it, what Knock does, proof of care, offer, measurement, pilot, ask), told by action titles alone.
12 native, editable slides: dark title and close sandwich light content slides; no invented numbers, testimonials or logos; speaker notes on every slide.

## Skill steps followed
- Read the academic-pptx SKILL.md, content_guidelines.md, slide_patterns.md and the pptx SKILL.md before building.
- Step 1: chose Structured Argument mode (consulting-style persuasive deck); used Situation/Complication/Resolution spine.
- Step 2: planned slide-by-slide outline with action titles and ran the ghost deck test on titles (brief served as approval).
- Step 3: communication-first design: white content slides, restrained 3-colour palette, one exhibit per slide, left-aligned titles and body, ~40 words max of body per slide, generous whitespace, no decorative icons or title underlines.
- Built with pptxgenjs as a structured deck: theme fonts and colours (applyTheme), slide layouts with named title/kicker placeholders, slide numbers and footer in the layout, speaker notes.
- Step 4 QA: validate.py passed; rendered with the competition script, reviewed every slide image, fixed issues in one batch (centred and three-line titles, font substitution, package card overflow, formula visual), re-rendered to confirm.
- Ending on a conclusions-plus-next-step slide with contact (no "Thank you" slide). References slide omitted on purpose: the deck cites no external sources and the brief forbids invented statistics.

## Problems
- The render environment has no Calibri/Cambria metric substitutes, so I switched to Arial (renders true via Liberation Sans) and Georgia (renders as DejaVu Serif here, which is wider than real Georgia, so PowerPoint will have extra slack).
- The Done-for-you card needed two extra passes to stop the price and detail lines wrapping.
- Academic skill's 20 pt body minimum relaxed to 15 to 16 pt for secondary card text on the wide layout to keep one idea per card readable; headline points stay at 18 to 20 pt.
