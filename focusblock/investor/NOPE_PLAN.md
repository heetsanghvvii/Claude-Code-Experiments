# NOPE: Investor Plan v1 (Product and Tech)

Status date: 8 Nov 2026. Stage: pre-launch prototype, zero customers, zero revenue.
Founder: [name], solo founder, based in Mumbai. Contact: [email / WhatsApp].
This document is written to be evaluated. Every claim is tagged where it matters:
- [FACT] = shown in a screenshot, a vendor tool, or the code in the repo.
- [ASSUMPTION] = my estimate, change it freely.
- [UNVERIFIED] = believed true but not checked, must be verified before relying on it.
- [SYNTHETIC] = came from simulated AI customer interviews, a hypothesis not evidence.

---------------------------------------------------------------------

## 0. HOW TO USE THIS DOCUMENT (instructions for the AI or human evaluating it)

You are being asked to evaluate Nope as a possible investment, a product, a brand and a plan. Be a tough, honest, constructive reviewer. Do not be polite for its own sake. Do not invent numbers. If something is marked unverified, treat it as unverified and say what evidence would verify it. At the end of this document there is a ready prompt (Section 16) for running an investor panel, a due diligence pass and a red team pass.

---------------------------------------------------------------------

## 1. ONE PAGE SUMMARY

**One line:** Nope is a palm-sized puck you tap your phone on to lock the apps that eat your time, and tap again to unlock them. One deliberate physical action replaces a willpower fight you lose every day.

**The problem:** Most people know they scroll too much. Built-in screen time limits are one tap to ignore. Willpower fails at the exact moment of temptation. The decision to stop has to be made when you are strongest, and the lock has to hold when you are weakest.

**The solution:** A physical object (a hidden NFC tag in a calm, well-designed puck) plus an Android app. Lock in one tap. To unlock you must reach the puck. The idea: leave it in another room.

**Why now:** Phone overuse is a mainstream worry. NFC is on most Android phones and on all modern iPhones. A direct competitor (Brick) shows people will pay for a physical block, at a price in India of Rs 5,700 [FACT: from the Brick product page, 8 Nov 2026]. There is room for a better-priced, India-first product.

**Price:** Rs 1,999, one time, no subscription, 30 day refund. [FACT: decided by the founder]

**Business model:** Hardware margin first. Later: a paid app tier (schedules, multiple pucks, stats), bundles, gifting, and possibly room beacons for groups. [ASSUMPTION: nothing here is validated yet]

**Go to market:** Broad audience, no niche. Instagram and Meta ads send traffic to a fast mobile website for pre-orders. Orders and payment are handled manually via UPI and WhatsApp for the first 50 units. [FACT: founder decision]

**Where we are:** Android app built and compiled in the cloud, not yet run on a real phone with a real tag. Case designed, not yet printed. Brand direction chosen (charcoal and saffron orange). Website built. Marketing plan being written. No customers yet.

**What is the ask:** [FOUNDER TO FILL: amount, instrument, valuation expectation]. A suggested structure of use of funds is in Section 12.

**The honest weak points (we raise them first):**
1. Nothing has run end to end on a real device yet.
2. Android blockers can be bypassed by a determined user (disable permission, uninstall).
3. Google Play may reject an app that uses the accessibility service for blocking.
4. iPhone needs Apple approval and a paid account, so iPhone comes later.
5. A solo founder, no hardware track record, no traction yet.
6. Competitor Brick exists and may enter India aggressively.

---------------------------------------------------------------------

# PART 1: PRODUCT, BRAND, POSITIONING AND STRATEGY

## 2. THE PROBLEM IN DEPTH

### 2.1 The behaviour
People pick up the phone for a reason, get pulled into a feed, and lose time without deciding to. Willpower tools fail for a simple reason: the bypass is easy and the moment of temptation is exactly when judgement is weakest.

