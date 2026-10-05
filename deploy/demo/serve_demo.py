"""Run the Knock site and operator CRM locally on fictional demo data (used for screenshots).

    cd deploy && ./build.sh && PYTHONPATH=.:../engine python demo/serve_demo.py

Serves http://127.0.0.1:8765 (landing page at /, CRM at /crm/, password "demo").
Nothing touches a real Supabase: outreach.store's HTTP layer is replaced by an in-memory fake.
"""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

for k, v in {"SUPABASE_URL": "https://x.supabase.co", "SUPABASE_KEY": "x", "ENGINE_TOKEN": "x",
             "CRM_PASSWORD": "demo", "CRON_SECRET": "x"}.items():
    os.environ[k] = v

DEPLOY = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(DEPLOY), str(DEPLOY.parent / "engine"), str(DEPLOY.parent / "engine" / "tests")]

import uvicorn  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402
from test_bridge import FakePostgrest  # noqa: E402

from outreach import store  # noqa: E402
from outreach.models import Candidate, Fact, Hook, Message, Prospect  # noqa: E402

fake = FakePostgrest()
fake.tables["intake_requests"] = []


def _request(method, url, params=None, json=None, headers=None, timeout=None):
    # The fake asserts the test credentials; the demo env uses "x", so present the expected ones.
    return fake(method, url, params=params, json=json, headers={"x-engine-token": "eng_x", "apikey": "sb_publishable_x"})


store.httpx.request = _request  # same effect as the monkeypatch in deploy/tests/test_api.py

NOW = datetime.now(timezone.utc).replace(microsecond=0)
iso = lambda delta_h=0, delta_m=0: (NOW + timedelta(hours=delta_h, minutes=delta_m)).isoformat()
LI = "https://www.linkedin.com/in/"


def out(body, step=1, writer="curious_peer", sent_h=None, approved=True, send_after="", ask="none", edited=False):
    return Message(direction="outbound", step=step, body=body, writer=writer, approved=approved, ask_type=ask,
                   sent_at=iso(sent_h) if sent_h is not None else "", send_after=send_after, created_at=iso(-80), edited=edited)


def inn(body, h):
    return Message(direction="inbound", step=1, body=body, created_at=iso(h))


def hook(summary, kind="similar_transition"):
    return Hook(hook_type=kind, summary=summary, candidate_fact_id="c:1", prospect_fact_id="p:1",
                specificity=4, rarity=3, relevance=4, recency=3, score=4.1, selected=True)


def P(pid, name, headline, company, bucket, status, hook_text, msgs=(), kind="similar_transition"):
    return Prospect(id=pid, full_name=name, headline=headline, company=company, bucket=bucket, status=status,
                    linkedin_url=f"{LI}{pid}", hooks=[hook(hook_text, kind)], messages=list(msgs))


