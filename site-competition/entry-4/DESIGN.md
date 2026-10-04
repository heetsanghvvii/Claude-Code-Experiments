# DESIGN.md: Knock

> A private career concierge on warm paper: quiet ivory, deep door-green, one brass glint, and the sound of a single knock.

## 1. Visual Theme & Atmosphere

**Style**: Cream Editorial x Warm Professional (seed mix: palette + type from Cream Editorial, motion and component softness from Warm Professional)
**Keywords**: concierge, letterpress, calm, considered, human, private, warm, editorial
**Tone**: calm, premium, personal, plainspoken. NOT growth-hacking, NOT "AI tool", NOT neon, NOT purple gradients, NOT robots.
**Feel**: A handwritten introduction slipped under the right door, on heavy ivory card stock.

**Signature motif**: the door. An arched doorway in inline SVG with warm light spilling out, and concentric "knock" rings that pulse twice on load (two knocks, then stillness).

**Interaction Tier**: L2 (fluid interaction)
**Dependencies**: CSS only + ~120 lines vanilla JS (IntersectionObserver, rAF-throttled pointer vars). No GSAP, no Lenis, no WebGL (performance red line, calm brand).

### The 3 "wow" moments + 1 clever detail (landing page rule)
| # | Position | Move |
|---|----------|------|
| 1 | Hero | Word-by-word mask reveal of the serif headline, the doorway SVG with light spill, two knock rings radiating from the door on load, cursor-following warm light (`--mx/--my` radial-gradient, desktop only). |
| 2 | First scroll (The problem) | A dark "queue" band: two marquee rows of struck-through application log lines ("Application #214 · Associate PM · No response") drifting past, then a large serif statement "People hire people." that resolves in. |
| 3 | List / showcase | "How it works" is a sticky-left / scrolling-right timeline with a progress rail that fills as you scroll. "Why it works" is a bento (unequal) grid with SpotlightCard hover light. |
| Clever | Footer + logo | Hover or focus the small door mark in the footer: it knocks twice and a tooltip whispers "Knock knock. Who's there? Your next interview." |

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #F5F0E7;              /* ivory paper, page background */
  --surface: #FFFDF8;         /* cards, form, message card */
  --surface-alt: #ECE5D8;     /* alternating sections, inputs hover */
  --surface-hover: #FBF7EF;   /* card hover */
  --ink: #17201C;             /* dark section (problem band, footer) */
  --ink-2: #1F2B26;           /* raised surface on ink */

  /* Borders */
  --border: #DCD3C3;
  --border-hover: #B9AD98;
  --border-ink: #34413B;      /* borders on ink */

  /* Text */
  --text: #1C1B18;            /* headings, key text       15.2:1 on bg */
  --text-secondary: #4A463F;  /* body                     8.3:1 on bg */
  --text-tertiary: #6B655A;   /* labels, meta             5.1:1 on bg */
  --text-on-ink: #F5F0E7;     /* 14.7:1 on ink */
  --text-on-ink-muted: #C9BFAE; /* 9.2:1 on ink */

  /* Accent */
  --accent: #1F4A3A;          /* door green: CTA, links   8.8:1 on bg */
  --accent-hover: #163829;
  --accent-soft: #DDE6DF;     /* tinted fills */
  --brass: #8A5420;           /* small labels, eyebrows   5.5:1 on bg */
  --brass-light: #D9A86A;     /* decorative light on ink  7.8:1 on ink */
  --glow: #F2C98A;            /* door light, decorative only */

  /* RGB variants for rgba() */
  --bg-rgb: 245, 240, 231;
  --ink-rgb: 23, 32, 28;
  --accent-rgb: 31, 74, 58;
  --glow-rgb: 242, 201, 138;
  --text-rgb: 28, 27, 24;

  /* Semantic */
  --success: #2F6B47;
  --error: #A23B2A;
  --warning: #8A5420;
}
```

**Color Rules:**
- Every color in code is a `var(--*)`. Zero hex outside `:root`.
- One accent per section: door-green for actions, brass only for eyebrows and tiny marks. Never both as fills side by side.
- `--glow` is decoration only (light spill, rings). Never put text on it.
- Dark `--ink` is used exactly twice: the problem band and the footer, to bookend the page.

## 3. Typography Rules

**Font Stack:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Hanken+Grotesk:wght@400;500;600&display=swap');
--font-display: 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
--font-body: 'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero H1 | Fraunces (opsz 144) | clamp(2.9rem, 7.2vw, 6.25rem) | 500 | 0.98 | -0.025em |
| Section H2 | Fraunces | clamp(2rem, 4.2vw, 3.4rem) | 500 | 1.05 | -0.02em |
| H3 | Fraunces | 1.4rem | 500 | 1.2 | -0.01em |
| Body | Hanken Grotesk | 1.0625rem | 400 | 1.65 | 0 |
| Label / eyebrow | Hanken Grotesk | 0.78rem | 600 | 1.2 | 0.14em, uppercase |
| Mono / log lines | Hanken Grotesk (tabular nums) | 0.95rem | 500 | 1.4 | 0.02em |

**Typography Rules:**
- Italic Fraunces is the "human voice" accent: one italic phrase per headline at most ("Start *conversations*.").
- Body max width 62ch. Never justify.
- Hero weight is 500 rather than 700: Fraunces at display opsz is already high-contrast; heavier reads loud, not premium.
- **NEVER use**: Inter, Roboto as display, Space Grotesk, Orbitron, any monospace "terminal" look, Poppins.

**Text Decoration (per text-decoration-rules decision table, Cream Editorial ~ restrained):**
- Hero H1: no gradient, no shadow. Mask reveal only.
- Section H2: no gradient, no shadow.
- Eyebrows: brass color with a 24px brass rule before them.
- Body: no decoration. Links: underline with offset, thickening on hover.

## 4. Component Stylings

### Buttons
```css
.btn {
  display: inline-flex; align-items: center; gap: .6rem;
  min-height: 48px; padding: .85rem 1.4rem; border-radius: 999px;
  font: 600 1rem/1 var(--font-body); text-decoration: none; cursor: pointer;
  border: 1px solid transparent; transition: background .25s, transform .25s, box-shadow .25s, color .25s;
}
.btn-primary { background: var(--accent); color: var(--surface); box-shadow: 0 1px 0 rgba(var(--text-rgb), .08), 0 8px 24px -10px rgba(var(--accent-rgb), .55); }
.btn-primary:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 14px 30px -12px rgba(var(--accent-rgb), .6); }
.btn-primary:active { transform: translateY(0) scale(.98); }
.btn-primary:focus-visible { outline: 3px solid var(--brass); outline-offset: 3px; }
.btn-primary:disabled, .btn-primary[aria-disabled="true"] { background: var(--border-hover); color: var(--surface); cursor: not-allowed; transform: none; box-shadow: none; }
.btn-ghost { background: transparent; color: var(--text); border-color: var(--border-hover); }
.btn-ghost:hover { background: var(--surface); border-color: var(--text); }
.btn-ghost:active { transform: scale(.98); }
.btn-ghost:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
.btn-ghost:disabled { color: var(--text-tertiary); border-color: var(--border); cursor: not-allowed; }
.btn .arrow { transition: transform .3s; }
.btn:hover .arrow { animation: knock .5s ease-out; } /* the arrow "knocks" twice */
```

### Cards
```css
.card { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 1.75rem; transition: border-color .25s, transform .25s, box-shadow .25s; overflow: hidden; }
.card::before { /* spotlight */ content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity .3s;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(var(--glow-rgb), .28), transparent 60%); }
.card:hover { border-color: var(--border-hover); transform: translateY(-3px); box-shadow: 0 18px 40px -24px rgba(var(--text-rgb), .35); }
.card:hover::before { opacity: 1; }
.card:focus-within { border-color: var(--accent); }
.card.is-featured { border: 2px solid var(--accent); }
```

### Navigation
```css
.nav { position: fixed; inset: 0 0 auto 0; z-index: 50; height: 68px; display: flex; align-items: center; transition: background .3s, border-color .3s, box-shadow .3s; border-bottom: 1px solid transparent; }
.nav.scrolled { background: rgba(var(--bg-rgb), .86); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom-color: var(--border); }
.nav a:not(.btn) { color: var(--text-secondary); text-decoration: none; padding: .6rem .2rem; }
.nav a:not(.btn):hover { color: var(--text); }
.nav a:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 4px; }
```

### Links
```css
a.link { color: var(--accent); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .22em; transition: text-decoration-thickness .2s, color .2s; }
a.link:hover { text-decoration-thickness: 2px; color: var(--accent-hover); }
a.link:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 3px; }
```

### Tags / Badges
```css
.eyebrow { display: inline-flex; align-items: center; gap: .7rem; font: 600 .78rem/1.2 var(--font-body); letter-spacing: .14em; text-transform: uppercase; color: var(--brass); }
.eyebrow::before { content: ""; width: 24px; height: 1px; background: currentColor; }
.badge { display: inline-block; padding: .35rem .7rem; border-radius: 999px; background: var(--accent); color: var(--surface); font: 600 .75rem/1 var(--font-body); letter-spacing: .06em; text-transform: uppercase; }
```

### Form fields
```css
.field input { width: 100%; min-height: 48px; padding: .8rem 1rem; border-radius: 12px; border: 1px solid var(--border-hover); background: var(--surface); color: var(--text); font: 400 1rem var(--font-body); transition: border-color .2s, box-shadow .2s; }
.field input:hover { border-color: var(--text-tertiary); }
.field input:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(var(--accent-rgb), .25); }
.field input[aria-invalid="true"] { border-color: var(--error); }
.field input:disabled { background: var(--surface-alt); color: var(--text-tertiary); }
.field .error { color: var(--error); font-size: .875rem; }
```

### Message card (example first message)
A letter-like card: surface, 1px border, small avatar initials circle, sender line, message body in Fraunces italic-free 1.25rem, with three brass annotation pins connected by thin lines on desktop (stacked notes on mobile). Not a fake app UI: no chrome, no status bar, no app logos.

### FAQ
Native `<details>/<summary>`; summary min-height 56px, plus icon rotates 45deg on open; focus-visible ring in accent.

## 5. Layout Principles

**Container:** max width 1200px; padding-inline clamp(16px, 4vw, 40px); narrow variant 760px for FAQ and form intro.

**Spacing Scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
- Section padding: clamp(80px, 11vw, 140px) block.
- Component gap: 24px (mobile 16px).
- Card internal padding: 28px (mobile 22px).

**Grid:**
```css
.hero-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: clamp(32px, 5vw, 72px); align-items: center; }
.steps-wrap { display: grid; grid-template-columns: 5fr 7fr; gap: 64px; }
.bento { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
.bento .b1 { grid-column: span 4; } .bento .b2 { grid-column: span 2; }
.bento .b3 { grid-column: span 2; } .bento .b4 { grid-column: span 4; }
.pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: stretch; }
```

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | border 1px var(--border), no shadow | sections, inputs, FAQ |
| Subtle | 0 1px 0 rgba(text,.06) | nav when scrolled |
| Elevated | 0 18px 40px -24px rgba(text,.35) | card hover, message card |
| Featured | 2px accent border + 0 30px 60px -30px rgba(accent,.45) | Standard pricing card |
| Light | radial glow rgba(glow,.35-.6) | door light, cursor light, spotlight |

Paper grain: an inline SVG feTurbulence noise at 5% opacity over `body::before`, fixed, pointer-events none.

## 7. Animation & Interaction

**Motion Philosophy**: Two knocks, then calm. Only opacity, transform and clip-path. Nothing loops except the slow marquee in the problem band.
**Tier**: L2

### Dependencies
None. Vanilla JS.

### Entrance Animation
```css
.h1 .w { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: .08em; }
.h1 .w > span { display: inline-block; transform: translateY(105%); animation: rise .9s cubic-bezier(.2,.7,.1,1) forwards; animation-delay: calc(var(--i) * 70ms + 120ms); }
@keyframes rise { to { transform: none; } }
.fade-in { opacity: 0; animation: fadeUp .8s .7s cubic-bezier(.2,.7,.1,1) forwards; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes ring { 0% { transform: scale(.6); opacity: .7; } 100% { transform: scale(2.4); opacity: 0; } }
@keyframes knock { 0%,100% { transform: translateX(0); } 20% { transform: translateX(3px); } 40% { transform: translateX(0); } 60% { transform: translateX(3px); } }
```

### Scroll Behavior
```js
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
// nav state
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 24), { passive: true });
// steps progress rail: rAF-throttled, sets --progress (0..1) on .steps
// parallax: door light layer translates at 0.15x scroll (hero only, rAF)
```
```css
[data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .8s cubic-bezier(.2,.7,.1,1), transform .8s cubic-bezier(.2,.7,.1,1); transition-delay: calc(var(--d, 0) * 90ms); }
[data-reveal].in { opacity: 1; transform: none; }
/* H2 "ScrollFloat"-style: words float up in sequence when the heading enters */
.h2-split .w > span { display: inline-block; transform: translateY(60%); opacity: 0; transition: transform .7s, opacity .7s; transition-delay: calc(var(--i) * 50ms); }
.h2-split.in .w > span { transform: none; opacity: 1; }
```

### Hover & Focus States
All interactive elements: hover color/transform change + `:focus-visible` 2-3px outline (accent on light, brass-light on ink). Never remove outlines without replacement.

### Special Effects
- Hero cursor light: pointermove (rAF) sets `--mx/--my` on hero, radial-gradient of `--glow`. Only when `(hover: hover) and (pointer: fine)`.
- SpotlightCard: same technique per bento card.
- Magnet CTA (hero primary only): translate up to 6px toward pointer, desktop only.
- Body text reveal (ScrollReveal-style): problem paragraph lines go from 25% to 100% opacity as they enter.
- Marquee: two rows, opposite directions, `translateX` keyframes 60s/70s linear infinite, paused on hover.

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  .h1 .w > span, .h2-split .w > span, [data-reveal] { transform: none !important; opacity: 1 !important; }
  .marquee-track { animation: none !important; transform: none !important; }
  .ring { display: none; }
}
```
JS also checks `matchMedia('(prefers-reduced-motion: reduce)')` and skips magnet, parallax and cursor light.

