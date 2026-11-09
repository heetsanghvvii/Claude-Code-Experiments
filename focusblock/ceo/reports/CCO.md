# CCO Report to the CEO

Date: 9 Nov 2026. Status: pre-launch, no real customer evidence. Labels: [F] fact, [A] assumption, [U] unverified. Detail is in /home/user/Claude-Code-Experiments/focusblock/customer/.

## Top 5 customer risks

1. **Setup wall.** Sideloaded APK, Android 13+ restricted setting, accessibility permission and battery kill. Most likely place to lose people before they ever lock once [F: all named in the plan; exact screens U].
2. **Silent failure.** The home screen shows LOCKED even if the phone has killed the blocking service. One experience of opening Instagram while "LOCKED" ends trust [F: code shows no health check].
3. **Novelty fade and the drawer.** The idea only works if the puck is in another room and the habit sticks past day 7. No evidence yet [A].
4. **Bypass and lock-out are both built in.** Emergency unlock (2 a day), backup code, and a permanent "Lost my puck?" link make bypass easy. Lock-out with no support route makes people afraid [F: code]. We need the right balance.
5. **We cannot see week 4.** The app collects nothing, so retention is only self reported, biased and slow [F]. Risk of fooling ourselves with friendly early buyers.

## What I need from others

- **CTO:** blocking health indicator and permission-lost banner; NFC off and unsupported messages; first lock rehearsal step; confirm TEST_MODE is off in release builds; confirm what happens on reinstall; optional local "share my week" card.
- **Creative head:** design the two cards and the backup code card from ONBOARDING_CARD.md; rewrite screens per QA_WALKTHROUGH.md; film the setup video.
- **COO:** WhatsApp Business number, delivery date source, support hours, refund process within 3 working days, box contents.
- **CPO:** emergency unlock limits, streak rules, browser blocking default, auto relock.
- **CLO:** consent wording for WhatsApp check ins, testimonials, data storage (DPDP) and endorsement rules.
- **CMO:** make ad and site say Android only, NFC check, no subscription; no claims beyond what we can show.
- **CFO:** budget for a human setup call or fast WhatsApp support for the first 50 orders.

## 3 decisions I need from the CEO

1. **Gate shipping on a setup test.** Do not ship to paying customers until 5 strangers have set up on real phones (at least 3 brands) while we watch, and at least 4 of 5 reach a first lock unaided or with the guide. Yes or no?
2. **Add local "blocking health" and a local "share my week" card to the app**, with nothing sent unless the customer taps Share. This keeps the no-data promise but gives us honest evidence. Approve CTO time?
3. **Refund and bypass policy.** Approve: (a) we remind customers of the refund window on day 28, (b) support is human on WhatsApp for the first 50 orders, (c) we do not shame or block bypass further. Or choose a stricter line.

## My recommended definition of "the product works"

To be judged on the first 50 paying customers (all must hold; a miss on any means "not yet"). All thresholds are [A] starting points, not facts.

| Measure | Pass |
|---|---|
| Setup completed within 48 hours of delivery | 80 percent or more |
| First lock within 24 hours of setup | 85 percent or more |
| Blocking service reported failing | Under 5 percent of customers |
| Week 1 median days locked (of 7) | 4 or more |
| Week 4 retained (locked on 3 or more of last 7 days, non-repliers counted as not retained) | 40 percent or more |
| Refund rate by day 30 | Under 10 percent (stop line 20 percent [F: plan]) |
| Customers who volunteer a specific change in behaviour in their own words | At least 10 of 50 |

Limits: self reported, small numbers, early buyers are friendly. Say "early signal", never "proven". Confidence needs at least 30 replies and ideally a second batch from cold ad traffic.
