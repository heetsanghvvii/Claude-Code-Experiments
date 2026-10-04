# Knock, entry 12

## Design direction
A private concierge, not software: warm paper, deep bottle green, a brass accent and a lit doorway.
Editorial serif headlines (Fraunces) over a quiet sans (Inter), generous space, very few elements per screen.
Motion is calm and sparse: one door opening in the hero, gentle reveals, and crisp press feedback.

## Key decisions
- The tagline drives the one illustration: a CSS door that swings open once on load to warm light, with a "shared reason to talk" note. No robots, no gradients that read as AI.
- The problem section contrasts "The portal" (a fading list of unanswered applications) with "The person" (a short illustrative thread).
- The example message is a plain message card with highlights, plus three notes on why it works. It is labelled as illustrative and is not an app screenshot.
- Every CTA reads "Get my target list". Package buttons scroll to the form and preselect that package; focus moves to the first field.
- Form: inline validation on blur and submit, errors linked through aria-describedby, a short loading state, then a crossfade (with slight blur) to a personalised success state with focus moved to it.
- Motion: custom ease-out curve, transform and opacity only, 70ms staggers, button press scale(0.97) at 160ms, hover effects gated to fine pointers, FAQ accordion via grid rows. Reduced motion keeps fades and drops all movement (door shown already open).
- Mobile: a sticky bottom CTA appears after the hero and hides while the form is on screen.
- No testimonials, logos, counts or statistics. The only numbers are product facts from the brief.

## Could not do
- Google Fonts are blocked by the sandbox proxy, so screenshots used the Georgia/system fallback; the live page will use Fraunces and Inter.
- Form is static (no backend), as the brief allows.
