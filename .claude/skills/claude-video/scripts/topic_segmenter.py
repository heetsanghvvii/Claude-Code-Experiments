#!/usr/bin/env python3
"""Topic-based segment grouping for shorts pipeline.

Groups transcript segments + scene boundaries into coherent topic segments,
then scores each topic using multi-modal signals (visual interest from VLM,
audio engagement, keyword density, standalone coherence).

Usage:
  python3 topic_segmenter.py TRANSCRIPT SCENES [OPTIONS]

  --vlm-analysis FILE   VLM frame analysis JSON (from frame_analyzer.py)
  --min-duration S      Minimum topic duration (default: 20)
  --max-duration S      Maximum topic duration (default: 55)
  --count N             Number of top topics to return (default: 5)
  --output FILE         Output JSON path
"""
import argparse
import csv
import json
import os
import re
import sys


def load_transcript(path):
    """Load WhisperX/Whisper transcript JSON."""
    with open(path) as f:
        data = json.load(f)
    segments = []
    for seg in data.get("segments", []):
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "text": seg.get("text", "").strip(),
            "words": seg.get("words", []),
        })
    return segments


def load_scenes(path):
    """Load PySceneDetect scenes CSV."""
    scenes = []
    if not path or not os.path.isfile(path):
        return scenes
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            # PySceneDetect CSV columns vary; try common formats
            start = None
            end = None
            for key in row:
                if "start" in key.lower() and "timecode" in key.lower():
                    start = timecode_to_sec(row[key])
                elif "end" in key.lower() and "timecode" in key.lower():
                    end = timecode_to_sec(row[key])
            if start is not None and end is not None:
                scenes.append({"start": start, "end": end})
    return scenes


def timecode_to_sec(tc):
    """Convert HH:MM:SS.mmm timecode to seconds."""
    parts = tc.strip().split(":")
    if len(parts) == 3:
        return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    elif len(parts) == 2:
        return float(parts[0]) * 60 + float(parts[1])
    return float(parts[0])


def load_vlm_analysis(path):
    """Load VLM frame analysis JSON."""
    if not path or not os.path.isfile(path):
        return []
    with open(path) as f:
        data = json.load(f)
    return data.get("all_frames", data.get("top_moments", []))


def find_topic_boundaries(transcript, scenes, min_dur=20, max_dur=55):
    """Find natural topic boundaries using scene changes + transcript pauses.

    Strategy:
    1. Use scene boundaries as primary split points
    2. Also consider long pauses in speech (>1.5s) as potential boundaries
    3. Merge short adjacent topics; split overly long ones
    """
    if not transcript:
        return []

    total_start = transcript[0]["start"]
    total_end = transcript[-1]["end"]

    # Collect all potential boundary points
    boundaries = set()

    # Scene boundaries
    for scene in scenes:
        boundaries.add(round(scene["start"], 1))

    # Long speech pauses (>1.5 seconds between segments)
    for i in range(1, len(transcript)):
        gap = transcript[i]["start"] - transcript[i - 1]["end"]
        if gap > 1.5:
            boundaries.add(round(transcript[i]["start"], 1))

    # Sentence-ending boundaries (period/question mark followed by pause)
    for seg in transcript:
        text = seg["text"]
        if text.endswith((".","?","!")) and seg["end"] < total_end:
            boundaries.add(round(seg["end"], 1))

    boundaries = sorted(boundaries)

    # Build initial segments from boundaries
    raw_segments = []
    prev = total_start
    for b in boundaries:
        if b > prev + 3:  # minimum 3s between boundaries
            raw_segments.append({"start": prev, "end": b})
            prev = b
    if prev < total_end - 3:
        raw_segments.append({"start": prev, "end": total_end})

    # Merge short segments and split long ones
    topics = []
    current = None

    for seg in raw_segments:
        if current is None:
            current = {"start": seg["start"], "end": seg["end"]}
            continue

        combined_dur = seg["end"] - current["start"]
        current_dur = current["end"] - current["start"]

        if current_dur < min_dur and combined_dur <= max_dur:
            # Merge: current too short, combined fits
            current["end"] = seg["end"]
        elif current_dur >= min_dur:
            # Current is good, finalize it
            topics.append(current)
            current = {"start": seg["start"], "end": seg["end"]}
        else:
            # Current too short but combining would exceed max; keep merging
            current["end"] = seg["end"]
            if current["end"] - current["start"] >= min_dur:
                topics.append(current)
                current = None

    if current:
        dur = current["end"] - current["start"]
        if dur >= min_dur:
            topics.append(current)
        elif topics:
            # Merge into last topic if possible
            if topics[-1]["end"] - topics[-1]["start"] + dur <= max_dur:
                topics[-1]["end"] = current["end"]

    # Split topics that exceed max_dur
    final_topics = []
    for t in topics:
        dur = t["end"] - t["start"]
        if dur <= max_dur:
            final_topics.append(t)
        else:
            # Split at the midpoint sentence boundary
            mid = t["start"] + dur / 2
            best_split = mid
            best_dist = float("inf")
            for b in boundaries:
                if t["start"] + min_dur <= b <= t["end"] - min_dur:
                    if abs(b - mid) < best_dist:
                        best_dist = abs(b - mid)
                        best_split = b
            final_topics.append({"start": t["start"], "end": best_split})
            final_topics.append({"start": best_split, "end": t["end"]})

    return final_topics


