#!/usr/bin/env python3
"""AI audio enhancement for video production.

Subcommands:
  separate   Source separation with Demucs v4 (isolate vocals, drums, bass, other)
  diarize    Speaker diarization with pyannote-audio + WhisperX
  denoise    AI noise reduction with DeepFilterNet3
  tts        Text-to-speech voiceover (ElevenLabs, OpenAI, Bark)
  upsample   Audio upsampling with AudioSR (phone to studio quality)

Usage:
  python3 audio_enhance.py separate INPUT --stems vocals [--model htdemucs_ft] --output FILE
  python3 audio_enhance.py diarize INPUT [--hf-token TOKEN] [--with-transcript] --output FILE
  python3 audio_enhance.py denoise INPUT --output FILE
  python3 audio_enhance.py tts --text "..." --provider elevenlabs|openai|bark [--voice NAME] --output FILE
  python3 audio_enhance.py upsample INPUT --output FILE [--model speech|music|general]
"""
import argparse
import json
import os
import subprocess
import sys
import time


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


def ensure_vram(required_mb):
    """Ensure enough VRAM is available."""
    try:
        import torch
        import gc
        torch.cuda.empty_cache()
        gc.collect()
        torch.cuda.empty_cache()
    except ImportError:
        pass
    free = get_free_vram_mb()
    if free < required_mb:
        print(json.dumps({
            "error": f"Insufficient VRAM: {free}MB free, {required_mb}MB required",
            "suggestion": "Close other GPU applications"
        }))
        return False
    return True


def unload_model(model):
    """Properly unload a model from GPU."""
    del model
    import gc
    gc.collect()
    try:
        import torch
        torch.cuda.empty_cache()
    except ImportError:
        pass


def separate(args):
    """Separate audio stems with Demucs v4."""
    import torch

    input_path = args.input
    stems = args.stems.split(",")
    model_name = args.model
    output_path = args.output

    required_vram = 7000 if model_name == "htdemucs_ft" else 5000
    if not ensure_vram(required_vram):
        sys.exit(1)

    start = time.time()

    # Use demucs CLI for reliability
    output_dir = os.path.dirname(output_path) or "."
    cmd = ["demucs", "-n", model_name, "-d", "cuda", "-o", output_dir]

    if len(stems) == 1 and stems[0] == "vocals":
        cmd.extend(["--two-stems", "vocals"])

    cmd.append(input_path)

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(json.dumps({"error": "Demucs failed", "stderr": result.stderr[:500]}))
        sys.exit(1)

    # Move output to desired path
    basename = os.path.splitext(os.path.basename(input_path))[0]
    demucs_output_dir = os.path.join(output_dir, model_name, basename)

    outputs = {}
    if os.path.isdir(demucs_output_dir):
        for stem_file in os.listdir(demucs_output_dir):
            stem_name = os.path.splitext(stem_file)[0]
            if "all" in stems or stem_name in stems:
                src = os.path.join(demucs_output_dir, stem_file)
                if len(stems) == 1:
                    dst = output_path
                else:
                    dst = os.path.join(os.path.dirname(output_path),
                                       f"{basename}_{stem_name}.wav")
                os.rename(src, dst)
                outputs[stem_name] = dst

    torch.cuda.empty_cache()
    elapsed = time.time() - start

    print(json.dumps({
        "action": "separate",
        "model": model_name,
        "stems": stems,
        "input": input_path,
        "outputs": outputs,
        "processing_time_sec": round(elapsed, 1),
        "vram_used_mb": required_vram
    }, indent=2))