### 2.2 What people already tried (from the simulated interviews) [SYNTHETIC]
- Phone built-in limits: ignored with one tap.
- Timer and focus apps: uninstalled or disabled the first time they hurt.
- Taking the phone away or turning wifi off: works for a day, then fades.
- Browser workaround: blocked app, open the same site in Chrome.

### 2.3 What makes the problem unusually suited to a physical product
The act of unlocking has to cost something. A tap on a puck that you left in another room costs a walk. That tiny cost is the product. Software alone cannot create a cost that the same person cannot remove in a second.

### 2.4 Evidence status
The customer research so far is five simulated AI interviews. It is a hypothesis generator, not proof. A real interview plan (10 real people) is written and not yet run. Anyone evaluating this should treat demand as unproven.

## 3. THE CUSTOMER

### 3.1 Decision: broad audience
The founder decided not to target a niche. The audience is anyone in India who wants to scroll less. This is a deliberate trade: bigger reach on Meta, but the ads and website must carry the message because no group is already hungry for it.

### 3.2 Who the simulated research said would buy [SYNTHETIC]
| Persona (simulated) | Core pain | Biggest objection | Price signal |
|---|---|---|---|
| College student, 19 | Reels addiction, hostel life | Accessibility permission worry, breaks group chats | Rs 999 self buy, Rs 1,999 with parent or gift framing, rejects Rs 5,700 |
| Exam aspirant, 24 | Break time leaks into hours | Fear of being locked out before a mock test | Rs 1,999 justifiable as study cost, rejects Rs 5,700 |
| Software engineer, 28 | Doomscroll between tasks | Android only (his main phone is an iPhone), permission trust | Rs 3,499 felt defensible, Rs 1,999 read as low quality |
| Mother of a 15 year old, 42 | Teen gaming and reels | Teen can refuse to tap, wants visibility not locks | Rs 1,499 low regret, Rs 2,999 needs reviews and returns |
| Skeptical creator, 31 | Needs Instagram for work, scrolls too | He beat five blockers already, thinks tap is a gimmick unless it forces movement | Rs 1,499 to try, Rs 2,999 only with refund, rejects Rs 5,700 |

Caveat: the price was seeded in the prompts (Brick at Rs 5,700), so the rejection of Rs 5,700 may be biased. Real price testing is needed.

### 3.3 Segments we are not leading with
- Parents of teens: the simulated verdict was not to lead with this, because the person holding the puck is the person being controlled.
- iPhone heavy users: not served until the iPhone version.

## 4. THE PRODUCT (WHAT THE USER EXPERIENCES)

### 4.1 The core loop
1. Choose the apps to block (once).
2. Pair a puck (the app writes a secret code onto its hidden tag).
3. Tap the phone on the puck: locked. Blocked apps send you home with a calm "Blocked" screen.
4. Tap again: unlocked.

### 4.2 Features built in the current Android build [FACT: in the repo, compiled, not yet device tested]
- Tap to lock and unlock using NFC.
- Per app blocking with a foreground app detector.
- A "Blocked" full screen with a way home.
- First run onboarding: allow blocking, choose apps, pair puck.
- Plain language permission explainer shown before Android Settings opens.
- Daily focus time and a day streak.
- Emergency unlock, 2 per day, 10 second hold to confirm.
- Lock-out rescue: a 10 character backup code shown once at pairing; only a salted hash is stored; "Lost my puck?" screen; 5 wrong tries then a 10 minute cooldown; a hint after 24 hours of being locked.
- Essentials protection: phone dialers can never be blocked; WhatsApp, UPI apps, maps and messages show a "keep reachable" warning.
- Optional "also block browsers" toggle, default off.
- Developer test buttons so the app can be tested without a tag.

### 4.3 Not built yet
- Schedules and auto-lock (the simulated research asked for them).
- Per feature blocking (block Reels but allow DMs).
- Work mode and calendar based locking.
- Multiple pucks and a spare puck workflow.
- iPhone version.
- Desk mode with a Bluetooth beacon.

