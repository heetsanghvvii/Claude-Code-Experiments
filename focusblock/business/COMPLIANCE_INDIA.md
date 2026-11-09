# nope: India launch compliance checklist (research notes, not legal advice)

Date: 2026-11-08. Product: passive NFC puck + Android app, Rs 1,999, first 50 sales via own site and manual UPI, then Meta ads. Founder: one salaried person in Mumbai.

**Method note.** WebSearch worked but returned only summaries and mostly secondary sites. Direct page fetch of support.google.com failed (host not reachable from this sandbox), and I did not open any official page. So NO item below is VERIFIED. Tags used: LIKELY (consistent across my knowledge and search snippets), UNVERIFIED (check before use). "Ask" = CA, lawyer, or none. Rules change; every item needs a quick check by the named professional.

## 1. GST
- Threshold for a goods-only seller in Maharashtra is Rs 40 lakh aggregate all-India turnover (Rs 20 lakh if services are included). LIKELY (secondary sources only). Ask: CA.
- Selling through a marketplace (Amazon, Flipkart etc.) forces registration at any turnover. Own website is not a marketplace operator, so the threshold should apply. Search found no source that settles "own website" directly. LIKELY. Ask: CA.
- Interstate sales of goods by an unregistered small seller are generally allowed below the threshold (a notification exempts them). LIKELY. Ask: CA.
- Salary is not GST turnover; only the nope sales count. LIKELY. Ask: CA.
- Likely HSN: 8523 (smart card / media family) or 3926 (plastic articles); rate probably 18 percent. UNVERIFIED, classification is a judgement call. Ask: CA.
- If unregistered: you cannot charge or show GST. Issue a plain numbered invoice or receipt, no GST line. If registered: tax invoice with GSTIN, HSN, tax split. LIKELY. Ask: CA.
- MRP is the maximum retail price inclusive of all taxes. Show Rs 1,999 as an all-inclusive price; if registered, tax comes out of that figure. LIKELY. Ask: CA.
- To do: decide expected 12 month turnover; keep a sales ledger from sale one; register voluntarily only if a CA says it helps (it lets you claim input tax credit but adds filings).

## 2. Business structure for the first 50 sales
| Option | Pros | Cons | Cost / time (relative) |
|---|---|---|---|
| Sole proprietorship | No incorporation, start now, simplest tax | Unlimited personal liability, weaker credibility, bank may ask for proof of business | Lowest, days |
| LLP | Limited liability, low compliance | Annual filings, IP and bank setup, partner needed (2) | Medium, weeks. UNVERIFIED |
| Private limited | Strongest for investors and IP, limited liability | Most compliance and audit, 2 directors | Highest, weeks. UNVERIFIED |

- Suggested: sole proprietorship for the first 50 units, move to a company before outside money or large volume. LIKELY. Ask: CA.
- Udyam registration is free and optional; useful for MSME benefits and some payment or bank onboarding. LIKELY (fee: unverified). Ask: CA.
- Maharashtra Shops and Establishments registration or intimation may apply to a commercial establishment even from home; applicability for a home based online seller is unclear. UNVERIFIED. Ask: CA.
- Bank: open a separate current or business savings account in the proprietorship name. LIKELY. Ask: CA.
- Salaried and a director or partner elsewhere: check the employment contract first (section 12).

## 3. Legal Metrology (Packaged Commodities) Rules: box declarations
All LIKELY. Ask: lawyer (or a Legal Metrology consultant).
- Name and address of the manufacturer, packer, or importer.
- Common or generic name of the commodity (for example "NFC tag holder").
- Net quantity (for example "1 Unit").
- Month and year of manufacture or packing (or import).
- MRP "Rs 1,999 inclusive of all taxes".
- Consumer care details: name, address, phone, email.
- Country of origin; if imported, importer details and import month and year.
- Marketplace and e-commerce rules also want these shown on the product page. LIKELY.
- Whether you must register with Legal Metrology as packer or importer, and any small pack exemptions: UNVERIFIED.
- To do: print the declarations on the box or a sticker; keep a sample photo on file.

## 4. Consumer Protection (E-Commerce) Rules 2020
All LIKELY unless stated. Ask: lawyer.
- Your own site that sells your own goods is an e-commerce entity covered by the Rules (inventory model).
- Show: legal name, geographic address, email and phone, website; grievance officer name and contact; total price with every charge (price breakup); delivery, return, refund, exchange and warranty terms; payment methods; country of origin.
- Grievance officer acknowledges within 48 hours and resolves within one month (LIKELY).
- No unjustified cancellation charges; refund within the period you state.
- CCPA guidelines on dark patterns (2023) ban false urgency, hidden charges, drip pricing, forced actions. LIKELY. A 2025 self audit push on dark patterns exists; UNVERIFIED.
- Any recent amendment to the E-Commerce Rules: could not confirm. UNVERIFIED.
- To do: Terms, Refund and Returns, Shipping, Contact and Grievance pages before sale one.

