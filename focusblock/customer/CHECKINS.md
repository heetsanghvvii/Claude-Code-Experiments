# nope WhatsApp Check-ins and Week 4 Measurement

Owner: CCO. Date: 9 Nov 2026. Status: DRAFT.

Labels: **[F]** fact, **[A]** assumption, **[U]** unverified.

Rules for every message: from a real person's number (the founder or a named support person), under 40 words where possible, one question, no pressure, easy to say "stop". Send only to people who gave their WhatsApp number when they ordered [F: pre-order opens WhatsApp]. Include "Reply STOP to end these messages" in the first message. Respect it, always. Check with the CLO on consent wording and data handling (DPDP Act) before sending anything [U].

Day 0 = the day we believe the parcel arrived (use courier delivery date; if unknown, ship date plus 4 days [A]).

---

## Messages

### Day 1: "How did setup go?"
> Hi [name], [founder] from nope. Did the app install and your first lock work? Reply 1 = yes all good, 2 = stuck somewhere, 3 = not tried yet. If 2, tell me your phone model and I will help right now. (Reply STOP anytime and I will stop messaging.)

- **The one question:** Is setup done? (1, 2 or 3)
- **Logged as:** setup_status = done / stuck / not_started; phone model if given; stuck step if given.
- **If 2:** call or reply within the hour. Log the step they got stuck at (feeds SETUP_GUIDE.md and the CTO).

### Day 3: "Where did you leave it?"
> Hi [name], quick one. Where did you leave the puck last night? Kitchen, shoe rack, bag... a one word answer is perfect. No wrong answer, even "next to me" 🙂

- **The one question:** Where is the puck right now?
- **Logged as:** puck_location = other_room / same_room / drawer / lost; free text. "Same room" is an early churn warning [A].
- **Reply to "same room":** "Totally fine. If you try one night in another room, tell me what changes."

### Day 7: "How many days did you lock this week?"
> Hi [name], week one done. Roughly how many of the 7 days did you lock your apps? Any number is fine, zero too. I just want the real picture.

- **The one question:** Days locked in the first week (0 to 7).
- **Logged as:** week1_days_locked (number). Also log any reason given for zero.
- **Reply to 0 to 2:** "Thanks for being honest. What got in the way? Setup, forgetting, or it not feeling useful?"

### Day 14: "Is it still worth it?"
> Hi [name], two weeks in. On a scale of 1 to 5, how much is nope helping you right now? 1 = not at all, 5 = a lot. And one line on why, if you feel like it.

- **The one question:** Helpfulness score 1 to 5.
- **Logged as:** day14_score, day14_reason (free text).
- **Reply to 1 or 2:** "That's useful. Do you want help changing your setup (which apps, what time), or would you like a refund? Both are fine." (Offering refund is honest and builds trust [A].)

### Day 28: "Keep or refund?"
> Hi [name], it is nearly day 30, so your refund window is about to close. No pressure either way. In the last 7 days, how many days did you lock? And do you want to keep nope? Reply KEEP or REFUND. If you keep it, could we chat for 15 minutes about how it went?

- **The one question:** Days locked in the last 7 (0 to 7). The KEEP or REFUND answer is a second, plain decision.
- **Logged as:** week4_days_locked (number), decision = keep / refund, interview_ok = yes / no.
- **Process:** Refund processed within [A: 3 working days] with no argument. Do not guilt anyone.

---

## Logging

Keep it simple: one Google Sheet (or Notion table) with one row per customer. Columns: order id, name, phone model, delivery date, setup_status, puck_location, week1_days_locked, day14_score, week4_days_locked, decision, free text notes, consent_to_quote (yes/no/unknown), last_reply_date. Store only what the customer sent us. Restrict who can open it. Delete on request [A, check with CLO].

Reply keywords (no tool needed beyond WhatsApp Business): 1, 2, 3 for setup; a number 0 to 7 for locks; KEEP, REFUND, STOP, HELP. Use WhatsApp Business labels to tag replies.

---

## Measuring week 4 without the app collecting data

The app has no account and no analytics, by design [F: Plan; accessibility disclosure promises nothing leaves the phone]. We keep that promise. We measure by asking, not by tracking. Three opt in methods, from easiest to most robust:

### Method A: Reply keyword (all customers)
The check-ins above. The week 4 number is what the customer tells us. Cheapest, least reliable.

### Method B: Weekly focus card screenshot (opt in)
Every Sunday, one message: "Want to share this week? Open nope, screenshot the home screen (it shows Focused today and your Day streak) and send it. Totally optional." The app already shows "Focused today" and "Day streak" [F: Home.tsx], so no code change is needed. We log the number from the screenshot. Better than a guess, but the app shows only today and the streak, not a weekly total [F]. Ask the CTO whether a weekly total can be shown on the phone (it would still be local, and not collected).

### Method C: A "share my week" button inside the app (needs the CTO)
The app builds a small card (image or text) on the phone with this week's numbers, and the customer taps Share to send it to us on WhatsApp if they choose. Nothing is sent automatically. The customer chooses every time. This keeps the "nothing leaves your phone" promise because the customer, not the app, sends it [A: needs the CLO to confirm wording]. Do not build any hidden sending.

### Definition we use
A "week 4 retained" customer = someone who reports (or screenshots) locking on 3 or more of the last 7 days, measured between day 22 and day 30, and has not refunded.

### Honest limits of this measurement
- **Self selection:** People who still use nope reply more. People who quit go quiet. So non-replies must count as "not retained" in the headline number, and the "retained of repliers" number must be shown separately, labelled as optimistic.
- **Self report bias:** People round up and want to be nice to the founder. Screenshots are better than words.
- **Small numbers:** With 50 customers, one person is 2 percentage points. Do not claim anything with fewer than about 30 replies [A].
- **No bypass data:** We cannot see emergency unlock use, backup code use, uninstalls or service kills unless the customer tells us.
- **First customers are friendly:** Early buyers are the most motivated and most forgiving. Real retention for strangers from ads will likely be lower [A].
- **Measuring changes behaviour:** Being asked can make people use it more. Say so in any claim.
- **Not a clinical result:** This tells us if people keep using nope. It does not prove it reduces screen time or improves wellbeing, and we must never say so [F policy].