### 4.4 The physical product
- Round puck, about 60 mm wide, 12 mm tall in the first version, soft rounded edges, the word "nope" pressed gently into the top. [FACT: design files exist; a more refined version matching the brand photo is being produced]
- A hidden NFC sticker (NTAG213) sits under a thin top skin. The underside closes with a cap or a felt pad.
- No magnet in version 1, because metal near an NFC tag weakens the read. [UNVERIFIED: needs a real test]
- Phase 1 manufacturing: 3D printed in PETG. Vendor quote on a placeholder file: Rs 61 for one piece, Rs 2,097 for 50 (about Rs 42 each), with free shipping above Rs 999. [FACT: vendor quote tool on 8 Nov 2026, solid placeholder geometry, real file will differ]
- NFC stickers: NTAG213 packs of 10 cost roughly Rs 150 to Rs 300 on Amazon India, about Rs 15 to Rs 30 per sticker. [FACT: from listings viewed]

## 5. POSITIONING

### 5.1 Positioning statement
For anyone who knows they scroll too much, nope is the physical off switch for your distractions. Unlike willpower apps and screen time limits that are one tap to ignore, nope makes unlocking a deliberate, physical act, and it costs a fraction of the premium alternative.

### 5.2 Core idea
"Put it down." Not a lecture. Not shame. A small calm object that gives you back the first 10 seconds of every decision.

### 5.3 Messaging pillars (angles to test in ads)
1. Leave it in another room: the tap only works when you go to the puck.
2. One deliberate tap: no timers, no negotiating, no willpower contest.
3. No subscription, one price: Rs 1,999, 30 day refund.
4. Privacy in plain language: nope only sees which app is open, nothing else, nothing leaves your phone. [FACT for design; to be verified against the final manifest]
5. Never locked out: backup code and an emergency unlock.
6. Gift angle: the thing you give someone you care about who needs a break.
7. Work focus and bedtime angles.

### 5.4 What we must not claim
- No health, addiction treatment or mental health claims.
- No fake testimonials or invented statistics.
- No comparison with Brick that we cannot substantiate.
- Indian advertising standards apply. [UNVERIFIED: founder must check ASCI guidance]

## 6. BRAND

### 6.1 Name
nope. Short, memorable, a witty refusal. The domain getnope.in was available at about USD 9.98 a year; nope.in is taken. [FACT: Namecheap check, not purchased] Trademark clearance is not done. [OPEN: a word as common as "nope" may be hard to protect, needs a trademark attorney]

### 6.2 Direction
- Voice: calm, confident, a little witty, never shaming.
- Palette (chosen by the founder): charcoal #1C1C1E, warm grey #C9C7C3, off-white #F5F4F1 and one bold saffron orange #FF8A1F. The first direction (terracotta and sage) was rejected.
- Logo: heavy rounded lowercase "nope" wordmark, and a simple "n" app icon. Concepts exist; a creative head agent is producing clean vector versions. A human designer should polish before launch. [OPEN]
- Product look: soft, pillow-like puck, matte, the name pressed in.
- Tagline: "Put it down."
- Differentiation from Brick: round not square, no corner brackets, no blue, warm and personal, India priced.

### 6.3 Brand risks
- Colors and logo are concept stage.
- Name genericness (trademark risk).
- Orange text contrast must be checked (accessibility).

## 7. COMPETITION

| Competitor | What it is | Price / notes |
|---|---|---|
| Brick (getbrick.com) | A physical block you tap to lock apps | Rs 5,700 in India, Rs 1,500 for a mount, 30 day money back, 10 percent off for 2 or more [FACT: product page screenshot, 8 Nov 2026] |
| Built-in OS tools (Screen Time, Digital Wellbeing) | Free timers | One tap to dismiss [UNVERIFIED in detail] |
| Software blockers (Opal, Forest, Freedom, One Sec and similar) | App based locks and friction | Subscription or one time, easy to uninstall [UNVERIFIED from memory] |
| Other physical keys and tags | Niche hardware | [UNVERIFIED] |