def diarize(args):
    """Speaker diarization with pyannote-audio."""
    input_path = args.input
    output_path = args.output
    hf_token = args.hf_token or os.environ.get("HF_TOKEN")
    with_transcript = args.with_transcript

    if not hf_token:
        print(json.dumps({
            "error": "HuggingFace token required for pyannote",
            "suggestion": "Set HF_TOKEN env var or use --hf-token"
        }))
        sys.exit(1)

    start = time.time()
    import torch

    if with_transcript:
        # Combined diarization + transcription via WhisperX
        # Skips standalone pyannote pass since WhisperX runs its own diarization
        import whisperx
        import gc

        if not ensure_vram(6000):
            sys.exit(1)

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = whisperx.load_model("large-v2", device, compute_type="float16")
        audio = whisperx.load_audio(input_path)
        transcript = model.transcribe(audio, batch_size=16)

        model_a, metadata = whisperx.load_align_model(language_code="en", device=device)
        transcript = whisperx.align(transcript["segments"], model_a, metadata, audio, device)

        # WhisperX diarization assigns speakers to transcript segments
        diarize_df = whisperx.DiarizationPipeline(use_auth_token=hf_token, device=device)
        diarize_result = diarize_df(input_path)
        transcript = whisperx.assign_word_speakers(diarize_result, transcript)

        # Extract speaker segments from diarization result
        speakers = set()
        segments = []
        for seg in transcript.get("segments", []):
            speaker = seg.get("speaker", "UNKNOWN")
            speakers.add(speaker)
            segments.append({
                "speaker": speaker,
                "start": round(seg["start"], 3),
                "end": round(seg["end"], 3),
                "duration": round(seg["end"] - seg["start"], 3)
            })

        result = {
            "speakers": sorted(speakers),
            "speaker_count": len(speakers),
            "segments": segments,
            "transcript_segments": transcript["segments"]
        }

        del model, model_a
        gc.collect()
        torch.cuda.empty_cache()
    else:
        # Standalone diarization only (no transcript)
        if not ensure_vram(4000):
            sys.exit(1)

        from pyannote.audio import Pipeline

        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=hf_token
        )
        pipeline.to(torch.device("cuda"))

        diarization = pipeline(input_path)

        speakers = set()
        segments = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            speakers.add(speaker)
            segments.append({
                "speaker": speaker,
                "start": round(turn.start, 3),
                "end": round(turn.end, 3),
                "duration": round(turn.end - turn.start, 3)
            })

        result = {
            "speakers": sorted(speakers),
            "speaker_count": len(speakers),
            "segments": segments
        }

        unload_model(pipeline)

    with open(output_path, "w") as f:
        json.dump(result, f, indent=2, default=str)

    elapsed = time.time() - start

    print(json.dumps({
        "action": "diarize",
        "input": input_path,
        "output": output_path,
        "speaker_count": len(speakers),
        "segment_count": len(segments),
        "with_transcript": with_transcript,
        "processing_time_sec": round(elapsed, 1)
    }, indent=2))


def denoise(args):
    """AI noise reduction with DeepFilterNet3."""
    input_path = args.input
    output_path = args.output

    start = time.time()

    # Try DeepFilterNet CLI first
    try:
        subprocess.run(
            ["deep-filter", input_path, "-o", output_path],
            check=True, capture_output=True
        )
        elapsed = time.time() - start
        print(json.dumps({
            "action": "denoise",
            "engine": "DeepFilterNet3",
            "input": input_path,
            "output": output_path,
            "processing_time_sec": round(elapsed, 2)
        }, indent=2))
        return
    except (FileNotFoundError, subprocess.CalledProcessError):
        pass

    # Try Python DeepFilterNet
    try:
        from df.enhance import enhance, init_df

        model, df_state, _ = init_df()
        import soundfile as sf
        audio, sr = sf.read(input_path)
        enhanced = enhance(model, df_state, audio)
        sf.write(output_path, enhanced, sr)

        elapsed = time.time() - start
        print(json.dumps({
            "action": "denoise",
            "engine": "DeepFilterNet3-python",
            "input": input_path,
            "output": output_path,
            "processing_time_sec": round(elapsed, 2)
        }, indent=2))
        return
    except ImportError:
        pass

    # Fallback to FFmpeg afftdn
    print("  DeepFilterNet not found, falling back to FFmpeg afftdn", file=sys.stderr)
    subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, "-af", "afftdn=nf=-25:nt=w",
         "-c:v", "copy", output_path],
        check=True, capture_output=True
    )

    elapsed = time.time() - start
    print(json.dumps({
        "action": "denoise",
        "engine": "ffmpeg-afftdn",
        "input": input_path,
        "output": output_path,
        "processing_time_sec": round(elapsed, 2),
        "note": "Using FFmpeg fallback. Install DeepFilterNet for better quality."
    }, indent=2))


