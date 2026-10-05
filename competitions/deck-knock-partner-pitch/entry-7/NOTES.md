# Entry 7 notes

## Direction (3 lines)
Private career concierge, not software: warm paper and ink navy, with brass as the single accent, a Fraunces serif for headlines and Inter for body.
One idea per slide with action titles, built as a 12-slide argument: problem, what works, what Knock does, proof by example, safety, price, offer, measurement, pilot, ask.
The recurring motif is a line-drawn door (the "right door" in the tagline). No robots, no gradients, no invented numbers, testimonials or logos.

## Skill steps followed
1. Loaded the slides skill and its `create` subcommand, then read the layout-patterns, html-template, copywriting-formulas and slide-strategies references.
2. Ran the offline design-system search for "Knock". Kept its storytelling sequence (hook, problem, journey, solution, climax CTA) and its CTA-at-the-end rule. Rejected its glass/translucent style because the brief asks for a calm, premium feel.
3. Set up design tokens as CSS custom properties (`--color-*`, `--font-*`) following the html-template structure, and used the skill's 1920x1080 slide sections with keyboard navigation.
4. Matched each storyline beat to a layout pattern: title split, process flow, comparison table, 4-step cards, annotated example, big-number plus list, tiered pricing, two-sided offer, metric funnel, timeline, CTA.
5. Wrote the copy with copywriting formulas (PAS for the problem, a clear single CTA for the close). Short sentences, no hype, no exclamation marks, no em dashes.
6. Drew every visual as inline SVG/CSS because CDNs are blocked, so there is no Chart.js.
7. Added `@media print` with `@page 1920px 1080px` so the deck prints one slide per page.
8. Rendered once and checked the result. Fixed everything in one batch, re-rendered once to confirm, then deleted the temp files.

## Problems
- Chart.js, which the skill relies on, is blocked. The metrics slide uses HTML/CSS instead.
- Google Fonts may not load in an offline renderer. If they don't, the headlines fall back to a system serif, which still fits the tone.
- On the first render, the body content sat high on several slides and left the bottom third empty. Fixed by centring each slide's body block in the space under its title.
- The "who it helps" slide had italic quotes that could be read as testimonials. They are now labelled "Typical case" and have no quotation marks.
