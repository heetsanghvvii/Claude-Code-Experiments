# nope: Metrics, Dashboard and Tracking Sheet

Labels: **[A]** assumption, **[U]** unverified, **[F]** founder, **[D]** repo document. Targets are **[A]** unless noted.

Two facts shape everything here:

1. **The app has no analytics** [D, privacy policy]. Activation and retention can only be measured by asking buyers. That is a feature for trust and a cost in founder time.
2. **Payments are UPI outside the website** [D, landing]. Meta cannot see purchases on its own. You log them by hand and upload them (GTM.md section 4).

---

## 1. Metrics tree

**Phase 1 north star: active pucks in week 4** = buyers who locked on 4 or more of the last 7 days during their fourth week. It proves people bought it *and* kept using it, which is what the 500 decision needs.

```
Active pucks in week 4
├── Paid orders
│   ├── Meta ads
│   │   ├── Spend
│   │   ├── CPM  ->  impressions
│   │   ├── Hook rate (3 second plays / impressions)
│   │   ├── Link CTR  ->  link clicks
│   │   ├── Landing page views (LPV)
│   │   ├── LPV -> lead (waitlist) rate      LPV -> pay intent (UPI tap) rate
│   │   └── Lead -> paid (14 days)           Pay intent -> paid
│   ├── Organic Instagram (link in bio UTM, "where did you hear")
│   ├── Founder network and LinkedIn
│   ├── Referrals (codes)
│   └── Creators (codes and UTMs)
├── Delivered (on time vs promised date)
├── Activated  = paired + backup code saved + first lock within 48 hours
├── Day 7 active  = locked on 4+ of first 7 days (self-reported)
└── Week 4 active = locked on 4+ of days 22 to 28 (self-reported)

Guardrails (must not break while chasing the above)
├── Refund rate
├── Lockout incidents (anyone stuck without rescue)
├── NFC or phone incompatibility after purchase
├── Founder minutes per order (chat + setup + support)
└── Cost per paid order vs break-even (GTM.md section 9)
```

---

## 2. Phase 1 targets

| Metric | Target [A] | Red flag [A] | Source |
|---|---|---|---|
| Paid orders | 50 within 6 weeks of opening pre-orders | under 15 after 3 weeks | Orders sheet |
| Share of orders from Meta + organic (not network) | 50%+ | under 30% | Orders sheet, UTM + "where did you hear" |
| Hook rate (reels ads) | 25%+ | under 15% | Ads Manager |
| Link CTR | 1.0% | under 0.4% | Ads Manager |
| Cost per landing page view | under Rs 25 | over Rs 50 | Ads Manager |
| LPV to lead (waitlist) | 10% | under 4% | Pixel Lead / LPV |
| LPV to paid, direct | 1.5% | under 0.5% | Orders sheet / LPV |
| Lead to paid within 14 days | 20% | under 8% | Leads + Orders sheets |
| Blended cost per paid order (ads only) | under Rs 600 | over Rs 850 for 7 days | Spend / ad-attributed orders |
| Two-pack share | 15% | not tracked | Orders sheet |
| Delivered by promised date | 100% | any order more than 7 days late | Orders sheet |
| Activated | 85% | under 70% | Setup call |
| Day 7 active | 65% | under 45% | Day 7 check-in |
| **Week 4 active (north star)** | **45% of delivered** | under 30% | Day 28 check-in |
| "Very disappointed" if they lost nope (asked on day 7 and 28) | 40%+ | under 20% | Check-in question |
| Refund rate | 15% or under | over 25% | Orders sheet |
| Lockouts without rescue | 0 | any | Support log |
| Founder minutes per order | under 45 | over 90 | Your estimate, weekly |

Benchmarks for Meta metrics in India vary by season, category and creative [U]. These are planning numbers, not industry facts.

---

## 3. Weekly dashboard (one sheet tab, 10 minutes every Sunday)