### 7.1 Our wedge
- Price: Rs 1,999 versus Rs 5,700.
- India first: UPI, WhatsApp support, Hinglish content, Android first (most of the Indian market is Android [UNVERIFIED: commonly stated, check]).
- Calm brand instead of a clinical productivity brand.

### 7.2 Why competitors might crush us
- Brick can lower its price or localize and has a lead in brand and distribution.
- Platform owners (Apple, Google) can ship better built-in friction at any time.
- Hardware is easy to copy; the moat has to be brand, distribution and software experience.

## 8. GO TO MARKET

### 8.1 Phase plan
| Phase | Goal | Units | Gross revenue at Rs 1,999 | How |
|---|---|---|---|---|
| 1 | Prove it works and someone pays | 50 | Rs 99,950 | Hand made, 3D printed, manual UPI orders |
| 2 | Prove ads can sell it | 500 | Rs 999,500 | Meta ads, better supply, return and support process |
| 3 | Build the repeatable machine | 5,000 | Rs 9,995,000 | Better manufacturing, iPhone, Play Store |
| 4 | Scale | 50,000 | Rs 99,950,000 | Retail, partnerships, marketplace [ASSUMPTION: illustrative arithmetic only] |

### 8.2 Primary channel: Instagram and Meta ads to the website
- Structure: conversion campaigns, broad targeting, creative testing across the messaging angles, a budget ladder from Rs 5,000 to Rs 75,000, retargeting for site visitors.
- The website is built for paid traffic: fast hero, one call to action, price and refund early, privacy section, FAQ, sticky pre-order button on mobile.
- Tracking: UTM scheme, Meta Pixel, and manual matching of UPI payments. [OPEN: details are being written by the CMO agent]
- Organic Instagram content: tap demo video, how it works, behind the scenes of making the puck.

### 8.3 Order flow for the first 50 units
Pre-order page, UPI payment, WhatsApp confirmation, hand made unit shipped in about 2 to 3 weeks (timing to be confirmed), a 30 day refund. No payment gateway at first. [DECISION: switch to a gateway after about 100 orders]

### 8.4 Offer mechanics
- Rs 1,999 one time.
- 30 day refund.
- Bundle idea: puck plus spare puck (answers the lost puck fear).
- Gift option.

### 8.5 Validation still owed
Ten real customer interviews, recruited broadly, using a written script. Not done. A landing page price test (Rs 1,499 vs Rs 1,999 vs Rs 2,499). Not done.

## 9. BUSINESS MODEL AND UNIT ECONOMICS

### 9.1 Revenue
1. Hardware: Rs 1,999 per puck.
2. Bundles and spares.
3. Later: a paid app tier (schedules, work mode, stats, multiple pucks). Not designed or tested. [ASSUMPTION]
4. Possible B2B: rooms and study spaces with beacons (idea only). [ASSUMPTION]

### 9.2 Illustrative unit economics at 50 units [ASSUMPTION unless tagged]
All inputs are editable. This is a template for a spreadsheet.
- Price Rs 1,999. If GST at 18 percent is included in the price, taxable value is 1,999 / 1.18 = about Rs 1,694. [UNVERIFIED: tax treatment must be confirmed with a CA]
- 3D printed case: about Rs 42 to Rs 60 [partly FACT: vendor quote on a placeholder]
- NFC sticker: about Rs 15 to Rs 30 [FACT: listings]
- Cap or felt pad: about Rs 30 to Rs 60 [ASSUMPTION]
- Box and card: about Rs 40 to Rs 80 [ASSUMPTION]
- Shipping inside India: about Rs 60 to Rs 100 [ASSUMPTION]
- Payment fees: 0 to 2 percent [ASSUMPTION]
- Refund and return allowance: 10 percent of revenue [ASSUMPTION]
- Mid case landed cost about Rs 290 plus refund allowance about Rs 170.
- Contribution before ads about Rs 1,235 per unit (1,694 minus 290 minus 169).
- Break even advertising cost per purchase is therefore about Rs 1,235, and break even return on ad spend is price divided by contribution, about 1.6.
- Meaning: if Meta can deliver a paying customer for under about Rs 1,235, each sale is profitable before overhead. Real ad costs for hardware in India are unknown and are the single most important number to learn. [OPEN]

