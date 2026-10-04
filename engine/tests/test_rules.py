from outreach.discovery import _parse_title
from outreach.hooks import rank, validate
from outreach.messages import check_opener
from outreach.models import Fact, HookDraft


def _fact(id_, owner):
    return Fact(id=id_, owner=owner, kind="employer", text="x", source="test")


def _hook(c, p, s=4):
    return HookDraft(hook_type="shared_employer", summary="s", candidate_fact_id=c, prospect_fact_id=p,
                     specificity=s, rarity=s, relevance=s, recency=s)


def test_validate_drops_uncited_hooks():
    cf, pf = [_fact("c:1", "candidate")], [_fact("p:a:1", "prospect")]
    drafts = [_hook("c:1", "p:a:1"), _hook("c:9", "p:a:1"), _hook("c:1", "p:a:9")]
    assert len(validate(drafts, cf, pf)) == 1


def test_rank_selects_best_and_drops_weak():
    ranked = rank([_hook("c:1", "p:1", 3), _hook("c:2", "p:2", 5), _hook("c:3", "p:3", 1)])
    assert [h.candidate_fact_id for h in ranked] == ["c:2", "c:1"]
    assert ranked[0].selected and not ranked[1].selected


def test_good_opener_passes():
    body = ("Hey Rahul, noticed you moved from Flipkart into product at Zepto. I'm making a similar jump "
            "from consumer brands into product. Curious, what was the biggest adjustment for you?")
    assert check_opener(body, "Rahul") == []


def test_opener_rejects_asks_and_spam():
    body = "Hi Rahul! I came across your profile and would love a referral for the PM opening."
    problems = " ".join(check_opener(body, "Rahul"))
    assert "exclamation" in problems
    assert "came across your profile" in problems
    assert "ask" in problems


def test_opener_rejects_missing_name_and_length():
    problems = " ".join(check_opener("Hello there, " + "a" * 300, "Priya"))
    assert "Too long" in problems and "Priya" in problems


def test_parse_linkedin_title():
    assert _parse_title("Rahul Shah - Product Manager - Zepto | LinkedIn") == ("Rahul Shah", "Product Manager - Zepto")


def test_web_facts_uses_profile_slug_and_dedupes(monkeypatch):
    from outreach import discovery, llm
    from outreach.models import ExtractedFact, Prospect, WebSnippets
    queries = []

    def search(q, count=20):
        queries.append(q)
        return [{"url": "https://www.linkedin.com/posts/rahulshah_pricing-123", "title": "Rahul on pricing", "description": "Why we killed discounts"}]

    seen = {}

    def parse(system, content, schema, effort="medium"):
        seen["content"] = content
        return WebSnippets(facts=[ExtractedFact(kind="post", text="Posted that Zepto killed blanket discounts")])

    monkeypatch.setattr(discovery, "brave_search", search)
    monkeypatch.setattr(llm, "parse", parse)
    p = Prospect(id="r", full_name="Rahul Shah", company="Zepto", linkedin_url="https://in.linkedin.com/in/rahulshah/")
    facts = discovery.web_facts(p)
    assert queries[0] == "site:linkedin.com/posts/rahulshah"
    assert seen["content"].count("rahulshah_pricing-123") == 1
    assert facts[0].kind == "post"