# ---- Candidate 1: career switcher (teacher to product design) ----
ananya = Candidate(
    id="ananya-rao-a1b2c3", full_name="Ananya Rao", tier="self_send", auto_send=True, reply_delay_minutes=30,
    target_roles=["Product Designer", "UX Designer"], target_companies=["Lumen Freight", "Orchard Pay", "Tidewater Health"],
    locations=["Bengaluru"], headline="Former maths teacher moving into product design",
    facts=[Fact(id="c:1", owner="candidate", kind="role_change", text="Taught maths for 7 years, now designing", source="cv")],
    prospects=[
        P("meera-pillai", "Meera Pillai", "Design Lead", "Lumen Freight", "hiring_manager", "interview",
          "Also moved into design from teaching in 2019",
          [out("Hi Meera, you moved from teaching into design too. What was the first project that made it feel real?", sent_h=-70),
           inn("Honestly a timetable app for a school. Happy to chat, send me your portfolio.", -60),
           out("That is a lovely first project. I have a case study on exam scheduling, sending it now. Could we do 15 minutes this week?", 2, "shared_path", sent_h=-58, ask="advice"),
           inn("Sure. I also mentioned you to our recruiter, she will email you.", -40)]),
    P("dev-kulkarni", "Dev Kulkarni", "Senior Product Designer", "Orchard Pay", "team_member", "referral",
      "Both worked on accessibility for school software",
      [out("Hi Dev, your talk on accessible forms stayed with me. How do you test with real users on a small team?", writer="sharp_observer", sent_h=-90),
       inn("We do guerrilla sessions at the cafe next door. Happy to help however I can.", -75),
       out("Thank you, that is useful. Would you be open to referring me for the open product design role?", 2, "shared_path", sent_h=-70, ask="referral"),
       inn("Done, I submitted your name this morning.", -30)], "shared_interest"),
    P("sana-farooqui", "Sana Farooqui", "Product Design Manager", "Tidewater Health", "hiring_manager", "conversation",
      "Hired two career switchers last year",
      [out("Hi Sana, I read that you hired two career switchers last year. What did their portfolios show that convinced you?", writer="shared_path", sent_h=-50),
       inn("Honest process notes more than polish. Why do you ask?", -36),
       out("Because I am one, and I would rather show my thinking than a glossy final screen. May I share a short walkthrough?", 2, "curious_peer", approved=False, ask="advice")]),
    P("rohan-bhat", "Rohan Bhat", "UX Researcher", "Lumen Freight", "team_member", "replied",
      "Runs research ops for the logistics app",
      [out("Hi Rohan, how does your team decide which driver complaints become research studies?", writer="sharp_observer", sent_h=-30),
       inn("Mostly volume plus severity. What is your background?", -12)]),
    P("isha-menon", "Isha Menon", "Recruiter", "Orchard Pay", "recruiter", "accepted", "Recruits for design and research roles",
      [out("Hi Isha, I am a teacher turned designer exploring Orchard Pay. What does a strong first call look like for you?", writer="curious_peer", sent_h=-26)], "relevant_work"),
    P("karan-joshi", "Karan Joshi", "Staff Designer", "Tidewater Health", "senior_connector", "sent", "Writes about designing for clinics",
      [out("Hi Karan, your post on clinic waiting-room screens made me rethink queue design. Did patients respond to the change?", writer="sharp_observer", sent_h=-20)], "post_reaction"),
    P("leela-nair", "Leela Nair", "Design Director", "Orchard Pay", "senior_connector", "no_response", "Spoke at a design conference in Bengaluru",
      [out("Hi Leela, I enjoyed your talk on design systems at small companies. How did you decide what to leave out?", writer="shared_path", sent_h=-190)], "shared_geo"),
    P("arjun-sethi", "Arjun Sethi", "Product Designer", "Lumen Freight", "alumni", "message_ready", "Same teacher training programme alumnus",
      [out("Hi Arjun, we both came through the same teacher training programme. What made you leave the classroom?", writer="shared_path", approved=False)], "shared_school"),
    P("tara-dsouza", "Tara D'Souza", "Product Designer", "Tidewater Health", "team_member", "message_ready", "Built the patient intake flow",
      [out("Hi Tara, the intake flow you shipped looks calm. What did you cut to get there?", writer="curious_peer", approved=False)], "relevant_work"),
    ],
)

