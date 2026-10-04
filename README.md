# Job Search Outbound Engine

Finds the right people at a candidate's target companies, researches them, finds a real reason for them to talk, writes the opener, and drafts every follow-up from the actual conversation.

North star: **interviews per 100 targeted prospects**.

- Launch checklist: [`docs/LAUNCH_PLAN.md`](docs/LAUNCH_PLAN.md)
- Client intake: [`docs/INTAKE.md`](docs/INTAKE.md)
- Database schema: [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)

## Pipeline

```
Intake (CV + LinkedIn PDF + targets)
  -> discover   public LinkedIn results via Brave Search, sorted into buckets
  -> enrich     LinkedIn "Save to PDF" per shortlisted person, parsed into facts
  -> generate   hooks (must cite a real fact on both sides), ranked, Message 1 written and rule-checked
  -> approve    human review
  -> send       client sends (Tier 1) or LGM sends (Tier 2)
  -> reply      paste their reply, get the next message based on the whole thread
  -> funnel     conversion metrics
```

No LinkedIn login or scraping anywhere. Discovery uses public search results; profiles come from manual PDF exports.

## Setup

```bash
cd engine
pip install -r requirements.txt
cp ../.env.example ../.env   # add ANTHROPIC_API_KEY and BRAVE_API_KEY
set -a; source ../.env; set +a
python -m pytest -q tests
```

## Usage

```bash
cd engine

# 1. Candidate
python -m outreach.cli candidate-add --name "Asha Mehta" \
  --cv asha_cv.pdf --linkedin asha_linkedin.pdf \
  --roles "Product Manager" --companies "Zepto,CRED,Swiggy" \
  --locations "Bangalore" --story examples/story.json

# 2. Discover prospects (10 per company by default)
python -m outreach.cli discover asha-mehta-1a2b3c
python -m outreach.cli list asha-mehta-1a2b3c

# 3. For each shortlisted person: open their LinkedIn, More > Save to PDF, then
python -m outreach.cli prospect-add asha-mehta-1a2b3c --id rahul-shah-9f8e7d \
  --pdf rahul.pdf --posts rahul_posts.txt

# 4. Hooks + Message 1
python -m outreach.cli generate asha-mehta-1a2b3c

# 5. Review, edit if needed, approve, mark sent
python -m outreach.cli approve asha-mehta-1a2b3c rahul-shah-9f8e7d
python -m outreach.cli status asha-mehta-1a2b3c rahul-shah-9f8e7d sent

# 6. They replied
python -m outreach.cli reply asha-mehta-1a2b3c rahul-shah-9f8e7d --text "Ha, the speed. Everything ships weekly."

# 7. Report
python -m outreach.cli funnel asha-mehta-1a2b3c
python -m outreach.cli export asha-mehta-1a2b3c
```

Data is stored as JSON in `engine/data/` for now. Supabase replaces it with the client website (Phase 2).
