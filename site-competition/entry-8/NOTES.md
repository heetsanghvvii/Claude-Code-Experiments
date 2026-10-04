# Knock, entry 8

## Design direction (3 lines)
"Lit Threshold": a calm field of identical closed doors in which exactly one stands open with warm light falling out of it.
Warm ivory paper, deep ink-green and a single aged-brass accent used only where light or touch happens; no gradients, no tech glow.
High-contrast serif (Instrument Serif) for the few words that matter, precise sans (Instrument Sans) for everything else; generous space, hairline rules.

## Key decisions
- Visual language came from a written design philosophy first (`design-philosophy.md`), then expressed as the hero art: a 10 x 6 grid of 60 doors (a quiet nod to the 60 hand-picked people), one ajar, annotated like an architect's survey. Inline SVG, about 9 KB.
- The brand mark is the same arched door with a brass knocker point; it reappears in the problem section (a queue of 20 doors versus one lit door) and in the form success state ("The door is open.").
- "How it works" is a two-lane swimlane diagram (You / Knock) showing the real mechanism: targets flow to Knock, drafts cross back to you for approval, approved messages go out from your LinkedIn, and every reply loops back through your approval until it becomes a referral or interview. A wide left-to-right SVG for desktop and a separate top-to-bottom SVG for mobile, both with labelled arrows, role="img" and aria-labels.
- Example message is shown as a quiet letter card (recipient line, the message, "Drafted by Knock · Approved by you"), not an app screenshot, with three margin notes explaining why it works.
- One primary action, "Get my target list", used on every CTA (nav, hero, each package, form submit). The done-for-you option uses a secondary mail link.
- No testimonials, logos, counts or invented stats. Pricing note states plainly that replies are not guaranteed.
- Accessibility: visible focus rings tuned per background, skip link, labelled inputs with inline errors and aria-invalid, success message in a live region that receives focus, prefers-reduced-motion disables the reveal and door-swing animations. Text colour pairs checked at 4.6:1 or better.
- Copy avoids em dashes and exclamation marks.

## Checks
- Rendered with Playwright Chromium at 1440 px and 390 px: no horizontal scroll, all nine sections present, form validation and success state work, no JS errors.

## Could not do / caveats
- Google Fonts could not load in the sandbox (TLS interception), so test screenshots show the Georgia / system fallbacks. The fallback stack keeps the layout intact; with Instrument Serif loaded, headlines set slightly narrower.
- The form is static (no backend), as the brief allows.
