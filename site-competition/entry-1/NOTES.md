# Knock, entry 1

## Design direction
Calm, premium service page that feels like a private career concierge: cool green-tinted off-white, one deep forest-green accent, Geist sans throughout.
The core image is a door (the tagline made literal), drawn as a simple arched CSS shape holding a sample target list, so the hero shows the actual deliverable.
Quiet confidence over flash: big plain headlines, generous space, motion only where it explains something.

## Key decisions
- Design read: premium service landing for skeptical, mobile-first MBA job seekers in India. Dials: variance 6, motion 4, density 3 (calm and premium, not agency).
- Palette: forest green on cool neutrals, chosen on purpose instead of the cream and brass look. One accent, locked across every section. Light and dark themes both come from `prefers-color-scheme` through CSS variables, and both were checked.
- Shape rule: interactive buttons are full pill, cards and panels are 16px, inputs are 10px.
- Every section uses a different layout: split hero, editorial statement with a two-column contrast, sticky heading with a step list, a 4-cell bento (the 60-dot grid shows the 60 people), a single annotated message, a raised middle pricing tier, a narrow accordion FAQ, and a split intake form.
- The example message is shown as a plain message card, not app chrome. Underlined phrases are numbered and explained, which shows the craft behind it.
- One CTA label everywhere: "Get my target list". The pricing buttons carry the chosen package into the form, and it shows there with a "Change" link.
- The form validates inline with errors below each field and focuses the first problem. It shows a short sending state, then a personal success panel that receives focus.
- Motion: staggered hero entry, a gentle rise as sections come into view (transform only, so content is readable even if it never fires), dots filling in sequence, and pushes on button press. All of it is turned off under `prefers-reduced-motion`. No scroll listeners: IntersectionObserver only.
- Accessibility: skip link, visible focus rings, labels above inputs, `aria-invalid` and `aria-describedby` on fields, native `details` for the FAQ, AA contrast in both themes.
- Icons are Phosphor (regular) SVG paths, inlined so there are no external requests.

## What I could not do
- No photography: the brief bans external images and there was no image tool. The hero visual is a CSS door with a real-content component instead.
- Google Fonts are blocked in this sandbox, so the test renders used the system fallback sans. The layout was sized to work in both fonts.
- The form has no backend. Submission only shows the success state on the page.
