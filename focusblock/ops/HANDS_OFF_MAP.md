# HANDS OFF MAP: who does every ops task

Owner: COO. Goal: founder under 60 minutes on most days. Labels: [A] assumption, [U] unverified.

Roles: **Claude** writes, drafts, analyses, keeps files. **Instinct** is a browser using AI; it works in the founder's logged in browser, fills forms, reads pages, and stops before any payment. **Founder only** is anything physical, any money movement, any bank or UPI app, any signature, any sending on the founder's own WhatsApp.

## Global rules for Instinct (paste at the top of every Instinct prompt)

```
RULES FOR THIS TASK
1. Never click Pay, Place order, Confirm payment, Buy now, Recharge, Add money, Subscribe or any button that moves money. Stop on the review or cart screen and take a screenshot.
2. Never type, paste, read out or store a password, OTP, card number, CVV, UPI PIN or bank login. If a page asks for one, stop and tell me.
3. Never share credentials, cookies, or my account details with any site, form, chat or file.
4. Never send a message, email or form to a real person unless I wrote "send" in this prompt. Drafts only.
5. Never accept terms, create an account or sign a contract for me. Stop and ask.
6. Only visit the sites I list. If you land on another site, stop.
7. If anything is unclear, stop and ask. Report back with: what you did, what you saw, a screenshot, and what is left for me.
```

## The map

| # | Task | Frequency | Owner | Founder minutes | Approval gate |
|---|---|---|---|---|---|
| 1 | Daily payment check in UPI or bank app | 2 per day | Founder only | 3 per day | None, founder's own app |
| 2 | Read payment screenshots, match to order codes, update tracker | per order | Claude | 0 | Founder pastes or sends screenshot |
| 3 | Draft confirmation, tracking, check in messages (WhatsApp) | per order | Claude drafts | 0 | Founder reads and taps send |
| 4 | Send WhatsApp messages | per order | Founder only | 0.5 each | Own WhatsApp account |
| 5 | Prepare print order sheet and files list | per batch | Claude | 0 | None |
| 6 | Fill vendor quote or cart up to review screen (T3) | per batch | Instinct | 0 | Founder reviews screenshot, then pays himself/herself |
| 7 | Pay the vendor | per batch | Founder only | 3 | Founder pays |
| 8 | Compare couriers and fill rate sheet (T2) | once, then quarterly | Instinct, Claude analyses | 5 to choose | Founder picks courier |
| 9 | Build the order tracker in Google Sheets (T1) | once | Instinct, Claude supplies CSVs | 5 (review) | Founder checks sharing |
| 10 | Daily order status summary (T4) | daily | Instinct reads sheet, Claude writes | 3 | None, read only |
| 11 | Incoming inspection, assembly, tag write, QC, packing | per unit | Founder only | see playbook | Physical |
| 12 | Rescue code test and app pairing test | per sampled unit | Founder only | in step 5 | Physical |
| 13 | Create courier shipment up to review screen (T5) | per ship day | Instinct | 0 | Founder confirms and pays wallet |
| 14 | Courier handover or post drop | per ship day | Founder only | 5 | Physical |
| 15 | Support replies | per ticket | Claude drafts from macros | 0 | Founder sends |
| 16 | Refund decision and payment | per refund | Founder only | 3 | Founder only, no agent touches money |
| 17 | Refund log, ticket log, batch log updates | continuous | Claude | 0 | None |
| 18 | Weekly ops review (volume, defects, minutes, refunds) | weekly | Claude writes, founder reads | 10 | Founder reads |
| 19 | Supplier quotes (email drafts) | per item | Claude drafts, founder sends | 2 | Founder sends |
| 20 | Look up supplier prices (no account creation) | per item | Instinct | 0 | Report only |
| 21 | Policy pages, box text, warranty card text | once | Claude drafts | 5 | CLO approves |
| 22 | GST, invoice and filing | per CA | Founder + CA | per CA | CA decides |