### 9.3 What breaks the economics
- Ad cost per purchase above about Rs 1,200 with no repeat revenue.
- Return rate above the assumed 10 percent.
- Manufacturing rework at small volume.
- Support burden on a solo founder.

## 10. PRODUCT ROADMAP (customer facing)
| When | What |
|---|---|
| Now to week 3 | Real device test, first printed puck, website live, 50 unit pre-order |
| Weeks 4 to 8 | Fix issues from first customers, schedules, always allowed list improvements |
| Months 3 to 6 | iPhone version (needs Apple developer account and Apple approval of the Screen Time permission), better manufacturing for 500 units |
| Months 6 to 12 | Paid tier, spare puck bundles, Desk mode test with a Bluetooth beacon, evaluate B2B rooms |
| Later | Custom molded puck, retail and marketplace distribution |

## 11. PRODUCT RISKS (with mitigation)
| Risk | Severity | Mitigation |
|---|---|---|
| Nothing validated with real customers | High | 10 real interviews, a price test, pre-order as the real proof |
| Easy to bypass on Android | High | Honest marketing (we reduce, not eliminate), optional browser blocking, protection checks, physical friction story |
| Lock-out fear | High | Rescue code, emergency unlock, spare puck bundle, 30 day refund |
| Brick or others cut price | Medium | India first brand, price, speed, community |
| Hardware quality at small volume | Medium | First 50 hand checked with a QC list |
| Trademark on "nope" | Medium | Early attorney check, consider a modifier in the legal name |
| Solo founder bandwidth | High | Narrow scope, agents and contractors for design, a clear Phase 1 stop point |
| Advertising claims and policy | Medium | Compliance checklist, no health claims |

## 12. THE ASK AND USE OF FUNDS (template, founder to decide)

Amount: [FOUNDER TO FILL]. Instrument: [FOUNDER TO FILL]. Valuation expectation: [FOUNDER TO FILL].

A suggested allocation to reach 500 units and an iPhone version in about 12 months [ASSUMPTION, adjust]:
- 35 percent paid acquisition and creative.
- 20 percent product, tooling and small batch manufacturing.
- 15 percent engineering and iPhone program (Apple developer account, testing devices, contractor help).
- 10 percent legal, trademark, GST and compliance.
- 10 percent support, logistics, packaging.
- 10 percent buffer.

Milestones that unlock the next tranche: first 50 paid orders, refund rate under 10 percent, ad cost per purchase below break even, real device reliability proven.

---------------------------------------------------------------------

# PART 2: TECHNOLOGY

## 13. TECH ARCHITECTURE

### 13.1 Overview
Nope has three technical parts: the phone app, the physical NFC tag in the puck, and the website. There is no backend server and no user account in version 1. Everything runs on the phone.

### 13.2 The Android app
- Framework: Expo (React Native) with TypeScript. Expo SDK 58, React Native 0.88. [FACT: from package.json]
- Native module: a local Expo module called AppBlocker written in Kotlin for Android and Swift for iPhone. [FACT: in repo]
- NFC: the react-native-nfc-manager library.
- Storage: on-device storage (AsyncStorage) for settings, the blocked app list, stats, the backup code hash and rescue attempt counters.
- Builds: Expo cloud builds (EAS) produce an installable APK without needing Android Studio. A development build and a standalone build both completed. [FACT]
- Code structure: a thin App shell; screens for Home, Onboarding, App picker, Rescue, Backup code and Permission explainer; hooks for state; helper files for NFC, storage, essentials and settings.

