#!/usr/bin/env python3
"""Segment scoring for longform-to-shortform pipeline.

Subcommands:
  transcribe  Transcribe video with word-level timestamps via WhisperX
  score       Score video segments for viral/engagement potential

Usage:
  python3 segment_scorer.py transcribe INPUT [--model large-v2] [--language en] [--output transcript.json]
  python3 segment_scorer.py score INPUT --transcript FILE [--scenes FILE] [--duration 60] [--count 5] [--output segments.json]
"""
import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

# Engagement keywords for scoring
HOOK_KEYWORDS = {
    "questions": ["why", "how", "what", "when", "where", "who", "which", "can", "do", "does",
                   "is", "are", "was", "were", "will", "would", "should", "could"],
    "superlatives": ["best", "worst", "most", "least", "biggest", "smallest", "fastest",
                      "easiest", "hardest", "greatest", "top", "ultimate", "incredible"],
    "emotional": ["amazing", "shocking", "unbelievable", "insane", "crazy", "mind-blowing",
                   "terrifying", "hilarious", "heartbreaking", "inspiring", "devastating",
                   "beautiful", "horrible", "perfect", "terrible", "awesome", "epic", "wild"],
    "urgency": ["never", "always", "must", "need", "stop", "start", "now", "today",
                 "immediately", "secret", "hack", "trick", "mistake", "truth", "real",
                 "actually", "literally", "seriously"],
    "numbers": ["first", "second", "third", "one", "two", "three", "four", "five",
                 "percent", "million", "billion", "thousand", "hundred", "zero"]
}

POSITIVE_WORDS = {"good", "great", "love", "happy", "excellent", "wonderful", "fantastic",
                   "brilliant", "perfect", "beautiful", "amazing", "incredible", "awesome",
                   "outstanding", "superb", "magnificent", "delightful", "remarkable", "success"}

NEGATIVE_WORDS = {"bad", "terrible", "hate", "angry", "horrible", "awful", "disgusting",
                   "worst", "failure", "disaster", "painful", "miserable", "dreadful",
                   "pathetic", "tragic", "devastating", "frustrating", "annoying", "stupid"}


def get_free_vram_mb():
    """Get free VRAM in MB."""
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.free", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=5
        )
        return int(result.stdout.strip().split('\n')[0])
    except Exception:
        return 0