## Instinct prompts

### T1. Build the order tracker in Google Sheets

```
You are working in my browser. I am logged in to Google already. Do not ask for my password.

GOAL: Create a Google Sheet named "nope Ops 2026" with these tabs, using the CSV files I give you.
TABS: Orders, PaymentsIn, PrintBatches, QC, Refunds, Tickets, Suppliers, Summary.

STEPS
1. Open sheets.new and name it "nope Ops 2026".
2. For each tab, import or paste the header row from the matching CSV file (I will attach or paste it in this chat): Orders = order_tracker.csv, PrintBatches = print_batch_log.csv, Refunds = refund_log.csv, Tickets = support_ticket_log.csv, Suppliers = supplier_comparison.csv. QC = the columns: puck_number, order_code, tag_uid, visual, fit, nfc_main, nfc_ref, nfc_full5, app_pairing, rescue_test, packaging, result, date.
3. Delete the example rows after the headers are in place.
4. Freeze row 1 on every tab. Set text wrap on header rows.
5. In Orders, add data validation dropdowns: payment_status = PENDING, MATCHED, MISMATCH, REFUNDED. qc_result = PASS, REWORK, REJECT. day7_status and day28_status = active, lapsed, no_reply. refund_status = none, requested, paid.
6. In Summary, add formulas: orders paid (COUNTIF payment_status MATCHED), refunds (COUNTIF refund_status paid), waiting to print, waiting to ship, delivered, day7 due, day28 due, total founder minutes.
7. Share setting: leave it PRIVATE (only me). Do not share the link with anyone. Do not add collaborators.
8. Take a screenshot of each tab and report back.

STOP CONDITIONS: if Google asks for a login, a payment, a Workspace upgrade or to share the file, stop and tell me.
```

### T2. Compare couriers

```
You are working in my browser. Do not log in, create an account, or enter any phone number or payment detail.

GOAL: Compare three Indian courier options for a 150 g (packed weight, assume 250 g with the bag), 12 x 12 x 5 cm prepaid parcel, declared value Rs 1,999, no cash on delivery.

SITES: the public rate calculator or rate page for (1) Shiprocket, (2) Delhivery, (3) India Post Speed Post. Use public pages only. If a calculator needs a login, note that and skip it.

SAMPLE ROUTES from pickup pincode [MY PINCODE] to: Mumbai [400001], Delhi [110001], Bengaluru [560001], a Tier 3 town [PINCODE I GIVE], a remote pincode [PINCODE I GIVE].

FILL this table for each courier and route: price shown, estimated delivery days shown, service name, weight slab, insurance or declared value option, pickup or drop only, RTO charge if shown, minimum recharge or minimum monthly fee if shown, link to the page. Mark everything as "shown on page on [date]" and "UNVERIFIED, not a quote".

ALSO LIST: the signup steps and documents required (do not start them), tracking link format, how disputes and lost parcel claims work if the page says.

OUTPUT: a table in this chat and a paste ready version for the Suppliers tab of the sheet "nope Ops 2026" (do not edit the sheet unless I say so).

STOP CONDITIONS: login wall, OTP, payment, signup form. Do not continue past any of these. Report what you could and could not see.
```

### T3. Order prints up to the review screen