### 13.3 How blocking works on Android
1. The user enables the Nope accessibility service once in Android Settings.
2. The service listens only to window change events (TYPE_WINDOW_STATE_CHANGED) and reads the package name of the foreground app. It does not request access to screen content. [FACT: configured in the service config; to be re verified in the compiled manifest]
3. If locking is on and the foreground app is on the blocked list (and not on the always allowed list), the service performs a Home action and starts a full screen Blocked activity. It debounces repeats, ignores system UI, launchers, keyboards and Nope itself.
4. Dialers and emergency apps can never be blocked.
5. The optional browser toggle adds browser packages to the blocked list.

### 13.4 NFC pairing and tap logic
- Pairing: the app generates a random token and writes it as an NDEF text record on the NTAG213 tag. The token is stored on the phone.
- Lock or unlock: the app reads the tag, compares the token, and toggles.
- Works with blank, unlocked NTAG213 tags on both Android and iPhone in principle. [UNVERIFIED on real hardware]
- Known weakness: the token is readable, so someone could copy it onto another tag with an NFC app. Fine for self control, weak as a security device. Upgrade path: NTAG 424 DNA tags that sign each tap (more expensive, about Rs 100 plus per tag, estimate). [UNVERIFIED]

### 13.5 Lock-out rescue design
- Backup code: 10 characters from an alphabet without confusing characters; only a salted hash of the code is stored; the code is shown once.
- Rescue screen: enter the code to unlock and optionally re-pair a new tag.
- Brute force protection: 5 wrong attempts then a 10 minute cooldown stored on the device.
- Emergency unlock: 2 per day with a 10 second hold, counted in storage.
- Limitation: a user with root or a data wipe can bypass the counters. Acceptable for this threat model, which is self control, not security.

### 13.6 Privacy and data
- No account, no analytics, no data leaves the phone. [FACT: by design; final manifest and dependency review still owed]
- The only sensitive permission is the accessibility service, explained in plain language before it is requested. A written Play Store accessibility disclosure and privacy policy are drafted. [FACT: drafted]
- If analytics or crash reporting are added later, the privacy policy and the Play data safety form must change.

### 13.7 The website
- A static single page (inline CSS and JS, no framework), mobile first, built for paid traffic.
- Pre-order: UPI deep link and a QR box; waitlist form opens WhatsApp with the person's details and keeps a local backup. Placeholders remain for the WhatsApp number and UPI ID.
- Hosting is not set up. Candidate: a static host. Domain: getnope.in (not purchased).
- No backend, no database. [DECISION: acceptable for 50 units, replace with a proper store or checkout after Phase 1]

### 13.8 Infrastructure and tooling
- Source: a GitHub repository, working branch with commits pushed.
- Builds: Expo cloud (EAS), free tier, an access token stored securely.
- Distribution for Phase 1: direct APK install or internal distribution link. Play Store is a Phase 2 or 3 goal.
- Testing: type checking passes. There are no automated tests and no real device test yet. [FACT: honest status]

## 14. TECH RISKS AND HOW WE HANDLE THEM

| Risk | Detail | Handling |
|---|---|---|
| Google Play policy | Play restricts the accessibility service for non accessibility uses and may reject blockers | Prepare a disclosure and demo, distribute the APK directly for Phase 1, keep a fallback design using Usage Access plus overlay [UNVERIFIED feasibility] |
| Background reliability | Several Android brands kill background services | Test on common Indian brands, add a setup guide per brand, keep the service lightweight |
| Bypass | Disable permission, uninstall, factory reset, use another device | Be honest in marketing, add a permission lost warning and a nudge, consider device admin protection later [UNVERIFIED] |
| NFC read range through the case | Thick or tinted plastic and nearby metal weaken reads | NFC test plan (sticker size by shell thickness by phone brand), keep the skin thin, no magnet near the tag |
| Cloned tags | Token can be copied | Acceptable for v1, signed tags later |
| iPhone | Needs a paid Apple developer account and Apple approval for the Screen Time (Family Controls) permission, real device only, shield design controlled by Apple | Treat as Phase 3, prototype code exists but is untested [FACT] |
| Platform change | OS updates can break the service behavior | Keep a test device per major Android version, monitor beta releases |
| Security of rescue code | Salted hash on device | Fine for the threat model, document it |
| Single developer | Bus factor of one | Clean repo, written docs, contractors for hardware and iPhone |

