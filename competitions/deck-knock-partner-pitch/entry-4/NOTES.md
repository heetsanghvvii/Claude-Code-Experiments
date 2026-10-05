# Entry notes

## Direction (3 lines)
"Threshold Light": a quiet field of identical doors in deep ink, with one opened and warm brass light spilling across the floor.
Calm private-concierge feel: ink, paper and brass only; Georgia headlines, Arial body, small spaced-caps kickers; one idea per slide with action titles.
A native door glyph (closed, lit, ajar, open) recurs on every slide as the motif and quietly tracks progress through the story.

## Skill steps followed
- Design philosophy: wrote a short visual manifesto ("Threshold Light": hairline grid, three materials, brass only where light falls, clinical labels, restraint) before drawing anything.
- Subtle reference: the closed-door grid is the job market; the single opened door is the warm conversation, echoing the tagline without saying it.
- Canvas: rendered three art pieces to PNG locally with Pillow (cover door field, closing door field, an "applications" grid with three answered), using DM Mono for tiny reference labels; refined once (door proportions, light falloff).
- Deck: pptxgenjs structured deck: theme first (12 scheme colors via apply_theme), four layouts (cover, content light, content dark, close) with named kicker/title placeholders, footer and slide numbers on layouts, sections, scheme colors everywhere, objectNames, speaker notes on every slide.
- QA: validate.py passed; rendered with the competition renderer, reviewed every slide, fixed in one batch (title alignment, wrapping headings, a price that wrapped, note text past the margin, timeline proportions), confirmed once.

## Problems
- pptxgenjs was not installed globally; installed it into a temporary folder inside this entry and removed it afterwards.
- Georgia is not installed in the render environment, so previews show DejaVu Serif (wider); boxes were sized with slack, so text will fit with real Georgia in PowerPoint.
- Art images are flattened PNGs by design; all text, cards, door glyphs, timeline and pricing are native, editable shapes and text.
