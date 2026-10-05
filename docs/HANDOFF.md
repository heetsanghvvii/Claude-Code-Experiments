# Handoff: end-to-end test of Knock (start here in a new session)

State on 5 Oct 2026 (IST):
- Live: https://knock-eosin-beta.vercel.app (site), /crm (operator CRM, password in Vercel env CRM_PASSWORD), /api/health returns supabase true, claude true.
- Supabase project outbound-engine (ref elgypbjgsvkiulwhefbk). Migrations 0001 to 0005 applied (0005 = onboarding, candidate_files).
- Founder test signup exists in intake_requests (Heet Sanghvi, PM, Zepto/Swiggy/Blinkit/Zomato, Mumbai). Fix typos on import: "Product Manager", "Mumbai".
- Branch: claude/ai-job-seeker-outreach-49b5hr. Deploy = Vercel create_deployment with gitSource (org heetsanghvvii, repo Claude-Code-Experiments, this branch, latest sha), project prj_0ZN46NltEHx0lgD7LlFqcDrlRHJS, target production. Run deploy/build.sh before committing deploy changes.
- Engine env needed in the session: ANTHROPIC_API_KEY (environment), SUPABASE_URL=https://elgypbjgsvkiulwhefbk.supabase.co, SUPABASE_KEY (publishable key, get via Supabase MCP get_publishable_keys), ENGINE_TOKEN (ask the founder; only its hash is in the DB). Without ENGINE_TOKEN, run locally with OUTREACH_DATA_DIR and show results via screenshots.
- In progress when this was written: landing page animation (deploy/public/index.html, recordings in deploy/screenshots/home-motion*.mp4, not deployed until founder approves) and customer onboarding page /start with PDF upload + CRM Onboarding tab.

## Test plan (visual: screenshot every step, send to founder, times in IST)
1. Founder imports sign-up in CRM (or via /start onboarding once deployed, uploading LinkedIn PDF + CV).
2. Engine: discover people at the 4 companies (public web search only, never LinkedIn), enrich-web, hooks, generate openers (3 writers + judge). Show sources per hook.
3. CRM Queue: founder approves or edits a few.
4. Simulate one reply (inbound-add), run sync, show drafted reply and Learning tab.
5. cost command: show real cost per prospect.
Nothing is sent on LinkedIn. Smoke/stress tests and LGM/Chrome bridge are on hold until the founder says so.
Follow CLAUDE.md (IST times, brand kit for all creatives).
