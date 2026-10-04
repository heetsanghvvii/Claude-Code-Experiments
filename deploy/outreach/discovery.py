"""Find prospects from public search results. Never logs into LinkedIn."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass

import httpx

from . import llm, prompts
from .models import BucketDecision, Candidate, ExtractedFact, Prospect, WebSnippets

BRAVE_URL = "https://api.search.brave.com/res/v1/web/search"

# Title keywords per bucket, used to build search queries.
QUERY_TEMPLATES = [
    '"{role}" "{company}"',
    '"Head of" OR "Director" OR "Group" "{role_family}" "{company}"',
    '"Talent Acquisition" OR "Recruiter" "{company}"',
]


@dataclass
class SearchHit:
    full_name: str
    headline: str
    linkedin_url: str
    snippet: str
    company: str


def _role_family(role: str) -> str:
    words = role.split()
    return words[-1] if len(words) > 1 else role


def _parse_title(title: str) -> tuple[str, str]:
    # LinkedIn result titles look like "Name - Title - Company | LinkedIn"
    title = re.sub(r"\s*\|\s*LinkedIn.*$", "", title)
    parts = [p.strip() for p in re.split(r"\s+[-–—]\s+", title) if p.strip()]
    if not parts:
        return "", ""
    return parts[0], " - ".join(parts[1:])


def brave_search(query: str, count: int = 20) -> list[dict]:
    """Brave Search when BRAVE_API_KEY is set (about 1,000 free searches/month), else Claude web search."""
    key = os.environ.get("BRAVE_API_KEY")
    if not key:
        return llm.web_search(query, max_results=count)
    response = httpx.get(
        BRAVE_URL,
        params={"q": query, "count": count},
        headers={"X-Subscription-Token": key, "Accept": "application/json"},
        timeout=30,
    )
    response.raise_for_status()
    return response.json().get("web", {}).get("results", [])


def search_company(candidate: Candidate, company: str) -> list[SearchHit]:
    hits: dict[str, SearchHit] = {}
    location = candidate.locations[0] if candidate.locations else ""
    for role in candidate.target_roles or ["Product Manager"]:
        for template in QUERY_TEMPLATES:
            q = "site:linkedin.com/in " + template.format(
                role=role, company=company, role_family=_role_family(role)
            )
            if location:
                q += f' "{location}"'
            for r in brave_search(q):
                url = r.get("url", "").split("?")[0]
                if "linkedin.com/in/" not in url or url in hits:
                    continue
                name, headline = _parse_title(r.get("title", ""))
                if not name:
                    continue
                hits[url] = SearchHit(name, headline, url, r.get("description", ""), company)
    return list(hits.values())


def classify(candidate: Candidate, hit: SearchHit) -> BucketDecision:
    candidate_summary = "\n".join(f"- {f.text}" for f in candidate.facts if f.kind in ("education", "employer"))
    text = (
        f"Candidate target roles: {', '.join(candidate.target_roles)}\n"
        f"Candidate background:\n{candidate_summary}\n\n"
        f"Person at {hit.company}:\nName: {hit.full_name}\nHeadline: {hit.headline}\nSnippet: {hit.snippet}"
    )
    return llm.parse(prompts.CLASSIFY_BUCKET, text, BucketDecision, effort="low")


def _slug(linkedin_url: str) -> str:
    m = re.search(r"linkedin\.com/in/([^/?#]+)", linkedin_url or "")
    return m.group(1) if m else ""


def web_facts(prospect: Prospect) -> list[ExtractedFact]:
    """Our own enrichment: public posts, talks and articles via search. No LinkedIn login."""
    queries = [f'site:linkedin.com/posts "{prospect.full_name}"', f'"{prospect.full_name}" "{prospect.company}"']
    slug = _slug(prospect.linkedin_url)
    if slug:
        queries.insert(0, f"site:linkedin.com/posts/{slug}")
    seen, lines = set(), []
    for q in queries:
        for r in brave_search(q, count=10):
            url = r.get("url", "")
            if url in seen:
                continue
            seen.add(url)
            lines.append(f"- {r.get('title', '')} | {r.get('description', '')} | {url}")
    if not lines:
        return []
    text = (f"Person: {prospect.full_name}, {prospect.headline} at {prospect.company}\n"
            f"LinkedIn: {prospect.linkedin_url}\n\nSEARCH RESULTS:\n" + "\n".join(lines[:30]))
    return llm.parse(prompts.WEB_FACTS, text, WebSnippets, effort="low").facts