# ---- Candidate 2: laid-off professional (operations manager) ----
vikram = Candidate(
    id="vikram-iyer-d4e5f6", full_name="Vikram Iyer", tier="done_for_you", auto_send=False, reply_delay_minutes=45,
    target_roles=["Operations Manager", "Supply Chain Lead"], target_companies=["Harbor & Pine", "Northgate Foods", "Brightline Logistics"],
    locations=["Pune", "Mumbai"], headline="Operations manager, laid off in the August restructuring",
    facts=[Fact(id="c:1", owner="candidate", kind="employer", text="Ran warehouse operations for 9 years", source="cv")],
    prospects=[
    P("neelam-gupta", "Neelam Gupta", "VP Operations", "Harbor & Pine", "hiring_manager", "interview", "Scaled a warehouse network from 3 to 11 sites",
      [out("Hi Neelam, scaling from 3 to 11 sites is hard. What broke first when you opened the fourth?", writer="curious_peer", sent_h=-120),
       inn("Slotting and shift handovers. Send me your CV, we are hiring.", -100),
       out("Thank you. CV attached. I cut pick travel by 22 percent at my last site, happy to walk you through how.", 2, "curious_peer", sent_h=-96, ask="opening"),
       inn("Interview with our hiring panel on Thursday, my assistant will confirm.", -50)], "relevant_work"),
    P("sameer-khan", "Sameer Khan", "Head of Supply Chain", "Northgate Foods", "hiring_manager", "referral", "Also laid off in 2023 and rebuilt",
      [out("Hi Sameer, I saw you rebuilt after a layoff in 2023. What helped most in the first month?", writer="shared_path", sent_h=-140),
       inn("Talking to people, not applying. Ask me anything.", -120),
       out("That is the plan. Would you share my profile with your operations leads?", 2, "shared_path", sent_h=-110, ask="referral"),
       inn("Forwarded to two leads this morning.", -26)]),
    P("pooja-reddy", "Pooja Reddy", "Operations Manager", "Brightline Logistics", "team_member", "conversation", "Same city, same industry",
      [out("Hi Pooja, fellow Pune operations person here. How is the fleet-utilisation project going?", writer="curious_peer", sent_h=-60),
       inn("Slowly, but it is going. What brings you to Brightline?", -44),
       out("Your team's results on dock-to-stock time. I would like to understand how you got there.", 2, "sharp_observer", approved=False, ask="advice")], "shared_geo"),
    P("anil-desai", "Anil Desai", "Recruiter", "Harbor & Pine", "recruiter", "replied", "Recruits operations managers",
      [out("Hi Anil, which operations roles at Harbor & Pine are most urgent this quarter?", writer="sharp_observer", sent_h=-40),
       inn("Two sites open, I can share details by email.", -20)], "relevant_work"),
    P("rekha-shetty", "Rekha Shetty", "Plant Manager", "Northgate Foods", "team_member", "accepted", "Moved from warehousing to plant ops",
      [out("Hi Rekha, you moved from warehousing into plant operations. What transferred, and what did not?", writer="curious_peer", sent_h=-30)]),
    P("imran-qureshi", "Imran Qureshi", "Director, Logistics", "Brightline Logistics", "senior_connector", "sent", "Posts weekly on cold-chain lessons",
      [out("Hi Imran, your note on cold-chain handovers matched what I saw in a past role. Do you audit handovers weekly?", writer="sharp_observer", sent_h=-18)], "post_reaction"),
    P("farah-ali", "Farah Ali", "Supply Planner", "Harbor & Pine", "team_member", "no_response", "Alumna of the same engineering college",
      [out("Hi Farah, fellow alumnus here. How did you move from the shop floor into planning?", writer="shared_path", sent_h=-220)], "shared_school"),
    P("gaurav-more", "Gaurav More", "COO", "Brightline Logistics", "senior_connector", "no_response", "Keynote on resilient supply chains",
      [out("Hi Gaurav, your keynote on resilient supply chains made one point stick. How do you pick which supplier to dual-source?", writer="curious_peer", sent_h=-260)], "post_reaction"),
    P("hema-kapoor", "Hema Kapoor", "Operations Lead", "Northgate Foods", "team_member", "message_ready", "Runs a night-shift distribution centre",
      [out("Hi Hema, how do you keep night-shift handovers clean at a busy distribution centre?", writer="sharp_observer", approved=False)]),
    ],
)
for c in (ananya, vikram):
    store.save(c)

store.put_doc("usage", [
    {"at": iso(-24 * 9 + h), "command": cmd, "candidate": cand, "calls": calls, "input": calls * 6200, "output": calls * 540, "usd": usd}
    for h, cmd, cand, calls, usd in [
        (0, "discover", ananya.id, 38, 1.214), (3, "profiles", ananya.id, 52, 1.488), (9, "hooks", ananya.id, 44, 0.972),
        (14, "openers", ananya.id, 36, 1.105), (30, "discover", vikram.id, 41, 1.302), (34, "profiles", vikram.id, 57, 1.611),
        (40, "hooks", vikram.id, 46, 1.018), (46, "openers", vikram.id, 39, 1.19), (120, "sync", None, 6, 0.164),
        (150, "learn", None, 9, 0.287), (180, "sync", None, 5, 0.131), (200, "sync", None, 4, 0.118)]
])
store.put_doc("feedback", {
    "writers": {
        "curious_peer": "Curious about one specific decision or change in their career.",
        "sharp_observer": "One sharp observation about their work, tied to your own experience.",
        "shared_path": "Lead with the concrete thing you share, then one easy question.",
    },
    "retired": {"formal_intro": {"angle": "Polite, formal introduction listing credentials.", "rate": 0.04, "at": iso(-24 * 4)}},
    "playbook": ["Name one specific thing about their work in the first sentence.", "Keep openers under 45 words.",
                 "Ask one question, not two.", "Avoid compliments that could apply to anyone."],
    "playbook_history": [], "judge_misses": [{"context": "x", "judge_pick": "a", "operator_pick": "b", "at": iso(-30)}],
    "reply_playbook": ["Ask for a referral only after the person offers help or answers two questions.",
                       "Mirror their level of formality and length."],
    "edits": [{"draft": "a", "final": "b", "writer": "curious_peer", "hook_type": "x", "bucket": "team_member", "at": iso(-40)}] * 3,
    "learned_at_evidence": 10,
})

