# Audio Enhancement Reference

## Demucs v4 — Source Separation

### Models
| Model | VRAM | SDR (vocals) | Speed | Notes |
|-------|------|-------------|-------|-------|
| htdemucs_ft | 7GB | 9.20 dB | 1x | Best quality (recommended) |
| htdemucs | 5GB | 8.85 dB | 1.5x | Faster, good quality |
| htdemucs_6s | 7GB | — | 0.8x | 6-stem (guitar + piano) |

### Usage
```bash
# Isolate vocals (most common for video)
demucs --two-stems vocals -n htdemucs_ft -d cuda input_audio.wav
# Output: separated/htdemucs_ft/input_audio/vocals.wav

# Full 4-stem separation
demucs -n htdemucs_ft -d cuda input_audio.wav
# Output: separated/htdemucs_ft/input_audio/{vocals,drums,bass,other}.wav

# From video file (extracts audio automatically)
demucs --two-stems vocals -n htdemucs_ft -d cuda video.mp4
```

### Use Cases for Video
- **Isolate dialogue** from background music in interviews
- **Remove background music** while keeping speech
- **Create music-only** track for audio ducking workflow
- **Extract effects** for remixing

## DeepFilterNet3 — AI Noise Reduction

### Quality Comparison
| Engine | PESQ Score | VRAM | Notes |
|--------|-----------|------|-------|
| DeepFilterNet3 | 3.17-3.50 | <1GB | State-of-the-art |
| FFmpeg afftdn | ~2.50 | 0 | Built-in fallback |

### Installation
```bash
# Python package
pip install deepfilternet

# Rust CLI (fastest)
cargo install deep-filter
```

### Usage
```bash
# Rust CLI
deep-filter input.wav -o clean.wav

# Python
from df.enhance import enhance, init_df
import soundfile as sf

model, df_state, _ = init_df()
audio, sr = sf.read("input.wav")
enhanced = enhance(model, df_state, audio)
sf.write("clean.wav", enhanced, sr)
```

### When to Use
- Phone recordings with background noise
- Webcam audio with room echo
- Field recordings with wind/traffic
- Any audio where FFmpeg afftdn isn't sufficient

## pyannote-audio 4.0 — Speaker Diarization

### Setup
```bash
pip install pyannote-audio
# Requires HuggingFace token with access to pyannote/speaker-diarization-3.1
export HF_TOKEN="hf_your_token"
```

### Usage
```python
from pyannote.audio import Pipeline
import torch

pipeline = Pipeline.from_pretrained(
    "pyannote/speaker-diarization-3.1",
    use_auth_token="HF_TOKEN"
)
pipeline.to(torch.device("cuda"))

diarization = pipeline("video.mp4")

for turn, _, speaker in diarization.itertracks(yield_label=True):
    print(f"{speaker}: {turn.start:.1f}s - {turn.end:.1f}s")
```

### Integration with WhisperX
```bash
whisperx video.mp4 --model large-v2 --language en \
  --diarize --hf_token YOUR_TOKEN \
  --output_format json --output_dir ./transcripts/
```

Output includes speaker labels per segment.

### Performance
- **VRAM**: 2-4GB
- **Speed**: 2.5% real-time (60 min video = ~90 seconds)
- **Accuracy**: State-of-the-art (DER < 10% on typical content)

## TTS Comparison

| Provider | Quality | Cost | Voices | Latency | VRAM |
|----------|---------|------|--------|---------|------|
| ElevenLabs | Best | $5/mo (30min) | 10,000+ | Low | N/A |
| OpenAI tts-1 | Very Good | $15/1M chars | 13 | Low | N/A |
| OpenAI tts-1-hd | Excellent | $30/1M chars | 13 | Medium | N/A |
| Google Neural2 | Good | $16/1M chars | 300+ | Low | N/A |
| Bark (local) | Good | Free | 100+ presets | High | 12GB |
| Coqui XTTS-v2 | Good | Free | Voice cloning | Medium | 4GB |

### ElevenLabs
```python
from elevenlabs import ElevenLabs

client = ElevenLabs(api_key="your-key")
audio = client.text_to_speech.convert(
    text="Welcome to the show.",
    voice_id="Rachel",
    model_id="eleven_multilingual_v2",
    output_format="mp3_44100_128"
)
with open("voiceover.mp3", "wb") as f:
    for chunk in audio:
        f.write(chunk)
```

### OpenAI TTS
```python
from openai import OpenAI
client = OpenAI()
response = client.audio.speech.create(
    model="tts-1",  # or tts-1-hd
    voice="alloy",  # alloy, echo, fable, onyx, nova, shimmer
    input="Welcome to the show."
)
response.stream_to_file("voiceover.mp3")
```

### Bark (Local, Free)
```python
from transformers import AutoProcessor, BarkModel
import torch, scipy

processor = AutoProcessor.from_pretrained("suno/bark")
model = BarkModel.from_pretrained("suno/bark", torch_dtype=torch.float16).to("cuda")

inputs = processor("Welcome to the show. [laughs]", voice_preset="v2/en_speaker_6")
speech = model.generate(**{k: v.to("cuda") for k, v in inputs.items()})
scipy.io.wavfile.write("voiceover.wav", rate=model.generation_config.sample_rate,
                        data=speech.cpu().numpy().squeeze())
```

Bark supports non-verbal sounds: `[laughs]`, `[sighs]`, `[music]`, `[gasps]`

## AudioSR — Audio Upsampling

### What It Does
- Input: 8-16kHz bandwidth (phone quality, compressed audio)
- Output: 24kHz bandwidth at 48kHz sample rate

### Usage
```bash
audiosr -i phone_audio.wav -s ./output --model_name speech -d cuda
```

### Models
| Model | Best For | VRAM |
|-------|----------|------|
| speech | Spoken word, podcasts | 6-8GB |
| music | Music recordings | 6-8GB |
| general | Mixed content | 6-8GB |

## VRAM Budget for Audio Enhancement

| Tool | VRAM | Tier |
|------|------|------|
| Demucs htdemucs_ft | 7GB | Heavy |
| WhisperX large-v2 | 6GB | Heavy |
| AudioSR | 6-8GB | Heavy |
| pyannote-audio | 2-4GB | Light |
| Bark TTS | 12GB | Exclusive |
| DeepFilterNet3 | <1GB | Light |

**Never combine two heavy models.** Load sequentially with `torch.cuda.empty_cache()` between them.
