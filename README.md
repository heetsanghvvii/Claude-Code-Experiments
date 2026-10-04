# Knock

Knock on the right door: interviews at your target companies, through the people who work there.

Finds the right people at a candidate's target companies, researches them, finds a real reason for them to talk, writes the opener, and drafts every follow-up from the actual conversation.

North star: **interviews per 100 targeted prospects**.

- Launch checklist: [`docs/LAUNCH_PLAN.md`](docs/LAUNCH_PLAN.md)
- Client intake: [`docs/INTAKE.md`](docs/INTAKE.md)
- Database schema: [`supabase/migrations/`](supabase/migrations/)
- Automated pipeline, self-learning and the Chrome task: [`docs/AUTOMATION.md`](docs/AUTOMATION.md)

## Pipeline

```
Intake (CV + LinkedIn PDF + targets)
  -> discover   public LinkedIn results (Brave or Claude web search), sorted into buckets
  -> enrich     public posts/articles via search (enrich-web), optional LinkedIn "Save to PDF"
  -> generate   hooks (must cite a real fact on both sides), ranked; 3 writer agents draft Message 1
                in parallel, rule checks drop bad drafts, a judge agent picks the winner
  -> approve    human review
  -> send       client sends (Tier 1) or LGM sends (Tier 2)
  -> reply      paste their reply, get the next message based on the whole thread
  -> funnel     conversion metrics
  -> learn      operator edits + reply outcomes rewrite the writing playbook used by writers and judge
```

## Writer agents and feedback loop

| Writer | Angle |
|---|---|
| `curious_peer` | Asks about one specific decision in their career |
| `sharp_observer` | One sharp observation about their work or post, tied to the candidate |
| `shared_path` | Leads with the concrete overlap, then an easy question |

Every opener stores which writer won, why the judge picked it, and the losing drafts.

Feedback signals:
1. **Edits**: approving with `--body` records the draft vs what you actually sent.
2. **Outcomes**: status changes show which writers' openers get replies.
3. **Playbook**: `learn` distills edits and outcomes into up to 15 concrete rules. Rules and recent winning openers are fed into every writer and the judge on the next `generate`.
4. **Stats**: `stats` shows reply rate and edit count per writer.

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

# 7. Learn from edits and results (run weekly)
python -m outreach.cli learn
python -m outreach.cli stats

# 8. Report
python -m outreach.cli funnel asha-mehta-1a2b3c
python -m outreach.cli export asha-mehta-1a2b3c
```

State lives in the Supabase project `outbound-engine` (table `engine_state`) when `SUPABASE_URL`, `SUPABASE_KEY` and `ENGINE_TOKEN` are set, otherwise in local JSON under `engine/data/`.
