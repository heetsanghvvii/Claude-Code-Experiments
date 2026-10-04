# Entry 5: Knock

## Design direction
- A private-concierge feel built around the tagline: a deep bottle-green door with a brass knocker and a brass name plate on cool sage paper.
- Bricolage Grotesque for display, Figtree for body text, IBM Plex Mono for small "door plate" labels. Brass is the only accent.
- Calm and editorial: asymmetric two-column sections, one bold band (the example message shown as a drafted note), and a single small motion (the knocker taps every few seconds).

## Key decisions
- Built with the built-in artifact-design skill's guidance (tokens on :root, light + dark themes, avoiding templated AI looks such as cream/terracotta and purple gradients). Nothing was published; this is a local file only.
- Numbered markers ("Door 01-04") are used only for How it works, because it is a real sequence.
- The example message is presented as a draft note awaiting approval (who it is for, the shared reason, no ask yet), not a fake app screenshot. The hero reply card is labeled "Example reply".
- No testimonials, logos, counts or statistics. Pricing states that replies are not guaranteed and repeats the founding-member extra-week offer.
- Every primary CTA reads "Get my target list" and scrolls to the intake form. The form validates inline (plain-language errors, aria-invalid, focus moves to the first problem) and shows a personalised success state that names the person's target companies.
- Accessibility: skip link, visible brass focus ring, native details/summary FAQ, prefers-reduced-motion disables the knock animation and smooth scroll, AA contrast checked in both themes.
- Checked with Playwright at 1440px and 390px (light and dark): no horizontal overflow, no console errors, form submit and success state work.

## Could not do
- No backend: the form is static and only shows a success state.
- The contact email is shown as selectable text rather than a mailto link.