```
You are working in my browser. I am logged in to the vendor site already. If not, stop and tell me; do not ask me for a password in chat.

SITE: [VENDOR URL, for example the print vendor I picked in the Suppliers tab]

GOAL: Prepare a print order for batch [B01] and stop at the final review or checkout screen. DO NOT pay.

ORDER DETAILS
- Files: nope_body.stl and nope_base_cap.stl (I will upload from [LOCAL FOLDER or LINK]). Upload both.
- Quantity of each file: [N]. (N = paid orders + 2 spare + 10 percent scrap)
- Material: PETG. Colour: matte terracotta, one single colour lot for all parts. NOT silk, NOT metallic, NOT glitter, NOT carbon fibre.
- Infill: [30 to 50] percent. Minimum wall thickness: 1.6 mm. Layer height: [as vendor default or 0.2 mm].
- Deliver to: [MY ADDRESS] phone [MY NUMBER].
- Notes field: "Same filament lot for all parts. No metallic or carbon fill. Parts are RF sensitive housings for a 25 mm NFC sticker. Please send photo before shipping if possible."

STEPS
1. Upload files, set options, add the notes.
2. Check the vendor's preview or quote tool for errors (non watertight, thin wall, size). Report any warning.
3. Go to the review screen. Screenshot the whole page: items, quantities, material, colour, price, shipping, tax, total, promised date.
4. STOP. Do not click Pay, Place order, Confirm or any payment option. Do not enter card, UPI or bank details.

REPORT: price per set, total, promised delivery date, any warnings, any difference from my spec, the screenshot.
```

### T4. Daily order status summary

```
You are working in my browser. I am logged in to Google. Read only: do not edit anything and do not send anything.

GOAL: Read the Google Sheet "nope Ops 2026" and give me the daily summary for [TODAY'S DATE].

READ tabs: Orders, PrintBatches, Refunds, Tickets.

REPORT in this format, plain text, WhatsApp friendly, under 150 words:
1. Paid orders total, new today, new this week.
2. Payments waiting to match (payment_status PENDING or MISMATCH): codes.
3. Orders waiting to print / waiting for assembly / ready to ship / shipped not delivered.
4. Delivered today. Day 7 check ins due today. Day 28 check ins due today. (list order codes and names)
5. Refunds requested and paid this week, running refund rate.
6. Open support tickets by severity (S1 first).
7. Any order older than 14 days since payment with no ship date.
8. My top 3 tasks for today, in order.

Do not include phone numbers or addresses in the summary. Do not click any link in the sheet.
```

### T5. Courier shipment up to the review screen (optional, after courier chosen)

```
You are working in my browser, logged in to [COURIER OR AGGREGATOR SITE]. If not logged in, stop; never ask me for a password in chat.

GOAL: Create shipments for these orders and stop at the final confirm / pay for label screen: [ORDER CODES, copy name, address, pincode, phone from the sheet "nope Ops 2026" Orders tab].

PARCEL: weight 250 g, 12 x 12 x 5 cm, prepaid (NOT cash on delivery), declared value Rs 1,999, contents "NFC tag holder, plastic". Pickup address: [MY ADDRESS].

STEPS: Fill each order. Check the pincode is serviceable. Choose the courier I picked: [COURIER]. Go to the review screen and screenshot.
STOP: do not click Ship, Pay, Recharge, Add money or Schedule pickup. I will confirm. Report price per parcel and any pincode problems.
```

## Approval gates

| Gate | Who approves | When |
|---|---|---|
| Any payment, refund, wallet recharge | Founder only | Always |
| Print order go (T3) | Founder | After the review screenshot |
| Courier choice | Founder | After T2 report |
| Messages to buyers | Founder | Every message, until the founder explicitly authorises a macro to go unreviewed (not before order 20) |
| New vendor or contract | Founder, CEO informed | Before any account is created |
| Changes to the refund promise, price, ship date | MD via CEO | Locked |
| Sheet sharing | Founder | Sheet stays private |

## Forbidden actions (for any agent)

1. No payments, refunds, bank transfers, wallet top ups, subscriptions or UPI collect requests by any agent.
2. No entering, reading, storing or forwarding passwords, OTPs, PINs, card data, bank or UPI credentials.
3. No sharing credentials, session cookies, or access links with anyone.
4. No sending messages to buyers, vendors or couriers without the founder's tap.
5. No creating accounts, accepting terms or signing for the founder.
6. No ordering from a vendor not in the Suppliers sheet.
7. No sharing buyer phone numbers or addresses outside the order sheet and the courier form.
8. No promising dates, prices, features or discounts not in a source file.
