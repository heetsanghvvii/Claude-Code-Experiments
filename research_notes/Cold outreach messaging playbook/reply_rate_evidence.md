# Quantitative Evidence on What Drives Replies to Cold Outreach (Email and LinkedIn)

> **Method note for the report writer.** The network proxy blocked full-page fetches from almost every vendor domain (backlinko.com, lemlist.com, hunter.io, lavender.ai, woodpecker.co, gong.io, pitchhired.com). Most figures below therefore come from search-engine summaries of those pages, not from reading the primary page. Each figure is attributed to the URL the summary pointed to. Treat exact decimals as "reported by", not as verified. Where a number is passed through an aggregator (prospeo.io, salesso, shno.co and similar) and not the original publisher, I say so.
>
> **Source-quality key:** [ACAD] peer-reviewed or academic field experiment; [PLATFORM] the platform owner's own data (e.g. LinkedIn on InMail); [VENDOR] a sales-tool vendor publishing its own customer data. Vendors have a commercial interest in "cold email works if you use our features" and rarely publish methods, confidence intervals or controls, so these numbers are **potentially biased** and observational. [AGG] a secondary aggregator re-citing others.
>
> **Applies to job seekers?** Each section separates sales findings from networking findings. Almost all large-sample data is **sales/B2B outreach**. Networking-specific hard data is thin. The academic help-seeking literature (Flynn & Lake, Bohns, Milkman et al.) is the closest high-quality proxy for job-seeker asks.

---

## 1. Baseline reply rates and message length (words/characters), email vs LinkedIn

### Takeaway
Across sales datasets the consistent signal is that short wins: about 50-125 words for email, with replies falling past about 100 words to executives. On LinkedIn InMail, under 400 characters beats average and over 800 characters underperforms. Baseline cold-email reply rates in 2025-26 sales data are low, about 3-5% on average.

