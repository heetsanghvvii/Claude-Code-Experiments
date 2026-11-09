# nope brand system v1

Owner: Creative head. Date: 9 Nov 2026. Direction locked by the founder and CEO (DECISION_LOG D20): charcoal plus saffron. Terracotta is retired.
Overview image: `brand/brand-board.png`. Tokens: `brand/tokens.css`, `brand/tokens.ts`. App theme: `src/theme.ts`.

## 1. The idea in one line

A dark, quiet room with one warm light in it. Charcoal is the calm; saffron is the single deliberate act (the tap, the lock, the one button). If a layout has two saffron things competing, remove one.

## 2. Palette

| Token | Hex | Role |
|---|---|---|
| `charcoal-900` | #1C1C1E | Base. Backgrounds, text on light and on saffron |
| `charcoal-800` | #262628 | Raised surfaces on dark (cards, form panels) |
| `charcoal-700` | #323235 | Controls on dark (secondary buttons, unlocked state) |
| `charcoal-600` | #48484C | Borders and outlines only, never text |
| `stone-300` | #C9C7C3 | Warm grey. The stone puck colourway, secondary text on dark |
| `stone-500` | #9C9993 | Muted text on dark only |
| `stone-700` | #5C5A56 | Muted text on light only |
| `chalk-100` | #F5F4F1 | Off-white. Light base, primary text on dark |
| `chalk-200` | #E9E7E2 | Raised surface on light |
| `saffron-500` | #FF8A1F | The one accent: primary action, locked state, focus ring, one highlight line |
| `saffron-600` | #F27A0C | Pressed and hover state of saffron fills |
| `ember-700` | #A84A00 | Saffron family for text on light backgrounds (links on print, light pages) |
| `saffron-tint-dark` | #3A2817 | Quiet saffron wash on dark (notices, the NFC check box) |
| `saffron-tint-light` | #FFE7D1 | Quiet saffron wash on light |

Dark is the default brand mode (site, app, ads). Light is for print, the backup code card and partner documents.
Usage ratio guide: about 80 percent charcoal family, 15 percent chalk and stone, 5 percent saffron. The S2 price ad and the gift note are the only full-saffron surfaces.

### Contrast (WCAG 2.x, computed with the relative luminance formula)

Allowed text pairs. AA needs 4.5:1 for body text and 3:1 for text at 24 px, or 18.7 px bold, and above.

| Text | Background | Ratio | Use |
|---|---|---|---|
| chalk-100 | charcoal-900 | 15.47 | All body and headings on dark |
| chalk-100 | charcoal-800 | 13.73 | Text in cards |
| chalk-100 | charcoal-700 | 11.62 | Secondary buttons |
| chalk-100 | #19191B (alt section) | 15.96 | Alternate section band on the site |
| stone-300 | charcoal-900 | 10.08 | Secondary text, leads |
| stone-300 | charcoal-700 | 7.57 | Text on controls |
| stone-300 | saffron-tint-dark | 8.32 | Notices |
| stone-500 | charcoal-900 | 5.99 | Muted text, micro copy |
| stone-500 | charcoal-800 | 5.32 | Muted text in cards |
| stone-500 | charcoal-700 | 4.50 | Limit. Muted text on controls only at 16 px or larger |
| saffron-500 | charcoal-900 | 7.22 | Links, accent lines, questions |
| saffron-500 | charcoal-800 | 6.41 | Links in cards |
| saffron-500 | charcoal-700 | 5.42 | Accent text on controls |
| saffron-500 | saffron-tint-dark | 5.95 | Accent on notices |
| charcoal-900 | saffron-500 | 7.22 | All text on saffron buttons and saffron ads |
| charcoal-900 | chalk-100 | 15.47 | Text on light |
| charcoal-900 | stone-300 | 10.08 | Text on the stone puck colourway |
| stone-700 | chalk-100 | 6.26 | Muted text on light |
| ember-700 | chalk-100 | 5.24 | Accent text on light |
| ember-700 | chalk-200 | 4.66 | Accent text on raised light |

Banned pairs (fail AA):

| Text | Background | Ratio |
|---|---|---|
| chalk-100 or white | saffron-500 | 2.14 (fails). Never put white or chalk text on saffron |
| saffron-500 | chalk-100 | 2.14 (fails). Never use saffron as text on light; use ember-700 |
| stone-500 | chalk-100 | 2.58 (fails) |
| stone-300 | saffron-500 | 1.40 (fails) |
| stone-700 | charcoal-900 | 2.47 (fails) |

The app icon (chalk n on saffron) is a logo and is exempt from text contrast rules; it was the founder's chosen direction. A charcoal-on-saffron alternative is in `brand/logo/app-icon-charcoal-alt.svg` should a stronger small-size read be wanted.

Known gaps in the app (for the CTO, not my files): `src/screens/Rescue.tsx` lines 64 to 65 and 86 to 87 use `g.buttonText` (chalk) on a saffron button, 2.14:1. Fix: add `{ color: c.onAccent }` as the other screens already do. `src/components/HoldButton.tsx` shows chalk text over the saffron progress fill; switch the label to `c.onAccent` once the fill passes the middle, or keep the fill at 40 percent opacity.

## 3. Type