## 5. Product regulation
- BIS (Compulsory Registration Scheme covers listed product types): a passive NFC sticker in a plastic puck is probably not listed. UNVERIFIED. Ask: lawyer or test lab.
- WPC ETA (equipment that radiates): passive tags have no transmitter; the phone does the reading. Probably no ETA for the tag. UNVERIFIED. Ask: lawyer.
- E-waste rules: probably not applicable to a passive tag; UNVERIFIED.
- Small part and adhesive: add "not for children under 3" and a skin warning. LIKELY. Ask: none.
- Ask the tag supplier for a written spec (frequency 13.56 MHz, passive, no battery) and keep it.

## 6. Data (DPDP Act 2023)
- DPDP Rules were notified 13 or 14 Nov 2025 with phased start; most obligations (notice, consent, security, breach, rights) reportedly start about 18 months later, around May 2027. Board provisions apply early. Current IT Act SPDI Rules 2011 stay till then. LIKELY (secondary sources). Ask: lawyer.
- Practical: still collect only name and phone, with clear consent, a purpose, a deletion option, and secure storage. LIKELY.
- WhatsApp: get opt-in before marketing messages, honour stop requests, follow Meta/WhatsApp Business policy. LIKELY.
- Minimal privacy notice text: "We collect your name and phone number to [take your order / tell you when nope launches]. We keep it until [date] or until you ask us to delete it. We do not sell it. To withdraw consent, access or delete, email [email]. Grievances: [name, email]." Add a consent tick box, not pre-ticked.
- Do not collect phone usage data you do not need; if the app reads app usage, say so in the policy.

## 7. Advertising (ASCI)
- ASCI Code: ads must be honest, not misleading, not harmful, fair. Claims need substantiation. LIKELY. Ask: none or lawyer.
- Avoid: curing or treating addiction, anxiety, depression, ADHD, sleep disorders; "clinically proven", "guaranteed results", fake scarcity; invented testimonials. Drugs and Magic Remedies Act and consumer law add risk for health claims. LIKELY.
- Safer: "a physical friction tool to help you pause before opening apps". Describe, do not promise outcomes.
- ASCI influencer guidelines: disclose material connection (free product, payment) with labels like #ad or "paid partnership", visible upfront, not buried in hashtags. LIKELY. Meta's partnership label also required. Ask: none.
- To do: keep a claim file with evidence; get influencers to sign a one page brief.