| Row | This week | Last week | Total | Target | Status |
|---|---|---|---|---|---|
| Meta spend (Rs, incl. GST if charged) | | | | ladder step | |
| Impressions | | | | | |
| Hook rate (best ad / average) | | | | 25% | |
| Link clicks / CTR | | | | 1.0% | |
| Landing page views | | | | | |
| Leads (waitlist) | | | | | |
| Pay intent (UPI taps) | | | | | |
| Paid orders: ads / organic / network / referral / creator | | | | 50 | |
| Cost per LPV / per lead / per paid order | | | | 25 / 200 / 600 | |
| Revenue (Rs) and blended ROAS | | | | 2.1+ | |
| Delivered / activated | | | | 85% | |
| Day 7 active / week 4 active | | | | 65% / 45% | |
| Refunds (count, Rs) | | | | 15% or under | |
| Best ad (name) and why | | | | | |
| One thing to change next week | | | | | |

Status: green on or above target, amber within 25%, red beyond.

---

## 4. Spreadsheet columns (track by hand)

Use one Google Sheet with five tabs. Keep phone numbers and names private; share the sheet with no one but the people who need it.

### Tab 1: Leads

`lead_id | date | name | phone | email | city | order_code (NP-xx-xxxx) | utm_source | utm_medium | utm_campaign | utm_content (ad name) | where_heard (self-reported) | angle_seen | phone_model | android_version | has_nfc (Y/N/unknown) | price_shown | first_reply_time_min | objection_raised (privacy / lockout / price / iphone / trust / other) | stage (lead / chatting / pay link sent / paid / lost) | lost_reason | last_contact | notes`

### Tab 2: Orders

`order_id | order_code | lead_id | date_paid | amount_rs | upi_ref | payer (self / someone else) | product (single / two-pack / spare) | gift (Y/N) | recipient_name | ship_to_city | referral_code_used | utm_source | utm_content | where_heard | puck_number (01 to 50) | promised_ship_date | shipped_date | delivered_date | courier_ref | setup_call_date | nfc_worked (Y/N) | accessibility_enabled (Y/N) | backup_code_saved (Y/N) | first_lock_within_48h (Y/N) | puck_location (another room / same room / carried) | d2_status | d7_days_locked_of_7 | d7_emergency_unlocks_used | d7_very_disappointed (very / somewhat / not) | d14_days_locked_last_7 | d28_days_locked_last_7 | d28_streak | d28_very_disappointed | lockout_incident (Y/N + note) | cheat_found (note) | refund_requested_date | refund_reason | refund_paid_date | testimonial_consent (Y/N + date) | quote | referrals_made | uploaded_to_meta (Y/N, date) | notes`

### Tab 3: Ads (weekly, per ad, copied from Ads Manager)

`week | ad_name | angle | format | hook_text | spend_rs | impressions | cpm | 3s_plays | hook_rate | link_clicks | ctr | lpv | cost_per_lpv | leads | cost_per_lead | pay_intents | paid_orders_matched | cost_per_paid | frequency | verdict (keep / iterate / kill) | learning`

### Tab 4: Experiments

As listed at the end of EXPERIMENTS.md.

### Tab 5: Unit economics

`line | assumed value | real value | source | date checked` with rows: price, GST status, net revenue, case cost, NFC sticker, packaging, shipping, payment fees, refund rate, contribution, break-even CAC, break-even ROAS, target CAC (from GTM.md section 9).

---

## 5. How each number gets collected

| Number | How | When |
|---|---|---|
| Spend, impressions, hook rate, CTR, LPV, leads, pay intents | Ads Manager columns (save a custom column preset) and Pixel events | Sunday |
| Paid orders and source | UPI app history (note field with order code) + payment screenshot on WhatsApp + "Where did you first hear about nope?" | Same day as payment |
| Offline Purchase upload to Meta | Events Manager offline upload [U] | Sunday |
| Activated | Setup call checklist | Delivery day |
| Day 7, 14, 28 usage | WhatsApp message: "How many days did you lock last week? What's your streak?" Optional screenshot. | Scheduled reminders in your calendar per order |
| Very disappointed question | "How would you feel if you could no longer use nope? Very disappointed / somewhat / not disappointed" | Day 7 and day 28 |
| Refunds | Orders sheet | When requested |
| Founder minutes | Rough weekly estimate | Sunday |

Self-reported usage is biased upward [A]: people round up. Treat it as an upper bound, and pay most attention to the *trend* between day 7 and day 28.