| Role | Face | Weight | Size (web) | Tracking | Leading |
|---|---|---|---|---|---|
| Display (hero, ad headlines) | Outfit | 800 | 56 to 144 px | -0.05em | 0.90 |
| Headings | Outfit | 800 | 34 to 58 px | -0.035em | 1.02 |
| Sub-heads, angle lines | Outfit | 700 | 20 to 42 px | -0.03em | 1.08 |
| Body | Outfit | 400 | 17 px | -0.005em | 1.55 |
| Labels, buttons | Outfit | 600 to 700 | 15 to 17 px | -0.01em | 1.2 |
| Micro (price lines, legal) | Outfit | 500 | 13 to 15 px | 0 | 1.45 |

Outfit is a free geometric sans (SIL Open Font License), close in spirit to the wordmark without copying it. Files: `brand/fonts/` (variable font plus static weights, Latin subset). The site inlines the variable font so it renders the same offline.
Fallback stack: `ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Arial, sans-serif`. In the app, Android's default Roboto at weight 800 is acceptable until we bundle Outfit.
Rules: sentence case everywhere, lowercase "nope" always, no all-caps labels (the app's LOCKED state is the one exception, as a status word), no eyebrows above every section, line length under 70 characters, never mix a serif in. Use "Rs 1,999" (not the rupee glyph, which the Latin subset lacks).

## 4. Logo

**Wordmark.** "nope" drawn as vector geometry (`brand/logo/nope-wordmark-*.svg`), not typed in a font. Heavy (stroke about 31 percent of x-height), single-storey geometric forms, perfect-circle bowls, a square spur on the n and p, and an e with a crossbar and an angled cut terminal. Tight, optically kerned (n-o and o-p closer than the stems suggest). Versions: dark (charcoal), light (chalk), saffron (saffron on charcoal only).
**App icon.** A lowercase n, from the same drawing but widened for an open counter, chalk on saffron. `assets/icon.png` is full bleed; Android adaptive foreground keeps the n inside the 66 dp safe circle (n is 330 of 1024 px tall).
**Puck mark.** A circle (the puck seen from above) with the n knocked through. Use for avatars, stickers, favicons in round contexts. Colourways: charcoal, saffron, stone.
**Favicon.** Charcoal n on a saffron rounded square, chosen for crispness at 16 to 32 px.

Clear space: the height of the wordmark's x-height (the o) on all sides. For the icon and puck mark, 25 percent of the mark's width.
Minimum size: wordmark 56 px wide on screen, 14 mm in print. App icon 16 px. Puck mark 20 px.
Don'ts: no outlines, no gradients, no shadows on the wordmark; do not retype it in Outfit; do not stretch, rotate or recolour outside charcoal, chalk and saffron; do not place the saffron wordmark on light backgrounds; no ring-and-dot icon (too close to a well-known camera app); no corner-bracket marks; nothing that echoes another focus device brand.

## 5. Voice

Calm, confident, a little witty, never shaming. Short sentences. Talk to an adult who chose this.
Do: "Put it down." / "Leave it in another room." / "It doesn't stop you. It makes you choose." / "No forms, no argument."
Don't: addiction, detox, cure, brain rot, dopamine, "unbypassable", "never locked out", "nothing leaves your phone" (until the CTO's manifest check), any numbers or results, any competitor name.
Claims follow `docs/CLAIMS_VERIFIED.md` and `ceo/reports/CLO.md` exactly.

## 6. Imagery

- The puck is the hero. Renders today are made from the real 64 x 16 mm STL (`product/case/nope_assembled.stl`) in three colourways, soft single key light from top left, tinted shadows, no reflections on the floor. Files in `marketing/assets/visual/renders/`. First prints are orange PETG; saffron is the closest render colour.
- Next: real photos (phone camera, window light) on plain charcoal card, plain chalk card, and a real kitchen shelf. Real beats render for trust; swap as soon as a print exists.
- Show the act, not the feeling: the tap, the puck on a shelf in another room, the app's locked state. No moody stock people, no "stressed person with phone" clichés.
- Never show real Instagram, YouTube or Facebook logos or icons. Generic tiles with text labels only. No fake notifications, no fake buttons in ads.
- Layout: big left-aligned type, the puck resting on a line (a shelf, a surface), generous empty charcoal. Text sits inside platform safe zones (stories: not in the top 14 percent or bottom 20 percent; reels: not in the bottom 35 percent).

## 7. Motion

- One orchestrated moment per screen. On the site: the headline rises in, then the puck settles down onto its surface (700 to 900 ms, ease-out `cubic-bezier(0.22, 1, 0.36, 1)`).
- Everything else answers a person: buttons press to 97 percent, the try-it puck dims the feed tiles when tapped, FAQ arrows rotate.
- The lock is a state change, not a celebration: a 220 ms colour change to saffron, no confetti, no shaking. (Exception: a short shake to point at the NFC question when someone tries to pay first.)
- Everything respects `prefers-reduced-motion`: animations collapse to instant.
- In reels: hard cuts, the tap shown uncut, captions burned in; the end card holds 2 seconds.

## 8. Do and don't

| Do | Don't |
|---|---|
| One saffron action per view | Saffron headlines, saffron body text on light, two saffron buttons side by side |
| Charcoal text on saffron | White or chalk text on saffron |
| Lowercase "nope", sentence case | "Nope", "NOPE", title case headlines |
| Real product, real app screens | Div-drawn fake phones, fake notifications, stock photos |
| Price, refund and "Android with NFC" near every call to action | Hidden conditions, countdowns, stock counters |
| Pills for actions, 20 px panels, 12 px inputs, circles for anything puck | Mixed corner radii without a rule |
