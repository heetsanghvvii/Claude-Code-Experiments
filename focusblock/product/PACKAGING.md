# Packaging and unboxing spec

Goal: a calm, honest kraft box that looks like panel 4 of the brand board, protects the puck, and puts the backup code in the buyer's hand before they ever need it. It must not look like a cheap gift (Rohan) and must carry the maker's details (Meera).

Dimensions come from the real part: puck 64.0 mm diameter, 16.0 mm tall, 18.2 mm with the bumpers fitted (`case/build_report.txt`).

## 1. Single box ("nope")

| Item | Spec |
|---|---|
| Style | Kraft tuck-end box (or a 2-piece lid box if budget allows), unbleached, no plastic window |
| Internal size | 90 x 90 x 30 mm |
| Why that size | Puck 64 mm + 13 mm insert margin each side; 18.2 mm puck + 2 cards under it (about 1 mm) + 10 mm headroom for the insert lip and a thumb |
| External | about 92 x 92 x 32 mm (board thickness [A]) |
| Board | 300 to 350 gsm kraft, or E-flute kraft for shipping without an outer mailer [A] |
| Print | 1 colour brand orange: "nope" on the lid, "Put it down." on one side; maker details on the bottom (section 6) |
| Insert | One die-cut kraft card folded into a tray with a 65 mm round hole. The puck drops in, top up, logo visible when the lid opens. No plastic, no foam |
| Under the insert | Quick start card (A6 folded to 85 x 85 mm) and the backup code card (85 x 55 mm, credit card size) |
| Seal | 30 mm round kraft sticker "put it down." across the lid opening |
| Shipping | Single box goes into a small kraft mailer or bubble-free paper padded envelope [A]; target total weight about 150 g |

## 2. Two-pack ("desk + bag") and spare puck

Research (Aarav) suggests "one for the desk, one for the bag" and a cheap spare for the lost-puck case.

| SKU | Box | Insert | Note |
|---|---|---|---|
| Two-pack | 160 x 90 x 30 mm internal | Two 65 mm holes side by side, labels "desk" and "bag" printed next to them | Both pucks paired to one account at setup |
| Spare puck (add-on or later order) | Same single box, with a sticker "spare" on the seal | Same | Card says "Pair this in the app: Settings, Pucks, Add a puck" |

## 3. Gift option

- A plain kraft sleeve over the single box, printed "for someone who'd like their evenings back" on the inside flap only, never shaming on the outside (Meera: "you think I'm addicted").
- A gift card with blank lines: "Set up for: ____. Apps to lock: ____. Backup code: in the sealed envelope." Rohan wants to set it up for his father first.
- No price inside the box for gift orders.

## 4. Quick start card (front and back, plain English)

**Front**

> **nope**
> Put it down.
>
> 1. Install the nope app from the link on the back. Your phone needs NFC. Check: Settings, search "NFC".
> 2. Open the app and choose the apps you want to lock.
> 3. Hold the back of your phone flat on the word "nope". Hold still for one second.
> 4. Locked. Tap again to unlock.
>
> Tip: put the puck in another room. The walk is the point.

**Back**

> **If it does not read**
> Take off a phone case with a metal ring or metal plate. Move the phone slowly around the top of the puck; every phone's NFC spot is in a slightly different place, often near the camera.
>
> **If you lose the puck**
> Use your backup code (the small card in this box). Then order a spare puck or pair a second one.
>
> **What is inside**
> A passive NFC sticker. No battery, no camera, no microphone, no GPS. It cannot track you.
>
> **Care**
> Do not leave it on a car dashboard or in direct sun in a parked car. Wipe with a damp cloth.
>
> Help: [support WhatsApp / email, filled in by the MD]. App link: [QR code, filled in by the CTO].

All claims on the card must be on the CTO's Verified Claims List before printing (ceo/DECISION_LOG.md D3). "No battery, no camera, no microphone, no GPS" is a hardware fact; "cannot track you" refers to the puck only.

## 5. Backup code card

Credit-card size, uncoated stock so a pen writes on it.

> **Your nope backup code**
> Write it here when the app shows it:
>
> `____ - ____ - ____ - ____`
>
> Keep this card somewhere safe that is NOT next to the puck.
> Use it only if the puck is lost or broken.

Design notes: leave real writing space (at least 6 mm tall boxes); print light lines, not a filled box, so the code is readable in a photo if the user takes one.

## 6. Labels on the box (bottom panel)

Draft content, legal wording **unverified**, confirm with the CLO and a CA (Legal Metrology packaged commodity rules apply to retail packages in India, exact fields to be confirmed):

- Product name: nope, NFC focus puck
- Contents: 1 puck (PETG plastic), 1 quick start card, 1 backup code card
- Net quantity: 1 unit
- MRP: Rs 1,999 (inclusive of all taxes)
- Month and year of manufacture or packing
- Name and full address of the manufacturer / packer
- Customer care: phone or email
- "Contains a passive NFC tag. No battery."
- "Not a toy. Contains small parts inside the base. Keep away from children under 3."
- Country of origin: India

## 7. Sustainability notes

- All packaging is paper: kraft box, kraft insert, paper cards, paper seal. No plastic bag around the puck; the puck is matte and does not need one if the insert holds it still.
- No foam inserts, no plastic windows, no glossy lamination.
- Ink: one colour.
- The puck itself is PETG (recyclable in principle, resin code 1, but small items are rarely recycled in practice; say "keep it" rather than make a recyclability claim).
- The sticker can be replaced without throwing away the shell (the cap opens with a coin), so a failed tag is not a failed product.
- Offer a "send it back" route for broken pucks at the 500-unit stage; reuse caps and shells where possible.

## 8. Unboxing sequence (what the buyer sees)

1. Kraft box, "nope" in orange, sealed with "put it down."
2. Lid opens: the puck sits in the insert, logo up, nothing else in view.
3. Lift the puck: it is heavier than expected for its size (aim 35 g+, **unverified**), matte, no seams visible from the top.
4. Lift the insert: quick start card and the backup code card.
5. Turn the puck over: three soft feet, a coin slot, "put it down." in small letters.
