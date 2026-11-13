# Food Label Checker (health and fitness): CFO Model v2

Prepared 2026-11-11. Replaces the Jain-niche model for the new product direction. Supersedes revenue sections only; the cost stack is reused unchanged from /home/user/Claude-Code-Experiments/food-scanner/team/reports/cfo-model.md (FX assumed INR 88 per USD).

Conventions: "Benchmark" means a number found at a cited URL, with a quality flag. "Assumption" (A-numbers) means my estimate, never a fact. No ad revenue appears in any scenario. The app makes no health claims, so revenue comes only from subscriptions and affiliate links.

## 1. Cost stack (reused, not re-researched)

| Item | INR | Label |
|---|---|---|
| Fixed monthly F: domain 80, agent and tooling 3,000, CA 1,000, misc 500 | 4,580 per month | Assumptions A1, A6, A7, A8 from the earlier model |
| LLM label extraction | 0.04 per MAU per month | Earlier model section 1.3 (Gemini Flash-Lite price per https://ai.google.dev/pricing) plus assumption A4 |
| Workers Paid, applied when MAU is above 10,000 | 440 per month | https://developers.cloudflare.com/d1/platform/pricing/ |
| Sole proprietorship, one time | 3,500 | Assumption A5, range from https://qwikfilings.com/sole-proprietorship-registration/ |
| Google Play developer account, one time | 2,200 | https://support.google.com/googleplay/android-developer/answer/112622 |
| Domain prepaid, 1 year | 1,000 | Earlier model A1 |
| Payment and store fees | Inside net ARPU below | Razorpay 2.36% all-in https://razorpay.com/blog/razorpay-payment-gateway-pricing-explained/ ; Play 15% https://support.google.com/googleplay/android-developer/answer/10632485 |
| Paid marketing from month 4 | Low 0, Base 3,000, High 8,000 | New assumption A18b. Raised from the old 2,000 because the health audience is contested and organic reach is less certain |

Apple developer fee (INR 8,700) stays excluded; PWA covers iOS. Owner time is unpaid (A9).

## 2. Revenue benchmarks

### 2.1 Affiliate commission rates

| Program | Rate found | Quality | Source |
|---|---|---|---|
| HealthKart via EarnKaro | Flat 3% | Aggregator, not HealthKart itself | https://earnkaro.com/blog/healthkart-affiliate-program/ |
| HealthKart via GrabCash | Up to 4.8% (protein, supplements, wellness) | Aggregator | https://grabcash.in/blog/healthkart-affiliate-program/ |
| HealthKart via Shopper | 2.7% to 4.73%, 7 day cookie (Affi.io lists 30 days) | Aggregator, conflicting cookie | https://shopper.com/partnerships/healthkart-com-affiliate-program |
| MuscleBlaze via EarnKaro | Flat 3% | Aggregator | https://earnkaro.com/blog/muscleblaze-affiliate-program |
| MuscleBlaze via Cuelinks | 4.72% to 5.67%, 30 day cookie (a separate Cuelinks listing shows 18% to 22% for a men's health programme, which I treat as a different offer and do not use) | Network's own blog, conflicts with EarnKaro | https://www.cuelinks.com/blog/top-whey-protein-affiliate-programs-india/ |
| Myprotein India via Cuelinks | 2.40% to 2.88% | Network blog | https://www.cuelinks.com/blog/top-whey-protein-affiliate-programs-india/ |
| Amazon India Associates, health and personal care or grocery | Not confirmed. Third-party guides conflict: 4% to 6% beauty and personal care, 2% to 10% range, 3.74% for personal care appliances, 8% in a 2023 guide. Seller referral fees (for example 9% for nutrition) are not affiliate rates and are not used | Weak. Official affiliate.amazon.in schedule not reached | https://www.cuelinks.com/blog/amazon-affiliate-commission-rates-guide/ and https://cashify.in/amazon-affiliate-commission-rates-india |
| Amazon India payout terms | Minimum payout INR 2,500, paid about 60 days after month end | Single secondary source | https://fluxnote.io/guides/amazon-india-affiliate-commission-rates-2026 |
| Wellbeing Nutrition, other D2C | No rate found | None | none |

Read: 3% to 5% is the evidenced band for supplement brands. I use 3.5% for Base (A-C, below). Amazon is unverified, so no scenario depends on a specific Amazon rate.

### 2.2 Order values

No transaction-level average order value found. Only list prices:

| Item | Price | Source |
|---|---|---|
| MuscleBlaze 1 kg Raw Whey Isolate | INR 4,199 | https://www.healthkart.com/sv/muscleblaze-raw-whey-isolate-powder/SP-83793 |
| MuscleBlaze 4 kg Raw Whey 80% | INR 10,999 (about 2,750 per kg) | https://www.healthkart.com/sv/muscleblaze-raw-whey-protein-80-powder/SP-48431 |
| Market range for whey | About INR 1,500 to 7,000 per kg; concentrate blends about 2,800 to 3,300 per kg; isolates about 4,800 per kg | https://www.healthkart.com/connect/?p=61360 and https://nutsutra.pages.dev/blog/best-whey-protein-in-india-2026-12-brands-tested-ranked (blog, weak) |
| Typical sale discounts | 20% to 30% (one comparison site, weak) | https://zoutons.com/news/muscleblaze-vs-nakpro-protein-comparison-indian-athletes-2026 |

Health snack prices (bars, makhana, oats) were not sourced. My basket (A-D) is an assumption blending snacks of a few hundred rupees with occasional INR 3,000 to 4,000 protein tubs.

### 2.3 Subscription prices of Indian fitness apps

| App | Price found | Quality | Source |
|---|---|---|---|
| HealthifyMe | Aggregator claims Premium from about INR 4,000 per year, Smart INR 8,000, Pro INR 15,000; another page says INR 2,499 for 12 months as a Blinkit-exclusive offer; older sources INR 299 per month and coach plans INR 1,199 to 3,999 per month (2019) | Weak, conflicting | https://subger.com/en/service/healthifyme and https://nutriscan.app/blog/posts/healthifyme-pricing-2026-india-plans-63a87b21d0 |
| Cult.fit | Official live page shows 12 month plan INR 1,859 (about 155 per month) and 24 month INR 2,779 (about 116 per month), after discounts; Elite from INR 958 per month on a centre page | Official page for live plans; gym memberships, not comparable to a utility app | https://www.cult.fit/live and https://www.cure.fit/cult?gmb=79 |
| Fittr | Not found | None | none |
| Earlier anchor | Google Play Pass INR 99 per month or 889 per year | Weak | https://www.businesstoday.in/technology/story/google-play-pass-launched-in-india-at-rs-99-per-month-annual-plan-to-cost-rs-889-324162-2022-02-28 |

Read: coaching apps charge INR 2,500 and up per year. My INR 49 per month or 399 per year (A12, unchanged) is a deliberately low utility price, below every incumbent found.

### 2.4 Conversion benchmarks

| Benchmark | Finding | Quality | Source |
|---|---|---|---|
| Affiliate conversion, India | About 2% average, global about 4% (IAMAI report, repeated by GrabCash) | Best of a weak set | https://www.iamai.in/sites/default/files/research/Affiliate-Marketing-Report%20-%20IAS23%20Launch.pdf and https://grabcash.in/blog/?p=2005 |
| Health and wellness supplement conversion | 1.8% (global vertical table, India not specified) | Weak | https://www.digitalapplied.com/blog/affiliate-marketing-statistics |
| Elite affiliate conversion | 5% to 10% on targeted audiences | Network marketing, weak | https://www.vcommission.com/blog/publishers/how-to-maximise-affiliate-conversions-in-india-best-indian-campaigns/ |
| Click-through rate | No affiliate CTR benchmark found for India. Only a Facebook ads figure for wellness in India, 2.58%, which is a different thing | Not usable | https://www.superads.ai/facebook-ads-costs/ctr-click-through-rate/wellness-holistic-health/india |
| Subscription conversion, India | 0.7% of installs pay within 35 days (RevenueCat, via secondary blogs, from the earlier model) | Secondary | https://revenuecat.com/blog/growth/app-trial-conversion-rate-insights/ |

## 3. Twelve-month model

Month 1 is the first month after public launch. Phase 1 (build) is before month 1.

### 3.1 Assumptions (all assumptions, none are facts)

| ID | Assumption | Low | Base | High | Basis |
|---|---|---|---|---|---|
| A10 | MAU at month 12 | 2,500 | 20,000 | 100,000 | Judgement. Bigger audience than Jain niche (Base was 15,000) |
| A11 | Paying subscribers as % of MAU | 0.5% | 1.2% | 2.5% | Anchored on 0.7% of installs (2.4); fitness users may pay more but free calorie apps exist |
| A12 | Price INR 49 per month or 399 per year | n/a | n/a | n/a | Unchanged |
| A13 | Net subscription revenue per payer per month, after fees | 30 | 36 | 36 | Unchanged from earlier model |
| A-A | Affiliate link clicks per MAU per month | 0.10 | 0.30 | 0.60 | No benchmark; a link shown on product and comparison pages |
| A-B | Click to purchase rate | 1.5% | 2.0% | 3.0% | Base equals IAMAI 2% (2.4) |
| A-D | Average basket (INR) | 600 | 1,000 | 1,500 | No AOV source; list prices in 2.2 |
| A-C | Commission rate | 2.5% | 3.5% | 5.0% | Evidenced 2.4% to 5.67% band (2.1); Amazon unknown |
| A16 | Fixed cost F per month | 4,580 | 4,580 | 4,580 | Section 1 |
| A17 | LLM per MAU | 0.04 | 0.04 | 0.04 | Section 1 |
| A18b | Marketing per month from month 4 | 0 | 3,000 | 8,000 | Judgement |
| A19 | Workers Paid 440 per month when MAU above 10,000 | yes | yes | yes | Section 1 |
| A20 | Paying users = MAU x conversion each month (churn folded into the rate) | | | | Unchanged |
| A21 | Affiliate commission is recognised when earned; cash arrives about 60 days later on Amazon (2.1). Payout minimums can delay cash further | | | | Model is accrual; cash is later |
| A22 | Network or tracking cuts on commission are not modelled; published rates are assumed to be what the publisher receives | | | | Risk |

### 3.2 Affiliate revenue per MAU, derived step by step

Formula: clicks x purchase rate x basket x commission.

| Step | Low | Base | High |
|---|---|---|---|
| Clicks per MAU | 0.10 | 0.30 | 0.60 |
| x purchase rate | 0.10 x 0.015 = 0.0015 orders | 0.30 x 0.02 = 0.006 orders | 0.60 x 0.03 = 0.018 orders |
| x basket | 0.0015 x 600 = INR 0.90 | 0.006 x 1,000 = INR 6.00 | 0.018 x 1,500 = INR 27.00 |
| x commission | 0.90 x 0.025 = INR 0.0225 | 6.00 x 0.035 = INR 0.21 | 27.00 x 0.05 = INR 1.35 |

Per MAU per month, subscription plus affiliate:

| | Subscription (conv x ARPU) | Affiliate | Total |
|---|---|---|---|
| Low | 0.005 x 30 = 0.15 | 0.0225 | 0.1725 |
| Base | 0.012 x 36 = 0.432 | 0.21 | 0.642 |
| High | 0.025 x 36 = 0.90 | 1.35 | 2.25 |

Compare earlier Base: 0.59 without ads (0.83 with the INR 0.24 ads, now removed). The new Base is 0.642, a modest rise, because lost ads are replaced by 4x higher affiliate revenue.

Formulas: Paying = round(MAU x conv). Subscription = Paying x ARPU. Affiliate = round(MAU x affiliate per MAU). Revenue = Subscription + Affiliate. Cost = 4,580 + round(0.04 x MAU) + marketing (month 4 on) + 440 (MAU above 10,000). Computed by script and spot-checked by hand below. INR, rounded.

### 3.3 Base scenario

| Month | MAU | Paying | Subscription | Affiliate | Revenue | Cost | Profit | Cumulative |
|---|---|---|---|---|---|---|---|---|
| 1 | 300 | 4 | 144 | 63 | 207 | 4,592 | -4,385 | -4,385 |
| 2 | 700 | 8 | 288 | 147 | 435 | 4,608 | -4,173 | -8,558 |
| 3 | 1,300 | 16 | 576 | 273 | 849 | 4,632 | -3,783 | -12,341 |
| 4 | 2,200 | 26 | 936 | 462 | 1,398 | 7,668 | -6,270 | -18,611 |
| 5 | 3,400 | 41 | 1,476 | 714 | 2,190 | 7,716 | -5,526 | -24,137 |
| 6 | 4,900 | 59 | 2,124 | 1,029 | 3,153 | 7,776 | -4,623 | -28,760 |
| 7 | 6,800 | 82 | 2,952 | 1,428 | 4,380 | 7,852 | -3,472 | -32,232 |
| 8 | 9,000 | 108 | 3,888 | 1,890 | 5,778 | 7,940 | -2,162 | -34,394 |
| 9 | 11,500 | 138 | 4,968 | 2,415 | 7,383 | 8,480 | -1,097 | -35,491 |
| 10 | 14,000 | 168 | 6,048 | 2,940 | 8,988 | 8,580 | 408 | -35,083 |
| 11 | 17,000 | 204 | 7,344 | 3,570 | 10,914 | 8,700 | 2,214 | -32,869 |
| 12 | 20,000 | 240 | 8,640 | 4,200 | 12,840 | 8,820 | 4,020 | -28,849 |

Hand checks. Month 10: 168 x 36 = 6,048; 14,000 x 0.21 = 2,940; revenue 8,988; cost 4,580 + 560 + 3,000 + 440 = 8,580; profit 408. Month 9: 11,500 is above 10,000 so Workers applies: 4,580 + 460 + 3,000 + 440 = 8,480; profit 7,383 - 8,480 = -1,097. Month 12: 4,580 + 800 + 3,000 + 440 = 8,820; 12,840 - 8,820 = 4,020. Cumulative, month 12: -35,491 (month 9) - 1,097... re-added via rows 10 to 12: 408 + 2,214 + 4,020 = 6,642; 6,642 - 35,491 = -28,849. Matches.

Base totals: 12-month revenue INR 58,515; cost INR 87,364; cumulative INR -28,849; peak deficit INR -35,491 (month 9). Monthly break-even: month 10. Cumulative break-even: not within 12 months; a rough extrapolation at month 12 profit and continued growth suggests beyond month 18 (rough guess, not modelled).

### 3.4 Low scenario

MAU: 150, 300, 450, 600, 800, 1,000, 1,250, 1,500, 1,800, 2,100, 2,300, 2,500.

| Month | MAU | Paying | Subscription | Affiliate | Revenue | Cost | Profit | Cumulative |
|---|---|---|---|---|---|---|---|---|
| 1 | 150 | 1 | 30 | 3 | 33 | 4,586 | -4,553 | -4,553 |
| 3 | 450 | 2 | 60 | 10 | 70 | 4,598 | -4,528 | -13,606 |
| 6 | 1,000 | 5 | 150 | 23 | 173 | 4,620 | -4,447 | -27,027 |
| 9 | 1,800 | 9 | 270 | 41 | 311 | 4,652 | -4,341 | -40,156 |
| 12 | 2,500 | 12 | 360 | 56 | 416 | 4,680 | -4,264 | -52,997 |

Totals: revenue INR 2,553; cost INR 55,550; cumulative INR -52,997. No break-even. Check: 55,550 - 2,553 = 52,997.

### 3.5 High scenario

MAU: 800, 2,500, 5,000, 9,000, 14,000, 21,000, 30,000, 42,000, 55,000, 70,000, 85,000, 100,000.

| Month | MAU | Paying | Subscription | Affiliate | Revenue | Cost | Profit | Cumulative |
|---|---|---|---|---|---|---|---|---|
| 1 | 800 | 20 | 720 | 1,080 | 1,800 | 4,612 | -2,812 | -2,812 |
| 3 | 5,000 | 125 | 4,500 | 6,750 | 11,250 | 4,780 | 6,470 | 4,585 |
| 6 | 21,000 | 525 | 18,900 | 28,350 | 47,250 | 13,860 | 33,390 | 63,205 |
| 9 | 55,000 | 1,375 | 49,500 | 74,250 | 123,750 | 15,220 | 108,530 | 304,815 |
| 12 | 100,000 | 2,500 | 90,000 | 135,000 | 225,000 | 17,020 | 207,980 | 829,305 |

Totals: revenue INR 977,157; cost INR 147,852; cumulative INR +829,305. Check: 977,157 - 147,852 = 829,305. Cumulative break-even month 3. Caveat: High affiliate is 60% of revenue and rests on the least evidenced inputs (clicks, basket). At 100,000 MAU, support, infrastructure, GST registration and affiliate fraud checks would add cost not modelled. Revenue stays below the INR 20 lakh GST threshold, but see the earlier model's inter-state caveat.

### 3.6 Summary

| | Low | Base | High |
|---|---|---|---|
| MAU at month 12 | 2,500 | 20,000 | 100,000 |
| Month 12 paying | 12 | 240 | 2,500 |
| Month 12 monthly revenue | 416 | 12,840 | 225,000 |
| 12-month cumulative | -52,997 | -28,849 | +829,305 |
| Monthly break-even | none | Month 10 | Month 2 |
| Cumulative break-even | none | not in 12 months | Month 3 |

### 3.7 Sensitivity of Base (one change at a time)

| Change | Monthly break-even | Month 12 cumulative |
|---|---|---|
| Base | Month 10 | -28,849 |
| MAU path at 50% | none | -54,560 |
| MAU path at 150% | Month 8 | -2,366 |
| Subscription conversion 1.2% to 0.6% | none | -48,577 |
| Subscription conversion 1.2% to 2.4% | Month 8 | +10,499 |
| Affiliate per MAU halved (0.105) | Month 11 | -38,414 |
| Affiliate per MAU zero | none | -47,980 |
| Affiliate per MAU doubled (0.42) | Month 9 | -9,718 |
| Net ARPU 36 to 30 | Month 11 | -35,413 |
| Agent and tooling cost doubled (F = 7,580) | Month 12 | -64,849 |
| No paid marketing (MAU path unchanged) | Month 8 | -1,849 |

Last row is flattering: it keeps the same MAU with no spend, so it shows what the marketing line costs, not a realistic path.

Most sensitive: (1) the MAU path, (2) subscription conversion, (3) affiliate per MAU, whose four factors multiply so a miss in any one is amplified; agent cost is next.

## 4. Cash ask from the owner (INR)

Phases 1 and 2 are costed with no revenue credit (conservative). Phase 3 is net of Base revenue. Each phase releases only if the previous gate is met.

### Phase 1: MVP build (before launch)

| Item | INR | Note |
|---|---|---|
| Domain, 1 year | 1,000 | Earlier model |
| Hosting, Open Food Facts, Cloudflare free tiers | 0 | Earlier model |
| Agent compute | 0 | Assumes the owner's existing subscription covers build (A21 of earlier model); add 3,000 per month if not |
| **Phase 1 total** | **1,000** | |

### Phase 2: Launch, months 1 to 3

| Item | INR |
|---|---|
| Sole proprietorship | 3,500 |
| Google Play developer account | 2,200 |
| Agent and tooling, 3 x 3,000 | 9,000 |
| CA and bookkeeping, 3 x 1,000 | 3,000 |
| Misc, 3 x 500 | 1,500 |
| LLM, 0.04 x 2,300 MAU-months | 92 |
| Subtotal | 19,292 |
| Contingency 10% | 1,929 |
| Total 21,221, rounded | **21,500** |

Base revenue in months 1 to 3 (INR 1,491) is not credited.

### Phase 3: Growth, months 4 to 9

| Item | INR |
|---|---|
| Gross cost months 4 to 9 (fixed 27,480 + marketing 18,000 + LLM and Workers 1,952) | 47,432 |
| Less Base revenue months 4 to 9 | -24,282 |
| Net operating deficit (matches model: -35,491 minus -12,341 = -23,150) | 23,150 |
| Contingency 10% of gross cost | 4,743 |
| Total 27,893, rounded | **28,000** |

Check on gross cost: 7,668 + 7,716 + 7,776 + 7,852 + 7,940 + 8,480 = 47,432.

### Total and hard cap

| Phase | INR |
|---|---|
| Phase 1 | 1,000 |
| Phase 2 | 21,500 |
| Phase 3 | 28,000 |
| **Total ask, Base case** | **50,500** |
| **Hard cap on cumulative owner cash** | **55,000** |

The cap is about 9% above the ask. Low case with no kill criteria would lose about INR 53,000 operating plus INR 5,700 one-time plus INR 1,000 domain, about INR 59,700; the gates below stop this earlier. Cash timing risk: Amazon pays about 60 days late with a INR 2,500 minimum (2.1), so cash revenue in Phase 3 will lag the accrual figures; the owner may need to float roughly 2 months of affiliate accrual (Base months 4 to 9 affiliate is INR 7,938 total) beyond the ask.

## 5. Kill criteria

Thresholds are assumptions set between Low and Base paths.

| Gate | When | Continue only if | Otherwise |
|---|---|---|---|
| Gate 0 | Before Phase 2 | MVP resolves 50 real Indian barcodes and shows protein per 100 kcal and per rupee correctly on 20 products | Fix before spending |
| Gate 1 | End of month 3 | MAU at least 800 (Low 450, Base 1,300); at least 8 affiliate-link clicks per 100 MAU per month at least (Base 30); at least 1 confirmed affiliate order or 5 paying users | Stop paid marketing; 3 more months at agent cost only, or shut down |
| Gate 2 | End of month 6 | MAU at least 2,500 (Low 1,000, Base 4,900); payer conversion at least 0.7% of MAU; monthly revenue at least INR 1,500 (Base 3,153); measured affiliate revenue at least INR 0.10 per MAU | Stop all spend except domain and hosting; keep site |
| Gate 3 | End of month 9 | MAU at least 6,000 (Base 11,500); monthly revenue at least INR 4,000 (Base 7,383); monthly loss under INR 3,500 | Shut down paid work; archive |
| Hard cap | Any time | Cumulative cash above INR 55,000 | Stop |
| Trip wires | Any time | Agent cost above INR 6,000 per month; LLM above INR 0.5 per MAU; any affiliate programme drops commission below 2% or bans the app's link placement | Re-plan or stop |

Rule: no Apple fee, no Play app build, no paid ads before Gate 2.

## 6. Comparison with the Jain-niche model

| Dimension | Jain model | Health and fitness model | Why |
|---|---|---|---|
| Audience | Narrow, a few hundred thousand diet followers (my judgement) | Much larger: gym-goers, macro counters, sugar avoiders | Base MAU at month 12 rises from 15,000 to 20,000 only, because I haircut for competition |
| Incumbents | Few, Jain-specific | Strong: calorie and fitness apps (HealthifyMe, Cult.fit, others, priced INR 1,859 to 4,000 or more per year, sources in 2.3), plus free barcode scanners. Incumbent barcode-app strength is my own knowledge and not sourced here | Higher acquisition cost, so marketing line rises from 2,000 to 3,000 in Base |
| Affiliate per MAU (Base) | INR 0.05 (0.05 clicks x 5% x INR 500 x 4%) | INR 0.21 (0.30 x 2% x INR 1,000 x 3.5%) | Higher purchase intent for protein and snacks, bigger baskets, more link surfaces. Commission band 3% to 5% is evidenced, the other three inputs are not |
| Ad revenue | INR 0.24 per MAU in Base | Zero | Removed by the owner's rule |
| Total revenue per MAU, Base | INR 0.83 with ads (0.59 without) | INR 0.642 | Affiliate more than replaces ads |
| Base month 12 revenue | INR 12,450 | INR 12,840 | Nearly equal, but now with no ads, so quality of revenue is better |
| Base break-even | Month 10 | Month 10 | Same |
| Base month 12 cumulative | -22,885 | -28,849 | Marketing is 1,000 per month higher from month 4, and ads are gone |
| Total ask | INR 46,000 | INR 50,500 (cap 55,000) | Phase 3 marketing and larger MAU |
| Upside | High: INR 428,465 | High: INR 829,305 | Much of it from affiliate, the least evidenced line |
| B2B | Not modelled | Not modelled | Brand-paid verified data is later and unsized; clearly labelled disclosure needed |

Net: the new niche has a larger ceiling and better revenue quality, but the Base case is no safer. Affiliate is now the swing factor and it rests on guesses.

## 7. Weak sources and open items

1. Amazon India Associates rates were not confirmed from affiliate.amazon.in. Check the Associates dashboard before building on Amazon.
2. HealthKart and MuscleBlaze rates come from aggregators and conflict (3% to 5.67%). Confirm in the Cuelinks or EarnKaro dashboard, and read each programme's rules on app and comparison-site traffic.
3. No source for average order value, affiliate click rate or health snack prices. A-A, A-D are pure assumptions.
4. HealthifyMe prices conflict across aggregators; Fittr prices not found.
5. Subscription conversion benchmark is secondary (RevenueCat via blogs).
6. First 3 months of real data should replace every assumption above.
