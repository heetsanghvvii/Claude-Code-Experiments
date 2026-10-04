#!/usr/bin/env bash
# V3 Shorts Pipeline — Screen Recording Aware
#
# Uses VLM-powered visual analysis (Gemini 2.5 Flash) to understand what's on
# screen, identify the best moments by visual interest + transcript quality,
# and compose "Framed" vertical shorts that are readable on mobile.
#
# Layout (1080x1920):
#   Top zone (200px):    Hook text — compelling data point + subtitle
#   Content (1372px):    Zoomed-out screen content, properly cropped by VLM
#   Bottom zone (348px): Karaoke captions — Impact 72pt, yellow sweep, dark box
#
# Usage: bash scripts/screen_shorts_pipeline.sh INPUT [OPTIONS]
#
# Options:
#   --count N         Number of shorts to extract (default: 5)
#   --min-duration S  Minimum clip length in seconds (default: 20)
#   --max-duration S  Maximum clip length in seconds (default: 55)
#   --style STYLE     Caption style: default, bold, minimal, neon, shadow (default: bold)
#   --platform PLAT   Export: tiktok, reels, shorts, all (default: shorts)
#   --skip-captions   Skip animated caption burn-in
#   --skip-vlm        Skip VLM analysis (use audio-only scoring)
#   --hook-text TXT   Custom hook text overlay for all shorts
#   --language LANG   Transcription language (default: en)
#   --output-dir DIR  Output directory (default: same as input)
#   --vlm-model MOD   VLM model (default: gemini-2.5-flash)
#   --max-frames N    Max frames for VLM analysis (default: 40)
#   --mode MODE       Force mode: screen, talking-head, auto (default: auto)
set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────
INPUT=""
COUNT=5
MIN_DURATION=20
MAX_DURATION=55
STYLE="bold"
PLATFORM="shorts"
SKIP_CAPTIONS=false
SKIP_VLM=false
HOOK_TEXT=""
LANGUAGE="en"
OUTPUT_DIR=""
VLM_MODEL="gemini-2.5-flash"
MAX_FRAMES=40
MODE="auto"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$HOME/.video-skill/bin/activate"

# ── Parse arguments ───────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        --count) COUNT="$2"; shift 2 ;;
        --min-duration) MIN_DURATION="$2"; shift 2 ;;
        --max-duration) MAX_DURATION="$2"; shift 2 ;;
        --style) STYLE="$2"; shift 2 ;;
        --platform) PLATFORM="$2"; shift 2 ;;
        --skip-captions) SKIP_CAPTIONS=true; shift ;;
        --skip-vlm) SKIP_VLM=true; shift ;;
        --hook-text) HOOK_TEXT="$2"; shift 2 ;;
        --language) LANGUAGE="$2"; shift 2 ;;
        --output-dir) OUTPUT_DIR="$2"; shift 2 ;;
        --vlm-model) VLM_MODEL="$2"; shift 2 ;;
        --max-frames) MAX_FRAMES="$2"; shift 2 ;;
        --mode) MODE="$2"; shift 2 ;;
        -*) echo "Unknown option: $1" >&2; exit 1 ;;
        *) INPUT="$1"; shift ;;
    esac
done

if [[ -z "$INPUT" ]]; then
    cat >&2 << 'USAGE'
Usage: bash scripts/screen_shorts_pipeline.sh INPUT [OPTIONS]

V3 Shorts Pipeline — Screen recording aware with VLM visual analysis.

Options:
  --count N         Shorts to extract (default: 5)
  --min-duration S  Min clip length (default: 20s)
  --max-duration S  Max clip length (default: 55s)
  --style STYLE     Caption style (default: bold)
  --platform PLAT   Export target (default: shorts)
  --skip-captions   Skip caption burn-in
  --skip-vlm        Skip VLM analysis (audio-only scoring)
  --hook-text TXT   Custom hook text for all shorts
  --language LANG   Transcription language (default: en)
  --output-dir DIR  Output directory
  --vlm-model MOD   VLM model (default: gemini-2.5-flash)
  --max-frames N    Max VLM frames (default: 40)
  --mode MODE       screen|talking-head|auto (default: auto)
