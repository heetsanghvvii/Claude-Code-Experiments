#!/usr/bin/env python3
"""Scene Planner: the intelligence layer for promo video production.

Analyzes scene descriptions, infers intent, and auto-selects:
- Stock search query enhancements (mood keywords)
- Transition types and durations (via decision tree)
- SFX variety per transition
- Ken Burns direction per scene
- Audio ducking levels per scene intent
- Text position recommendations

Usage:
    scene_planner.py --scenes scenes.json --contrast-dir public/stock/ --output enhanced.json

Input JSON format:
    [{"id": "hook", "headline": "Rankenstein", "subtext": "AI SEO Engine",
      "stockQuery": "technology dark", "durationSec": 5}]

Output: Enhanced scene config with all intelligent defaults applied.
"""

import argparse
import json
import math
import re
import sys
from pathlib import Path

# ─── Scene Intent Classification ───

INTENT_KEYWORDS = {
    "hook": ["introducing", "meet", "welcome", "new", "announcing", "launch",
             "discover", "imagine", "what if"],
    "problem": ["struggling", "tired of", "problem", "challenge", "pain",
                "broken", "failing", "losing", "without", "before"],
    "feature": ["powered by", "built with", "using", "engine", "workflow",
                "automated", "one-command", "real-time", "ai-powered",
                "research", "analysis", "publish", "generate"],
    "proof": ["trusted", "used by", "customers", "results", "testimonial",
              "case study", "proven", "rated", "reviewed"],
    "cta": ["start", "try", "get started", "sign up", "join", "free",
            "download", "subscribe", "vote", "learn more", "visit"],
}

MOOD_KEYWORDS = {
    "hook": "cinematic dark dramatic slow motion",
    "problem": "tension contrast urgent busy",
    "feature": "clean professional technology smooth",
    "proof": "people team collaboration warm",
    "cta": "success growth bright upward celebration",
}

# ─── Transition Decision Tree ───

TRANSITION_RULES = [
    # (condition_fn, transition_type, duration_sec)
    # Order matters: first match wins
]

def classify_intent(headline, subtext=""):
    """Classify scene intent from text content."""
    text = f"{headline} {subtext}".lower()

    scores = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        scores[intent] = score

    # Default fallback logic
    best = max(scores, key=scores.get) if max(scores.values()) > 0 else None

    if best is None:
        # Heuristic: first scene is hook, last is cta, middle is feature
        return "feature"

    return best


def enhance_stock_query(base_query, intent):
    """Add mood keywords to stock search query based on intent."""
    mood = MOOD_KEYWORDS.get(intent, "")
    # Combine but don't duplicate words
    base_words = set(base_query.lower().split())
    mood_words = [w for w in mood.split() if w not in base_words]
    # Add top 2 mood words to keep query focused
    enhanced = base_query
    if mood_words:
        enhanced = f"{base_query} {' '.join(mood_words[:2])}"
    return enhanced


def select_transition(scene_before, scene_after):
    """Select transition type and duration based on scene context."""
    intent_before = scene_before.get("intent", "feature")
    intent_after = scene_after.get("intent", "feature")
    brightness_before = scene_before.get("avgBrightness", 0.3)
    brightness_after = scene_after.get("avgBrightness", 0.3)
    duration_after = scene_after.get("durationSec", 5)

    # Decision tree
    if intent_before == "hook" and intent_after == "problem":
        return "cut", 0.0
    if intent_after == "cta":
        return "zoom", 0.6
    if brightness_before < 0.3 and brightness_after > 0.5:
        return "fade", 0.7
    if brightness_before > 0.5 and brightness_after < 0.3:
        return "fade", 0.5
    if intent_before == "feature" and intent_after == "feature":
        return "wipe-left", 0.4

    # Duration-based default
    if duration_after < 4:
        return "fade", 0.3
    elif duration_after > 7:
        return "fade", 0.7
    else:
        return "fade", 0.5


def select_sfx(transition_type):
    """Select SFX category based on transition type."""
    sfx_map = {
        "fade": "sweep",      # soft sweep sound
        "cut": "impact",      # sharp impact hit
        "wipe-left": "swoosh",  # directional swoosh
        "wipe-right": "swoosh",
        "zoom": "riser",      # riser + impact
    }
    return sfx_map.get(transition_type, "sweep")


def select_ken_burns(intent, index, total):
    """Select Ken Burns direction based on scene intent and position."""
    if intent == "hook":
        # Reveal: start zoomed, zoom out
        return {"start": 1.06, "end": 1.0, "origin": "center center"}
    elif intent == "cta":
        # Urgency: slight zoom in
        return {"start": 1.0, "end": 1.03, "origin": "center center"}
    elif intent == "feature":
        # Focus: slow zoom in
        return {"start": 1.0, "end": 1.04, "origin": "center center"}
    elif intent == "problem":
        # Tension: slow pan (simulate with off-center origin)
        return {"start": 1.02, "end": 1.04, "origin": "40% 50%"}
    else:
        # Alternate zoom in/out based on position
        if index % 2 == 0:
            return {"start": 1.0, "end": 1.05, "origin": "center center"}
        else:
            return {"start": 1.05, "end": 1.0, "origin": "center center"}


