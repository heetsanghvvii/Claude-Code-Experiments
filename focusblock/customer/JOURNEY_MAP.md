# nope: Customer Journey Map (ad to week 4)

Owner: CCO. Date: 9 Nov 2026. Status: pre-launch, zero customers, zero revenue.

Labels: **[F]** fact (from repo, code or plan), **[A]** assumption, **[U]** unverified, **[S]** synthetic (from simulated interviews, a hypothesis only).

Nothing below has been tested with a real customer. All percentages are planning guesses [A] to be replaced with real data.

---

## The three moments where most people will quit

| # | Moment | Stage | Why people quit | What to do |
|---|---|---|---|---|
| Q1 | Permission and install wall | 6 and 7 | Sideloaded APK warning, "restricted setting" block on Android 13+, accessibility permission sounds scary, battery settings kill the service [F: plan lists all of these as risks; exact screens U] | Founder video plus 1 page picture guide, WhatsApp setup help within 1 hour, and a "book a 10 minute setup call" option for the first 50 orders. Do not ship to a customer until we have watched 5 strangers set up on real phones. |
| Q2 | The first lock that does not feel good | 8 | The first lock either fails (tap does not read, service killed) or works but nothing in life changes, so there is no "aha" [A] | A guided first lock: test tap while standing next to the puck, then lock 20 minutes only, then try opening Instagram and see it bounce. Success must happen in the first 10 minutes. |
| Q3 | Novelty fade in days 4 to 14 | 9 and 10 | Puck ends up in a drawer, or the person finds the escape routes (emergency unlock, backup code, uninstall, another browser) [S, A] | The "leave it in another room" ritual, a day 3 and day 7 check in, a locked window tied to one daily time (for example 9 pm to 7 am) so it becomes a routine, and honest handling of bypass (see Stage 9). |

---

## Stage by stage

### 1. See the ad
- **Feels:** Curious, sceptical. "Another app that says it will fix me." Rs 1,999 for a puck feels high before the idea lands [S].
- **Failure points:** Looks like a gimmick; claims sound like a cure; no proof; iPhone users click and cannot buy (Android only) [F].
- **Metric:** Click through rate and cost per click (target unknown, set after first Rs 1,000 test) [A].
- **Fix:** Show the actual tap in the first 3 seconds, state "Android only, no subscription, 30 day refund" in the ad or its first line, no health or addiction cure claims.

### 2. Land on the site
- **Feels:** "Is this real? Will it work on my phone? Is it safe to give a permission?"
- **Failure points:** No NFC phone check, no clear Android only message, the permission fear is not answered, no real photo of the puck, price shock [A].
- **Metric:** Landing page to pre-order click rate; share of visitors who scroll to the FAQ.
- **Fix:** Add a "Does my phone work?" line (Settings, search NFC) above the buy button; a plain "what the permission does and does not do" box; real photo or video of a tap; refund promise near the button.

### 3. Pre-order (UPI)
- **Feels:** Nervous about paying a tiny unknown brand by UPI with no gateway [F: UPI deep link and QR, no payment gateway at first].
- **Failure points:** Payment done but no confirmation; no order id; unclear delivery date (2 to 3 weeks is itself unconfirmed [U]); fear of scam.
- **Metric:** Pre-order click to UPI paid rate; time from payment to WhatsApp confirmation (target under 1 hour in India daytime) [A].
- **Fix:** A human WhatsApp confirmation within the hour with order id, expected ship window stated as a range, refund promise repeated, founder name and face.

### 4. Wait (2 to 3 weeks [U])
- **Feels:** Doubt grows. Buyer's regret. "Did I get scammed?"
- **Failure points:** Silence; delays; the person forgets they ordered, then refunds; the problem they felt at the ad fades.
- **Metric:** Refund or cancel requests before shipping; reply rate to the waiting-period message.
- **Fix:** Three short updates (order confirmed, being made, shipped with tracking). Send the setup guide and video link while they wait so install happens in their first 10 minutes of owning it. Ask for their phone model so we can warn about brand quirks.

### 5. Unbox
- **Feels:** Hopeful, a bit excited. First physical impression decides whether it feels like a Rs 1,999 object or a sticker in plastic (a risk the plan names [F]).
- **Failure points:** Cheap feel of 3D printed PETG [A]; no obvious "start here"; the box says nothing about the APK.
- **Metric:** Share who message a photo or reply to the day 1 check in; qualitative comments on feel.
- **Fix:** A single card on top: "Do this first: scan the QR, watch 2 minutes." Back of card has the backup code box. See ONBOARDING_CARD.md.

