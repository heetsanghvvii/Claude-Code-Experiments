# Customer account: /login and /app

Knock customers sign in with their email and a one-time code, then use the customer app at `/app`. The old secret
portal link (`/portal?t=...`, created from the CRM's "Portal link" button) keeps working as a fallback; on a device
that is already signed in, `/portal` sends the person to `/app`.

## Page map

`/login` (`deploy/public/login/index.html`)
- Step 1: email, "Email me a code" (`supabase.auth.signInWithOtp({email, options: {shouldCreateUser: true, emailRedirectTo: <origin>/app}})`).
- Step 2: the code from the email (`verifyOtp({email, token, type: "email"})`), "Send a new code" (60 second cooldown), "Use a different email".
- Already signed in: goes straight to `/app`. Link to `/start` for new people.

`/app` (`deploy/public/app/index.html`), one page with hash routes. Desktop: left sidebar. Mobile: bottom tabs (Home, Send, People, Replies, More).

| Route | Page | What it does |
|---|---|---|
| `#/home` | Home | Greeting, today's tasks (to send within the daily pace, people waiting on a reply, conversations quiet for 7+ days), progress strip (targeted, sent, replied, talking, referrals, interviews), what Knock is doing now, plan and days left, recent activity |
| `#/send` | Send today | The paced batch: up to 15 messages a day (IST), follow-ups first. Each card: person, why (hook and 2 cited facts with source links), the draft with Edit, Copy message, Open LinkedIn (profile URL, else a LinkedIn people search for name and company), I sent it. "You are done for today" when the 15 are sent |
| `#/people` | My people | Table (cards on mobile) with search and filters by company, type and status |
| `#/people/<id>` | Person | Profile, why worth talking to, facts with sources, full thread, next draft or "being written", paste their reply, set outcome (no reply after 7 days, declined, referral, interview, offer), do not contact |
| `#/replies` | Replies | Paste a reply after choosing the person from a searchable list; all conversations with the latest message |
| `#/outcomes` | Outcomes | Referrals, interviews and offers with dates, newest first |
| `#/profile` | My profile | Roles, companies (star up to 10 as top), places, story answers, tone, never say, off-limits; re-upload the LinkedIn PDF or CV |
| `#/plan` | Plan | Package, start and end dates, days left, people contacted against the package, what is included, upgrade by email (no payments) |
| `#/help` | Help | How to send safely, questions, email support |
| `#/more` | More (mobile) | Outcomes, My profile, Plan, Help, Log out |

## Auth flow

1. The browser gets the project URL and publishable key from `GET /api/public-config` (read from the `SUPABASE_URL`
   and `SUPABASE_KEY` environment variables; nothing is hard-coded) and loads supabase-js v2 from cdn.jsdelivr.net.
2. Sign-in is Supabase Auth email OTP. supabase-js keeps the session in localStorage and refreshes it.
   A magic link in the same email also works: it lands on `/app`, where supabase-js reads the session from the URL.
3. Every `/api/me/*` call sends `Authorization: Bearer <access token>`. The API checks the token with
   `GET {SUPABASE_URL}/auth/v1/user` (apikey plus the bearer), caches the answer for 60 seconds per token hash,
   and refuses unconfirmed addresses.
4. The confirmed email (case-insensitive) is matched to the candidate whose `story.email` is the same.
   No match: 403 with "We could not find a Knock account for this email." and a link to `/start`.
   Bad or expired token: 401, and the app returns to `/login`.

API (all take the bearer token, all scoped to the signed-in candidate, none return writer, judge, playbook, cost or token fields):
`GET /api/me`, `GET /api/me/prospects`, `POST /api/me/prospects/{id}/approve|sent|reply|status|skip`,
`GET /api/me/activity`, `GET|PATCH /api/me/profile`, `POST /api/me/files`, `GET /api/me/plan`.
They share their logic with `/api/portal/*` (`do_approve`, `do_sent`, `do_reply`, `do_status`, `do_skip`, `client_views`).
Profile edits save straight to the candidate: new companies are picked up by the next research run, and a change of
roles or places re-opens research at every company (no founder step). Uploads keep the PDF text on the candidate so
the next daily run refreshes their facts.

Database: apply `supabase/migrations/0007_customer_app.sql` (adds `candidate_files.candidate_id`; the API works without it).

## Supabase dashboard settings the founder must set

Project: `https://elgypbjgsvkiulwhefbk.supabase.co`.

1. **Authentication > Sign In / Providers > Email**: Email provider **enabled**. Keep **Confirm email** on
   (the API ignores unconfirmed addresses). Email OTP length 6 is the default; keep it, as the page asks for a 6-digit code.
2. **Authentication > URL Configuration**:
   - Site URL: `https://knock-eosin-beta.vercel.app`
   - Redirect URLs: add `https://knock-eosin-beta.vercel.app/app`
3. **Authentication > Emails > Templates > Magic Link** (the template used for email OTP sign-in), and the
   **Confirm signup** template (used for a first sign-in when the user is created): include `{{ .Token }}` so the
   6-digit code appears. A suggested body:

   ```html
   <h2>Your Knock sign-in code</h2>
   <p>Enter this code on the sign-in page:</p>
   <p style="font-size:28px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
   <p>Or open this link on the same device: <a href="{{ .ConfirmationURL }}">sign in to Knock</a>.</p>
   <p>If you did not ask for this, you can ignore this email.</p>
   ```
4. **Email sending limits**: the built-in Supabase sender is for testing only and sends only a few
   auth emails per hour for the whole project, and may deliver only to your team's own addresses. Before real
   customers sign in, set up custom SMTP under **Authentication > Emails > SMTP Settings** (for example Resend,
   Postmark or Amazon SES with a knock.careers sender), then raise the rate limit under **Authentication > Rate Limits**.
5. Vercel environment: `SUPABASE_URL` and `SUPABASE_KEY` (the publishable key) are already set for the engine; nothing new is needed.

## Local demo and screenshots

`cd deploy && ./build.sh && KNOCK_DEMO=1 PYTHONPATH=.:../engine python demo/serve_demo.py`. Only with `KNOCK_DEMO=1`,
the demo server accepts one fixed demo access token as the demo candidate Ananya (it replaces the Supabase user
lookup inside `demo/serve_demo.py`; production code has no bypass). Screenshots: `deploy/screenshots/app-*.png` and
`login-*.png`, at 1440 and 390 wide.
