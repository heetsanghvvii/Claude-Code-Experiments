#!/usr/bin/env python3
"""Generate TTS voiceover using Gemini's dedicated TTS model.

Usage:
    tts_generate.py --text "Your narration here" --output voiceover.wav [options]

Options:
    --voice NAME        Gemini voice: Kore, Charon, Fenrir, Puck, Aoede, Leda (default: Kore)
    --api-key KEY       Google AI API key (or set GOOGLE_AI_API_KEY env)
    --fps 30            FPS for duration_frames output (default: 30)

Available voices:
    Kore    - Deep, authoritative (good for narration, promos)
    Charon  - Warm, narrative (good for storytelling)
    Fenrir  - Dramatic, bold (good for trailers)
    Puck    - Energetic, youthful (good for social media)
    Aoede   - Soft, calm (good for tutorials)
    Leda    - Clear, professional (good for corporate)
"""

import argparse
import json
import os
import sys
import wave
from pathlib import Path


def generate_tts(text, voice, api_key, output_path, fps=30):
    """Generate TTS using Gemini 2.5 Flash TTS model."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=text,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice
                    )
                )
            ),
        ),
    )

    # Extract audio data
    audio_data = None
    mime = None
    for part in response.candidates[0].content.parts:
        if part.inline_data and part.inline_data.mime_type.startswith("audio/"):
            audio_data = part.inline_data.data
            mime = part.inline_data.mime_type
            break

    if audio_data is None:
        print(json.dumps({"error": True, "message": "No audio in Gemini response"}))
        sys.exit(1)

    # Save as WAV (24kHz, 16-bit, mono from Gemini)
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    sample_rate = 24000
    channels = 1
    sample_width = 2

    with wave.open(str(output), "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(sample_rate)
        wf.writeframes(audio_data)

    # Measure duration
    duration_sec = len(audio_data) / (sample_rate * channels * sample_width)
    duration_frames = int(duration_sec * fps)
    size_kb = output.stat().st_size / 1024

    print(json.dumps({
        "success": True,
        "path": str(output.resolve()),
        "duration_sec": round(duration_sec, 3),
        "duration_frames": duration_frames,
        "size_kb": round(size_kb, 1),
        "sample_rate": sample_rate,
        "voice": voice,
        "fps": fps,
    }))


def main():
    parser = argparse.ArgumentParser(description="Gemini TTS Generator")
    parser.add_argument("--text", required=True, help="Text to speak")
    parser.add_argument("--voice", default="Kore",
                       choices=["Kore", "Charon", "Fenrir", "Puck", "Aoede", "Leda"],
                       help="Gemini voice name")
    parser.add_argument("--output", required=True, help="Output WAV file path")
    parser.add_argument("--api-key", default=None)
    parser.add_argument("--fps", type=int, default=30)

    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("GOOGLE_AI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print(json.dumps({"error": True,
            "message": "Set GOOGLE_AI_API_KEY env or pass --api-key"}))
        sys.exit(1)

    generate_tts(args.text, args.voice, api_key, args.output, args.fps)


if __name__ == "__main__":
    main()