def get_audio_blueprint(intent):
    """Return audio settings based on scene intent."""
    blueprints = {
        "hook":    {"duckingLevel": 0.10, "duckingRampFrames": 10, "voPacing": "slow"},
        "problem": {"duckingLevel": 0.12, "duckingRampFrames": 8,  "voPacing": "moderate"},
        "feature": {"duckingLevel": 0.10, "duckingRampFrames": 10, "voPacing": "clear"},
        "proof":   {"duckingLevel": 0.15, "duckingRampFrames": 15, "voPacing": "relaxed"},
        "cta":     {"duckingLevel": 0.08, "duckingRampFrames": 5,  "voPacing": "deliberate"},
    }
    return blueprints.get(intent, blueprints["feature"])


def get_duration_recommendation(intent):
    """Return recommended duration range in seconds."""
    ranges = {
        "hook": (3, 5),
        "problem": (5, 7),
        "feature": (4, 6),
        "proof": (3, 5),
        "cta": (3, 4),
    }
    return ranges.get(intent, (4, 6))


def load_contrast_data(contrast_dir, scene_id):
    """Load contrast map for a scene if available."""
    path = Path(contrast_dir) / f"{scene_id}-contrast.json"
    if path.exists():
        data = json.loads(path.read_text())
        # Calculate average brightness across all frames
        if data.get("frames"):
            avg = sum(f["avg_luminance"] for f in data["frames"]) / len(data["frames"])
            return avg
    return 0.3  # default: assume dark


def plan_scenes(scenes, contrast_dir=None):
    """Run the full intelligence layer on scene descriptions."""
    total = len(scenes)
    enhanced = []

    for i, scene in enumerate(scenes):
        headline = scene.get("headline", "")
        subtext = scene.get("subtext", "")
        stock_query = scene.get("stockQuery", headline)
        duration_sec = scene.get("durationSec", 5)

        # 1. Classify intent
        intent = classify_intent(headline, subtext)

        # Override: first scene is always hook, last is always cta
        if i == 0 and intent not in ("hook",):
            intent = "hook"
        if i == total - 1 and intent not in ("cta",):
            intent = "cta"

        # 2. Enhance stock query
        enhanced_query = enhance_stock_query(stock_query, intent)

        # 3. Ken Burns
        ken_burns = select_ken_burns(intent, i, total)

        # 4. Audio blueprint
        audio = get_audio_blueprint(intent)

        # 5. Duration recommendation
        dur_min, dur_max = get_duration_recommendation(intent)
        if duration_sec < dur_min:
            duration_sec = dur_min
        elif duration_sec > dur_max:
            duration_sec = dur_max

        # 6. Load contrast brightness if available
        avg_brightness = 0.3
        if contrast_dir:
            avg_brightness = load_contrast_data(contrast_dir, scene.get("id", f"s{i+1}"))

        enhanced.append({
            **scene,
            "intent": intent,
            "enhancedQuery": enhanced_query,
            "durationSec": duration_sec,
            "durationFrames": int(duration_sec * 30),
            "kenBurns": ken_burns,
            "audio": audio,
            "avgBrightness": avg_brightness,
        })

    # 7. Select transitions (needs pairs of adjacent scenes)
    for i in range(len(enhanced)):
        if i == 0:
            enhanced[i]["transition"] = "fade"
            enhanced[i]["transitionDuration"] = 0.5
            enhanced[i]["sfxType"] = "sweep"
        else:
            trans_type, trans_dur = select_transition(enhanced[i-1], enhanced[i])
            enhanced[i]["transition"] = trans_type
            enhanced[i]["transitionDuration"] = trans_dur
            enhanced[i]["sfxType"] = select_sfx(trans_type)

    return enhanced


def main():
    parser = argparse.ArgumentParser(description="Scene Planner: intelligence layer")
    parser.add_argument("--scenes", required=True, help="Input scenes JSON file")
    parser.add_argument("--contrast-dir", default=None, help="Directory with contrast JSON files")
    parser.add_argument("--output", required=True, help="Output enhanced scenes JSON")

    args = parser.parse_args()

    scenes = json.loads(Path(args.scenes).read_text())
    enhanced = plan_scenes(scenes, args.contrast_dir)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(enhanced, indent=2))

    # Summary
    intents = [s["intent"] for s in enhanced]
    transitions = [s["transition"] for s in enhanced]
    total_sec = sum(s["durationSec"] for s in enhanced)

    print(json.dumps({
        "success": True,
        "scenes": len(enhanced),
        "totalDuration": total_sec,
        "intents": intents,
        "transitions": transitions,
        "output": args.output,
    }, indent=2))


if __name__ == "__main__":
    main()