## 8. Do's and Don'ts

### Do
- Lead with people and conversations; let the service feel hand-made.
- Use the exact CTA label "Get my target list" everywhere.
- Keep one primary action per viewport; secondary actions are ghost or text links.
- Show the example message as a letter, annotated, so the craft is visible.
- Keep copy short, warm, plain; full stops, no exclamation marks.
- Give every interactive element a visible focus state and a 44px+ touch target.
- Keep marquee content clearly decorative (`aria-hidden`), with the real message in text.

### Don't
- ❌ No robots, sparkles, chip icons, "AI-powered" badges, or purple/blue AI gradients.
- ❌ No testimonials, logos, user counts, success rates or any invented statistic.
- ❌ No em dashes and no exclamation marks in copy.
- ❌ No hex values outside `:root`.
- ❌ No fake app screenshots (status bars, LinkedIn chrome, logos).
- ❌ No `filter: blur()` on moving elements; backdrop blur only on the nav, max 12px.
- ❌ No external images or scripts; Google Fonts only.
- ❌ No equal three-up feature grid for "Why it works"; use the bento.
- ❌ No looping attention-seeking animation near the form.
- ❌ No gradient or shadowed headline text.

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1024px | Hero two columns, steps sticky-left, bento 6-col, pricing 3-up |
| Tablet | 720-1024px | Hero stacks (door below text, smaller), steps single column, bento 2-col, pricing 3-up scroll-free stack at < 900 |
| Mobile | < 720px | Single column everything, nav collapses to logo + menu button, annotations stack under message card, marquee rows shorter |

**Touch Targets:** minimum 44 x 44px (buttons 48px, FAQ summaries 56px, inputs 48px).
**Collapsing Strategy:** nav links move into a disclosure panel (button with aria-expanded); hero CTA becomes full width; pricing stacks with Standard first visually kept in DOM order (Sprint, Standard, Full) but Standard keeps its featured border; bento spans collapse to full width.

```css
@media (max-width: 1024px) { .hero-grid, .steps-wrap { grid-template-columns: 1fr; } .bento { grid-template-columns: repeat(2, 1fr); } .bento > * { grid-column: span 1; } .bento .b1, .bento .b4 { grid-column: span 2; } }
@media (max-width: 900px) { .pricing { grid-template-columns: 1fr; max-width: 520px; margin-inline: auto; } }
@media (max-width: 720px) { .nav-links { display: none; } .nav-links.open { display: flex; } .bento { grid-template-columns: 1fr; } .bento > * { grid-column: auto !important; } .hero .btn-primary { width: 100%; justify-content: center; } }
```
