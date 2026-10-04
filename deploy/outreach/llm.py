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


# USD per million tokens / per search, for cost reporting (Claude Opus 5.5 list prices).
PRICES = {"input": 4.00, "output": 20.00, "cache_read": 0.20, "web_search": 0.01}

USAGE = {"calls": 0, "input": 0, "output": 0, "cache_read": 0, "web_searches": 0}


class RefusedError(RuntimeError):
    pass


def record_usage(usage) -> None:
    """Accumulate token usage from a response so commands can report what they cost."""
    if usage is None:
        return
    USAGE["calls"] += 1
    USAGE["input"] += getattr(usage, "input_tokens", 0) or 0
    USAGE["output"] += getattr(usage, "output_tokens", 0) or 0
    USAGE["cache_read"] += getattr(usage, "cache_read_input_tokens", 0) or 0
    server = getattr(usage, "server_tool_use", None)
    USAGE["web_searches"] += (getattr(server, "web_search_requests", 0) or 0) if server else 0


def cost_usd(u: dict | None = None) -> float:
    u = u or USAGE
    return round((u["input"] * PRICES["input"] + u["output"] * PRICES["output"]
                  + u["cache_read"] * PRICES["cache_read"]) / 1_000_000
                 + u["web_searches"] * PRICES["web_search"], 4)


def reset_usage() -> None:
    for k in USAGE:
        USAGE[k] = 0


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
    record_usage(response.usage)
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
    record_usage(response.usage)
    if response.parsed_output is None:
        return []
    return [r.model_dump() for r in response.parsed_output.results]