## 15. TECH ROADMAP
| Stage | Work |
|---|---|
| Now | Run the standalone APK on a real Android phone with the test buttons, then with a real tag; fix bugs; add a brand specific battery setup guide |
| Next 4 weeks | Schedules, per feature blocking research, in app help, crash free checks on at least 5 phones, a short automated test suite for the logic (rescue counters, essentials filter, token compare) |
| Months 2 to 4 | iPhone prototype on a real device with the paid Apple account, Play Store submission pack and closed testing, optional signed tags |
| Months 4 to 8 | Desk mode test with an off the shelf Bluetooth beacon, multi puck support, paid tier prototype, a lightweight backend only if a paid tier or orders require it |
| Later | Custom hardware with Bluetooth if desk mode proves demand (requires firmware, battery or USB power, radio approvals in India [UNVERIFIED]) |

---------------------------------------------------------------------

# APPENDIX A: Q AND A WE EXPECT FROM INVESTORS

1. Is this a company or a feature? Honest answer: today it is a feature plus a gadget. The company case depends on brand, distribution, a subscription or tier that sticks, and possibly B2B rooms. We have not proven that yet.
2. Why would anyone pay Rs 1,999 for an NFC sticker in plastic? They are paying for the commitment device, the app and the calm brand, not the chip. The BOM is small by design; the value is behaviour change. Needs real pre-order proof.
3. Why would you beat Brick? We do not claim to beat them globally. In India we are priced at about a third, support in local ways, and sell a calmer brand. They can respond with price or localization, which is a real risk.
4. What if Apple or Google build this? They could. Their incentives (screen time versus engagement) make it less likely they ship a hard lock; the physical object is also outside their stack.
5. What stops a copy? Not much on hardware. Brand, community, software polish and execution speed.
6. Can the user cheat? Yes, with effort. We reduce impulsive opens, we do not make it impossible, and we say so.
7. Will Google ban the app? Possible. Mitigation in Section 14.
8. Do you have customers? No. We have a prototype and simulated research. Validation plan exists.
9. What is the CAC? Unknown. Break even is about Rs 1,235 under illustrative assumptions. Ad tests exist to find the real number.
10. What is LTV? Mostly one time hardware today. A paid tier, spares, gifts and B2B are hypotheses.
11. Why India first? Price sensitivity favors a cheaper product than Brick, UPI and WhatsApp make small batch selling easy, and Android dominates. [UNVERIFIED market share figure, check]
12. Why a solo founder? Honest constraint. The plan keeps Phase 1 small, uses specialist help for design and iPhone, and sets stop criteria.
13. What are the unit economics? Section 9. Illustrative and unverified.
14. What is the manufacturing plan? 3D print for 50, then resin or silicone casting, then injection molding when demand is proven. Tooling costs and minimums not yet quoted. [OPEN]
15. What about regulation? GST, product labelling, possible battery or radio rules only if we add electronics. NFC stickers are passive. [UNVERIFIED, needs a CA and a compliance check]
16. Is it safe for kids? Phase 1 is for adults. No small magnets in version 1. We do not market to children.
17. Privacy? On device only by design. To be proven by an independent review of the manifest and code.
18. What if the puck is lost? Backup code, emergency unlock, spare puck bundle, refund.
19. What is the moat in 3 years? Brand, the largest India focused library of focus content and routines, an installed base, partnerships, and eventually data from consented opt in programs. Not strong today.
20. What is the exit? Strategic sale to a consumer electronics, wellbeing or phone brand, or a profitable brand business. Early thinking only.
21. Why this team? One founder with a product and operations mindset and a fast, AI assisted build process. No hardware track record yet. [FOUNDER TO ADD: relevant background]
22. How will you hire? Contractors first for industrial design and Android QA, then a full stack engineer after the first 500 units.
23. What metric matters most in the next 90 days? Paid pre-orders, cost per paid order, refund rate, week 4 usage retention.
24. What would make you stop? Fewer than 20 paid orders from a fair test, or ad cost per purchase above break even with no improving trend after the ladder, or refund rate above 20 percent.
25. What do you need from us besides money? Introductions to D2C hardware operators, a trademark attorney, and an Indian manufacturing partner.

