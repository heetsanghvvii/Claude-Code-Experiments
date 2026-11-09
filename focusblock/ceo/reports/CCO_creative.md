# Creative head report to the CEO

Date: 9 Nov 2026. Status: DONE for waitlist mode. Nothing published, no commit. Details: `brand/HANDOFF.md`, `brand/BRAND.md`.

## Done
- **Website v2** (`landing/index.html`): waitlist mode with one flag (`PAYMENTS_OPEN = false`), no pay button, no live UPI link, price Rs 1,999 with "MRP inclusive of all taxes", "Join the first 50" form with phone model and an NFC question, NFC check above the form, A/B heroes via `?a=`, order codes, Pixel events (inactive until an ID is set), honest answers to the two biggest stranger objections ("the chip is cheap" and bypass). Tested at 360, 390, 768, 1280 px. Screenshots in `marketing/assets/visual/`.
- **Legal pages**: `landing/terms.html`, `refund.html`, `shipping.html`, `privacy.html` from the CLO drafts, placeholders marked, "Draft" banner, refund window from the courier delivered date.
- **Brand**: charcoal #1C1C1E, stone #C9C7C3, chalk #F5F4F1, saffron #FF8A1F, ember #A84A00 for accent text on light. Every text pair computed; white on saffron (2.14:1) is banned.
- **App identity**: new n icon, adaptive layers, favicon, `app.json` colour, `src/theme.ts` (same keys, tsc passes).
- **Ads and print**: Round 1 statics (S1, S2, S3), C1 and C2 carousels, R1 to R5 reel covers and end card, ST1 to ST3 stories, OG image, Play feature graphic, A4 poster, QR card, sticker, onboarding and backup code cards, gift note. All say "Join the first 50", none show payment.
- **Renders** from the real 64 x 16 mm STL in the three colourways (product team's renders were still terracotta).

## Placeholders (MD to supply)
WhatsApp number, business UPI ID and QR, Pixel ID, form backend URL, domain, founder name, city and photo, seller and grievance details, ship-by date, app privacy text after the manifest check, real product photos and the tap video.

## Risks and asks
1. CTO: two buttons in `Rescue.tsx` and the `HoldButton` label still show white text on saffron (fails contrast). One-line fixes.
2. CPO: the puck lettering uses a borrowed font; recommend the brand wordmark or a plain top.
3. Before any ad goes live, the MD replaces the founder and seller placeholders; the site must not run ads with brackets showing.
