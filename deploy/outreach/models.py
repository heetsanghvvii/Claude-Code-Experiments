"""Data models. LLM output schemas and stored records share these types."""

from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Bucket(str, Enum):
    hiring_manager = "hiring_manager"
    team_member = "team_member"
    recruiter = "recruiter"
    alumni = "alumni"
    senior_connector = "senior_connector"
    other = "other"


FactKind = Literal[
    "education", "employer", "role_change", "project", "post",
    "location", "skill", "award", "community", "other",
]


# ---------- LLM output schemas ----------

class ExtractedFact(BaseModel):
    kind: FactKind
    text: str = Field(description="One specific, verifiable fact in plain English, with names, dates and numbers.")


class ExtractedProfile(BaseModel):
    full_name: str
    headline: str
    current_company: str
    current_title: str
    location: str
    facts: list[ExtractedFact]


class BucketDecision(BaseModel):
    bucket: Bucket
    reason: str
    keep: bool = Field(description="False if this person is irrelevant to the candidate's target role.")


class HookDraft(BaseModel):
    hook_type: Literal[
        "shared_school", "shared_employer", "similar_transition", "relevant_work",
        "post_reaction", "shared_geo", "shared_interest",
    ]
    summary: str = Field(description="One line: why these two people have a real reason to talk.")
    candidate_fact_id: str
    prospect_fact_id: str
    specificity: int = Field(ge=1, le=5)
    rarity: int = Field(ge=1, le=5)
    relevance: int = Field(ge=1, le=5)
    recency: int = Field(ge=1, le=5)


class HookSet(BaseModel):
    hooks: list[HookDraft]


class OpenerDraft(BaseModel):
    body: str
    style: Literal["question", "observation"]


class DraftVerdict(BaseModel):
    draft_index: int
    reply_likelihood: int = Field(ge=1, le=5, description="How likely this exact person replies.")
    specificity: int = Field(ge=1, le=5)
    human_feel: int = Field(ge=1, le=5, description="5 = indistinguishable from a thoughtful peer.")
    critique: str = Field(description="One line: the main weakness.")


class JudgeResult(BaseModel):
    verdicts: list[DraftVerdict]
    winner_index: int
    reason: str


class Playbook(BaseModel):
    rules: list[str] = Field(description="Short, concrete writing rules learned from the evidence. Max 15.")


class WriterAngle(BaseModel):
    name: str = Field(description="snake_case name, 1 to 3 words")
    angle: str = Field(description="One or two sentences: the specific approach this writer takes.")


class WebSnippets(BaseModel):
    facts: list[ExtractedFact]


class ReplyAnalysis(BaseModel):
    sentiment: Literal["warm", "neutral", "deflecting", "redirecting", "negative"]
    rapport: int = Field(ge=1, le=5, description="1 = cold, 5 = clearly happy to help.")
    redirect_to: str = Field(description="Person they pointed to, or empty string.")
    ask_type: Literal["none", "opening", "referral", "hiring_manager", "advice", "intro"]
    ask_reason: str
    next_message: str


# ---------- Stored records ----------

class Fact(BaseModel):
    id: str
    owner: Literal["candidate", "prospect"]
    kind: FactKind
    text: str
    source: str


class Hook(HookDraft):
    score: float
    selected: bool = False


class Message(BaseModel):
    direction: Literal["outbound", "inbound"]
    step: int
    body: str
    ask_type: str = "none"
    style: str = ""
    writer: str = ""
    judge_reason: str = ""
    alternatives: list[str] = []
    alternative_writers: list[str] = []
    approved: bool = False
    edited: bool = False
    send_after: str = ""             # ISO time; set when queued for sending
    sent_at: str = ""
    created_at: str


class Prospect(BaseModel):
    id: str
    full_name: str
    headline: str = ""
    company: str = ""
    linkedin_url: str = ""
    location: str = ""
    bucket: Bucket = Bucket.other
    bucket_reason: str = ""
    status: str = "discovered"
    source: str = "manual"
    exported_at: str = ""            # when the opener was handed to LGM
    facts: list[Fact] = []
    hooks: list[Hook] = []
    messages: list[Message] = []


class Candidate(BaseModel):
    id: str
    full_name: str
    tier: Literal["self_send", "done_for_you"] = "self_send"
    target_roles: list[str] = []
    target_companies: list[str] = []
    locations: list[str] = []
    industries: list[str] = []
    story: dict = {}
    headline: str = ""
    auto_send: bool = False          # follow-ups go to the outbox without human approval
    reply_delay_minutes: int = 45    # wait this long after their reply before sending ours
    facts: list[Fact] = []
    prospects: list[Prospect] = []
