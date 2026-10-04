"""Operator CLI. Run `python -m outreach.cli --help`."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from . import bridge, discovery, feedback, hooks, messages, profiles, store
from .models import Bucket, Candidate, Fact, Message, Prospect

STATUSES = [
    "discovered", "shortlisted", "enriched", "message_ready", "approved", "sent", "accepted",
    "replied", "conversation", "referral", "interview", "offer", "no_response", "declined", "skipped",
]
FUNNEL = ["sent", "accepted", "replied", "conversation", "referral", "interview", "offer"]


def _split(value: str | None) -> list[str]:
    return [v.strip() for v in (value or "").split(",") if v.strip()]


def cmd_candidate_add(a):
    story = json.loads(Path(a.story).read_text()) if a.story else {}
    pdfs = [p for p in (a.cv, a.linkedin) if p]
    extracted = profiles.extract(pdfs)
    cid = store.new_id(a.name or extracted.full_name)
    c = Candidate(
        id=cid,
        full_name=a.name or extracted.full_name,
        tier=a.tier,
        target_roles=_split(a.roles),
        target_companies=_split(a.companies),
        locations=_split(a.locations),
        industries=_split(a.industries),
        story=story,
        headline=extracted.headline,
        facts=profiles.to_facts(extracted, "candidate", "c", "cv"),
    )
    store.save(c)
    print(f"Created candidate {cid} with {len(c.facts)} facts.")


def cmd_discover(a):
    c = store.load(a.candidate)
    companies = [a.company] if a.company else c.target_companies
    known = {p.linkedin_url for p in c.prospects}
    for company in companies:
        hits = [h for h in discovery.search_company(c, company) if h.linkedin_url not in known]
        kept = 0
        for hit in hits:
            if kept >= a.per_company:
                break
            decision = discovery.classify(c, hit)
            if not decision.keep:
                continue
            c.prospects.append(Prospect(
                id=store.new_id(hit.full_name), full_name=hit.full_name, headline=hit.headline,
                company=company, linkedin_url=hit.linkedin_url, bucket=decision.bucket,
                bucket_reason=decision.reason, source="brave",
            ))
            kept += 1
        print(f"{company}: {len(hits)} found, {kept} kept")
        store.save(c)


def cmd_prospect_add(a):
    """Attach a LinkedIn "Save to PDF" export to a discovered prospect, or create a new one."""
    c = store.load(a.candidate)
    posts = Path(a.posts).read_text() if a.posts else ""
    extracted = profiles.extract([a.pdf], posts)
    if a.id:
        p = store.get_prospect(c, a.id)
    else:
        p = Prospect(id=store.new_id(extracted.full_name), full_name=extracted.full_name, source="manual",
                     linkedin_url=a.url or "", bucket=Bucket(a.bucket))
        c.prospects.append(p)
    p.headline = p.headline or extracted.headline
    p.company = p.company or extracted.current_company
    p.location = extracted.location
    p.facts = profiles.to_facts(extracted, "prospect", f"p:{p.id}", "linkedin_pdf")
    p.status = "enriched"
    store.save(c)
    print(f"{p.id}: {len(p.facts)} facts")


def cmd_generate(a):
    c = store.load(a.candidate)
    targets = [p for p in c.prospects if p.status == "enriched" and (not a.id or p.id == a.id)]
    everyone = [store.load(cid) for cid in store.list_ids()]
    guidance, judge_notes = feedback.guidance(everyone), feedback.judge_guidance()
    for p in targets:
        p.hooks = hooks.find(c, p)
        if not p.hooks:
            p.status = "skipped"
            print(f"{p.full_name}: no legitimate hook, skipped")
            store.save(c)
            continue
        writers = feedback.choose_writers(everyone, p.bucket.value)
        msg, problems = messages.write_opener(c, p, p.hooks[0], guidance, writers, judge_notes)
        p.messages = [msg]
        p.status = "message_ready"
        store.save(c)
        flag = f"  [CHECK: {'; '.join(problems)}]" if problems else ""
        print(f"\n{p.full_name} ({p.bucket.value}, hook={p.hooks[0].hook_type}, score={p.hooks[0].score}){flag}")
        print(f"  WINNER [{msg.writer}]: {msg.body}")
        if msg.judge_reason:
            print(f"  Why: {msg.judge_reason}")
        for i, (alt, w) in enumerate(zip(msg.alternatives, msg.alternative_writers), start=1):
            print(f"  alt {i} [{w}]: {alt}")


def cmd_approve(a):
    c = store.load(a.candidate)
    p = store.get_prospect(c, a.id)
    msg = p.messages[-1]
    if a.alt:
        # Operator prefers a losing draft: the judge learns from this.
        alt_body, alt_writer = msg.alternatives[a.alt - 1], msg.alternative_writers[a.alt - 1]
        feedback.record_judge_miss(f"{p.full_name}, {p.headline} at {p.company}", msg.body, alt_body)
        msg.alternatives[a.alt - 1], msg.alternative_writers[a.alt - 1] = msg.body, msg.writer
        msg.body, msg.writer = alt_body, alt_writer
    if a.body and a.body.strip() != msg.body.strip():
        if msg.step == 1:
            feedback.record_edit(msg.body, a.body, msg.writer, p.hooks[0].hook_type if p.hooks else "", p.bucket.value)
        msg.body = a.body
        msg.edited = True
    if msg.step == 1:
        msg.approved = True
        p.status = "approved"
    else:
        bridge.queue(c, p, msg)
    store.save(c)
    print(f"Approved: {msg.body}" + (f" (sends after {msg.send_after})" if msg.send_after else ""))


def cmd_status(a):
    c = store.load(a.candidate)
    p = store.get_prospect(c, a.id)
    p.status = a.status
    store.save(c)
    print(f"{p.full_name}: {a.status}")


def cmd_reply(a):
    """Log their reply, then draft our next message from the full thread."""
    c = store.load(a.candidate)
    p = store.get_prospect(c, a.id)
    result = bridge.handle_reply(c, p, a.text)
    store.save(c)
    print(f"Sentiment: {result.sentiment}, rapport {result.rapport}/5, ask: {result.ask_type} ({result.ask_reason})")
    if result.redirect_to:
        print(f"They pointed to: {result.redirect_to}")
    draft = p.messages[-1]
    state = f"queued, sends after {draft.send_after}" if draft.approved else "held for approval"
    print(f"\nDraft ({state}):\n{draft.body}")


def cmd_export(a):
    c = store.load(a.candidate)
    out = Path(a.out or f"{c.id}.csv")
    with out.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["prospect_id", "name", "company", "headline", "bucket", "linkedin_url", "hook", "message", "status"])
        for p in c.prospects:
            if p.status in ("discovered", "skipped"):
                continue
            last_out = next((m.body for m in reversed(p.messages) if m.direction == "outbound"), "")
            hook = p.hooks[0].summary if p.hooks else ""
            w.writerow([p.id, p.full_name, p.company, p.headline, p.bucket.value, p.linkedin_url, hook, last_out, p.status])
    print(f"Wrote {out}")


def cmd_funnel(a):
    c = store.load(a.candidate)
    counts = Counter(p.status for p in c.prospects)
    targeted = sum(v for k, v in counts.items() if k not in ("discovered", "skipped"))
    print(f"{c.full_name}: {targeted} targeted")
    reached = 0
    for i, stage in enumerate(FUNNEL):
        reached = sum(counts[s] for s in FUNNEL[i:]) + (counts["no_response"] + counts["declined"] if stage == "sent" else 0)
        rate = f"{100 * reached / targeted:.0f}%" if targeted else "-"
        print(f"  {stage:<13}{reached:>4}  {rate}")
    interviews = counts["interview"] + counts["offer"]
    if targeted:
        print(f"  Interviews per 100 targeted: {100 * interviews / targeted:.1f}")
    by_bucket = Counter((p.bucket.value, p.status in FUNNEL[2:]) for p in c.prospects if p.status in FUNNEL + ["no_response", "declined"])
    buckets = sorted({b for b, _ in by_bucket})
    if buckets:
        print("  Reply rate by bucket:")
        for b in buckets:
            total = by_bucket[(b, True)] + by_bucket[(b, False)]
            print(f"    {b:<17}{by_bucket[(b, True)]}/{total}")


NAME_COLS = ("full name", "name", "person name")
URL_COLS = ("linkedin profile", "linkedin url", "linkedin", "profile url", "linkedin profile url")
COMPANY_COLS = ("company", "company name", "company domain")
TITLE_COLS = ("title", "job title", "headline")


def _pick(row: dict, names: tuple[str, ...]) -> str:
    lower = {k.strip().lower(): v for k, v in row.items()}
    return next((lower[n].strip() for n in names if lower.get(n)), "")


def cmd_import_csv(a):
    """Import any people list (CSV): one row per person, any extra columns become facts."""
    c = store.load(a.candidate)
    known = {bridge.normalize_url(p.linkedin_url) for p in c.prospects}
    with open(a.file, newline="") as f:
        rows = list(csv.DictReader(f))
    added = 0
    for row in rows:
        url = _pick(row, URL_COLS)
        if bridge.normalize_url(url) in known:
            continue
        text = "\n".join(f"{k}: {v}" for k, v in row.items() if v and v.strip())
        extracted = profiles.extract_text(text)
        p = Prospect(id=store.new_id(extracted.full_name or _pick(row, NAME_COLS)),
                     full_name=_pick(row, NAME_COLS) or extracted.full_name,
                     headline=_pick(row, TITLE_COLS) or extracted.headline,
                     company=_pick(row, COMPANY_COLS) or extracted.current_company,
                     linkedin_url=url, location=extracted.location, source="csv", status="enriched")
        decision = discovery.classify(c, discovery.SearchHit(p.full_name, p.headline, url, text[:500], p.company))
        p.bucket, p.bucket_reason = decision.bucket, decision.reason
        p.facts = profiles.to_facts(extracted, "prospect", f"p:{p.id}", "csv")
        c.prospects.append(p)
        known.add(bridge.normalize_url(url))
        added += 1
        store.save(c)
    print(f"Imported {added} of {len(rows)} rows")


def cmd_enrich_web(a):
    c = store.load(a.candidate)
    targets = [p for p in c.prospects if p.status == "discovered" and (not a.id or p.id == a.id)]
    for p in targets:
        facts = discovery.web_facts(p)
        start = len(p.facts) + 1
        p.facts += [Fact(id=f"p:{p.id}:{start + i}", owner="prospect", kind=f.kind, text=f.text, source="web")
                    for i, f in enumerate(facts)]
        if len(p.facts) >= a.min_facts:
            p.status = "enriched"
        store.save(c)
        print(f"{p.full_name}: {len(facts)} web facts -> {p.status}")


def cmd_export_lgm(a):
    """CSV for La Growth Machine audience import, with Message 1 as a custom attribute."""
    c = store.load(a.candidate)
    out = Path(a.out or f"{c.id}-lgm.csv")
    n = 0
    with out.open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["firstname", "lastname", "linkedinUrl", "companyName", "jobTitle", "customAttribute1"])
        for p in c.prospects:
            opener = next((m for m in p.messages if m.step == 1 and m.direction == "outbound"), None)
            if p.status != "approved" or not opener or not p.linkedin_url:
                continue
            first, _, last = p.full_name.partition(" ")
            w.writerow([first, last, p.linkedin_url, p.company, p.headline, opener.body])
            n += 1
    print(f"Wrote {n} approved prospects to {out}. In LGM use {{{{customAttribute1}}}} as the invite note.")


def cmd_settings(a):
    c = store.load(a.candidate)
    if a.auto_send is not None:
        c.auto_send = a.auto_send == "on"
    if a.delay is not None:
        c.reply_delay_minutes = a.delay
    store.save(c)
    print(f"{c.full_name}: auto_send={'on' if c.auto_send else 'off'}, reply delay={c.reply_delay_minutes} min")


def cmd_inbound_add(a):
    bridge.add_inbound(a.linkedin_url or "", a.name or "", a.text)
    print("Queued reply for next sync")


def cmd_sync(a):
    print(bridge.sync())


def cmd_outbox(a):
    rows = bridge.outbox(due_only=not a.all)
    for r in rows:
        print(f"[{r['id']}] {r['prospect_name']} ({r['linkedin_url']}) after {r['send_after']}\n  {r['body']}")
    print(f"{len(rows)} message(s)")


def cmd_mark_sent(a):
    bridge.mark_sent(a.row_id)
    print("Marked sent")


def cmd_learn(a):
    """Rewrite the writing playbook from operator edits and reply outcomes."""
    summary = feedback.learn([store.load(cid) for cid in store.list_ids()], force=True)
    if summary is None:
        print(f"Not enough evidence yet (need {feedback.MIN_EVIDENCE} signals).")
        return
    for key in ("playbook", "reply_playbook"):
        if summary.get(key):
            print(f"{key}:")
            for r in summary[key]:
                print(f"  - {r}")
    for key in ("retired", "spawned"):
        if summary.get(key):
            print(f"{key} writers: {', '.join(summary[key])}")


def cmd_stats(a):
    rows = feedback.outcomes([store.load(cid) for cid in store.list_ids()])
    data = feedback.load()
    print(f"Sent openers: {len(rows)}, operator edits: {len(data['edits'])}")
    print("Reply rate by writer:")
    for writer, (replied, sent) in sorted(feedback.writer_stats(rows).items()):
        print(f"  {writer:<16}{replied}/{sent}  {100 * replied / sent:.0f}%")
    edits_by_writer = Counter(e["writer"] for e in data["edits"])
    if edits_by_writer:
        print("Edits needed by writer:")
        for writer, n in edits_by_writer.most_common():
            print(f"  {writer:<16}{n}")
    print("Active writers: " + ", ".join(data["writers"]))
    if data["retired"]:
        print("Retired writers: " + ", ".join(data["retired"]))
    asks = feedback.ask_stats([store.load(cid) for cid in store.list_ids()])
    if asks:
        print("Asks that led to referral/interview:")
        for ask, (adv, n) in sorted(asks.items()):
            print(f"  {ask:<16}{adv}/{n}")
    if data["playbook"]:
        print("Opener playbook:")
        for r in data["playbook"]:
            print(f"  - {r}")
    if data["reply_playbook"]:
        print("Reply playbook:")
        for r in data["reply_playbook"]:
            print(f"  - {r}")


def cmd_list(a):
    if not a.candidate:
        for cid in store.list_ids():
            print(cid)
        return
    c = store.load(a.candidate)
    for p in c.prospects:
        print(f"{p.id:<32} {p.status:<14} {p.bucket.value:<17} {p.full_name} ({p.company})")


def main(argv=None):
    ap = argparse.ArgumentParser(prog="outreach")
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("candidate-add", help="Create a candidate from CV / LinkedIn PDFs")
    s.add_argument("--name")
    s.add_argument("--cv", required=True)
    s.add_argument("--linkedin")
    s.add_argument("--roles", required=True, help="Comma separated")
    s.add_argument("--companies", required=True, help="Comma separated")
    s.add_argument("--locations", default="")
    s.add_argument("--industries", default="")
    s.add_argument("--story", help="JSON file with intake answers")
    s.add_argument("--tier", choices=["self_send", "done_for_you"], default="self_send")
    s.set_defaults(fn=cmd_candidate_add)

    s = sub.add_parser("discover", help="Find prospects via Brave Search")
    s.add_argument("candidate")
    s.add_argument("--company")
    s.add_argument("--per-company", type=int, default=10)
    s.set_defaults(fn=cmd_discover)

    s = sub.add_parser("prospect-add", help="Enrich a prospect from a LinkedIn PDF")
    s.add_argument("candidate")
    s.add_argument("--pdf", required=True)
    s.add_argument("--id", help="Existing discovered prospect id")
    s.add_argument("--posts", help="Text file with pasted recent posts")
    s.add_argument("--url")
    s.add_argument("--bucket", choices=[b.value for b in Bucket], default="other")
    s.set_defaults(fn=cmd_prospect_add)

    s = sub.add_parser("generate", help="Find hooks and write Message 1 for enriched prospects")
    s.add_argument("candidate")
    s.add_argument("--id")
    s.set_defaults(fn=cmd_generate)

    s = sub.add_parser("approve", help="Approve (optionally edit) the latest draft")
    s.add_argument("candidate")
    s.add_argument("id")
    s.add_argument("--body")
    s.add_argument("--alt", type=int, help="Use alternative draft N instead of the judge's pick")
    s.set_defaults(fn=cmd_approve)

    s = sub.add_parser("status", help="Set prospect status")
    s.add_argument("candidate")
    s.add_argument("id")
    s.add_argument("status", choices=STATUSES)
    s.set_defaults(fn=cmd_status)

    s = sub.add_parser("reply", help="Log their reply and draft the next message")
    s.add_argument("candidate")
    s.add_argument("id")
    s.add_argument("--text", required=True)
    s.set_defaults(fn=cmd_reply)

    s = sub.add_parser("export", help="CSV of prospects and messages (Tier 1 interim)")
    s.add_argument("candidate")
    s.add_argument("--out")
    s.set_defaults(fn=cmd_export)

    s = sub.add_parser("funnel", help="Funnel metrics for a candidate")
    s.add_argument("candidate")
    s.set_defaults(fn=cmd_funnel)

    s = sub.add_parser("import-csv", help="Import a people list from CSV (any enrichment columns)")
    s.add_argument("candidate")
    s.add_argument("file")
    s.set_defaults(fn=cmd_import_csv)

    s = sub.add_parser("enrich-web", help="Enrich discovered prospects from public web results (no LinkedIn login)")
    s.add_argument("candidate")
    s.add_argument("--id")
    s.add_argument("--min-facts", type=int, default=3, help="Facts needed to mark a prospect enriched")
    s.set_defaults(fn=cmd_enrich_web)

    s = sub.add_parser("export-lgm", help="CSV of approved openers for LGM audience import")
    s.add_argument("candidate")
    s.add_argument("--out")
    s.set_defaults(fn=cmd_export_lgm)

    s = sub.add_parser("settings", help="Auto-send follow-ups and reply delay")
    s.add_argument("candidate")
    s.add_argument("--auto-send", choices=["on", "off"])
    s.add_argument("--delay", type=int, help="Minutes to wait after their reply")
    s.set_defaults(fn=cmd_settings)

    s = sub.add_parser("inbound-add", help="Add a reply to the inbox queue (normally Chrome does this)")
    s.add_argument("--linkedin-url")
    s.add_argument("--name")
    s.add_argument("--text", required=True)
    s.set_defaults(fn=cmd_inbound_add)

    s = sub.add_parser("sync", help="Process new replies, queue follow-ups, record sends")
    s.set_defaults(fn=cmd_sync)

    s = sub.add_parser("outbox", help="Messages due to send")
    s.add_argument("--all", action="store_true", help="Include ones not yet due")
    s.set_defaults(fn=cmd_outbox)

    s = sub.add_parser("mark-sent", help="Mark an outbox message as sent")
    s.add_argument("row_id")
    s.set_defaults(fn=cmd_mark_sent)

    s = sub.add_parser("learn", help="Update the writing playbook from edits and outcomes")
    s.set_defaults(fn=cmd_learn)

    s = sub.add_parser("stats", help="Writer agent performance and current playbook")
    s.set_defaults(fn=cmd_stats)

    s = sub.add_parser("list", help="List candidates, or prospects for one candidate")
    s.add_argument("candidate", nargs="?")
    s.set_defaults(fn=cmd_list)

    a = ap.parse_args(argv)
    a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