def get_transcript_for_range(transcript, start, end):
    """Extract transcript text and words for a time range."""
    text_parts = []
    words = []
    for seg in transcript:
        if seg["end"] < start or seg["start"] > end:
            continue
        text_parts.append(seg["text"])
        for w in seg.get("words", []):
            if w.get("start", 0) >= start and w.get("end", 0) <= end:
                words.append(w)
    return " ".join(text_parts).strip(), words


def score_topic(topic, transcript, vlm_frames, scenes):
    """Score a topic segment using multi-modal signals.

    Weights:
      - visual_interest: 0.30 (from VLM frame analysis)
      - content_completeness: 0.25 (complete thoughts, data shown)
      - audio_engagement: 0.20 (keyword density, emphasis)
      - hook_potential: 0.15 (first sentence strength)
      - standalone_coherence: 0.10 (works without context)
    """
    start = topic["start"]
    end = topic["end"]
    text, words = get_transcript_for_range(transcript, start, end)

    scores = {}

    # 1. Visual interest (from VLM)
    relevant_frames = [
        f for f in vlm_frames
        if start <= f.get("timestamp_sec", 0) <= end
        and f.get("visual_interest", 0) > 0
    ]
    if relevant_frames:
        avg_interest = sum(f["visual_interest"] for f in relevant_frames) / len(relevant_frames)
        max_interest = max(f["visual_interest"] for f in relevant_frames)
        scores["visual_interest"] = min(1.0, (avg_interest * 0.6 + max_interest * 0.4) / 10)
    else:
        scores["visual_interest"] = 0.3  # default if no VLM data

    # 2. Content completeness
    # Look for data indicators: numbers, percentages, lists, comparisons
    data_patterns = [
        r'\d+%', r'\d+/\d+', r'score', r'table', r'chart', r'report',
        r'result', r'metric', r'analysis', r'issue', r'fix', r'tip',
    ]
    data_matches = sum(1 for p in data_patterns if re.search(p, text, re.I))
    completeness = min(1.0, data_matches / 4)

    # Check if text has complete sentences
    sentences = re.split(r'[.!?]+', text)
    complete_sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    if complete_sentences:
        completeness = (completeness + min(1.0, len(complete_sentences) / 3)) / 2
    scores["content_completeness"] = completeness

    # 3. Audio engagement (keyword density + emphasis words)
    engagement_words = [
        'amazing', 'incredible', 'powerful', 'important', 'critical',
        'secret', 'trick', 'hack', 'best', 'worst', 'never', 'always',
        'exactly', 'definitely', 'actually', 'literally', 'wow',
        'look at', 'check this', 'here we have', 'as you can see',
        'let me show', 'watch this', 'this is',
    ]
    word_count = len(text.split())
    if word_count > 0:
        matches = sum(1 for w in engagement_words if w.lower() in text.lower())
        scores["audio_engagement"] = min(1.0, matches / 3)
    else:
        scores["audio_engagement"] = 0.0

    # 4. Hook potential (first sentence)
    first_sentence = complete_sentences[0] if complete_sentences else text[:60]
    hook_indicators = [
        r'\?',                          # Questions hook viewers
        r'\d',                          # Numbers are compelling
        r'you',                         # Direct address
        r'how to|step|guide|tutorial',  # Educational hooks
        r'secret|hidden|unknown',       # Curiosity gaps
        r'here|this|look|check|see',    # Demonstrative hooks
    ]
    hook_matches = sum(1 for p in hook_indicators if re.search(p, first_sentence, re.I))
    scores["hook_potential"] = min(1.0, hook_matches / 3)

    # 5. Standalone coherence
    # Does it start cleanly (not mid-sentence)?
    starts_clean = text[0].isupper() if text else False
    # Does it end cleanly?
    ends_clean = text.rstrip().endswith(('.', '!', '?', '...')) if text else False
    coherence = 0.0
    if starts_clean:
        coherence += 0.4
    if ends_clean:
        coherence += 0.4
    if word_count > 20:
        coherence += 0.2
    scores["standalone_coherence"] = coherence

    # Weighted composite score
    weights = {
        "visual_interest": 0.30,
        "content_completeness": 0.25,
        "audio_engagement": 0.20,
        "hook_potential": 0.15,
        "standalone_coherence": 0.10,
    }
    composite = sum(scores[k] * weights[k] for k in weights)

    return {
        "start": start,
        "end": end,
        "duration": round(end - start, 1),
        "score": round(composite * 10, 2),  # Scale to 0-10
        "scores": {k: round(v, 3) for k, v in scores.items()},
        "transcript_excerpt": text[:200] + ("..." if len(text) > 200 else ""),
        "vlm_frames_in_range": len(relevant_frames),
        "word_count": word_count,
    }