def get_video_duration(video_path):
    """Get video duration in seconds via ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", video_path],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    return float(data["format"]["duration"])


def transcribe(args):
    """Transcribe video with WhisperX for word-level timestamps."""
    import torch

    input_path = args.input
    model_name = args.model
    language = args.language
    output_path = args.output or f"{Path(input_path).stem}_transcript.json"

    required_vram = 6000
    free_vram = get_free_vram_mb()
    if free_vram < required_vram:
        print(json.dumps({
            "error": f"Insufficient VRAM: {free_vram}MB free, {required_vram}MB required",
            "suggestion": "Close other GPU applications"
        }))
        sys.exit(1)

    start_time = time.time()

    # Import and run WhisperX
    import whisperx

    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"

    # Load model
    model = whisperx.load_model(model_name, device, compute_type=compute_type, language=language)

    # Transcribe
    audio = whisperx.load_audio(input_path)
    result = model.transcribe(audio, batch_size=16, language=language)

    # Align for word-level timestamps
    model_a, metadata = whisperx.load_align_model(language_code=language, device=device)
    result = whisperx.align(result["segments"], model_a, metadata, audio, device,
                            return_char_alignments=False)

    # Unload models
    del model, model_a
    import gc
    gc.collect()
    torch.cuda.empty_cache()

    elapsed = time.time() - start_time

    # Save transcript
    output = {
        "input": input_path,
        "model": model_name,
        "language": language,
        "duration_sec": get_video_duration(input_path),
        "transcription_time_sec": round(elapsed, 1),
        "word_count": sum(len(seg.get("words", [])) for seg in result["segments"]),
        "segments": result["segments"]
    }

    with open(output_path, "w") as f:
        json.dump(output, f, indent=2, default=str)

    # Print summary to stdout
    print(json.dumps({
        "action": "transcribe",
        "input": input_path,
        "output": output_path,
        "model": model_name,
        "language": language,
        "word_count": output["word_count"],
        "segment_count": len(result["segments"]),
        "transcription_time_sec": round(elapsed, 1),
        "duration_sec": output["duration_sec"]
    }, indent=2))


def compute_audio_energy(audio_path, windows):
    """Compute RMS audio energy for each scoring window."""
    import librosa
    import numpy as np

    y, sr = librosa.load(audio_path, sr=16000, mono=True)
    total_duration = len(y) / sr

    energies = []
    for start, end in windows:
        start_sample = int(start * sr)
        end_sample = min(int(end * sr), len(y))
        if end_sample <= start_sample:
            energies.append(0.0)
            continue
        segment = y[start_sample:end_sample]
        rms = float(np.sqrt(np.mean(segment ** 2)))
        energies.append(rms)

    # Normalize to 0-1
    if energies:
        max_e = max(energies) if max(energies) > 0 else 1.0
        energies = [e / max_e for e in energies]

    return energies


def compute_keyword_score(text):
    """Score text for engagement keyword density."""
    words = text.lower().split()
    if not words:
        return 0.0

    hits = 0
    for category, keywords in HOOK_KEYWORDS.items():
        for word in words:
            if word.strip(".,!?;:'\"") in keywords:
                hits += 1

    # Normalize: max out at ~10% keyword density
    density = hits / len(words)
    return min(density / 0.10, 1.0)


def compute_sentiment_intensity(text):
    """Score sentiment intensity (strong positive OR negative = high score)."""
    words = set(text.lower().split())
    words = {w.strip(".,!?;:'\"") for w in words}

    pos = len(words & POSITIVE_WORDS)
    neg = len(words & NEGATIVE_WORDS)
    total = len(words) if words else 1

    intensity = (pos + neg) / total
    return min(intensity / 0.05, 1.0)


def compute_speech_rate_variation(words_with_timing, start, end):
    """Compute speech rate variation within a segment."""
    import numpy as np

    segment_words = [w for w in words_with_timing
                     if w.get("start", 0) >= start and w.get("end", 0) <= end]

    if len(segment_words) < 10:
        return 0.5

    # Compute words per second in 5-second windows
    window_size = 5.0
    rates = []
    t = start
    while t + window_size <= end:
        count = sum(1 for w in segment_words
                    if w.get("start", 0) >= t and w.get("start", 0) < t + window_size)
        rates.append(count / window_size)
        t += window_size / 2  # 50% overlap

    if len(rates) < 2:
        return 0.5

    cv = float(np.std(rates) / (np.mean(rates) + 1e-6))
    return min(cv / 0.5, 1.0)


def compute_scene_variety(scene_boundaries, start, end):
    """Count scene changes within a segment window."""
    changes = sum(1 for t in scene_boundaries if start < t < end)
    # Normalize: 5+ scene changes in a segment = max score
    return min(changes / 5.0, 1.0)


def compute_coherence(text):
    """Score standalone coherence (complete thoughts)."""
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]

    if not sentences:
        return 0.0

    # Heuristics for coherence
    score = 0.0

    # Starts with a complete sentence
    if len(sentences[0].split()) >= 3:
        score += 0.3

    # Ends with a complete thought
    if len(sentences[-1].split()) >= 3:
        score += 0.3

    # Has enough content
    total_words = sum(len(s.split()) for s in sentences)
    if total_words > 20:
        score += 0.2

    # Multiple sentences = more structured
    if len(sentences) >= 3:
        score += 0.2

    return min(score, 1.0)


def parse_scenes_csv(scenes_path):
    """Parse PySceneDetect CSV output to get scene boundary timestamps."""
    boundaries = []
    if not scenes_path or not os.path.exists(scenes_path):
        return boundaries

    with open(scenes_path) as f:
        lines = f.readlines()

    for line in lines[2:]:  # Skip header rows
        parts = line.strip().split(",")
        if len(parts) >= 4:
            try:
                # Start timecode is typically column index 2 or 3
                for part in parts:
                    part = part.strip()
                    if "." in part and ":" not in part:
                        try:
                            boundaries.append(float(part))
                            break
                        except ValueError:
                            continue
            except (ValueError, IndexError):
                continue

    return sorted(set(boundaries))


def extract_audio_for_scoring(video_path, output_path):
    """Extract audio as WAV for librosa analysis."""
    subprocess.run(
        ["ffmpeg", "-y", "-i", video_path, "-vn", "-ar", "16000", "-ac", "1",
         "-f", "wav", output_path],
        capture_output=True, check=True
    )


def score(args):
    """Score video segments for engagement potential."""
    input_path = args.input
    transcript_path = args.transcript
    scenes_path = args.scenes
    target_duration = args.duration
    count = args.count
    output_path = args.output or f"{Path(input_path).stem}_segments.json"

    start_time = time.time()

    # Load transcript
    with open(transcript_path) as f:
        transcript = json.load(f)

    total_duration = transcript.get("duration_sec", get_video_duration(input_path))
    segments = transcript.get("segments", [])

    # Flatten words with timing
    all_words = []
    for seg in segments:
        for word in seg.get("words", []):
            all_words.append(word)

    # Parse scene boundaries
    scene_boundaries = parse_scenes_csv(scenes_path) if scenes_path else []

    # Extract audio for energy analysis
    import tempfile
    audio_fd = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    audio_tmp = audio_fd.name
    audio_fd.close()
    try:
        extract_audio_for_scoring(input_path, audio_tmp)

        # Generate candidate windows
        step = target_duration / 2  # 50% overlap sliding window
        windows = []
        t = 0.0
        while t + target_duration <= total_duration:
            windows.append((t, t + target_duration))
            t += step

        if not windows:
            windows = [(0, min(target_duration, total_duration))]

        # Compute audio energy for all windows
        audio_energies = compute_audio_energy(audio_tmp, windows)

        # Score each window
        scored_windows = []
        for i, (start, end) in enumerate(windows):
            # Get transcript text for this window
            window_text = " ".join(
                w.get("word", "") for w in all_words
                if w.get("start", 0) >= start and w.get("end", 0) <= end
            )

            # Compute individual scores
            audio_score = audio_energies[i]
            keyword_score = compute_keyword_score(window_text)
            sentiment_score = compute_sentiment_intensity(window_text)
            scene_score = compute_scene_variety(scene_boundaries, start, end)
            speech_var_score = compute_speech_rate_variation(all_words, start, end)
            coherence_score = compute_coherence(window_text)

            # Weighted composite score (0-10 scale)
            composite = (
                audio_score * 0.25 +
                keyword_score * 0.20 +
                sentiment_score * 0.20 +
                scene_score * 0.15 +
                speech_var_score * 0.10 +
                coherence_score * 0.10
            ) * 10

            scored_windows.append({
                "start": round(start, 2),
                "end": round(end, 2),
                "duration": round(end - start, 2),
                "score": round(composite, 2),
                "scores": {
                    "audio_energy": round(audio_score, 3),
                    "keyword_density": round(keyword_score, 3),
                    "sentiment_intensity": round(sentiment_score, 3),
                    "scene_variety": round(scene_score, 3),
                    "speech_rate_variation": round(speech_var_score, 3),
                    "standalone_coherence": round(coherence_score, 3)
                },
                "transcript_excerpt": window_text[:200] + ("..." if len(window_text) > 200 else "")
            })

        # Sort by score descending
        scored_windows.sort(key=lambda x: x["score"], reverse=True)

        # Select top N non-overlapping segments
        selected = []
        for window in scored_windows:
            if len(selected) >= count:
                break
            # Check overlap with already selected
            overlaps = False
            for sel in selected:
                if not (window["end"] <= sel["start"] or window["start"] >= sel["end"]):
                    overlaps = True
                    break
            if not overlaps:
                window["rank"] = len(selected) + 1
                selected.append(window)

        # Sort selected by rank
        selected.sort(key=lambda x: x["rank"])

    finally:
        if os.path.exists(audio_tmp):
            os.unlink(audio_tmp)

    elapsed = time.time() - start_time

    output = {
        "input": input_path,
        "total_duration": round(total_duration, 2),
        "target_duration": target_duration,
        "segments_analyzed": len(windows),
        "scoring_time_sec": round(elapsed, 1),
        "top_segments": selected
    }

    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print(json.dumps({
        "action": "score",
        "input": input_path,
        "output": output_path,
        "total_duration": round(total_duration, 2),
        "segments_analyzed": len(windows),
        "top_segments_count": len(selected),
        "top_score": selected[0]["score"] if selected else 0,
        "scoring_time_sec": round(elapsed, 1)
    }, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Segment scoring for shortform pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Transcribe subcommand
    t_parser = subparsers.add_parser("transcribe", help="Transcribe with WhisperX")
    t_parser.add_argument("input", help="Input video file")
    t_parser.add_argument("--model", default="large-v2", help="Whisper model (default: large-v2)")
    t_parser.add_argument("--language", default="en", help="Language code (default: en)")
    t_parser.add_argument("--output", help="Output JSON path")

    # Score subcommand
    s_parser = subparsers.add_parser("score", help="Score segments for engagement")
    s_parser.add_argument("input", help="Input video file")
    s_parser.add_argument("--transcript", required=True, help="Transcript JSON from transcribe step")
    s_parser.add_argument("--scenes", help="PySceneDetect scenes CSV")
    s_parser.add_argument("--duration", type=int, default=60, help="Target clip duration in seconds")
    s_parser.add_argument("--count", type=int, default=5, help="Number of top segments to select")
    s_parser.add_argument("--output", help="Output JSON path")

    args = parser.parse_args()

    if args.command == "transcribe":
        transcribe(args)
    elif args.command == "score":
        score(args)


if __name__ == "__main__":
    main()
