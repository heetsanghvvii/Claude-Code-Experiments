# Entry notes

## Direction
- Private career concierge: deep forest green, brass and white, Cambria headings with Calibri body; calm, premium, no AI imagery.
- One repeated motif: a door (frame, panel, brass knob, a sliver of warm light when open), used on title, close, comparison, approval band and metric slides.
- 12 slides with action titles: problem, what works, 4-step method, example message, anti-spam guardrails, concierge vs tool, packages, partnership, metric, pilot timeline, next step.

## Skill steps followed
- Built from scratch with a pptxgenjs script as a structured deck: theme object first, scheme colors throughout, three named layouts (Title Dark, Content Light/Mist, Close Dark) with title/body placeholders, footer and slide number on layouts, sections per story part, objectName on composed shapes, speaker notes on every slide.
- Wrote file then applied theme colors with the skill's apply_theme.js; ran office/validate.py (passed); markitdown content check (no placeholders left except the intended <Club name>, no em dashes).
- Followed design rules: safe fonts, 36pt-ish titles left aligned at the same position, no accent lines under titles or edge stripes, varied layouts, native editable table and shapes, no invented numbers (problem grid labelled "Illustration, not data").
- Visual QA: rendered to PNG, fixed in one batch (title alignment, step 3 title overlap, footnote colliding with footer, guard card title wrap, Done-for-you price wrap, closing title overrunning its label), confirmed.

## Problems
- pptxgenjs was not preinstalled as the skill claimed; installed locally in the entry folder (removed after build).
- apply_theme.js needs NODE_PATH pointing at the local node_modules.
- Renderer lacks Cambria/Calibri and substitutes wider fonts, so previews are slightly more cramped than real PowerPoint; layouts were sized to fit the wider fallback.
- Placeholder font size overrides on a slide are ignored by the layout, so the close slide got its own layout.