USAGE
    exit 1
fi

if [[ ! -f "$INPUT" ]]; then
    echo "Error: Input file not found: $INPUT" >&2
    exit 1
fi

# ── Setup ─────────────────────────────────────────────────────
BASENAME=$(basename "$INPUT" | sed 's/\.[^.]*$//')
if [[ -z "$OUTPUT_DIR" ]]; then
    OUTPUT_DIR=$(dirname "$INPUT")
fi
mkdir -p "$OUTPUT_DIR"

TMPDIR=$(mktemp -d /tmp/claude_video_shorts_v2_XXXXX)
trap 'rm -rf "$TMPDIR"' EXIT INT TERM

# Activate venv if available
if [[ -f "$VENV" ]]; then
    source "$VENV"
fi

echo "=== claude-video shorts V3 pipeline ==="
echo "Input:      $INPUT"
echo "Count:      $COUNT shorts"
echo "Duration:   ${MIN_DURATION}-${MAX_DURATION}s"
echo "Style:      $STYLE"
echo "Platform:   $PLATFORM"
echo "Mode:       $MODE"
echo "VLM:        ${SKIP_VLM:+DISABLED}${SKIP_VLM:-$VLM_MODEL}"
echo "Temp dir:   $TMPDIR"
echo ""

# ── Step 1: Transcribe ────────────────────────────────────────
echo "[1/8] Transcribing with WhisperX..."
python3 "$SCRIPT_DIR/segment_scorer.py" transcribe "$INPUT" \
    --model large-v2 --language "$LANGUAGE" \
    --output "$TMPDIR/transcript.json" 2>&1 | tail -3
echo "  Transcript complete."
echo ""

# ── Step 2: Scene Detection ──────────────────────────────────
echo "[2/8] Detecting scenes with PySceneDetect..."
SCENES_ARG=""
if command -v scenedetect &>/dev/null; then
    scenedetect -i "$INPUT" detect-adaptive -t 3.0 \
        list-scenes -o "$TMPDIR/" -f scenes.csv 2>&1 | tail -1
    if [[ -f "$TMPDIR/scenes.csv" ]]; then
        SCENES_ARG="$TMPDIR/scenes.csv"
        SCENE_COUNT=$(wc -l < "$TMPDIR/scenes.csv")
        echo "  Found $((SCENE_COUNT - 1)) scenes."
    fi
else
    echo "  PySceneDetect not found, skipping."
fi
echo ""

# ── Step 3: Extract keyframes ────────────────────────────────
echo "[3/8] Extracting keyframes for analysis..."
FRAMES_DIR="$TMPDIR/frames"
mkdir -p "$FRAMES_DIR"

# Get video duration
DURATION=$(ffprobe -v quiet -show_format "$INPUT" 2>/dev/null | grep duration | head -1 | cut -d= -f2)
DURATION_INT=${DURATION%.*}

# Extract frames at scene boundaries + regular intervals
python3 -c "
import csv, os, sys

scenes = []
if '$SCENES_ARG':
    with open('$SCENES_ARG') as f:
        reader = csv.DictReader(f)
        for row in reader:
            for key in row:
                if 'start' in key.lower() and 'timecode' in key.lower():
                    parts = row[key].strip().split(':')
                    sec = float(parts[0])*3600 + float(parts[1])*60 + float(parts[2])
                    scenes.append(int(sec))

