"""Thin wrapper over the Anthropic SDK for structured calls."""

from __future__ import annotations

import base64
import os
from pathlib import Path
from typing import TypeVar

import anthropic
from pydantic import BaseModel

MODEL = os.environ.get("OUTREACH_MODEL", "claude-opus-5-5")

T = TypeVar("T", bound=BaseModel)

_client: anthropic.Anthropic | None = None


class RefusedError(RuntimeError):
    pass


def client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic()
    return _client


def pdf_block(path: str | Path) -> dict:
    data = base64.standard_b64encode(Path(path).read_bytes()).decode()
    return {
        "type": "document",
        "source": {"type": "base64", "media_type": "application/pdf", "data": data},
    }


def parse(system: str, content: list[dict] | str, schema: type[T], effort: str = "medium") -> T:
    """One structured call. Falls back server-side if the primary model declines."""
    response = client().beta.messages.parse(
        model=MODEL,
        max_tokens=16000,
        system=system,
        messages=[{"role": "user", "content": content}],
        output_format=schema,
        output_config={"effort": effort},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )
    if response.stop_reason == "refusal":
        raise RefusedError(str(response.stop_details))
    if response.parsed_output is None:
        raise RuntimeError(f"No structured output (stop_reason={response.stop_reason})")
    return response.parsed_output


class _Result(BaseModel):
    title: str
    url: str
    description: str


class _Results(BaseModel):
    results: list[_Result]


def web_search(query: str, max_results: int = 10) -> list[dict]:
    """Search via Claude's server-side web search tool. Used when no Brave key is set."""
    response = client().beta.messages.parse(
        model=MODEL,
        max_tokens=16000,
        system="Run the web search exactly as given and return the results you found. Do not invent results.",
        messages=[{"role": "user", "content": f"Search: {query}\nReturn up to {max_results} results."}],
        tools=[{"type": "web_search_20260209", "name": "web_search", "max_uses": 2}],
        output_format=_Results,
        output_config={"effort": "low"},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )
    if response.parsed_output is None:
        return []
    return [r.model_dump() for r in response.parsed_output.results]
