# Visual Specs

Status: ASSUMED DEFAULTS, replace with your real brand. Logo file does not exist yet.

## Palette
- Primary (ink): #101820
- Secondary (paper): #F6F3EC
- Accent (amber): #E8A33D
- Background: #F6F3EC (light mode), #101820 (dark mode)
- Text: #101820 on light, #F6F3EC on dark
- Muted text (captions, metadata): #5B6670 on light, #A9B1B8 on dark
- Contrast rule: text on background must meet WCAG AA (4.5:1). Amber is for accents and highlight words, never for body text on paper.

## Fonts
- Headline: DM Sans, 700
- Body: DM Sans, 400 (500 for emphasis)
- Fallback: system sans-serif, then Arial

## Logo
- File: brand-brain/assets/agentdesk-logo.svg (assumed path, not yet created)
- Placement: bottom-right on video and carousels, 6% of frame width, 5% safe margin from edges. Dark logo on light backgrounds, paper logo on dark.

## Layout rules
- Text on image: max 12 words, min size 48px at 1080px width, safe margins 8% (Reels and Shorts UI overlaps the edges)
- Carousel: slide 1 = hook (max 8 words), last slide = CTA with the keyword, consistent 12-column grid with 80px outer margins at 1080px width
- Thumbnail: face yes (one person, eyes in top third), max 4 words, text contrast 4.5:1 minimum, amber used for one word only
- Aspect ratios: Reel/Short 9:16 (1080x1920), Carousel 4:5 (1080x1350), LinkedIn 1:1 or 4:5, YouTube thumb 16:9 (1280x720)

## Photography / image style
- Look: natural daylight, warm neutrals, real desks, laptops, phones and notebooks, candid framing, one amber object or accent per frame.
- Avoid: stock-photo handshakes, neon or purple gradients, floating holograms, robots as the hero, dense clutter, fake dashboards with unreadable text.

## Video style
- Pacing: cut every 2-3 seconds on Reels and Shorts, every 5-8 seconds on long form
- Captions: DM Sans 700, white on a dark ink bar or with a dark outline, lower-middle of frame, max 2 lines, the key word in amber, burned in for Reels
- Music: low-volume lo-fi or instrumental, under -18 LUFS under voice, or none
- Intro/outro: 1 second logo sting at open (optional on Shorts). Outro 3 seconds with the CTA keyword on paper background.

## Image model prompt prefix (prepended to every generation)
"Warm natural daylight, candid editorial photo of a real small workspace, muted dark ink and warm paper tones with one amber accent, shallow depth of field, no text, no logos, no people looking at the camera."
