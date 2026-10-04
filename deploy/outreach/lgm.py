"""La Growth Machine API client. Needs the Pro plan (API access) and LGM_API_KEY.

Not used by the Chrome bridge; this is the drop-in for when Tier 2 volume justifies Pro.
Endpoints from LGM's public API (base https://apiv2.lagrowthmachine.com/flow, apikey query param).
"""

from __future__ import annotations

import os

import httpx

BASE_URL = "https://apiv2.lagrowthmachine.com/flow"


def _call(method: str, path: str, body: dict | None = None, params: dict | None = None):
    key = os.environ.get("LGM_API_KEY")
    if not key:
        raise RuntimeError("Set LGM_API_KEY (LGM Pro plan: Settings > Integrations & API)")
    r = httpx.request(method, f"{BASE_URL}{path}", params={"apikey": key, **(params or {})}, json=body, timeout=30)
    r.raise_for_status()
    return r.json() if r.content else None


def add_lead(audience: str, linkedin_url: str, firstname: str, lastname: str, company: str,
             job_title: str, message_1: str):
    """Create or update a lead in an audience, with Message 1 as a custom field for the invite note."""
    return _call("POST", "/leads", {
        "audience": audience, "linkedinUrl": linkedin_url, "firstname": firstname, "lastname": lastname,
        "companyName": company, "jobTitle": job_title, "customFields": {"message_1": message_1},
    })


def send_linkedin_message(identity_id: str, member_id: str, linkedin_url: str, message: str):
    return _call("POST", "/inbox/linkedin", {
        "identityId": identity_id, "memberId": member_id, "linkedinUrl": linkedin_url, "message": message,
    })


def lead_conversations(lead_id: str):
    return _call("GET", f"/leads/{lead_id}/conversations")


def create_inbox_webhook(url: str, name: str):
    return _call("POST", "/inboxWebhooks", {"url": url, "name": name, "campaigns": ["all"]})