def tts(args):
    """Generate TTS voiceover."""
    text = args.text
    provider = args.provider
    voice = args.voice
    output_path = args.output

    start = time.time()

    if provider == "elevenlabs":
        api_key = os.environ.get("ELEVENLABS_API_KEY")
        if not api_key:
            print(json.dumps({"error": "ELEVENLABS_API_KEY environment variable not set"}))
            sys.exit(1)

        from elevenlabs import ElevenLabs

        client = ElevenLabs(api_key=api_key)
        audio_gen = client.text_to_speech.convert(
            text=text,
            voice_id=voice or "Rachel",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )

        with open(output_path, "wb") as f:
            for chunk in audio_gen:
                f.write(chunk)

        elapsed = time.time() - start
        print(json.dumps({
            "action": "tts",
            "provider": "elevenlabs",
            "voice": voice or "Rachel",
            "text_length": len(text),
            "output": output_path,
            "processing_time_sec": round(elapsed, 2)
        }, indent=2))

    elif provider == "openai":
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print(json.dumps({"error": "OPENAI_API_KEY environment variable not set"}))
            sys.exit(1)

        from openai import OpenAI

        client = OpenAI()
        model = args.model or "tts-1"

        response = client.audio.speech.create(
            model=model,
            voice=voice or "alloy",
            input=text,
        )
        response.stream_to_file(output_path)

        elapsed = time.time() - start
        chars = len(text)
        cost = chars / 1_000_000 * (15 if model == "tts-1" else 30)
        print(json.dumps({
            "action": "tts",
            "provider": "openai",
            "model": model,
            "voice": voice or "alloy",
            "text_length": chars,
            "output": output_path,
            "cost_usd": round(cost, 4),
            "processing_time_sec": round(elapsed, 2)
        }, indent=2))

    elif provider == "bark":
        if not ensure_vram(12000):
            sys.exit(1)

        import torch
        from transformers import AutoProcessor, BarkModel
        import scipy.io.wavfile

        processor = AutoProcessor.from_pretrained("suno/bark")
        model = BarkModel.from_pretrained("suno/bark", torch_dtype=torch.float16).to("cuda")

        inputs = processor(text, voice_preset=voice or "v2/en_speaker_6")
        inputs = {k: v.to("cuda") if hasattr(v, "to") else v for k, v in inputs.items()}

        speech = model.generate(**inputs)
        audio = speech.cpu().numpy().squeeze()

        scipy.io.wavfile.write(output_path, rate=model.generation_config.sample_rate, data=audio)

        unload_model(model)
        del processor

        elapsed = time.time() - start
        print(json.dumps({
            "action": "tts",
            "provider": "bark",
            "voice": voice or "v2/en_speaker_6",
            "text_length": len(text),
            "output": output_path,
            "cost_usd": 0,
            "vram_used_mb": 12000,
            "processing_time_sec": round(elapsed, 2)
        }, indent=2))


def upsample(args):
    """Upsample audio quality with AudioSR."""
    input_path = args.input
    output_path = args.output
    model_name = args.model

    if not ensure_vram(8000):
        sys.exit(1)

    start = time.time()

    # Use AudioSR CLI
    output_dir = os.path.dirname(output_path) or "."
    subprocess.run(
        ["audiosr", "-i", input_path, "-s", output_dir,
         "--model_name", model_name, "-d", "cuda"],
        check=True, capture_output=True
    )

    # Find output file
    basename = os.path.splitext(os.path.basename(input_path))[0]
    possible_outputs = [
        os.path.join(output_dir, f"{basename}_audiosr.wav"),
        os.path.join(output_dir, f"{basename}.wav"),
    ]

    for p in possible_outputs:
        if os.path.exists(p) and p != output_path:
            os.rename(p, output_path)
            break

    import torch
    torch.cuda.empty_cache()

    elapsed = time.time() - start
    print(json.dumps({
        "action": "upsample",
        "model": model_name,
        "input": input_path,
        "output": output_path,
        "processing_time_sec": round(elapsed, 1),
        "vram_used_mb": 8000
    }, indent=2))


def main():
    parser = argparse.ArgumentParser(description="AI audio enhancement")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Separate
    sep = subparsers.add_parser("separate", help="Source separation with Demucs")
    sep.add_argument("input", help="Input audio/video file")
    sep.add_argument("--stems", default="vocals", help="Stems: vocals, drums, bass, other, all")
    sep.add_argument("--model", default="htdemucs_ft", help="Model (default: htdemucs_ft)")
    sep.add_argument("--output", required=True, help="Output path")

    # Diarize
    dia = subparsers.add_parser("diarize", help="Speaker diarization")
    dia.add_argument("input", help="Input audio/video file")
    dia.add_argument("--hf-token", help="HuggingFace token")
    dia.add_argument("--with-transcript", action="store_true", help="Include WhisperX transcript")
    dia.add_argument("--output", required=True, help="Output JSON path")

    # Denoise
    den = subparsers.add_parser("denoise", help="AI noise reduction")
    den.add_argument("input", help="Input audio/video file")
    den.add_argument("--output", required=True, help="Output path")

    # TTS
    tts_p = subparsers.add_parser("tts", help="Text-to-speech voiceover")
    tts_p.add_argument("--text", required=True, help="Text to speak")
    tts_p.add_argument("--provider", required=True, choices=["elevenlabs", "openai", "bark"],
                       help="TTS provider")
    tts_p.add_argument("--voice", help="Voice name/ID")
    tts_p.add_argument("--model", help="Model variant (openai: tts-1, tts-1-hd)")
    tts_p.add_argument("--output", required=True, help="Output audio path")

    # Upsample
    ups = subparsers.add_parser("upsample", help="Audio upsampling (phone to studio)")
    ups.add_argument("input", help="Input audio file")
    ups.add_argument("--model", default="speech", choices=["speech", "music", "general"],
                     help="Model (default: speech)")
    ups.add_argument("--output", required=True, help="Output path")

    args = parser.parse_args()

    if args.command == "separate":
        separate(args)
    elif args.command == "diarize":
        diarize(args)
    elif args.command == "denoise":
        denoise(args)
    elif args.command == "tts":
        tts(args)
    elif args.command == "upsample":
        upsample(args)


if __name__ == "__main__":
    main()
