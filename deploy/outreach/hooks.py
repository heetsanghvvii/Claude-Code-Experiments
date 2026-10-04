"""Hook engine: find, validate and rank reasons for two people to talk."""

from __future__ import annotations

from . import llm, prompts
from .models import Candidate, Fact, Hook, HookDraft, HookSet, Prospect

# Relevance and specificity matter most; rarity next; recency is a tiebreaker.
WEIGHTS = {"specificity": 0.3, "rarity": 0.25, "relevance": 0.3, "recency": 0.15}

# Minimum score (1 to 5 scale) for a hook to be used at all.
MIN_SCORE = 2.5


def _fact_lines(facts: list[Fact]) -> str:
    return "\n".join(f"[{f.id}] ({f.kind}) {f.text}" for f in facts)


def score(h: HookDraft) -> float:
    return round(sum(getattr(h, k) * w for k, w in WEIGHTS.items()), 2)


def validate(drafts: list[HookDraft], candidate_facts: list[Fact], prospect_facts: list[Fact]) -> list[HookDraft]:
    """Drop any hook that does not cite a real fact on both sides."""
    c_ids = {f.id for f in candidate_facts}
    p_ids = {f.id for f in prospect_facts}
    return [h for h in drafts if h.candidate_fact_id in c_ids and h.prospect_fact_id in p_ids]


def rank(drafts: list[HookDraft]) -> list[Hook]:
    hooks = sorted((Hook(**h.model_dump(), score=score(h)) for h in drafts), key=lambda h: h.score, reverse=True)
    hooks = [h for h in hooks if h.score >= MIN_SCORE]
    if hooks:
        hooks[0].selected = True
    return hooks


def find(candidate: Candidate, prospect: Prospect) -> list[Hook]:
    text = (
        f"Candidate target roles: {', '.join(candidate.target_roles)}\n"
        f"Prospect: {prospect.full_name}, {prospect.headline} at {prospect.company}\n\n"
        f"CANDIDATE FACTS:\n{_fact_lines(candidate.facts)}\n\n"
        f"PROSPECT FACTS:\n{_fact_lines(prospect.facts)}"
    )
    result = llm.parse(prompts.FIND_HOOKS, text, HookSet, effort="high")
    return rank(validate(result.hooks, candidate.facts, prospect.facts))