---------------------------------------------------------------------

# APPENDIX B: ASSUMPTIONS REGISTER (change these first)
| Item | Current value | Source |
|---|---|---|
| Price | Rs 1,999 | Founder decision |
| GST inclusive | Yes at 18 percent | Assumption, verify with a CA |
| Case cost at 50 units | Rs 42 to Rs 60 | Vendor quote on placeholder |
| NFC sticker | Rs 15 to Rs 30 | Amazon listings |
| Cap or pad | Rs 30 to Rs 60 | Assumption |
| Box and card | Rs 40 to Rs 80 | Assumption |
| Shipping | Rs 60 to Rs 100 | Assumption |
| Refund rate | 10 percent | Assumption |
| Ad cost per purchase | Unknown | To be measured |
| Time available from founder | 8 to 10 hours a week | Assumption |

# APPENDIX C: WHAT IS VERIFIED VERSUS NOT
- Verified: the code compiles and cloud builds finish; the vendor print quote; NFC sticker prices; the Brick price; domain availability.
- Not verified: anything on a real phone, NFC read through the case, customer demand, ad costs, GST, trademark, Play Store acceptance, iPhone feasibility, Bluetooth ideas, B2B ideas.

---------------------------------------------------------------------

# 16. PROMPTS FOR AI EVALUATORS (copy and paste after this document)

## Prompt 1: Investor panel (Shark Tank style)
```
Read the Nope document above. Run a panel of 6 investor archetypes, each answering separately and in character: (1) a D2C consumer brand operator, (2) a hardware and manufacturing skeptic, (3) a consumer app and growth investor, (4) a unit economics and finance hawk, (5) a brand and positioning expert, (6) a legal, compliance and platform risk reviewer. If you can run multiple agents or parallel threads, give each archetype its own agent and then merge.
For each investor give: what you love, what scares you, your top 5 questions for the founder, whether you would invest today (yes, no, or only on conditions), and what valuation range and structure you would accept and why. Then run a vote and give a final decision: invest, pass, or conditional, and the exact conditions.
Rules: do not invent facts or numbers. If something is marked UNVERIFIED or SYNTHETIC, say what evidence would make it credible. Be blunt and specific. No flattery.
```

## Prompt 2: Red team
```
Act as the harshest possible red team for Nope. List the 15 most likely reasons it fails, ranked by probability times impact, with early warning signs and a cheap test for each. Then list what would have to be true for it to become a 100 crore revenue business, and which of those are currently least supported.
```

## Prompt 3: Due diligence checklist
```
Produce a due diligence checklist for Nope: product, tech, hardware, legal, financial, marketing, and team. For each item say what document or proof an investor would ask for, whether the founder has it today, and how to get it fast.
```

## Prompt 4: Pitch rewrite
```
Rewrite the Nope pitch as a 3 minute Shark Tank style pitch with an opening hook, the problem, the demo moment, the ask, and answers to the 5 hardest questions. Keep every claim consistent with the document and mark anything unverified. Then give me a 10 slide deck outline with the key message and the number or proof on each slide.
```

## Prompt 5: Improve the plan
```
Based on all of the above, give me a ranked list of the 10 highest leverage changes to the product, tech, brand, positioning, pricing and go to market that would most increase the chance of getting funded and of the business working. For each: what to change, why, cost, time, and how to test it.
```
