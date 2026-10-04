# Shorts Pipeline Reference

## V3 Framed Layout (Screen Mode)

The validated composition approach for screen recordings:

### Layout Dimensions (1080x1920)
- **Top zone**: 200px — hook text (white 52pt + cyan 32pt, first 3.5s)
- **Content**: 1372px — cropped + scaled screen content
- **Bottom zone**: 348px — karaoke captions centered (MarginV=240)

### Crop Calculation
```
# Given source WxH and desired content_h:
crop_w = src_h * (1080 / content_h)  # e.g., 2160 * (1080/1372) = 1700
crop_h = src_h                        # always full height
crop_x = VLM-determined position      # varies by content alignment
crop_y = 0                            # always from top

# Scale + pad:
scale=1080:{content_h}, pad=1080:1920:0:{top_pad}:black
```

### Caption Style (ASS)
```
Style: Default,Impact,72,&H00FFFFFF,&H0000FFFF,&H00000000,&HC0000000,
       -1,0,0,0,100,100,2,0,4,4,0,2,40,40,240,1
```
- BorderStyle=4 (opaque box), BackColour=&HC0000000 (semi-transparent black)
- Karaoke: `{\kf<cs>}word` — word-by-word yellow sweep fill
- 3 words per line, centered in bottom padding zone

### VLM Crop Position Guide
| Content Type | x_pct | w_pct | Description |
|-------------|-------|-------|-------------|
| Left tables | 0.22 | 0.44 | Score tables, lists, left-aligned data |
| Centered | 0.28 | 0.44 | Title pages, score circles, headers |
| Right panels | 0.50 | 0.44 | Right sidebar content |
| Full width | 0.15 | 0.70 | Wide dashboards, full-screen content |

### Chrome Masking
After pad, apply drawbox to hide IDE chrome leaked into content edges:
```
drawbox=x=0:y={top_pad}:w=1080:h=22:color=black:t=fill     # title bar
drawbox=x=0:y={top_pad+content_h-15}:w=1080:h=15:color=black:t=fill  # status bar
```

---

## WhisperX Setup

WhisperX provides word-level timestamps essential for animated captions and segment scoring.

```bash
# Install in video-skill venv
pip install whisperx

# Basic transcription with word timestamps
whisperx video.mp4 --model large-v2 --language en --compute_type float16 \
  --highlight_words True --output_format json --output_dir ./transcripts/

# With speaker diarization
whisperx video.mp4 --model large-v2 --language en \
  --diarize --hf_token YOUR_TOKEN --output_format json
```

**Model Comparison:**
| Model | VRAM | Speed | Accuracy | Recommended |
|-------|------|-------|----------|-------------|
| tiny | 1GB | 32x | Low | Testing only |
| base | 1GB | 16x | Fair | Quick drafts |
| small | 2GB | 6x | Good | Budget GPU |
| medium | 5GB | 2x | Very good | Balanced |
| large-v2 | 6GB | 1x | Excellent | Production |
| large-v3 | 6GB | 0.8x | Best | Critical dialogue |

**Output JSON Format:**
```json
{
  "segments": [
    {
      "start": 0.0, "end": 5.2,
      "text": "Hello everyone welcome to the show",
      "words": [
        {"word": "Hello", "start": 0.0, "end": 0.3, "score": 0.99},
        {"word": "everyone", "start": 0.4, "end": 0.8, "score": 0.97}
      ]
    }
  ]
}
```

## Segment Scoring Algorithm

### Composite Score Formula

```
score = (audio_energy * 0.25) + (keyword_density * 0.20) + (sentiment_intensity * 0.20)
      + (scene_variety * 0.15) + (speech_rate_variation * 0.10) + (standalone_coherence * 0.10)
```

All individual scores are normalized to 0.0-1.0. Final score is 0-10 scale.

### Audio Energy (Weight: 0.25)

Uses librosa RMS energy as proxy for excitement and intensity.

```python
import librosa
import numpy as np

y, sr = librosa.load("audio.wav", sr=16000)
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=512)[0]
segment_energy = np.mean(rms[start_frame:end_frame])
```

