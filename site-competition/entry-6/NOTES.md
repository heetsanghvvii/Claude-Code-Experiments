# Knock, entry 6

## Design direction
Private career concierge: warm paper, deep ink and a single brass accent, like a well-made letter rather than software.
Editorial serif headlines (Cormorant) over a clean sans (Montserrat) for warmth with clarity.
One visual metaphor carried through: a door left ajar with light behind it. No robots, no gradients, no AI badges.

## Key decisions
- Palette and type came from the design-system search (premium black + gold, Cormorant/Montserrat). Gold was darkened to #854D0E/#A16207 for text on light, and a lighter #E3B55B is used only on dark backgrounds, so every pairing passes WCAG AA.
- The recommended "Liquid Glass" style was rejected: it is aimed at Apple system chrome and reads as tech, which fights the brief. Only a light blurred sticky header remains of it.
- Rhythm alternates light and dark sections (problem, intake) so the page reads as chapters: problem, method, proof of craft, price, action.
- The example message is shown as a plain note card with highlighted lines and three annotations explaining why it works, labeled "Illustrative example", not a fake LinkedIn screenshot.
- Primary CTA label is always "Get my target list": header, hero, each package card, mobile sticky bar and the form submit. Package buttons remember the chosen plan and mention it in the success message.
- Form: visible labels, helper text, inline errors on blur and submit with aria-invalid/aria-describedby, focus moves to first error, brief loading state, then a focused success panel (role=status).
- Mobile: single column, full-width CTA, sticky bottom CTA that appears after the hero and hides at the form. Checked no horizontal scroll at 390px and 1440px.
- Motion is subtle (short fade-up on scroll, slow light "breathe" on the door) and fully disabled under prefers-reduced-motion. Content is visible without JS.
- No testimonials, logos, counts or statistics. No em dashes or exclamation marks in copy.

## Could not do
- Google Fonts were blocked in the local test browser, so screenshots used fallback serif/sans; the font stack degrades to Georgia/system-ui gracefully.
- Form is static (no backend), as allowed.
- Design-system spec persisted in design-system/knock/MASTER.md.