## 8. Trademark
- Search: IP India public search (tmrsearch.ipindia.gov.in or ipindia.gov.in). Search "nope", phonetic variants ("noep", "nop", "nope"), in Class 9 (hardware, downloadable apps), Class 42 (non-downloadable software or SaaS), Class 35 (online retail, only if you retail others' goods; probably skip). LIKELY (portal URL unopened). Ask: lawyer.
- Filing basics: Form TM-A, proposed-to-be-used basis OK, one application per class, use TM not (R) until registered, 10 year term. LIKELY.
- Fees: online per class roughly Rs 4,500 for individuals, startups and small enterprises and Rs 9,000 for others. UNVERIFIED. Attorney fees extra.
- Timeline to registration: usually long (a year or more). UNVERIFIED.
- "nope" is a common English word: weak as a mark for a product about saying no to apps (suggestive at best), crowded register likely, hard to enforce. Mitigations: a distinctive modifier ("nope puck", "NopeBlock"), a stylised logo or device mark, or a coined name. Disclaimer of the word alone may be required. LIKELY.
- Also check the domain and Play Store name.

## 9. Google Play
- Account types: Personal or Organization. Fee: one time registration (US$25). LIKELY.
- Identity verification: government ID, address, phone; Organization needs D-U-N-S, which can take weeks. LIKELY.
- Closed testing rule: new personal accounts (created after 13 Nov 2023) must run a closed test with at least 12 testers opted in for 14 continuous days before applying for production. Earlier figure was 20. Organization accounts exempt. Seen in a search snippet of Google's help page but I could not open it. LIKELY. Verify at support.google.com/googleplay/android-developer/answer/14151465.
- Accessibility service: must be declared; Play limits the API to features that really need it, requires a prominent in-app disclosure, user consent, a declaration form, and a stated core functionality. A blocking app is a risk area. LIKELY. Ask: lawyer or none. Prefer less sensitive APIs (usage access, overlay) where possible.
- Android 13+ "restricted settings": sideloaded APKs (not installed via Play) have accessibility toggles greyed out until the user allows restricted settings in App Info. Plan instructions for early testers. LIKELY.
- Watch: Google announced developer verification for sideloaded apps rolling out from 2026. UNVERIFIED.

## 10. Apple
- Apple Developer Program: US$99 a year (local pricing may differ). LIKELY.
- Family Controls entitlement: request through Apple's form for each app ID, then separately for distribution; Apple reviews the use case. Timeline: days to weeks or longer. UNVERIFIED. Ask: none.
- No iOS in the first 50 is fine.

## 11. Payments
- A personal UPI ID for business: UPI personal accounts are meant for personal use; banks can flag many unrelated incoming payments, freeze, or ask for KYC. The income remains taxable and GST rules still apply. A seller may collect own sales, but a third party collecting for others needs RBI authorisation (payment aggregator rules). LIKELY. Ask: CA.
- Lightest compliant options: (a) bank issued business UPI QR or VPA on a current account, (b) payment link from a gateway (Razorpay, Cashfree, PhonePe PG or similar), (c) full checkout on gateway. Nodal flow is for aggregators, not for you.
- Fees: typically around 2 percent per transaction; UPI often much lower or zero. UNVERIFIED. Check current gateway pricing.
- For 50 units: gateway payment links with a fixed amount are cleanest, give receipts, and make refunds traceable.
- Keep every payment reference matched to an order and invoice.

## 12. Employment (read before starting)
Checklist for the contract and handbook (Ask: lawyer):
- Moonlighting or outside business clause, and whether prior consent is needed.
- IP assignment: does the employer claim inventions or code made on own time or related to its business?
- Conflict of interest: is nope in the employer's field or among its customers or vendors?
- Use of employer devices, time, accounts, confidential info.
- Notice or disclosure requirements; non-compete and non-solicit.
- Policy on directorships or holding a company.
- Template email: "Hi [HR/Name], I am planning a small personal project outside work hours that sells a consumer hardware and app product unrelated to our company's business. I will use no company time, devices or confidential information. Could you confirm whether my contract or policies require approval or disclosure, and whether anything in my IP or conflict of interest clauses would apply? Happy to share more detail. Thanks, [name]." Ask a lawyer first if relations are sensitive; HR emails create a record.

## 13. Insurance and product liability
- Consumer Protection Act 2019 has product liability for manufacturers, sellers and service providers. LIKELY.
- A small passive puck is low risk (choking, adhesive, allergic reaction, claims). Consider product liability or commercial general liability and cyber cover once volume rises; premiums UNVERIFIED. Ask: CA or an insurance broker.
- Reduce risk: warnings, supplier specs, batch records, clear refund policy.

## 14. Action lists
### This week, under Rs 5,000
- Decide proprietorship; open a separate bank account (usually Rs 0 to a few hundred). UNVERIFIED cost.
- Free Udyam registration (optional). 
- Search IP India for "nope" and variants; write down results; do not file yet.
- Draft site pages: Terms, Returns/Refunds, Shipping, Privacy notice, Contact and grievance officer.
- Design the box label with Legal Metrology items; print stickers.
- Create a claims file; avoid health claims.
- Send HR email or read contract.
- Set up payment link account.
- Pay for a short CA call (fee: unverified).
- Recruit 12+ closed testers now for Play (they must stay 14 days).

### Before scaling past 100 orders
- Move to a company or LLP if raising money or turnover nears the GST threshold.
- Register for GST if a CA advises or before the threshold.
- File the trademark (Classes 9, 42, maybe 35).
- Full payment gateway checkout, proper invoicing.
- Privacy policy aligned with DPDP Rules, ahead of May 2027.
- Product liability insurance quote.
- Written influencer agreements and ASCI check on ads.
- Confirm BIS and WPC position in writing.
- Confirm Legal Metrology registration status.

## Open questions
| For | Exact wording |
|---|---|
| CA | If I sell only goods from my own website, interstate, below Rs 40 lakh turnover, as an individual with a salary, am I required to register under GST? |
| CA | What HSN code and GST rate apply to a plastic enclosure with an embedded passive NFC sticker sold with an app? |
| CA | If I am unregistered, what must my invoice contain and can I show MRP as inclusive of taxes? |
| CA | Is receiving customer payments into my personal UPI ID acceptable for a proprietorship, and how should I report it for income tax? |
| CA | Do I need Shops and Establishments registration or intimation in Maharashtra for a home based online seller? |
| CA | At what point should I move from proprietorship to LLP or private limited, and what does each cost to set up and maintain? |
| Lawyer | Which Legal Metrology (Packaged Commodities) declarations are mandatory on my box, and do I need to register as a packer or importer? |
| Lawyer | Does a passive NFC tag product need BIS, WPC ETA, or e-waste registration? |
| Lawyer | Which obligations in the Consumer Protection (E-Commerce) Rules apply to my own website, and has any amendment changed them? |
| Lawyer | Is "nope" registrable in Classes 9 and 42, and which modifier would improve registrability? |
| Lawyer | Under my employment contract, do I need consent to run this business, and who owns IP created on my own time? |
| Lawyer | Which DPDP obligations apply to my waitlist now, and which start in 2027? |