def get_best_zoom_for_topic(topic, vlm_frames):
    """Get the best zoom region(s) for a topic from VLM data."""
    start = topic["start"]
    end = topic["end"]

    relevant = [
        f for f in vlm_frames
        if start <= f.get("timestamp_sec", 0) <= end
        and f.get("visual_interest", 0) > 0
        and "suggested_zoom_region" in f
    ]

    if not relevant:
        return [{"t": 0, "x_pct": 0.25, "y_pct": 0.05,
                 "w_pct": 0.70, "h_pct": 0.85}]

    # Sort by timestamp for animated panning
    relevant.sort(key=lambda f: f["timestamp_sec"])

    zoom_regions = []
    for f in relevant:
        r = f["suggested_zoom_region"]
        zoom_regions.append({
            "t": round(f["timestamp_sec"] - start, 2),
            "x_pct": r.get("x_pct", 0.25),
            "y_pct": r.get("y_pct", 0.05),
            "w_pct": r.get("w_pct", 0.60),
            "h_pct": r.get("h_pct", 0.80),
            "description": r.get("description", ""),
        })

    return zoom_regions


def main():
    parser = argparse.ArgumentParser(
        description="Topic-based segment grouping for shorts pipeline"
    )
    parser.add_argument("transcript", help="WhisperX transcript JSON")
    parser.add_argument("scenes", nargs="?", default=None,
                        help="PySceneDetect scenes CSV (optional)")
    parser.add_argument("--vlm-analysis",
                        help="VLM frame analysis JSON (from frame_analyzer.py)")
    parser.add_argument("--min-duration", type=int, default=20,
                        help="Minimum topic duration in seconds (default: 20)")
    parser.add_argument("--max-duration", type=int, default=55,
                        help="Maximum topic duration in seconds (default: 55)")
    parser.add_argument("--count", type=int, default=5,
                        help="Number of top topics to return (default: 5)")
    parser.add_argument("--output", "-o", default="topics.json",
                        help="Output JSON path (default: topics.json)")

    args = parser.parse_args()

    # Load data
    transcript = load_transcript(args.transcript)
    scenes = load_scenes(args.scenes)
    vlm_frames = load_vlm_analysis(args.vlm_analysis)

    if not transcript:
        print(json.dumps({"error": "Empty transcript"}))
        sys.exit(1)

    total_duration = transcript[-1]["end"] - transcript[0]["start"]

    print(f"Loaded: {len(transcript)} transcript segments, "
          f"{len(scenes)} scenes, {len(vlm_frames)} VLM frames",
          file=sys.stderr)

    # Find topic boundaries
    topics = find_topic_boundaries(
        transcript, scenes, args.min_duration, args.max_duration
    )
    print(f"Found {len(topics)} topic segments", file=sys.stderr)

    # Score each topic
    scored = []
    for topic in topics:
        result = score_topic(topic, transcript, vlm_frames, scenes)
        result["zoom_regions"] = get_best_zoom_for_topic(topic, vlm_frames)
        scored.append(result)

    # Rank by score (descending)
    scored.sort(key=lambda t: t["score"], reverse=True)

    # Select top N non-overlapping
    selected = []
    for topic in scored:
        overlap = False
        for s in selected:
            if topic["start"] < s["end"] and topic["end"] > s["start"]:
                overlap = True
                break
        if not overlap:
            selected.append(topic)
            if len(selected) >= args.count:
                break

    # Assign ranks
    for i, t in enumerate(selected):
        t["rank"] = i + 1

    output = {
        "total_duration": round(total_duration, 1),
        "topics_found": len(topics),
        "topics_selected": len(selected),
        "min_duration": args.min_duration,
        "max_duration": args.max_duration,
        "has_vlm_data": len(vlm_frames) > 0,
        "top_topics": selected,
    }

    with open(args.output, "w") as f:
        json.dump(output, f, indent=2)

    # Print summary
    print(f"\nTop {len(selected)} topics:", file=sys.stderr)
    for t in selected:
        ts = t["start"]
        te = t["end"]
        print(f"  #{t['rank']} {ts//60:02.0f}:{ts%60:02.0f}-{te//60:02.0f}:{te%60:02.0f} "
              f"score={t['score']:.1f} dur={t['duration']:.0f}s "
              f"— {t['transcript_excerpt'][:60]}...",
              file=sys.stderr)

    # Print JSON to stdout
    print(json.dumps({
        "action": "topic_segmentation",
        "topics_found": len(topics),
        "topics_selected": len(selected),
        "top_topics": [
            {
                "rank": t["rank"],
                "time": f"{t['start']//60:02.0f}:{t['start']%60:02.0f}-{t['end']//60:02.0f}:{t['end']%60:02.0f}",
                "score": t["score"],
                "duration": t["duration"],
                "excerpt": t["transcript_excerpt"][:80],
            }
            for t in selected
        ],
    }, indent=2))


if __name__ == "__main__":
    main()
