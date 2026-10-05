# Client intake: what we need from every candidate

Two steps. The website form is short so people sign up. Onboarding collects the rest after they pay.

## Step 1: website sign-up (live now)
Full name, email, LinkedIn URL, target role, city, target companies, package. Enough to qualify them and send a first target list.

## Step 2: onboarding (after payment, before any research)

### A. Files (required)
1. **LinkedIn profile PDF**: on their profile, "More", then "Save to PDF". This is the main source of facts for hooks.
2. **CV / resume (PDF)**: fills gaps LinkedIn leaves (numbers, projects).

### B. Targeting (required)
3. **Target roles**: up to 2 exact titles. Example: "Product Manager", "Growth Manager".
4. **Target companies**: 10 to 30, ranked. Mark the top 5. We can suggest more if they have fewer.
5. **Locations**: up to 2 cities, plus remote yes or no.
6. **Seniority and years of experience.**
7. **Off-limits**: current employer, companies to avoid, people they already know there (we never message these).

### C. Story (required: this is what makes messages personal)
8. **Why this move, why now**: one or two lines in their own words.
9. **Two things they are proudest of**, each with one concrete result.
10. **Transition they are making**, if any (for example teacher to designer, operations to product).
11. **Where they come from**: schools, past employers, hometown, communities, clubs, causes, languages. Every one of these is a possible shared reason to talk.
12. **Anything recent**: a post, talk, project, certification or side project they are happy for us to mention.

### D. Preferences (required)
13. **Tone**: formal, neutral or casual.
14. **Never say**: topics or phrases to avoid (for example their layoff, a gap year, salary).
15. **Approval window**: confirm they can review drafts within 24 hours, and how (CRM link, email or WhatsApp summary).

### E. Consent (required, written)
16. **Message approval**: they approve every message before it is sent.
17. **Data use**: they agree we process their profile and the public profiles of people we research, only to run their search; we delete it on request or 90 days after the engagement (DPDP).
18. **Tier 2 only (done-for-you)**: written consent to send from their LinkedIn through La Growth Machine, acknowledgement that LinkedIn's User Agreement restricts automation and that the account carries some risk, our sending limits, and that we switch to self-send at the first LinkedIn warning.

## Maps to the engine
| Intake | Engine field |
|---|---|
| Name | `full_name` |
| Package | `tier` (self_send or done_for_you) |
| Roles | `target_roles` |
| Companies | `target_companies` |
| Locations | `locations` |
| Industries | `industries` |
| LinkedIn PDF, CV, story answers | `facts` (via `candidate-cv` and profile extraction), `story` |
| Tone, never say | `story.tone`, `story.never_say` |
| Off-limits | excluded at discovery |

## Quality bar before research starts
- At least 10 target companies and 1 role.
- LinkedIn PDF received.
- At least 3 story answers with something specific (a place, an employer, a result).
- Consent recorded.
If any is missing, the client gets one friendly email asking for exactly what is missing. Research does not start until the bar is met.
