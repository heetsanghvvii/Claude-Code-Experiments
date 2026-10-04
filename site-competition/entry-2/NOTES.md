# Knock, entry 2

## Design direction
- A private career concierge, not software: deep ink green, warm ivory paper and brass, like a quiet members' club.
- Editorial typography (Fraunces serif headlines, Figtree body). The page leads with words, not with UI chrome.
- One motif carries the brand: an arched door, slightly open, with warm light spilling out. "Knock on the right door."

## Key decisions
- Custom theme "Brass Door" (spec in `design-spec-theme.md`). None of the preset themes fit; it blends the calm of Forest Canopy with the warmth of Golden Hour, retuned for WCAG AA (Deep Brass #87591A for accent text on light, Brass #D4A458 only on dark).
- Built with React + TypeScript + Tailwind + shadcn/ui (Accordion, Input, Label), bundled with Parcel and html-inline into one `index.html`. Source is in `knock-app/` (node_modules removed; `pnpm install` then the bundle script and `python3 finalize.py` rebuild it).
- Google Fonts links are added after bundling (`finalize.py`) because the inliner tries to read remote URLs as local files.
- Every primary CTA reads "Get my target list" and scrolls to the intake form, then focuses the first field.
- The example message is a plain message card with annotations explaining why it works, not a fake LinkedIn screenshot, and is labeled illustrative.
- The problem section uses a visual queue of "Applied, no response" rows against one reply. No numbers, logos, testimonials or user counts anywhere.
- Prices shown as ₹ (INR) with a screen-reader "rupees" label. A line notes there are no reply guarantees, only guaranteed work.
- Form: client-side validation with inline, aria-linked errors, focus moves to the first error; success state replaces the form and receives focus.
- Accessibility: skip link, visible 3px focus outline (brass on dark sections), reduced motion disables the door animation and smooth scrolling, no scroll-triggered reveals so content never hides.
- Checked in Chromium at 1440px and 390px: no horizontal overflow, no console errors (fonts load from Google Fonts).

## Could not do
- No backend: the form does not send anywhere; it shows the success state only.
- Real photography or illustrations were out of scope (no external images); the door is pure CSS.
