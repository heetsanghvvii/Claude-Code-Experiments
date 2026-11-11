# Affiliate programmes at source (2026-11-11)

Replaces the earlier "blocked" version. Seed price list status is in `team/reports/data-seed.md`: 179 rows (protein-bars 27, protein-powders 42, nut-butters 75, muesli-oats 33, high-protein-snacks 2), 65 usable for protein per Rs 100.

## Amazon India Associates: verified

Sources (fetched directly, 2026-11-11):
- Fee schedule: https://affiliate-program.amazon.in/help/node/topic/GRXPHT8U84RAYDXZ ("Associates Program Advertising Fee Schedule", Table 1 titled "Advertising Rates (Oct-Nov 2026)")
- Operating Agreement: https://affiliate-program.amazon.in/help/operating/agreement

Stated commission rates (fixed rate on Qualifying Revenues, shipped items):

| Category as listed by Amazon | Rate |
|---|---|
| Sports & Fitness | 4.72% |
| Health, Household & Personal Care (listed together with Furniture, Kitchen & Dining, Pet Supplies) | 4% |
| Amazon Fresh and Grocery | 2.50% |
| All Other Categories | 5% |
| Beauty and Luxury Beauty (for reference) | 8% |

The schedule has no separate "nutrition" or "protein supplements" line. Which of Sports & Fitness, Health & Personal Care, Grocery or All Other applies to a given protein bar or powder is not stated on the page: not verified. Table 1 is dated Oct-Nov 2026 and Amazon states it can change.

- Cookie window: the Operating Agreement defines a Session that starts at the click and ends at the first of 24 hours, the customer placing an order, or a click through another associate's link. Purchases after the session ends are not Qualifying Purchases (items added to cart in the session but ordered later are treated per the agreement text).
- Payout timing: fees are paid monthly for items shipped in the month, "approximately 60 days following the end of each calendar month".
- Payout threshold: Amazon "may accrue and withhold advertising fees until the total amount due to you is at least INR1000 in case of NEFT transfers". Other payment methods' thresholds are not stated on this page: not verified.
- Eligibility: applicants apply, and Amazon "will evaluate your application and notify you of its acceptance or rejection"; Special Links may be shown only after acceptance. Mobile apps must be named in the application. Purchases by the associate or on their behalf do not earn fees. The agreement page states no numeric eligibility rule (for example a minimum number of qualifying sales): not verified.
- Excluded from fees: flight bookings and gift cards, video gaming consoles and hardware, Prime membership, Kindle eBooks, gold and silver coins. Bounty events (e.g. Prime sign-up INR 100) are listed separately.

## HealthKart: not verified

https://www.healthkart.com/robots.txt returned HTTP 403 with a Cloudflare "Just a moment" bot challenge, so no HealthKart page (including any affiliate page) could be read. I did not try to get around it. Commission rates, cookie window, payout and eligibility: not verified. HealthKart also owns MuscleBlaze, whose own site has the same challenge.

## Brand programme pages

| Brand site | What I tried | Result |
|---|---|---|
| pintola.in | Homepage footer and navigation links (/pages/ list: about-us, contact, faq, refund, shipping-policy, why-pintola) | No affiliate, creator or partner page found: not verified |
| thewholetruthfoods.com | Homepage links; https://thewholetruthfoods.com/affiliate | No affiliate page (that path is the site's 404 page): not verified |
| www.yogabars.in | Homepage links (/pages/ list: blogs, career, factory-finder, privacy-policy, returns, shipping, terms); /pages/affiliate and /pages/affiliate-program | Both 404, nothing linked: not verified |
| www.muscleblaze.com | /robots.txt | Cloudflare challenge (HTTP 403): not verified |

"No programme found" only means none was linked or at the paths tried; a brand may run a programme on a page or platform I did not reach. No commission, cookie, payout or eligibility values are stated for any brand.

## Takeaway for the app

Only the Amazon India terms are verified. The scoring app has no verified rate for protein supplements specifically, so any revenue model should assume a range of 2.50% to 5% depending on how Amazon categorises each item, with a 24-hour attribution window and roughly 60-day payout lag, until the exact category is confirmed per product.
