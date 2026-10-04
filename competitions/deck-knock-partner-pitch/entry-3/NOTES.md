# Entry 3 notes

## Direction (3 lines)
Private members' office, not software: warm ivory paper, deep forest ink, brass accents, Newsreader serif headlines with an italic forest second clause, Hanken Grotesk body.
One graphic idea only: a line-drawn arched door, closed on the cover and open on the close, with a brass knocker that also forms the logo mark.
Speaker-led density across 12 slides, one action title per slide, no invented numbers (the slide 2 grid and the example message are labelled "Illustrative").

## Skill steps followed
- Read SKILL.md, viewport-base.css (included in full), html-template.md, STYLE_PRESETS.md, animation-patterns.md.
- Skipped Phase 1 questions and Phase 2 style previews as instructed; chose low density / speaker-led and a custom calm editorial style myself (closest presets: Paper & Ink, Dark Botanical).
- Phase 3: single self-contained HTML, fixed 1920x1080 stage scaled as a whole, .active/.visible slide switching, keyboard/wheel/touch nav, progress bar, slow staggered reveals, prefers-reduced-motion, inline editing (E key / top-left hotzone, autosaves locally), speaker notes in hidden asides.
- Added @page 1920x1080 and print rules that force every slide and every reveal visible, one slide per page.
- Fonts embedded as base64 woff2 (SIL OFL) so the deck renders identically offline. No CDN libraries, no external images.
- Phases 5 and 6 (open, deploy, PDF export) skipped: no publishing allowed.
- Self-check: rendered with render_deck.py, reviewed the PNGs, fixed everything in one batch, confirmed once.

## Brand set (requested by the user)
- brand/brand-guidelines.html: brand idea, logo usage, colour palette and proportions, typography scale, voice rules with do/don't, graphic language, claims policy, asset index.
- brand/knock-logo.svg, knock-logo-reversed.svg, knock-mark.svg, knock-mark-reversed.svg, brand/tokens.css.

## Problems
- First render: Google Fonts did not load in the headless renderer, so the deck fell back to Times/Arial. Fixed by embedding the fonts.
- First render: content sat high with empty space at the bottom and titles left orphan words. Fixed with a centred content block and text-wrap: balance.
- The rupee sign comes from the embedded Newsreader latin-ext subset. The SVG logo files use live text, so they need outlining before going to a print vendor (noted in the guidelines).
