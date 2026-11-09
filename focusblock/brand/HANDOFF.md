# Creative handoff (brand, visuals, website)

Owner: Creative head. Date: 9 Nov 2026. Status: complete for waitlist mode. Nothing published or deployed, no git commit.
Design skills used: frontend-design, impeccable, taste-skill.

## 1. What I built

**Brand system** (`brand/`)
- `BRAND.md`: palette with tokens, computed contrast table (allowed and banned pairs), type, logo rules and clear space, voice, imagery, motion, dos and don'ts. `brand-board.png` is the one-page overview.
- `tokens.css`, `tokens.ts`: the same tokens for web and app.
- `logo/`: wordmark (dark, light, saffron) drawn as vector paths, app icon (the n), Android adaptive layers, favicon, puck mark (charcoal, saffron, stone), each as SVG and PNG.
- `fonts/`: Outfit (OFL), variable plus static weights.
- `tools/`: the generators (wordmark geometry, icon builder, three.js renderer, ad builder, site and legal page builders). Rerun them instead of editing PNGs by hand.

**App identity** (only these app files touched)
- `assets/icon.png`, `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`, `favicon.png` (1024 px, n inside the adaptive safe circle).
- `app.json`: adaptiveIcon backgroundColor `#FF8A1F`.
- `src/theme.ts`: charcoal theme, same keys plus `onAccent` and `accentSoft`. `npx tsc --noEmit` passes.

**Website** (`landing/`)
- `index.html`: single file, mobile first, about 246 KB with the font and images inlined. Tested at 360, 390, 768 and 1280 px, no horizontal scroll, form and flag tested in a browser. Screenshots: `marketing/assets/visual/site_mobile.png`, `site_desktop.png`.
- Waitlist mode: `PAYMENTS_OPEN = false` hides the NFC-check-then-UPI flow, the pay link and the QR box (`id="upi-qr"`). Flip it to true and every main button becomes "Pre-order for Rs 1,999" and the UPI section appears. Kept: `WHATSAPP_NUMBER`, `UPI_ID` with TODOs, form validation, WhatsApp hand-off, localStorage backup, refund line, shipping TODO.
- Sections: hero ("Put it down." plus the angle line from `?a=A`, `?a=B` or `?a=A1` to `A8`), tap demo, "Yes, the chip inside is cheap" (the top stranger objection), three steps with a try-it puck, leave it in another room (with the honest bypass note), privacy, backup code and emergency unlock, keep reachable, price and terms, "Join the first 50" form (first name, city, WhatsApp, optional email, phone model, NFC yes/no/not sure, NFC check above it), who makes this, FAQ, footer with seller placeholders.
- Order code `NP-<source><W or F>-XXXX` per DEMAND_TEST.md 3.1, sent in the WhatsApp text and stored. Meta Pixel events PageView, ViewContent, Lead, Contact, and InitiateCheckout only when payments are open; the pixel loads only once `META_PIXEL_ID` is set. `FORM_ENDPOINT` posts leads to a free backend when set.
- `terms.html`, `refund.html`, `shipping.html`, `privacy.html`: CLO drafts with every placeholder shown in orange brackets and a "Draft" banner. `og-image.png` for link previews.

**Visual assets** (`marketing/assets/visual/`, PNG plus HTML source in `src/`)
- `ads/`: S1 room 1080x1350, S2 price 1080x1350 (saffron), S3 room 1080x1080, C1 how-it-works carousel (5 x 1080), C2 FAQ retargeting carousel (5 x 1080), R1 to R5 reel covers and a reel end card (1080x1920, text inside the reels safe zone), ST1 rescue, ST2 privacy, ST3 founder story ads, P1 consented-quote template.
- `web/`: OG image 1200x630, Play feature graphic 1024x500.
- `app/`: four phone mockups (home locked, home unlocked, rescue code, permission) matching the current app copy.
- `renders/`: puck renders from the real 64 x 16 mm STL in charcoal, stone and saffron: three-quarter, top, trio on light and dark, the tap, and a stylised clay in-hand.
- `print/`: A4 poster (A3 note: scale 141 percent, 3 mm bleed, text 10 mm inside trim), A6 QR card, 50 mm round sticker, onboarding card front and back and backup code card (text from `customer/ONBOARDING_CARD.md`), gift note.

## 2. What the CMO, CEO and CLO changed

- CMO: broad India audience, Meta first, angles A1 to A8 and A/B heroes, "Join the first 50" in waitlist mode, safe zones, order code format, Pixel events, no real app logos, the "chip is cheap" and bypass answers (from the reel comments).
- CEO: no money before the gate (flag), no personal UPI, ship date only after G1 (the site says we confirm the ship date before anyone pays), terracotta dead.
- CLO and CTO claims lists: removed "nothing leaves your phone", "never locked out", "no questions", "Ever", results and health language; refund wording is 30 days from the courier delivered date; privacy wording uses the CTO's exact allowed lines.

## 3. Placeholders

WhatsApp number, UPI ID (business account only), QR image, Meta Pixel ID, form backend URL, domain and absolute og:image URL, founder name, city and photo, seller and grievance details on every legal page and the footer, privacy policy text for the app (after the CTO manifest check), setup video QR and short link, ship-by date, real product photos and the tap demo video (renders stand in today).

## 4. Needs a human designer or a real photo

- Replace renders with real photos of the first orange print; the clay hand is stylised on purpose and should go first.
- The tap demo video for the site hero area and the reels (no footage exists yet).
- A type specialist pass on the wordmark e terminal and n spur at very large sizes.
- Print proofs: check saffron on the actual paper stock (it shifts on uncoated paper) and the onboarding card back, which is dense at A6.
- App: `src/screens/Rescue.tsx` lines 64 to 65 and 86 to 87 still put chalk text on saffron (2.14:1) and `HoldButton` shows chalk over the saffron fill. One-line fixes for the CTO.

## 5. Five decisions for the founder

1. **Puck lettering.** The STL uses a borrowed font (Corben). Recommendation: deboss the brand wordmark (`brand/logo/nope-wordmark-dark.svg`) or nothing; a plain top also prints cleaner.
2. **Colourways.** Recommendation: launch saffron only (one print colour, strongest on camera), add charcoal and stone for batch 2.
3. **App icon colour.** Chalk n on saffron, as chosen. Recommendation: keep it; the charcoal-on-saffron version is ready if testers find it hard to spot.
4. **Seller address on the site.** Recommendation per CLO and CEO D18: a low-cost business address if one exists, otherwise the home address on legal pages and the box only, never in ads.
5. **Email on the waitlist form.** The CMO spec drops it; I kept it optional. Recommendation: keep optional, WhatsApp is the main channel.
