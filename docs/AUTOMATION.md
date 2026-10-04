# Automated Pipeline

Our own stack: no Clay, no LGM Pro. Claude is the brain, Supabase is the memory, LGM Basic sends,
Claude in Chrome moves messages in and out of LGM.

```
discover        public LinkedIn results (Brave if BRAVE_API_KEY is set, else Claude web search),
                each person bucketed: hiring manager, team member, recruiter, alumni, senior connector
enrich-web      public posts, talks, articles per person -> facts   (our own Clay)
prospect-add    optional: LinkedIn "Save to PDF" for the top prospects, for full career detail
generate        hooks + writer agents chosen by Thompson sampling + judge -> Message 1
approve         (you) quick review; --alt N teaches the judge, --body edits teach the writers
export-lgm      CSV with Message 1 as customAttribute1 -> import into an LGM Basic audience
   |
LGM campaign    invite with note {{customAttribute1}}
   |
   |  every 3 hours: Claude in Chrome
   |    1. sends due rows from Supabase `outbox` via the LGM inbox, stamps `sent_at`
   |    2. copies new LGM inbox replies -> Supabase `inbound_replies`
   v
sync (hourly)   drafts the next message from the whole thread, queues it with a delay
                (auto-send) or holds it for approval; negative replies always wait for you.
                Then runs self-learning when enough new evidence has arrived.
```

## Self-learning

| Signal | What learns |
|---|---|
| Opener got a reply or not | Writer selection per prospect type (Thompson sampling); writers under half the best reply rate after 10 sends are retired; new writer angles are evolved from openers that got replies (max 5 writers) |
| You edit a draft | Opener playbook: rules fed to every writer and the judge |
| You pick an alternative over the judge's pick | Judge sees your recent overrides and learns your taste |
| Conversation reached referral/interview or stalled | Reply playbook and per-ask success rates fed to the reply agent |

Learning runs automatically inside `sync` every 10 new signals; `learn` forces it, `stats` shows it.

## Setup status

Done by Claude (Supabase connector): project `outbound-engine`, all tables, access rules, engine token hash.

Needs the environment settings (only the account owner can change these):
1. Network access: allow `*.supabase.co` (and `api.search.brave.com` if using Brave).
2. Environment variables: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `ENGINE_TOKEN`
   (values in `.env.example`; the token is given to you separately).
3. Per candidate: `python -m outreach.cli settings <candidate> --auto-send on --delay 45`
4. LGM Basic: one audience per candidate, campaign: visit profile, then invite with note `{{customAttribute1}}`.

## Claude in Chrome scheduled task (every 3 hours)

```
You are the sending assistant for my LinkedIn outreach. Work only in these two tabs:
La Growth Machine (app.lagrowthmachine.com) and the Supabase dashboard project "outbound-engine" > Table Editor.

STEP 1: Send due messages
- In Supabase, open table "outbox". Filter: sent_at is empty AND send_after is before now.
- For each row, in order of send_after:
  - In LGM Inbox, open the conversation with the person in prospect_name / linkedin_url.
  - Check the last message in the conversation is from them, not from me. If my last message is already
    the same text, do not send again; just fill sent_at.
  - Paste the "body" text exactly, no edits, and send.
  - Back in Supabase, set that row's sent_at to the current time and save.

STEP 2: Copy new replies
- In LGM Inbox, find conversations with new messages from the other person since your last run
  (unread, or newer than 3 hours).
- For each new message, add a row to Supabase table "inbound_replies":
  linkedin_url = their LinkedIn profile URL, prospect_name = their full name, text = their message exactly.
  Leave processed_at and result empty.
- Mark the conversation as read in LGM.

RULES
- Never write or change a message yourself. Only paste "body" from outbox.
- Never send to anyone who is not in an outbox row.
- If anything looks wrong (person not found, message already sent, LGM error), skip that row and list it at the end.
- Finish with a summary: messages sent, replies copied, rows skipped and why.
```