### 6. Install (sideloaded APK in Phase 1 [F])
- **Feels:** "Why is my phone warning me about this app?" Android shows an unknown-source and Play Protect style warning [U: exact screens vary by phone].
- **Failure points:** Download blocked; "install unknown apps" permission is buried; Play Protect scanning prompt; 40+ year olds give up; file ends up in Downloads and cannot be found.
- **Metric:** Share of buyers who reach "app opened" within 24 hours of delivery (self reported by WhatsApp reply, see CHECKINS.md); setup help requests per 10 customers.
- **Fix:** One short link that downloads the APK, a picture step guide, and the founder video. Offer to do it with them on a call. Move to Play Store internal test or closed track as early as the CTO and CLO allow [U: Play may reject an accessibility blocker, see docs/play-store].

### 7. Permission and setup (accessibility, apps, pair)
- **Feels:** The most anxious moment. "You want to watch what I do on my phone?" Then boredom: three steps, a permission, a list of apps, a tap.
- **Failure points:** Android 13+ "restricted setting" greyed out switch [U]; user presses "Not now" and never returns; picks too many apps or none; tap does not read because case or NFC is off [A]; backup code screen skipped without saving; battery optimisation kills the service later [F: plan names it].
- **Metric:** Setup completion rate (all three steps done) within 48 hours; time to complete; share who saved the backup code (self reported).
- **Fix:** See SETUP_GUIDE.md and QA_WALKTHROUGH.md. Key: tell the person the permission screen is coming and why before they see it; handle the restricted setting step with a picture guide; ask them to pick only 2 to 3 apps for the first week.

### 8. First lock
- **Feels:** Small thrill, then doubt. "Does it really work? What if I get stuck?"
- **Failure points:** Tap needs repositioning (NFC antenna location differs per phone [U]); the lock works but they try Instagram in the browser and it opens (browser toggle is a hidden setting [F: AppPicker has the switch]); they lock for a long time and panic.
- **Metric:** Time from app open to first successful lock; first lock within 24 hours of setup (target above 80 percent of those who finish setup) [A]; first unlock by tap within 24 hours.
- **Fix:** Do a rehearsal: lock, open Instagram, see it bounce, unlock by tap, all within 5 minutes. Tell them where the NFC spot is on their phone (guide has a "find your NFC spot" tip).

### 9. First week
- **Feels:** Days 1 to 3 feel good ("I did not open Reels"). Days 4 to 6 the friction annoys. Someone uses the emergency unlock or the backup code. Some feel guilt after bypassing [S, A].
- **Failure points:** Puck is within reach so it is not real friction; service killed by the phone; the person unlocks "just for a minute" and stays unlocked; a legitimate need (work Instagram, OTP) hits a blocked app; streak broken makes them quit.
- **Metric:** Days locked in week 1 (self reported via weekly card); emergency unlocks used per week (the app knows this but collects nothing, see Decision 1 in ceo/reports/CCO.md); number of "it stopped working" messages.
- **Fix:** Day 3 and day 7 check ins; the "another room" ritual; a plain-language "what to do if you need Instagram for work" (use the app block list, do not block it, or lock only at night); do not shame bypass, ask why.

### 10. Week 4
- **Feels:** Either it is part of the evening routine, or the puck is in a drawer and they feel faintly foolish. The refund window ends on day 30 [F: 30 day refund], which is a decision point.
- **Failure points:** No reminder before the refund window closes (they refund by default or forget); novelty gone; phone update resets accessibility permission [U]; no way for us to know what happened (the app collects nothing [F]).
- **Metric:** Week 4 retention = share of buyers who report locking on 3 or more days in the last 7 (self reported, see CHECKINS.md). Refund rate by day 30 (target below 10 percent [F: plan milestone]).
- **Fix:** Day 28 message that honestly names the refund option, a short interview with a sample of users, and a "what would make you keep using it" question. A day 28 refund that is easy to give is a trust signal; do not hide it.

---

## Cross cutting notes

- Terminology mismatch: the screens say "sticker" and "Lost my puck?". Customers receive a puck. Pick one word everywhere (see QA_WALKTHROUGH.md item 1).
- Everything in this map is untested on a real stranger. The first 5 real setups (watched on video call, with consent) are worth more than all further planning.
- Persona interviews in research/ are synthetic. Treat as questions to test, not answers [S].
