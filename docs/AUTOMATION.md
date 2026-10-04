# Automated Pipeline

Your old Clay + LGM + GPT pipeline, rebuilt with Claude as the brain and Supabase as memory.

```
Clay table (companies -> people -> LinkedIn enrichment: posts, education, jobs, projects, bio)
   | export CSV
   v
clay-import      Claude turns each row into facts, buckets the person
generate         hooks + 3 writer agents + judge -> Message 1
approve          (you) quick review
export-lgm       CSV with Message 1 as customAttribute1 -> import into LGM audience
   |
LGM campaign     invite with note {{customAttribute1}}
   |
   |  every 3 hours: Claude in Chrome
   |    1. copies new LGM inbox replies  -> Supabase `inbound_replies`
   |    2. sends due rows from `outbox`  -> LGM inbox, stamps `sent_at`
   v
sync (hourly)    reads replies, drafts the next message from the whole thread,
                 queues it in `outbox` with a delay (auto-send) or holds it for approval
```

Negative replies are never auto-sent; they wait for you.

## One-time setup

1. Environment variables in the Claude Code cloud environment:
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL` = `https://elgypbjgsvkiulwhefbk.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase dashboard > outbound-engine > Project Settings > API Keys > `service_role` (secret)
   - `BRAVE_API_KEY` (only if using Brave discovery instead of Clay)
2. Per candidate: `python -m outreach.cli settings <candidate> --auto-send on --delay 45`
3. LGM: create an audience per candidate and a campaign: visit profile, then invite with note `{{customAttribute1}}`.
4. Hourly `sync`: a scheduled Claude Code routine that runs `cd engine && python -m outreach.cli sync`.
5. Every 3 hours: the Claude in Chrome scheduled task below.

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