Higher energy = more animated speech, louder moments, audience reactions.

### Keyword Density (Weight: 0.20)

Engagement keywords by category:
- **Questions**: why, how, what, when, where — indicate curiosity hooks
- **Superlatives**: best, worst, most, biggest — indicate strong claims
- **Emotional**: amazing, shocking, insane, hilarious — indicate emotional content
- **Urgency**: never, always, must, secret, hack — indicate actionable content
- **Numbers**: first, percent, million — indicate data/specifics

Score = (keyword_hits / total_words) / 0.10, capped at 1.0

### Sentiment Intensity (Weight: 0.20)

Strong emotions (positive OR negative) correlate with engagement.

Score based on density of positive and negative words in the segment. Neutral content scores low, strongly emotional content scores high.

### Scene Variety (Weight: 0.15)

More visual changes within a segment = more visually interesting.

Scene boundaries from PySceneDetect. Count boundaries within segment window. 5+ changes = max score.

### Speech Rate Variation (Weight: 0.10)

Dynamic pacing (fast-slow-fast) indicates emphasis and engagement.

Compute words-per-second in 5-second windows with 50% overlap. High coefficient of variation = dynamic pacing = higher score.

### Standalone Coherence (Weight: 0.10)

The segment should make sense out of context.

Heuristics:
- Starts with a complete sentence (+0.3)
- Ends with a complete thought (+0.3)
- Has enough content (>20 words, +0.2)
- Multiple sentences (+0.2)

## PySceneDetect Configuration

```bash
# AdaptiveDetector (recommended for most content)
scenedetect -i video.mp4 detect-adaptive -t 3.0 list-scenes save-images split-video

# ContentDetector (better for hard cuts)
scenedetect -i video.mp4 detect-content -t 27 list-scenes

# Threshold tuning:
# Lower threshold (1.0-2.0): More sensitive, detects subtle transitions
# Default (3.0): Good for most content
# Higher (5.0+): Only detects major scene changes
```

## Face Tracking Algorithm

### MediaPipe BlazeFace

```python
import mediapipe as mp

mp_face = mp.solutions.face_detection
with mp_face.FaceDetection(model_selection=1, min_detection_confidence=0.5) as fd:
    results = fd.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
```

- `model_selection=0`: Short-range (within 2 meters, more accurate)
- `model_selection=1`: Full-range (up to 5 meters, better for video)
- CPU-only, no VRAM required

### Exponential Smoothing

```python
alpha = 0.1  # Lower = smoother, higher = more responsive
smooth_x = alpha * face_cx + (1 - alpha) * smooth_x
```

- alpha=0.05: Very smooth, slow to respond to movement
- alpha=0.10: Good balance for talking-head content (recommended)
- alpha=0.20: Responsive, slight jitter on fast movement
- alpha=0.50: Very responsive, may appear jittery

### Crop Geometry

```python
# 9:16 crop from 16:9 source
crop_w = int(height * 9 / 16)  # e.g., 1080 * 9/16 = 607px from 1920 width
x1 = max(0, min(face_cx - crop_w // 2, width - crop_w))
```

For multi-person content, track the largest/most confident face detection.

## Platform Duration Limits

| Platform | Min | Max | Recommended | Notes |
|----------|-----|-----|-------------|-------|
| TikTok | 1s | 10min | 30-60s | 60s sweet spot for algorithm |
| Instagram Reels | 1s | 90s | 15-30s | Short performs better |
| YouTube Shorts | 1s | 60s | 30-60s | Must be vertical |
| Facebook Reels | 1s | 90s | 30-60s | Cross-posted from Instagram |

## Reference Projects

- **yt-short-clipper**: Most complete open-source implementation
- **AI-Youtube-Shorts-Generator**: 3k+ stars, GPT-4 highlight detection
- **ShortGPT**: Script-based generation + ElevenLabs integration
- **Opus Clip**: Commercial reference ($15-80/mo, trained viral prediction model)
