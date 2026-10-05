# Entry notes

## Direction
1. Private career concierge: warm ivory paper, deep forest ink, brass detail; Newsreader serif headlines with Instrument Sans body.
2. One signature device, the arched door (title, close, "four kinds of doors", arched package cards, door-plate page numbers), carrying "Knock on the right door."
3. Speaker-led density: 12 slides, one action title per slide, no invented numbers, a dark title and close bracketing light content slides.

## Skill steps followed
- Mode A (new presentation). Skipped the content questions and style previews per the brief; chose low density / speaker-led and one custom style myself, following the design aesthetics rules (no Inter/Roboto, no purple gradients, committed palette, one graphic device).
- Fixed 1920x1080 stage with the full viewport-base.css inlined; slide switching via .active/.visible; stage scaled by one transform.
- Single self-contained HTML, inline CSS/JS, Google Fonts only, no CDN libraries, commented sections.
- SlidePresentation controller: keyboard, wheel, touch nav, progress bar outside the stage; reduced-motion support; calm staggered reveals.
- Inline editing by default (hover top-left or press E, saved to localStorage).
- Added print rules: @page 1920x1080, every slide shown, reveals forced visible, chrome hidden. One slide per page.
- Rendered once with the competition renderer, reviewed PNGs, fixed in one batch (empty lower space on slides 3, 5, 10, 11; then an overlap on slide 3), confirmed.

## Problems
- Several slides were top-heavy on first render; added closing bands and larger elements. A follow-up overlap on slide 3 was corrected and re-checked.
- Fonts load from Google Fonts; offline viewing falls back to Georgia / Helvetica.
