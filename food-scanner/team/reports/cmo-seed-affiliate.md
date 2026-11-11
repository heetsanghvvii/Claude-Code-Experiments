# CMO seed price list and affiliate rates (2026-11-11)

Status: BLOCKED. No page could be fetched, so nothing was collected. No numbers were estimated.

## Why
Every WebFetch call failed with a DNS error (ENOTFOUND), meaning the host is outside this session's allowed network domains. Hosts tried: affiliate-program.amazon.in, www.healthkart.com, pintola.in, www.myprotein.co.in. Following the tool's guidance, I stopped trying more sites. WebSearch works but returns only titles and snippets, which are not the brand product pages and cannot be cited for label values.

## Task A: seed rows by category

| Category | Count | Brands |
|---|---|---|
| protein-bars | 0 | none |
| protein-powders | 0 | none |
| nut-butters | 0 | none |
| muesli-oats | 0 | none |
| high-protein-snacks | 0 | none |
| Total | 0 | |

data/seed-mrp.json contains `[]` (parses with node). No brand product page was readable.

## Products skipped and why
All targeted products (RiteBite Max Protein, Yoga Bar, The Whole Truth, Phab, MuscleBlaze, SuperYou, Nakpro, AS-IT-IS, Optimum Nutrition India, Oziva, Plix, Pintola, MyFitness, Alpino, The Butternut Co, Kellogg's, True Elements, Bagrry's and snack brands) were skipped: the brand sites could not be fetched from this session. Not attempted individually beyond the hosts above.

## Task B: affiliate rates

| Programme | Official URL | Status |
|---|---|---|
| Amazon India Associates fee schedule | https://affiliate-program.amazon.in/welcome/compensation | not verified (host blocked) |
| HealthKart affiliate programme | https://www.healthkart.com/affiliate (URL guessed, unconfirmed) | not verified (host blocked) |
| Brand D2C programmes (up to 3) | n/a | not attempted |

Commission rate for health, nutrition, grocery: not verified. Cookie window: not verified. Payout threshold and timing: not verified. Eligibility: not verified.

Secondary sources (NOT official, unverified, no figures adopted): search results list shiprocket.in, cashify.in, cuelinks.com and fluxnote.io pages on Amazon India affiliate rates. Search snippets mixed seller referral fees with Associates rates, so no rate is recorded here.

## To unblock
Allow these hosts in the session network settings, then re-run: affiliate-program.amazon.in, www.healthkart.com, and the brand sites (e.g. pintola.in, www.myprotein.co.in, muscleblaze.com, thewholetruthfoods.com, yogabars.in, ritebite.in, oziva.in, plixlife.com, truelements.com).
