# LinkedIn post draft (not published)

Status: draft for Heet to review and post himself. Every number below is from the project files as of 2026-11-11. Update the numbers if the data changes before posting.

## Post

I gave a team of AI agents a food label scanner and asked them to turn it into a business. The building took a day. The product decisions were still mine.

The setup: one AI "CEO" reporting to me, with a CTO, CPO, CMO and CFO under it. Their first plan was a diet checker for the Jain community. The research was sound: a clear niche, no strong competitor.

I said no. I wanted to build for people who read labels for fitness. That one call threw away a finished deck and a financial model, and it was the right use of my time. The agents can research any direction well. They cannot choose which one I want to spend a year on.

Three decisions shaped what got built:

1. Narrow wedge. India already has apps that rate packaged food. So we lead with one number nobody ranks: protein per rupee, and protein per 100 kcal.

2. No verdicts. The app never calls a product healthy or unhealthy. You set your own targets, and it shows label facts against them. That is a product choice and a legal one.

3. Gates before money. The business case asks for Rs 50,500 in three stages, each with a stop rule. The base case reaches monthly profit in month 10 and does not pay back in year one. I would rather know that now.

What exists today: a working prototype that compares 657 Indian products across five categories using Open Food Facts data, with 33 automated tests. No users and no revenue yet.

What surprised me: the code was the easy part. Data was the hard part. Most brands publish their nutrition table as an image, not text. We ended up reading label images twice and keeping only the values where both reads agreed. That gave us price and nutrition for 170 products across three brands. It is a start, not coverage.

My takeaway for PMs working with AI agents: speed of building is no longer the constraint. Direction, constraints and data quality are. Those were always the job.

If you have built on Indian packaged food data, I would like to compare notes on sourcing.

## Notes for Heet

- Suggested first comment from you: one screenshot of the category comparison, with a line on how the ranking number is calculated.
- Attach: 2 or 3 screenshots from `food-scanner/team/demo/` (20-compare-real.png, 21-product-real.png). The app is not public, so there is no link to add.
- Claims to keep true: "a day" refers to the Phase 1 build on top of an existing prototype. If asked, say the prototype existed before.
- Do not add: user numbers, revenue, or any statement that a product is good or bad for health.
- The closing question is real: only keep it if you will reply to answers.
