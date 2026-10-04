# Knock, entry 10

## Design direction
- Private correspondence: warm paper, deep forest-green ink, a brass accent taken from a door knocker.
- Editorial serif (Fraunces) for voice, Instrument Sans for reading and forms; ruled lines and numbered lists instead of icon cards.
- The product is shown as artifacts of the service: a hand-researched target list and an annotated first message.

## Key decisions
- Followed the local new-work playbook, then the craft checks, then the finish gate. The paid UIZZE MCP and uizze.com were not available, so no external screen references were used; all decisions come from the brief and the local playbooks.
- Direction choice was delegated by the brief, so I picked one of three considered (correspondence/paper, dark private-bank, newspaper editorial). Paper won because it reads human and calm, not software.
- Hero visual is an "Illustrative" target list (roles and shared reasons, no fake names or numbers) rather than an app mockup.
- Example message is a plain message card with highlights, paired with three notes on why it works.
- "Get my target list" is the only CTA label, used in nav, hero, each package and the form submit. Every CTA scrolls to the form and focuses the first field; package buttons remember the chosen package and show it in the success recap.
- Form states: empty, inline errors on blur, error summary with jump links on submit (focus moves to first invalid field), short sending state, success panel with recap and "Edit my details".
- No testimonials, logos, counts or statistics. Prices use tabular numerals. No em dashes or exclamation marks in copy.
- Accessibility: skip link, visible brass focus ring, aria-invalid and described-by errors, details/summary FAQ, reduced motion turns off smooth scroll and reveals, AA contrast on all text (brass is only decorative or on dark green).
- Mobile (390px): single column, vertical step timeline, stacked plans with Standard emphasised, full-width buttons, sticky nav keeps the CTA reachable. Verified no horizontal scroll.

## Verified
Rendered with Playwright Chromium at 1440px and 390px: full page, hero, form empty, error and success states, CTA focus behaviour, no horizontal overflow, no console errors.

## Could not do
- No UIZZE reference retrieval (paid MCP unavailable).
- Form is static: no backend, submission is simulated client side.
- Google Fonts load from the network; offline the page falls back to Georgia and system sans.
