# Knock, entry 11

## Design direction
Warm editorial luxury: cream paper, espresso ink, one amber accent and a muted sage, with a faint film grain.
Big Instrument Serif headlines with italic amber turns of phrase, Plus Jakarta Sans for body, lots of air.
Every card is a "double bezel" (soft outer tray, paper inner plate), with a single motif: a row of doors, one open and lit.

## Key decisions
- Hero visual is a CSS row of arched doors where one swings open, a quiet nod to "Knock on the right door". No robots, no AI language.
- Problem section is a dark espresso slab: a fading queue of "Applied, No response" rows ending in one lit "Replied" conversation.
- How it works is an asymmetric bento of 4 numbered steps; step 4 is sage to mark the payoff, followed by a pill "You approve every message".
- Example message is shown as a plain message card (recipient, bubble, "drafted by Knock, approved by you" caption) on slightly rotated paper layers, with three annotations explaining why it works. Rotations are removed on mobile.
- Packages: Standard is the dark, highlighted card with a "Most popular" tag; done-for-you sits as a wide strip below; the reply guarantee wording matches the brief (extra week if fewer than 5 replies), no reply promises.
- Every CTA reads exactly "Get my target list" and uses a pill with a nested arrow knob that shifts on hover.
- Floating pill nav; on mobile a hamburger morphs into an X and opens a blurred full-screen menu with staggered links (Esc closes).
- Intake form validates client-side, marks errors inline with aria-invalid, then swaps to a personalised success state (first name and companies) with focus moved to it.
- Scroll reveals use IntersectionObserver; content is visible without JS, and prefers-reduced-motion disables all motion.
- No testimonials, logos, user counts or invented statistics. "60, not 6,000" comes straight from the brief.

## Could not do / caveats
- Google Fonts could not load in the sandbox (certificate error), so screenshots used fallback serif/sans. The layout holds with fallbacks; real fonts will look tighter and more refined.
- Form is static (no backend), as allowed.