fake.tables["inbound_replies"] += [
    {"id": 1, "linkedin_url": f"{LI}rohan-bhat", "prospect_name": "Rohan Bhat", "text": "Mostly volume plus severity. What is your background?",
     "received_at": iso(-12), "processed_at": None, "result": None},
    {"id": 2, "linkedin_url": f"{LI}anil-desai", "prospect_name": "Anil Desai", "text": "Two sites open, I can share details by email.",
     "received_at": iso(-20), "processed_at": iso(-19), "result": "replied"},
    {"id": 3, "linkedin_url": f"{LI}someone-else", "prospect_name": "Chris Doyle", "text": "Sorry, who is this?",
     "received_at": iso(-48), "processed_at": iso(-47), "result": "unmatched"},
    {"id": 4, "linkedin_url": f"{LI}meera-pillai", "prospect_name": "Meera Pillai",
     "text": "Sure. I also mentioned you to our recruiter, she will email you.", "received_at": iso(-40), "processed_at": iso(-39), "result": "replied"},
]
fake.tables["outbox"] += [
    {"id": 1, "candidate_id": ananya.id, "prospect_id": "meera-pillai", "prospect_name": "Meera Pillai", "linkedin_url": f"{LI}meera-pillai", "step": 3,
     "body": "Thank you, that is kind. I will watch for her email and send the exam scheduling case study tonight.",
     "send_after": iso(-1), "sent_at": None, "processed_at": None},
    {"id": 2, "candidate_id": ananya.id, "prospect_id": "dev-kulkarni", "prospect_name": "Dev Kulkarni", "linkedin_url": f"{LI}dev-kulkarni", "step": 3,
     "body": "Thank you, Dev. I will follow the application and keep you posted on how it goes.",
     "send_after": iso(0, 25), "sent_at": None, "processed_at": None},
    {"id": 3, "candidate_id": vikram.id, "prospect_id": "sameer-khan", "prospect_name": "Sameer Khan", "linkedin_url": f"{LI}sameer-khan", "step": 3,
     "body": "That helps a lot, Sameer. I will send the two leads a short summary so it is easy to forward.",
     "send_after": iso(-26), "sent_at": iso(-25), "processed_at": iso(-25)},
]
fake.tables["intake_requests"] += [
    {"id": 1, "full_name": "Nisha Verma", "email": "nisha@example.com", "linkedin_url": None, "target_role": "Data Analyst",
     "target_companies": "Paperplane, Cobalt Retail", "city": "Hyderabad", "package": "standard",
     "created_at": iso(-3), "processed_at": None, "candidate_id": None},
    {"id": 2, "full_name": "Rahul Menon", "email": "rahul@example.com", "linkedin_url": f"{LI}rahul-demo", "target_role": "Marketing Manager",
     "target_companies": "Fernhill, Quill Media", "city": "Chennai", "package": "done_for_you",
     "created_at": iso(-9), "processed_at": None, "candidate_id": None},
    {"id": 3, "full_name": "Ananya Rao", "email": "ananya@example.com", "linkedin_url": None, "target_role": "Product Designer",
     "target_companies": "Lumen Freight, Orchard Pay", "city": "Bengaluru", "package": "full",
     "created_at": iso(-24 * 12), "processed_at": iso(-24 * 11), "candidate_id": ananya.id},
]

import api.index as api_module  # noqa: E402

app = api_module.app
app.mount("/", StaticFiles(directory=str(DEPLOY / "public"), html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8765, log_level="warning")
