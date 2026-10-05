# Entry 6 notes

## Direction (3 lines)
Custom "Brass Door" theme: deep evergreen and white with a single brass accent, Times New Roman headings over Arial body, for a calm private-concierge feel.
One motif carried through: a brass door-knocker ring (logo, step numbers, bullets, footer) plus a drawn vector door on title, people and close slides.
12 slides, one action title each: problem, what works, four steps, who we find, example message, guardrails, packages, offer, metric, pilot timeline, next step.

## Skill steps followed
- theme-factory: reviewed preset themes (Desert Rose, Forest Canopy and others); none fit "private career concierge" without leaning eco or boutique, so created a custom theme (palette + font pair) as the skill allows. The brief stood in for the showcase and approval steps.
- pptx: pptxgenjs structured deck. THEME object, scheme colors only, sections, two layouts (DARK, CONTENT with title placeholder, footer and slide number), objectName on shapes, speaker notes, writeFile then applyTheme.
- Ran validate.py (passed), rendered with LibreOffice through the competition render script, checked the PNGs, fixed everything in one batch, re-rendered to confirm.

## Problems
- pptxgenjs was not installed globally, so I installed it into a temp folder inside this entry (deleted afterwards).
- Cambria and Calibri are not installed here, so the render fell back to wide DejaVu fonts and text overflowed. I switched to Times New Roman and Arial, which render true to width here through Liberation fonts.
- The floor-light trapezoid lost its transparency in LibreOffice, so I replaced it with a solid doorstep. I also fixed wrapping on the package, partnership and metric cards and left-aligned the titles.
- Minor: on the title slide, "door." wraps onto its own line.