### Cited Findings
**Baselines (sales)**
- [VENDOR, 2026] Instantly's 2026 Cold Email Benchmark Report (said to cover "billions" of interactions, Jan-Dec 2025): average reply rate 3.43%, top quartile 5.5%+, top 10% at 10.7%+. Recommends emails under 80 words and 4-7 step sequences. — [Instantly via search summary](https://instantly.ai/blog/email-sequence-benchmarks-2026-whats-a-good-open-rate-reply-rate-and-cost-per-meeting/?lng=en)
- [AGG, 2026] Reported decline in platform-wide reply rates from 5.1% (2024) to about 3.43% (2026). Generic sends get 1-3%; well-targeted campaigns 10-18%. — [prospeo.io](https://prospeo.io/s/cold-email-personalization)
- [VENDOR, 2019, older] Backlinko + Pitchbox, 12 million outreach emails (mostly SEO/PR link outreach, not sales or job seeking): only 8.5% received any response. — [Backlinko](https://backlinko.com/email-outreach-study)
- [VENDOR, 2024 data] Belkins, 16.5M cold emails across 93 business domains (Jan-Dec 2024): reply rate peaked at 8.4% for one-email sequences. — [Belkins](https://belkins.io/blog/sales-follow-up-statistics?frame=0)
- [VENDOR, Feb 2026] Lavender cold email benchmark (231,818 cold emails): engineering/product recipients replied at 5.2%, HR recipients at 3.4%. — [Lavender](https://www.lavender.ai/blog/the-cold-email-benchmark-report)

**Length, email**
- [VENDOR, Gong Labs, date unclear, likely 2021-23] Reply rates drop sharply past 100 words. Best-performing emails are 50-100 words. C-level executives are 30.2% less likely to reply to cold email than non-executives. VPs reply at 11.3% vs CEOs at 7.63% (the VP/CEO figure may come from secondary "broader executive data", not Gong itself). — [Gong](https://www.gong.io/blog/do-execs-really-reply-to-cold-email-here-s-what-the-data-says)
- [VENDOR, 2016, older; NOT cold outreach] Boomerang, about 40M emails from its users (mostly ordinary correspondence, not cold): 75-100 words had the highest response rate (51%). 50 and 125 words were only slightly lower (about 50%), so the curve is flat across 50-125. — [Boomerang via Drip/Instantly summaries](https://www.drip.com/blog/ideal-email-length); [Instantly](https://instantly.ai/blog/how-long-should-an-email-be/)
- [VENDOR] Hunter.io published a cold-email word-count analysis. Could not retrieve the bucket figures (fetch blocked). — [Hunter](https://hunter.io/blog/cold-email-word-count)

**Length, LinkedIn**
- [PLATFORM, LinkedIn Talent Solutions, recruiter InMail, original analysis about 2016-2019, older] InMails under 400 characters got 22% higher response rates than the average InMail. Over 800 characters were below average. Only about 10% of InMails are under 400 characters. — [LinkedIn Talent Blog](https://www.linkedin.com/business/talent/blog/product-tips/tips-for-writing-inmails-from-linkedin-recruiters); restated by [linkedinsider](https://linkedinsider.blog/linkedin-inmail-response-rate)
- [AGG, unverified] "Messages over 1,200 characters perform 11% below average. Messages of 25-50 words get 65% more replies." The original source is not identified. — [linkedinsider / salesso summaries](https://salesso.com/blog/linkedin-inmail-statistics/)

**Subject lines**
- [VENDOR, 2019] Backlinko: subject lines of 36-50 characters had the best response (22.3%). Long subject lines got 24.6% more responses than short ones. Note: this conflicts with Gong, where 1-4 word subject lines had the best open rates. — [Backlinko](https://backlinko.com/email-outreach-study); [Gong](https://www.gong.io/blog/do-execs-really-reply-to-cold-email-here-s-what-the-data-says)

### Inferences
- The email sweet spot converges at about 50-100 words, and under 80 words for sales sequences (Instantly, Gong, Boomerang). A LinkedIn message under 400 characters is roughly 60-75 words, so the LinkedIn guidance is consistent with, and slightly tighter than, the email guidance.
- The Backlinko 8.5% and Belkins 8.4% baselines are higher than Instantly's 3.43%. This is likely due to different populations (link-building outreach, agency-run campaigns) and to the reported decline over time. Do not compare them directly.
- The subject-line evidence conflicts. Treat it as low confidence.

### Gaps
- No high-quality study isolates length while holding other factors constant. All the length data is observational, and short emails may simply come from better senders.
- I found no length data specific to LinkedIn connection-request notes (300-character cap) or to job-seeker messages.

---

## 2. Personalization: lift, which kinds, diminishing returns and "creepiness"

### Takeaway
Vendor data consistently shows personalization lifts replies, typically 30-140%. The kind of personalization is rarely broken out. Personalization that signals public, relevant research helps. No one has published a clean number for where it turns "creepy".

### Cited Findings
- [VENDOR, 2019] Backlinko/Pitchbox (12M emails): personalized subject lines raised response rate by 30.5%. Body personalization was also associated with higher responses (exact figure not retrieved). — [Backlinko](https://backlinko.com/email-outreach-study)
- [VENDOR, Woodpecker, about 20M emails, date unclear] Advanced personalization reached reply rates of about 17-18% vs about 7-9% for basic templates, a reported lift of up to 142-143%. Custom snippets "can double" reply rate. Campaigns under 50 recipients averaged a 5.8% reply rate vs 2.1% for campaigns of 1,000+. — [Woodpecker](https://woodpecker.co/blog/cold-email-statistics/); summarized via [shno.co](https://www.shno.co/marketing-statistics/cold-email-statistics) and [prospeo.io](https://prospeo.io/s/cold-email-personalization)
- [VENDOR, Hunter.io, via aggregator] Emails with two custom attributes beat generic emails by 56% on reply rate. — [prospeo.io citing Hunter](https://prospeo.io/s/cold-email-personalization); Hunter primary: [State of Cold Email 2025](https://hunter.io/the-state-of-cold-email-2025)
- [VENDOR, Reply.io, about 2019-2020] Generic images lowered reply rates (2.62% vs a 3% average, -12.7%). GIFs lowered them by 25% (2.25%). Personalized images specific to the prospect were associated with increases. — [Reply.io](https://reply.io/images-gifs-in-cold-emails)
- [VENDOR/blog, opinion] "The personalization curve rises, flattens, then drops hard once a prospect feels watched rather than understood. Nobody has published a clean number for where that drop starts." Public, obviously researched context helps; private, hard-to-explain context hurts. — [firstsales.io](https://firstsales.io/blog/personalization-creepiness-line)
- [AGG, job seeker] Claim that personalized LinkedIn outreach with a specific request gets 3x the response of generic messages (method not given). — [trykondo / jobsprout summaries](https://www.trykondo.com/blog/the-numbers-game-understanding-cold-networking-success-rates)

### Inferences
- The small-campaign effect (5.8% vs 2.1%) points to targeting and relevance as a large driver, likely confounded with personalization. One-to-one networking messages sit at the extreme small-campaign end.
- No dataset ranks name vs company vs recent post vs shared background. The playbook should present the type hierarchy as practitioner judgment, not evidence. Shared background is supported indirectly by the weak-ties/mutual-connections findings in section 7.

### Gaps
- No controlled test comparing personalization types (name, company, post/activity, shared alma mater).
- No quantitative evidence on a "creepiness" threshold. This is opinion only.
- The Woodpecker and Hunter primary pages could not be read to confirm definitions of "advanced personalization".

---

## 3. Questions vs statements, and call to action (CTA) vs no ask

### Takeaway
Asking for interest ("Interested?") beats asking for a meeting time in cold sales email (Gong, 304K emails). Including 1-3 questions raised response by about 50% in general email (Boomerang). Academic work shows direct asks are complied with far more often than askers expect, and more than indirect hints.

### Cited Findings
- [VENDOR, Gong Labs, 304,174 emails, date about 2020-22] Compared three CTA types: specific time ("Friday at 2 PM?"), open-ended meeting ask ("time later this week?") and interest ("Interested in learning more about X?"). Interest-based CTAs performed best. Reported: asking for time up front was associated with about a 44% reduction in replies, and interest CTAs outperformed meeting asks by about 2.5x. (The 44% and 2.5x figures come from a secondary write-up and could not be confirmed against Gong.) — [growleads.io summary](https://growleads.io/blog/interest-based-ctas-vs-meeting-requests-study/); [prospeo.io](https://prospeo.io/s/cold-email-call-to-action); [Gong podcast](https://podcast.gong.io/public/76/Reveal%3A-The-Revenue-Intelligence-Podcast-05b3e1e1/89119e7d)
- [VENDOR, Gong] Recommends replacing "do you have 15 minutes?" with a concrete value offer, and leading with the recipient's priority rather than talking about yourself. — [Gong](https://www.gong.io/blog/do-execs-really-reply-to-cold-email-here-s-what-the-data-says)
- [VENDOR, Boomerang, 2016, general email, older] Emails asking 1-3 questions were 50% more likely to get a response than emails with no questions. — [Boomerang via VOA summary](https://learningenglish.voanews.com/a/tips-for-email/3842882.html)
- [ACAD, Flynn & Lake 2008, JPSP] Across studies in lab and field settings, help seekers underestimated by as much as 50% how likely others were to agree to a direct request. Askers wrongly believed indirect requests would work better. They neglected the social cost to the helper of saying "no". — [Stanford GSB](https://www.gsb.stanford.edu/insights/francis-flynn-if-you-want-something-ask-it?app=true); [Bohns 2016 review, Cornell](https://ecommons.cornell.edu/bitstream/handle/1813/75652/Bohns14_If_You_Need_Help_Just_Ask.pdf;jsessionid=47B3D596042182750D973E147A106704?sequence=1)

### Inferences
- For job seekers, the Gong interest-CTA result implies a low-friction yes/no ask ("Would you be open to a 15-minute chat sometime this month?" or "Open to me sending two quick questions?") over a specific calendar slot in the first message. This is extrapolated from sales data.
- Flynn & Lake supports always including an explicit ask rather than hinting. But the mechanism (social cost of refusing) is much weaker in email/text than face to face (see section 7).

### Gaps
- No data on open vs closed questions specifically. No clean test of "no ask" vs "ask" in a first cold message.

---

## 4. Follow-up cadence: number, spacing, share of replies, when to stop

### Takeaway
One follow-up reliably adds a large share of replies, roughly +50-66%. 40-58% of replies come from the first email. Data conflicts on how many to send: older vendor data favours 4-7 touches, while Belkins 2024 data says stop after 1-3 because spam complaints triple by touch 4.

### Cited Findings
- [VENDOR, 2019] Backlinko: emailing a contact multiple times doubled responses. One follow-up alone increased replies by 65.8%. — [Backlinko](https://backlinko.com/email-outreach-study)
- [VENDOR, 2026] Instantly: 58% of replies come from the first email, 42% from follow-ups. Optimal 4-7 steps. — [Instantly](https://instantly.ai/blog/email-sequence-benchmarks-2026-whats-a-good-open-rate-reply-rate-and-cost-per-meeting/?lng=en)
- [VENDOR/AGG] 42% of replies come from follow-ups, yet 48% of reps never send one. Sequences of 4-7 touches average 8.3% reply vs 4.1% with no follow-up. These are attributed to Woodpecker and Instantly but are blended across sources. — [Woodpecker summary](https://woodpecker.co/blog/cold-email-statistics/); [Instantly](https://instantly.ai/blog/follow-up-emails-vs-no-followup/)
- [VENDOR, 2024 data] Belkins (16.5M emails): reply rate per sequence peaked at 8.4% with one email. Going from 1 to 5+ emails more than halved reply rate. 4+ emails more than tripled unsubscribe and spam-complaint rates. The first follow-up raised replies by up to 49% in high-performing campaigns and doubled responses in the top 20% of sequences. Recommends 1-3 follow-ups maximum. — [Belkins](https://belkins.io/blog/sales-follow-up-statistics?frame=0)
- [AGG, anecdote, job seeker] One job seeker following up on every unanswered message after 3-5 days went from a 5% to a 14% response rate (single case, not a study). — [search summary of job-seeker blogs](https://www.trykondo.com/blog/the-numbers-game-understanding-cold-networking-success-rates)

### Inferences
- The defensible rule for job seekers is one polite follow-up after about 3-7 business days and at most two in total. Networking contacts are individuals, not a list, and the reputational cost of being spam-like is higher than in sales.
- Spacing evidence is weak. The 3-5 day figure is anecdotal or practitioner advice.

### Gaps
- No rigorous data on optimal spacing in days. No data on follow-ups for LinkedIn DMs specifically. No networking-specific follow-up study.

---

## 5. Timing: day of week and time of day

### Takeaway
Effects are small and inconsistent across datasets. Midweek (Tue-Thu) mornings, around 8-11 AM in the recipient's time zone, are marginally best. Consistency matters more than timing.

### Cited Findings
- [VENDOR, Belkins 2026, 7.5M sends] Wednesday and Thursday 0.48% reply rate, Monday and Tuesday 0.45%, Friday 0.44%. Morning sends (8 AM-12 PM) had the highest reply rate (0.54%) and meeting rate. Early morning (5-8 AM) was close behind. Note the very low absolute rates, and differences of a few hundredths of a percentage point. — [Belkins](https://belkins.io/blog/email-deliverability/choosing-the-best-time-to-send-an-email)
- [VENDOR, WarmySender, 75,000 B2B emails, Jul 2025-Jan 2026] Reported a 4.8% reply rate for Tuesday 9-11 AM recipient-local sends. — [search summary, zeliq/cleverly](https://www.zeliq.com/blog/best-time-to-send-cold-email)
- [VENDOR, HubSpot 2025] Tuesday open rate 16% higher than other days. This is an open-rate figure, and opens are unreliable since Apple Mail Privacy Protection. — [search summary](https://www.humanlinker.com/blog/guide-what-is-the-best-day-to-send-cold-emails-in-2025)
- [VENDOR, Instantly 2026] Consistent sending patterns gave 15-20% higher replies than erratic volume (a deliverability effect). — [Instantly](https://instantly.ai/blog/email-sequence-benchmarks-2026-whats-a-good-open-rate-reply-rate-and-cost-per-meeting/?lng=en)

### Inferences
- Timing is a weak lever. Rank it low in the playbook: avoid Friday afternoons and weekends, and send on a weekday morning in the recipient's time zone.

### Gaps
- No LinkedIn-specific timing data found. No job-seeker timing data.

---

## 6. Tone, reading level, emojis, links, images and attachments

### Takeaway
Simple language (about 3rd-5th grade reading level) is associated with more replies. Emojis in the body, generic images and GIFs are associated with fewer replies. Link evidence is mixed. All sources are vendors with older data.

### Cited Findings
- [VENDOR, Boomerang 2016, general email, older] 3rd-grade reading level: 53% response; college level: 39%. — [Boomerang via search summary](https://blog.boomerangapp.com/?p=3933)
- [VENDOR, Lavender] Recommends grade 3-5 reading level. Its scoring model weighs length, reading level, question count, personalization and tone, and says emails scoring 90+ have "meaningfully higher" replies (no figures). — [Lavender](https://www.lavender.ai/blog/the-cold-email-benchmark-report)
- [VENDOR, Gong] "We-we" self-focused copy hurts replies. Lead with the recipient's priority (qualitative). — [Gong](https://www.gong.io/blog/do-execs-really-reply-to-cold-email-here-s-what-the-data-says)
- [VENDOR, Reply.io / lemlist] Emojis in the body: 13% fewer replies. Emojis in subject lines: higher open rates (+19.7 to 22%) and +6.95% replies. 1-2 emojis leave booking rates unchanged; more emojis lower them. — [Reply.io](https://reply.io/emojis-attachments-impact-cold-email/); [lemlist](https://lemlist.com/blog/emojis-in-cold-emails)
- [VENDOR, Reply.io] Images: -12.7% replies. GIFs: -25%. Personalized images are the exception. — [Reply.io](https://reply.io/images-gifs-in-cold-emails)
- [VENDOR, lemlist/Reply.io via search summary] "Links can boost Interested reply rate by 11%." Attachments or body emojis can raise open rate by up to 15%. These are open-rate or ambiguous figures. Deliverability guidance from the same vendors warns that images and links hurt inbox placement. — [lemlist copywriting](https://www.lemlist.com/fr/blog/cold-email-copywriting); [lemlist images/deliverability](https://lemlist.com/blog/images-cold-email-deliverability)

### Inferences
- For job seekers: write plain text, use short sentences, and avoid emojis, images and attachments in the first message (offer a resume rather than attaching one). At most one link, e.g. to a portfolio or LinkedIn profile. The link guidance rests on deliverability logic, since the reply-rate data is conflicting.

### Gaps
- No rigorous tone (formal vs casual) study found. The attachment effect on replies (not opens) was not found.

---

## 7. Networking and job-seeker outreach (not sales)

### Takeaway
Hard data on job-seeker cold messages is scarce and mostly blog-grade. The best evidence is academic. People comply with direct help requests far more often than askers predict (Flynn & Lake). But email requests are dramatically less effective than in-person ones (Roghanizad & Bohns). Academics answered 67% of student meeting-request emails, with substantial bias by sender name (Milkman et al.). Moderately weak ties with mutual connections drive the most job mobility (Rajkumar et al., Science 2022).

### Cited Findings
**Academic (high quality, most applicable to job seekers)**
- [ACAD, Flynn & Lake 2008, JPSP] Askers underestimated compliance with direct help requests by up to 50%. Askers wrongly believed indirect requests would be more effective. — [Stanford GSB](https://www.gsb.stanford.edu/insights/francis-flynn-if-you-want-something-ask-it?app=true); [Bohns review](https://ecommons.cornell.edu/bitstream/handle/1813/75652/Bohns14_If_You_Need_Help_Just_Ask.pdf;jsessionid=47B3D596042182750D973E147A106704?sequence=1)
- [ACAD, Roghanizad & Bohns 2017, JESP vol. 69] 45 participants each asked 10 strangers (450 total) to complete a survey using an identical script. Face-to-face requests were 34x more effective than email. About 6 in-person asks equalled about 200 emails. Emailers greatly overestimated how effective their emails would be. — [U. Waterloo](https://uwaterloo.ca/management-science-engineering/news/face-face-request-34-times-more-successful-email); [Western U.](https://news.westernu.ca/2017/05/study-put-face-request/)
- [ACAD, Milkman, Akinola & Chugh 2014-15, field experiment] Emails from fictional prospective PhD students to 6,548 professors (89 disciplines, 259 US institutions) asked for a 10-minute meeting. 67% received a response. Women and minorities were ignored at 1.4x (humanities) to 2.2x (business) the rate of white men. Chinese female names got 29% fewer responses than white male names. — [EurekAlert](https://eurekalert.org/news-releases/751840); [NPR/KUNC](https://www.kunc.org/2014-04-22/evidence-of-racial-gender-biases-found-in-faculty-mentoring); [ICPSR dataset](https://www.icpsr.umich.edu/web/ICPSR/studies/37243/staff)
- [ACAD, Rajkumar, Saint-Jacques, Bojinov, Brynjolfsson & Aral 2022, Science] Randomized experiments on LinkedIn's People You May Know feature, covering more than 20M users over 5 years (2B new ties, 600K job changes). Weak ties caused more job mobility, but with an inverted-U shape: moderately weak ties (by mutual connections) helped most. Weak ties mattered more in digital industries; strong ties mattered more in less digital ones. — [MIT IDE](https://ide.mit.edu/insights/new-publication-mit-harvard-and-stanford-scientists-show-weaker-ties-are-more-beneficial-for-job-seekers-on-linkedin/); [Gwern PDF](https://www.Gwern.net/doc/sociology/technology/2022-rajkumar.pdf)

**Job-seeker benchmarks (low quality, AGG/blog, methods undisclosed)**
- Cold LinkedIn messages from job seekers to recruiters: 3-8% reply. Cold email: 3-5%. Highly personalized messages with strong relevance may reach 10-15%. — [pitchhired.com (search summary)](https://pitchhired.com/blog/cold-email-reply-rates-job-search-data); [trykondo](https://www.trykondo.com/blog/the-numbers-game-understanding-cold-networking-success-rates)
- Recruiting-agency cold email: median positive reply rate 7.8% (Puzzle Inbox 2026, a sales context, about recruiters selling). HR specialists reply at 8.5% in one dataset. — [Puzzle Inbox](https://puzzleinbox.com/blog/cold-email-for-recruiting-agencies/)
- Lavender 2026: HR recipients reply to cold sales email at 3.4%, below engineering/product at 5.2%. — [Lavender](https://www.lavender.ai/blog/the-cold-email-benchmark-report)
- The "70% of jobs filled through networking" claim circulates widely but has no traceable primary study. Do not use it. — [search summary](https://www.trykondo.com/blog/the-numbers-game-understanding-cold-networking-success-rates)

### Inferences
- The professor study (67% reply to a polite, specific 10-minute student request) is the best available proxy for an informational-interview request from a student or early-career person to a stranger. It suggests networking asks can far outperform the 3-5% sales baseline, because the ask is small, personal and non-commercial. This is an extrapolation, and the sender-identity bias should be acknowledged.
- Combine Flynn & Lake (ask directly; people say yes more than you think) with Roghanizad & Bohns (email loses most of that effect). Recommend making the message as human and specific as possible. When available, use warm channels: a mutual connection's intro, in-person events, or a call after the first reply.
- Rajkumar supports prioritizing second-degree contacts with some mutual connections over total strangers or close friends.

### Gaps
- I found no rigorous, large-sample study of reply rates to job-seeker informational-interview or referral requests on LinkedIn or email.
- No data on whether mentioning a mutual connection or a shared school raises networking reply rates (this is plausible given weak-ties research, but untested).
- Primary job-seeker blog pages could not be fetched to check their methods.