# Add regular interval frames for coverage
duration = int(float('$DURATION'))
interval = max(15, duration // $MAX_FRAMES)
for t in range(0, duration, interval):
    if t not in scenes:
        scenes.append(t)

scenes = sorted(set(scenes))
# Limit total
if len(scenes) > $MAX_FRAMES:
    step = len(scenes) / $MAX_FRAMES
    scenes = [scenes[int(i * step)] for i in range($MAX_FRAMES)]

for t in scenes:
    print(t)
" > "$TMPDIR/frame_times.txt"

FRAME_COUNT=0
while IFS= read -r ts; do
    ffmpeg -y -ss "$ts" -i "$INPUT" -frames:v 1 -q:v 2 \
        "$FRAMES_DIR/frame_${ts}s.jpg" 2>/dev/null
    FRAME_COUNT=$((FRAME_COUNT + 1))
done < "$TMPDIR/frame_times.txt"
echo "  Extracted $FRAME_COUNT keyframes."
echo ""

# ── Step 4: Auto-detect mode ─────────────────────────────────
if [[ "$MODE" = "auto" ]]; then
    echo "[4/8] Auto-detecting video type..."
    # Quick face detection check on a few frames
    DETECTED_MODE=$(python3 -c "
import os, sys
try:
    import cv2
    import mediapipe as mp
    mp_face = mp.solutions.face_detection
    frames_dir = '$FRAMES_DIR'
    files = sorted([f for f in os.listdir(frames_dir) if f.endswith('.jpg')])
    # Sample 5 evenly spaced frames
    sample = files[::max(1, len(files)//5)][:5]
    faces_found = 0
    with mp_face.FaceDetection(model_selection=1, min_detection_confidence=0.5) as fd:
        for fname in sample:
            img = cv2.imread(os.path.join(frames_dir, fname))
            if img is None:
                continue
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = fd.process(rgb)
            if results.detections:
                # Check if face is small relative to frame (webcam overlay)
                for det in results.detections:
                    bbox = det.location_data.relative_bounding_box
                    if bbox.width * bbox.height < 0.05:
                        pass  # Small webcam overlay, still screen recording
                    else:
                        faces_found += 1
                        break
    rate = faces_found / len(sample) if sample else 0
    print('talking-head' if rate > 0.6 else 'screen')
except Exception:
    print('screen')
" 2>/dev/null)
    MODE="$DETECTED_MODE"
    echo "  Detected: $MODE"
else
    echo "[4/8] Using forced mode: $MODE"
fi
echo ""

# ── Step 5: VLM Frame Analysis ───────────────────────────────
VLM_ARG=""
if [[ "$SKIP_VLM" = false ]] && [[ "$MODE" = "screen" || "$MODE" = "auto" ]]; then
    echo "[5/8] Analyzing frames with VLM ($VLM_MODEL)..."

    if [[ -z "${GOOGLE_API_KEY:-}" ]]; then
        echo "  Warning: GOOGLE_API_KEY not set, skipping VLM analysis."
        echo "  Set it with: export GOOGLE_API_KEY=your_key"
    else
        python3 "$SCRIPT_DIR/frame_analyzer.py" "$FRAMES_DIR" \
            --output "$TMPDIR/vlm_analysis.json" \
            --model "$VLM_MODEL" \
            --max-frames "$MAX_FRAMES" 2>&1 | tail -5

        if [[ -f "$TMPDIR/vlm_analysis.json" ]]; then
            VLM_ARG="--vlm-analysis $TMPDIR/vlm_analysis.json"
            echo "  VLM analysis complete."
        else
            echo "  VLM analysis failed, continuing without visual data."
        fi
    fi
elif [[ "$MODE" = "talking-head" ]]; then
    echo "[5/8] Talking-head mode — skipping VLM (face tracking will be used)."
else
    echo "[5/8] VLM analysis skipped (--skip-vlm)."
fi
echo ""

# ── Step 6: Topic Segmentation & Scoring ──────────────────────
echo "[6/8] Segmenting and scoring topics..."

SCENES_OPT=""
if [[ -n "$SCENES_ARG" ]]; then
    SCENES_OPT="$SCENES_ARG"
fi

python3 "$SCRIPT_DIR/topic_segmenter.py" "$TMPDIR/transcript.json" \
    $SCENES_OPT \
    $VLM_ARG \
    --min-duration "$MIN_DURATION" --max-duration "$MAX_DURATION" \
    --count "$COUNT" \
    --output "$TMPDIR/topics.json" 2>&1 | tail -10

TOPIC_COUNT=$(python3 -c "import json; d=json.load(open('$TMPDIR/topics.json')); print(d['topics_selected'])")
echo "  Selected $TOPIC_COUNT topics."
echo ""

# ── Step 7+8: Process each topic into a short ─────────────────
echo "Processing $TOPIC_COUNT topics into shorts..."
echo ""

for i in $(seq 1 "$TOPIC_COUNT"); do
    IDX=$(printf "%02d" "$i")

    # Read topic data
    TOPIC_DATA=$(python3 -c "
import json
d = json.load(open('$TMPDIR/topics.json'))
t = d['top_topics'][$i-1]
print(json.dumps(t))
")
    START=$(echo "$TOPIC_DATA" | python3 -c "import json,sys; print(json.load(sys.stdin)['start'])")
    END=$(echo "$TOPIC_DATA" | python3 -c "import json,sys; print(json.load(sys.stdin)['end'])")
    SCORE=$(echo "$TOPIC_DATA" | python3 -c "import json,sys; print(json.load(sys.stdin)['score'])")
    DUR=$(echo "$TOPIC_DATA" | python3 -c "import json,sys; t=json.load(sys.stdin); print(round(t['end']-t['start'],1))")

    echo "── Short $IDX (score: $SCORE, ${START}s-${END}s, ${DUR}s) ──"

    # Extract zoom regions for this topic
    echo "$TOPIC_DATA" | python3 -c "
import json, sys
t = json.load(sys.stdin)
with open('$TMPDIR/zoom_${IDX}.json', 'w') as f:
    json.dump(t.get('zoom_regions', []), f, indent=2)
"

    # ── Step 7a: Extract segment ───────────────────────────────
    echo "  [7a] Extracting segment..."
    SEGMENT="$TMPDIR/segment_${IDX}.mp4"
    ffmpeg -y -ss "$START" -to "$END" -i "$INPUT" \
        -c:v libx264 -crf 18 -preset fast -c:a aac -b:a 192k \
        "$SEGMENT" 2>/dev/null

    CURRENT="$SEGMENT"

    # ── Step 7b: Smart reframe ──────────────────────────────────
    # Generate hook text from topic data
    HOOK_LINE1=""
    HOOK_LINE2=""
    if [[ -n "$HOOK_TEXT" ]]; then
        HOOK_LINE1="$HOOK_TEXT"
    else
        HOOK_LINE1=$(echo "$TOPIC_DATA" | python3 -c "
import json, sys
t = json.load(sys.stdin)
excerpt = t.get('transcript_excerpt', '')
first = excerpt.split('.')[0].split('?')[0].split('!')[0]
if len(first) > 45:
    first = first[:42] + '...'
print(first.strip())
" 2>/dev/null || echo "")
        HOOK_LINE2="Watch this..."
    fi

    if [[ "$MODE" = "screen" ]]; then
        echo "  [7b] Smart reframing (Framed layout)..."
        REFRAMED="$TMPDIR/segment_${IDX}_reframed.mp4"
        python3 "$SCRIPT_DIR/smart_reframe.py" "$CURRENT" "$REFRAMED" \
            --zoom-data "$TMPDIR/zoom_${IDX}.json" \
            --hook-line1 "$HOOK_LINE1" --hook-line2 "$HOOK_LINE2" \
            2>&1 | tail -1
        if [[ -f "$REFRAMED" ]]; then
            CURRENT="$REFRAMED"
        else
            echo "  Warning: Smart reframe failed, falling back to face tracking."
            CROPPED="$TMPDIR/segment_${IDX}_cropped.mp4"
            python3 "$SCRIPT_DIR/face_tracker.py" "$CURRENT" "$CROPPED" \
                --aspect 9:16 --smoothing 0.1 2>&1 | tail -1
            CURRENT="$CROPPED"
        fi
    else
        echo "  [7b] Face-tracked cropping to 9:16..."
        CROPPED="$TMPDIR/segment_${IDX}_cropped.mp4"
        python3 "$SCRIPT_DIR/face_tracker.py" "$CURRENT" "$CROPPED" \
            --aspect 9:16 --smoothing 0.1 2>&1 | tail -1
        CURRENT="$CROPPED"
    fi

    # ── Step 7c: Add captions ───────────────────────────────────
    if [[ "$SKIP_CAPTIONS" = false ]]; then
        echo "  [7c] Adding animated captions ($STYLE style)..."
        CAPTIONED="$TMPDIR/segment_${IDX}_captioned.mp4"

        # Generate segment-specific transcript
        python3 -c "
import json
with open('$TMPDIR/transcript.json') as f:
    data = json.load(f)
start, end = $START, $END
words = []
for seg in data.get('segments', []):
    for w in seg.get('words', []):
        if w.get('start', 0) >= start and w.get('end', 0) <= end:
            words.append({
                'word': w['word'].strip(),
                'start': round(w['start'] - start, 3),
                'end': round(w['end'] - start, 3)
            })
output = {'segments': [{'words': words}]}
with open('$TMPDIR/seg_transcript_${IDX}.json', 'w') as f:
    json.dump(output, f)
"

        # Generate ASS captions
        python3 -c "
import json

with open('$TMPDIR/seg_transcript_${IDX}.json') as f:
    data = json.load(f)

words = data['segments'][0]['words'] if data['segments'] else []
if not words:
    exit(0)

# Detect resolution for positioning
import subprocess
result = subprocess.run(
    ['ffprobe', '-v', 'quiet', '-print_format', 'json',
     '-show_streams', '-select_streams', 'v:0', '$CURRENT'],
    capture_output=True, text=True
)
info = json.loads(result.stdout)
h = int(info['streams'][0]['height'])
w = int(info['streams'][0]['width'])

# Framed layout (1920 tall): captions centered in 348px bottom padding zone
# MarginV=240 centers text in the bottom zone
# BorderStyle=4 = opaque box behind text; BackColour=semi-transparent black
margin_v = 240 if h >= 1900 else 40
font_size = 72 if h >= 1900 else 62

ass = f'''[Script Info]
Title: claude-video shorts caption
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Impact,{font_size},&H00FFFFFF,&H0000FFFF,&H00000000,&HC0000000,-1,0,0,0,100,100,2,0,4,4,0,2,40,40,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''

def fmt(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    sec = seconds % 60
    return f'{h}:{m:02d}:{sec:05.2f}'

wpl = 3
for i in range(0, len(words), wpl):
    chunk = words[i:i + wpl]
    if not chunk:
        continue
    start = chunk[0]['start']
    end = chunk[-1]['end']
    parts = []
    for w in chunk:
        dur_cs = max(1, int((w['end'] - w['start']) * 100))
        parts.append(f'{{\\\kf{dur_cs}}}{w[\"word\"]}')
    text = ' '.join(parts)
    ass += f'Dialogue: 0,{fmt(start)},{fmt(end)},Default,,0,0,0,,{text}\n'

with open('$TMPDIR/captions_${IDX}.ass', 'w') as f:
    f.write(ass)
"

        if [[ -f "$TMPDIR/captions_${IDX}.ass" ]]; then
            ffmpeg -y -i "$CURRENT" \
                -vf "ass=$TMPDIR/captions_${IDX}.ass" \
                -c:v libx264 -crf 18 -preset medium \
                -c:a copy \
                "$CAPTIONED" 2>/dev/null
            if [[ -f "$CAPTIONED" ]]; then
                CURRENT="$CAPTIONED"
            fi
        fi
    fi

    # Hook text is now baked into smart_reframe.py (step 7b) for screen mode.
    # For talking-head mode, add hook text separately:
    if [[ "$MODE" != "screen" ]] && [[ -n "$HOOK_LINE1" ]]; then
        echo "  [7d] Adding hook text (talking-head)..."
        HOOKED="$TMPDIR/segment_${IDX}_hooked.mp4"
        ffmpeg -y -i "$CURRENT" \
            -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${HOOK_LINE1//\'/\\\'}':fontcolor=white:fontsize=52:borderw=3:bordercolor=black:x=(w-text_w)/2:y=80:enable='between(t\,0.3\,3.5)'" \
            -c:v libx264 -crf 18 -preset medium -c:a copy "$HOOKED" 2>/dev/null
        if [[ -f "$HOOKED" ]]; then
            CURRENT="$HOOKED"
        fi
    fi

    # ── Step 8a: Normalize audio ────────────────────────────────
    echo "  [8a] Normalizing audio to -14 LUFS..."
    NORMALIZED="$TMPDIR/segment_${IDX}_normalized.mp4"

    # Two-pass loudnorm
    MEASURED=$(ffmpeg -hide_banner -i "$CURRENT" \
        -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json \
        -f null /dev/null 2>&1 | python3 -c "
import sys, json, re
text = sys.stdin.read()
match = re.search(r'\{[^}]+\}', text, re.DOTALL)
if match:
    d = json.loads(match.group())
    print(f'measured_I={d[\"input_i\"]}:measured_TP={d[\"input_tp\"]}:measured_LRA={d[\"input_lra\"]}:measured_thresh={d[\"input_thresh\"]}:offset={d[\"target_offset\"]}')
else:
    print('')
" 2>/dev/null)

    if [[ -n "$MEASURED" ]]; then
        ffmpeg -y -i "$CURRENT" \
            -af "loudnorm=I=-14:TP=-1.5:LRA=11:${MEASURED}:linear=true" \
            -c:v copy -c:a aac -b:a 192k \
            "$NORMALIZED" 2>/dev/null
    else
        ffmpeg -y -i "$CURRENT" \
            -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
            -c:v copy -c:a aac -b:a 192k \
            "$NORMALIZED" 2>/dev/null
    fi

    if [[ -f "$NORMALIZED" ]]; then
        CURRENT="$NORMALIZED"
    fi

    # ── Step 8b: Export for platform ────────────────────────────
    echo "  [8b] Exporting for $PLATFORM..."

    if [[ "$PLATFORM" = "all" ]]; then
        PLATFORMS=("tiktok" "reels" "shorts")
    else
        PLATFORMS=("$PLATFORM")
    fi

    for PLAT in "${PLATFORMS[@]}"; do
        FINAL="${OUTPUT_DIR}/${BASENAME}_short_${IDX}_${PLAT}.mp4"

        ffmpeg -y -i "$CURRENT" \
            -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
            -c:v libx264 -preset medium -crf 18 -profile:v high -level 4.2 \
            -pix_fmt yuv420p -c:a aac -b:a 192k -ar 48000 \
            -movflags +faststart -r 30 \
            "$FINAL" 2>/dev/null

        SIZE=$(du -h "$FINAL" 2>/dev/null | cut -f1)
        echo "  Output: $FINAL ($SIZE)"
    done

    echo ""
done

# ── Write manifest ────────────────────────────────────────────
MANIFEST="${OUTPUT_DIR}/${BASENAME}_shorts_v3_manifest.json"
python3 -c "
import json, os, glob

topics = json.load(open('$TMPDIR/topics.json'))
shorts = []
for i, topic in enumerate(topics['top_topics']):
    idx = f'{i+1:02d}'
    files = glob.glob('$OUTPUT_DIR/${BASENAME}_short_' + idx + '_*.mp4')
    shorts.append({
        'index': i + 1,
        'score': topic['score'],
        'start': topic['start'],
        'end': topic['end'],
        'duration': topic['duration'],
        'scores': topic.get('scores', {}),
        'zoom_regions': topic.get('zoom_regions', []),
        'output_files': [os.path.basename(f) for f in sorted(files)],
        'transcript_excerpt': topic.get('transcript_excerpt', '')
    })

manifest = {
    'pipeline_version': 3,
    'input': '$INPUT',
    'total_duration': topics['total_duration'],
    'mode': '$MODE',
    'vlm_model': '$VLM_MODEL' if '$SKIP_VLM' != 'true' else None,
    'shorts_generated': len(shorts),
    'platform': '$PLATFORM',
    'duration_range': '${MIN_DURATION}-${MAX_DURATION}s',
    'caption_style': '$STYLE',
    'shorts': shorts
}

with open('$MANIFEST', 'w') as f:
    json.dump(manifest, f, indent=2)

print(json.dumps(manifest, indent=2))
"

echo ""
echo "=== V3 Pipeline complete ==="
echo "Generated $TOPIC_COUNT shorts in $OUTPUT_DIR/"
echo "Manifest: $MANIFEST"
