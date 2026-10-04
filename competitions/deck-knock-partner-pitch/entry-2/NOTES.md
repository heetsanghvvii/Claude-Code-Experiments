# Entry notes

## Direction
1. A calm "private concierge" look: deep forest green with brass accents, Cambria headings and Arial body, plenty of white space.
2. The recurring motif is a door with a brass knocker. It is closed on the title slide and open with warm light on the close; brass "knocker" circles mark every numbered point.
3. Eleven slides, one idea each, with action titles: problem, what works, 4 steps, example message, safeguards, packages, partnership, metric, pilot timeline, ask.

## Skill steps followed
- Built from scratch with pptxgenjs as a structured deck: a THEME object (12 scheme colours plus fonts), `pres.SchemeColor` for every colour, 2 layouts (Dark Title, Title Only) with named title/body placeholders, footer and slide number on the layout, 4 sections, and `objectName` on the shapes.
- After `writeFile` I ran `applyTheme` so scheme colours resolve to the Knock palette.
- Followed the design rules: LAYOUT_WIDE, no accent lines under titles, no edge stripes, a visual element on every slide, body text left-aligned, isTextBox and margin 0 on text, and speaker notes on every slide.
- QA: `validate.py` passed; markitdown placeholder grep came back clean; I rendered to PNG and checked every slide visually, fixed everything in one batch, and re-rendered once to confirm.

## Problems
- pptxgenjs was not installed, so I installed it with npm into a temporary folder and deleted that folder afterwards. defusedxml and markitdown needed a pip install for validate.py.
- Calibri and Cambria are not installed here, so LibreOffice substitutes wider fonts. I switched the body text to Arial so the render is accurate, kept Cambria for headings, and shortened titles so they fit in one line even with the wider substitute.
- The first render had titles centred and wrapping, and some card headings overlapping their body text. I fixed both by aligning titles left, shortening copy and adjusting sizes and offsets.
