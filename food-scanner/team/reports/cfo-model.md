# Food Label Checker: CFO Financial Model

Prepared 2026-11-11. All INR figures use an assumed FX rate of 1 USD = INR 88 (assumption; Apple's India price of INR 8,700 for a USD 99 fee implies about 87.9).

Conventions: "Verified" means a price or fact found on a cited page during research. "Assumption" means my estimate, labeled A1, A2 and so on. Where search results conflicted or I could not confirm a number on an official page, I say so. Nothing marked as an assumption should be read as a fact.

## 1. Cost stack

### 1.1 Hosting, backend, domain

| Item | Current price or limit | Status | Source |
|---|---|---|---|
| Cloudflare Pages (free) | 500 builds per month; static requests and bandwidth reported as unlimited | Verified (limits page); "unlimited" per secondary sources | https://developers.cloudflare.com/pages/platform/limits |
| Cloudflare Workers (free) | About 100,000 requests per day, 10 ms CPU per call | Secondary source, verify | https://developers.cloudflare.com/workers/platform/pricing/ |
| Cloudflare D1 (free) | 5 million rows read per day; third-party notes give 100,000 rows written per day and 5 GB storage (sources disagree) | Partly verified | https://developers.cloudflare.com/d1/platform/pricing/ |
| Workers Paid plan | USD 5 per month (about INR 440); D1 overage USD 0.001 per million rows read, USD 1.00 per million rows written, USD 0.75 per GB-month | Verified | https://developers.cloudflare.com/d1/platform/pricing/ |
| Supabase free | 500 MB database, 50,000 MAU, project auto-pauses after 7 days of inactivity, no backups; bandwidth figures conflict (5 or 10 GB) | Secondary sources | https://dev.to/mahdi_benrhouma_fe1c6005/supabase-free-tier-limits-in-2026-what-you-actually-get-and-when-you-will-hit-them-4mhe |
| Netlify free, GitHub Pages | Not researched successfully; no limits verified | Unverified | none |
| Domain, .com at Cloudflare Registrar | About USD 10.46 per year (about INR 920), same at renewal; one review says new registrations may be limited, check dashboard | Secondary source | https://www.whtop.com/plans/cloudflare.com/135912 |
| Domain, .in | Hostinger: INR 549 first year, INR 899 renewal. Other registrars vary; compare renewal, not first-year promo | Secondary source | https://cybernews.com/best-domain-registrars/best-india-domain-registrars/ |

Decision: host on Cloudflare Pages free, add Workers and D1 free only when needed. Cost today is INR 0 for hosting. Domain budget INR 1,000 per year (about INR 80 per month, assumption A1).

### 1.2 Stores and payments

| Item | Price | Status | Source |
|---|---|---|---|
| Google Play developer account | One-time USD 25 (about INR 2,200) | Verified | https://support.google.com/googleplay/android-developer/answer/112622 |
| Play service fee on subscriptions | 15% for auto-renewing subscriptions; some blogs cite 10% or 20% for other structures, which conflicts with Google's pages | Verified, with conflicts | https://support.google.com/googleplay/android-developer/answer/10632485 and https://splitmetrics.com/blog/google-play-apple-app-store-fees/ |
| Apple Developer Program | USD 99 per year; INR 8,700 shown on India App Store; Indian users report payment failures (UPI mandate, region errors) | Verified; payment friction is user-reported | https://developer.apple.com/support/enrollment and https://apps.apple.com/in/app/id640199958 |
| Razorpay | 2% platform fee plus 18% GST on the fee, so 2.36% all-in; no setup fee, no annual fee. One Razorpay post claims UPI MDR above INR 2,000 from 15 Oct 2026; another says UPI stays zero MDR. Irrelevant for INR 49 to 399 plans, flagged for B2B invoices | Verified (vendor marketing pages) | https://razorpay.com/blog/razorpay-payment-gateway-pricing-explained/ |
| RBI cap on auto-renewing subscriptions | Below INR 5,000 per charge on Play | Secondary source | https://www.revenuecat.com/blog/indias-new-subscription-rules |

Decision: skip Apple. A PWA covers iOS users. Revisit the INR 8,700 only if iOS is more than 25% of traffic (A2) and web conversion is proven.

### 1.3 Vision LLM per label extraction

Model chosen: Gemini 2.5 Flash-Lite. Published price USD 0.10 per million input tokens (text, image, video) and USD 0.40 per million output tokens. Sources: https://ai.google.dev/pricing and https://sdtimes.com/ai/gemini-2-5-pro-and-flash-are-generally-available-and-gemini-2-5-flash-lite-preview-is-announced/. One aggregator lists USD 0.125 and 0.50, which conflicts; I use the lower figure and show the higher below. Newer Flash-Lite generations may exist by now; check the live price page before building.

Arithmetic (token counts are assumptions A3):

| Step | Value |
|---|---|
| Input tokens per extraction (photo plus prompt) | 1,800 (A3) |
| Output tokens (structured ingredients and nutrition JSON) | 600 (A3) |
| Input cost | 1,800 x 0.10 / 1,000,000 = USD 0.00018 |
| Output cost | 600 x 0.40 / 1,000,000 = USD 0.00024 |
| Total | USD 0.00042 = about INR 0.037 per extraction |
| At the conflicting higher price | 1,800 x 0.125 / 1e6 + 600 x 0.50 / 1e6 = USD 0.000525 = INR 0.046 |
| Per 1,000 extractions | About INR 37 to 46 |

Conclusion: LLM cost is negligible per scan. The model uses INR 0.04 per MAU per month (assumes about 1 extraction per MAU per month, A4). Even a 10x error stays below INR 0.4 per MAU.

### 1.4 Company setup in India

| Structure | Typical setup cost quoted | Notes | Source |
|---|---|---|---|
| Sole proprietorship | INR 2,000 to 5,000 (one quote INR 2,499) | No statute registration needed; unlimited liability | https://qwikfilings.com/sole-proprietorship-registration/ |
| LLP | INR 5,999 to 12,999 | Limited liability | https://www.registerkaro.in/post/llp-vs-sole-proprietorship |
| Private limited | INR 14,999 to 30,000 (govt fee INR 5,500 plus INR 3,000 DSC at low capital) | Needed only for equity funding | https://www.registerkaro.in/types-of-companies |
| GST threshold | INR 20 lakh turnover for services (INR 10 lakh in special category states); inter-state supply may need registration from the first rupee, which matters for an online service | Secondary sources; confirm with a CA before launch | https://www.registerkaro.in/post/llp-vs-sole-proprietorship |

Decision: sole proprietorship, budget INR 3,500 (A5, midpoint of the quoted range). Convert to LLP or Pvt Ltd only when B2B contracts or investors require it. Even the High case below earns about INR 5.4 lakh in 12 months, under the INR 20 lakh threshold, but the inter-state point means a CA must confirm in advance whether GST registration is needed from day one. If it is, add compliance cost, not modeled here (risk).

### 1.5 Operating costs that are not price-listed

| Item | Monthly INR | Label |
|---|---|---|
| Domain | 80 | A1 |
| AI agent and tooling compute (the agents running the business) | 3,000 | Assumption A6; the largest cost line |
| CA, bookkeeping, filings | 1,000 | Assumption A7 |
| Misc (email, monitoring, OFF/API contingencies) | 500 | Assumption A8 |
| Fixed total F | 4,580 | Sum of the above |

Owner time is unpaid and not costed (assumption A9).

## 2. Revenue benchmarks

| Benchmark | Finding | Quality | Source |
|---|---|---|---|
| Freemium conversion, India | RevenueCat 2026 data as reported by secondary blogs: India and Southeast Asia 0.7% of installs become paying within 35 days, global median 2.0%, North America 2.8%; freemium median about 2.1%. Denominator is installs, not MAU. I could not tie the number to one primary page | Secondary, verify | https://revenuecat.com/blog/growth/app-trial-conversion-rate-insights/ and https://dev.to/paywallpro/global-subscription-app-conversion-benchmarks-3c75 |
| Trial-to-paid, India | About 15.2% (India and SE Asia), but card-gated trials are weak in India due to low credit-card use | Secondary | same as above |
| Utility app INR price points | No direct source found. Closest anchor: Google Play Pass at INR 99 per month or INR 889 per year (2022) | Weak | https://www.businesstoday.in/technology/story/google-play-pass-launched-in-india-at-rs-99-per-month-annual-plan-to-cost-rs-889-324162-2022-02-28 |
| Amazon India Associates, grocery | No confirmed current rate. A 2021 guide said 8% for grocery; 2026 guides show a base around 3.74% for several categories and 0.2% to 9% overall. Check the official affiliate.amazon.in schedule | Weak | https://amalinkspro.com/?p=17303 and https://www.cuelinks.com/blog/amazon-affiliate-commission-rates-guide/ |
| AdMob eCPM, India | Blended USD 0.50 to 2.00; banner about USD 0.08 to 0.10; interstitial USD 0.7 to 1.1; rewarded about USD 1.50; sources are old forum posts and blogs | Weak | https://froggyads.com/blog/google-admob-cpm, https://revenueflex.com/blog/app-monetization-emerging-markets-strategy/, https://community.kodular.io/t/admob-ecpm-getting-low-by-low-everyday-india-0-22/189851 |

Honest read: benchmark quality is low. The model therefore treats revenue per user as unproven and uses the kill criteria to test it fast.

## 3. Twelve-month model

Month 1 is the first month after public launch (Phase 2 start). Phase 1 (MVP build) happens before month 1.

### 3.1 Assumptions

| ID | Assumption (all are assumptions, not facts) | Low | Base | High |
|---|---|---|---|---|
| A10 | Monthly active users path (MAU), see 3.2 | 2,000 by M12 | 15,000 by M12 | 80,000 by M12 |
| A11 | Paying subscribers as % of MAU (the Base value sits above the 0.7% install benchmark because MAU excludes one-time visitors) | 0.5% | 1.5% | 3.0% |
| A12 | Price: INR 49 per month or INR 399 per year; blended gross about INR 40 per paying user per month | n/a | n/a | n/a |
| A13 | Net revenue per paying user per month after payment fees (blended 10% fee: web at 2.36%, Play at 15%) | INR 30 (heavier annual discounting) | INR 36 | INR 36 |
| A14 | Affiliate revenue per MAU per month. Derived: 0.05 link clicks per MAU x 5% purchase rate x INR 500 basket x 4% commission = INR 0.05 (Base). Commission rate 4% is an assumption | INR 0.02 | INR 0.05 | INR 0.15 |
| A15 | Ad revenue per MAU per month. Derived: INR 30 RPM x 8 page views per MAU / 1,000 = INR 0.24 (Base). INR 30 is about USD 0.34, inside the cited eCPM band | INR 0 (no ads) | INR 0.24 | INR 0.50 |
| A16 | Fixed cost F per month | 4,580 | 4,580 | 4,580 |
| A17 | Variable cost per MAU (LLM) | INR 0.04 | INR 0.04 | INR 0.04 |
| A18 | Paid marketing per month from month 4 | 0 | 2,000 | 5,000 |
| A19 | Workers Paid (INR 440 per month) when MAU exceeds 10,000 | applies | applies | applies |
| A20 | Subscribers are a stock: paying users = MAU x conversion in each month (ignores churn separately; churn is folded into the conversion rate) | | | |

Per-MAU monthly revenue: Low 0.005 x 30 + 0.02 + 0 = INR 0.17. Base 0.015 x 36 + 0.05 + 0.24 = INR 0.83. High 0.03 x 36 + 0.15 + 0.50 = INR 1.73.

Formulas: Revenue = MAU x (conversion x ARPU + affiliate + ads). Cost = F + 0.04 x MAU + marketing + Workers. Profit = Revenue minus Cost. All figures in INR, rounded to the nearest rupee. Platform fees are already inside net ARPU (A13).

### 3.2 Base scenario

| Month | MAU | Paying | Subscription | Affiliate | Ads | Revenue | Cost | Profit | Cumulative |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 200 | 3 | 108 | 10 | 48 | 166 | 4,588 | -4,422 | -4,422 |
| 2 | 500 | 8 | 270 | 25 | 120 | 415 | 4,600 | -4,185 | -8,607 |
| 3 | 900 | 14 | 486 | 45 | 216 | 747 | 4,616 | -3,869 | -12,476 |
| 4 | 1,500 | 22 | 810 | 75 | 360 | 1,245 | 6,640 | -5,395 | -17,871 |
| 5 | 2,300 | 34 | 1,242 | 115 | 552 | 1,909 | 6,672 | -4,763 | -22,634 |
| 6 | 3,300 | 50 | 1,782 | 165 | 792 | 2,739 | 6,712 | -3,973 | -26,607 |
| 7 | 4,500 | 68 | 2,430 | 225 | 1,080 | 3,735 | 6,760 | -3,025 | -29,632 |
| 8 | 6,000 | 90 | 3,240 | 300 | 1,440 | 4,980 | 6,820 | -1,840 | -31,472 |
| 9 | 7,800 | 117 | 4,212 | 390 | 1,872 | 6,474 | 6,892 | -418 | -31,890 |
| 10 | 10,000 | 150 | 5,400 | 500 | 2,400 | 8,300 | 6,980 | 1,320 | -30,570 |
| 11 | 12,500 | 188 | 6,750 | 625 | 3,000 | 10,375 | 7,520 | 2,855 | -27,715 |
| 12 | 15,000 | 225 | 8,100 | 750 | 3,600 | 12,450 | 7,620 | 4,830 | -22,885 |

Check of month 10: 10,000 x 0.83 = 8,300; cost = 4,580 + 400 + 2,000 = 6,980 (Workers applies only above 10,000 MAU, so not yet); profit 1,320. Month 11 cost = 4,580 + 500 + 2,000 + 440 = 7,520.

Base totals: 12-month revenue INR 53,535, cost INR 76,420, cumulative loss INR 22,885, peak cumulative deficit INR 31,890 (month 9). Monthly break-even: month 10. Cumulative break-even: not within 12 months (extrapolating month 12 profit of 4,830 and growth, roughly month 16 to 18, rough guess).

### 3.3 Low scenario

MAU: 100, 200, 350, 500, 700, 900, 1,100, 1,300, 1,500, 1,700, 1,900, 2,000.

| Month | MAU | Paying | Revenue | Cost | Profit | Cumulative |
|---|---|---|---|---|---|---|
| 1 | 100 | 0 | 17 | 4,584 | -4,567 | -4,567 |
| 3 | 350 | 2 | 60 | 4,594 | -4,534 | -13,656 |
| 6 | 900 | 4 | 153 | 4,616 | -4,463 | -27,122 |
| 9 | 1,500 | 8 | 255 | 4,640 | -4,385 | -40,356 |
| 12 | 2,000 | 10 | 340 | 4,660 | -4,320 | -53,368 |

Low totals: revenue INR 2,082, cost INR 55,450, loss INR 53,368. No break-even. The kill criteria (section 5) cut this loss off at month 6 (about INR 27,000 operating loss) or earlier.

### 3.4 High scenario

MAU: 500, 1,500, 3,000, 5,500, 9,000, 14,000, 20,000, 28,000, 38,000, 50,000, 65,000, 80,000.

| Month | MAU | Paying | Revenue | Cost | Profit | Cumulative |
|---|---|---|---|---|---|---|
| 1 | 500 | 15 | 865 | 4,600 | -3,735 | -3,735 |
| 2 | 1,500 | 45 | 2,595 | 4,640 | -2,045 | -5,780 |
| 3 | 3,000 | 90 | 5,190 | 4,700 | 490 | -5,290 |
| 4 | 5,500 | 165 | 9,515 | 9,800 | -285 | -5,575 |
| 5 | 9,000 | 270 | 15,570 | 9,940 | 5,630 | 55 |
| 6 | 14,000 | 420 | 24,220 | 10,580 | 13,640 | 13,695 |
| 9 | 38,000 | 1,140 | 65,740 | 11,540 | 54,200 | 128,975 |
| 12 | 80,000 | 2,400 | 138,400 | 13,220 | 125,180 | 428,465 |

High totals: revenue INR 544,085, cost INR 115,620, cumulative profit INR 428,465. First profitable month 3, but month 4 dips negative when paid marketing starts; sustained profit from month 5; cumulative break-even month 5. Caveat: support, infrastructure (Supabase Pro or D1 overage) and GST compliance would add cost at 80,000 MAU; not modeled.

### 3.5 Scenario summary

| | Low | Base | High |
|---|---|---|---|
| MAU at M12 | 2,000 | 15,000 | 80,000 |
| M12 paying users | 10 | 225 | 2,400 |
| M12 monthly revenue | 340 | 12,450 | 138,400 |
| 12-month profit | -53,368 | -22,885 | +428,465 |
| First monthly break-even | none | Month 10 | Month 3 (sustained from 5) |
| Cumulative break-even | none | not in 12 months | Month 5 |

### 3.6 Sensitivity of the Base break-even

Each row changes one assumption and holds the rest at Base.

| Change | Result |
|---|---|
| Paid conversion 1.5% to 0.75% | Per-MAU revenue 0.56; monthly break-even slips to month 12 |
| Paid conversion 1.5% to 0.5% | Per-MAU revenue 0.47; no monthly break-even in 12 months |
| MAU path at 50% of Base | M12 revenue 6,225 vs cost 6,880; no break-even in 12 months |
| Agent and tooling cost doubled (A6 from 3,000 to 6,000) | Break-even month 12 |
| Ads earn INR 0 (A15) | Per-MAU revenue 0.59; break-even month 12 |

## 4. Cash needed from the owner (INR)

Revenue is ignored in Phases 1 and 2 (conservative), and credited in Phase 3 (net of revenue). Each phase releases only if the previous phase's gate is met (section 5). Apple's INR 8,700 is excluded; see 1.2.

### Phase 1: MVP (before launch)

| Item | INR | What it buys |
|---|---|---|
| Domain, 1 year (.com about INR 920, rounded) | 1,000 | The product's web address and email-sender identity |
| Hosting, Open Food Facts API, Nutri-Score, Jain screening, Cloudflare free tiers | 0 | Static site and edge functions at zero cost |
| Agent compute | 0 | Assumes the owner's existing AI subscription covers build work (A21); if not, add INR 3,000 per month |
| **Phase 1 total** | **1,000** | |

### Phase 2: Launch (months 1 to 3)

| Item | INR | What it buys |
|---|---|---|
| Sole proprietorship registration (A5) | 3,500 | Legal entity for Razorpay, Play and invoicing |
| Google Play developer account | 2,200 | One-time USD 25 to list the app or TWA |
| Agent and tooling, 3 months x 3,000 | 9,000 | The agents that run support, content and fixes |
| CA and bookkeeping, 3 x 1,000 | 3,000 | Filings, GST advice, books |
| Misc, 3 x 500 | 1,500 | Email, monitoring, small tools |
| LLM extraction, 3 months (0.04 x 1,600 MAU-months) | 64 | About 1,700 label photo extractions |
| Contingency, 10% (about) | 1,950 | Buffer for fee or price errors |
| **Phase 2 total (rounded)** | **21,500** | 3,500 + 2,200 + 9,000 + 3,000 + 1,500 + 64 + 1,950 = 21,214, rounded up. The model's domain line (3 x 80) is covered by the Phase 1 prepayment |

### Phase 3: Growth (months 4 to 9, the base-case trough)

| Item | INR | What it buys |
|---|---|---|
| Fixed costs, 6 x 4,580 | 27,480 | Same stack as above |
| Paid marketing, 6 x 2,000 | 12,000 | Search and social tests, about 2% of MAU growth (A18) |
| LLM variable, 0.04 x 25,400 MAU-months | 1,016 | About 25,000 extractions |
| Less base-case revenue months 4 to 9 | -21,082 | Subscriptions, affiliate, ads |
| Net operating deficit | 19,414 | Matches the model: -31,890 minus -12,476 |
| Contingency (about 10% of gross cost, 4,050; rounded) | 4,086 | Buffer for slower revenue |
| **Phase 3 total (rounded)** | **23,500** | |

### Total ask

| Phase | INR |
|---|---|
| Phase 1 | 1,000 |
| Phase 2 | 21,500 |
| Phase 3 | 23,500 |
| **Total, Base case** | **46,000** |

Worst-case exposure if no kill criterion were enforced is the Low case: INR 53,368 operating loss plus INR 5,700 one-time costs (registration and Play) plus INR 1,000 domain, about INR 60,000. The kill criteria stop spending well before that.

## 5. Kill criteria

All thresholds are my assumptions, set between the Low and Base paths so the owner can tell them apart early.

| Gate | Date | Continue only if | Otherwise |
|---|---|---|---|
| Gate 0: pre-spend | Before Phase 2 | MVP works on 50 real barcodes and 20 Indian products screened correctly by the owner | Fix before paying for registration or Play |
| Gate 1 | End of month 3 | MAU at least 600 (Low path is 350, Base 900) and at least 5 paying users | Stop paid marketing; run 3 more months at agent cost only, or shut down |
| Gate 2 | End of month 6 | MAU at least 1,800 (Low 900, Base 3,300), paid conversion at least 0.75% of MAU, monthly revenue at least INR 1,500 | Stop all spend except domain and hosting; keep the site as a free asset |
| Gate 3 | End of month 9 | MAU at least 4,000 and monthly revenue at least INR 3,500 (Base is 7,800 and 6,474) | Shut down paid work; archive |
| Hard cap | Any time | Cumulative owner cash above INR 50,000 (about 10% above the Base ask) | Stop |
| Unit-economics trip wires | Any time | LLM cost above INR 0.5 per MAU; payment fee above 15% blended; agent cost above INR 6,000 per month | Fix or stop; any one would push Base break-even to month 12 or later |
| Platform risk | Any time | Open Food Facts access lost or key data licensing changed | Pause; re-plan |

Rule: do not buy Apple (INR 8,700), a Play app build, or paid ads until Gate 2 is passed.

## 6. Open items

1. Verify the live Flash-Lite price and check whether a newer cheap vision model exists (https://ai.google.dev/pricing).
2. Get the official Amazon India grocery commission from the Associates schedule.
3. Ask a CA about GST on inter-state online services before launch.
4. Confirm Netlify and GitHub Pages limits only if Cloudflare Pages becomes unsuitable.
5. Replace every assumption with measured data from the first 3 months.
