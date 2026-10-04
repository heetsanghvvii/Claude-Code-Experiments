#!/usr/bin/env bash
# Longform-to-shortform pipeline: extract viral-ready short clips from long videos.
#
# Usage: bash scripts/shorts_pipeline.sh INPUT [OPTIONS]
#
# Options:
#   --count N        Number of shorts to extract (default: 5)
#   --duration S     Target clip length in seconds (default: 60)
#   --style STYLE    Caption style: default, bold, minimal, neon, shadow (default: bold)
#   --platform PLAT  Export target: tiktok, reels, shorts, all (default: tiktok)
#   --skip-captions  Skip animated caption burn-in
#   --skip-crop      Keep original aspect ratio (no 9:16 crop)
#   --hook-text TXT  Custom hook text overlay for first 3 seconds
#   --language LANG  Transcription language (default: en)
#   --output-dir DIR Output directory (default: same as input)
set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────
INPUT=""
COUNT=5
DURATION=60
STYLE="bold"
PLATFORM="tiktok"
SKIP_CAPTIONS=false
SKIP_CROP=false
HOOK_TEXT=""
LANGUAGE="en"
OUTPUT_DIR=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$HOME/.video-skill/bin/activate"

# ── Parse arguments ───────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        --count) COUNT="$2"; shift 2 ;;
        --duration) DURATION="$2"; shift 2 ;;
        --style) STYLE="$2"; shift 2 ;;
        --platform) PLATFORM="$2"; shift 2 ;;
        --skip-captions) SKIP_CAPTIONS=true; shift ;;
        --skip-crop) SKIP_CROP=true; shift ;;
        --hook-text) HOOK_TEXT="$2"; shift 2 ;;
        --language) LANGUAGE="$2"; shift 2 ;;
        --output-dir) OUTPUT_DIR="$2"; shift 2 ;;
        -*) echo "Unknown option: $1" >&2; exit 1 ;;
        *) INPUT="$1"; shift ;;
    esac
done

if [[ -z "$INPUT" ]]; then
    echo "Usage: bash scripts/shorts_pipeline.sh INPUT [--count N] [--duration S] [--style STYLE] [--platform PLATFORM]"
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

TMPDIR=$(mktemp -d /tmp/claude_video_shorts_XXXXX)
trap 'rm -rf "$TMPDIR"' EXIT INT TERM

echo "=== claude-video shorts pipeline ==="
echo "Input:    $INPUT"
echo "Count:    $COUNT shorts"
echo "Duration: ${DURATION}s"
echo "Style:    $STYLE"
echo "Platform: $PLATFORM"
echo "Temp dir: $TMPDIR"
echo ""

# ── Step 1: Transcribe ───────────────────────────────────────
echo "[1/9] Transcribing with WhisperX..."
if [[ -f "$VENV" ]]; then
    source "$VENV"
fi

python3 "$SCRIPT_DIR/segment_scorer.py" transcribe "$INPUT" \
    --model large-v2 --language "$LANGUAGE" \
    --output "$TMPDIR/transcript.json" 2>&1 | tee "$TMPDIR/step1.log"

echo "  Transcript saved to $TMPDIR/transcript.json"
echo ""

# ── Step 2: Scene Detection ──────────────────────────────────
echo "[2/9] Detecting scenes with PySceneDetect..."
if command -v scenedetect &>/dev/null; then
    scenedetect -i "$INPUT" detect-adaptive -t 3.0 \
        list-scenes -o "$TMPDIR/" -f scenes.csv \
        2>&1 | tail -1
    SCENES_ARG="--scenes $TMPDIR/scenes.csv"
else
    echo "  PySceneDetect not found, skipping scene detection"
    SCENES_ARG=""
fi
echo ""

# ── Step 3: Score Segments ────────────────────────────────────
echo "[3/9] Scoring segments for engagement..."
python3 "$SCRIPT_DIR/segment_scorer.py" score "$INPUT" \
    --transcript "$TMPDIR/transcript.json" \
    $SCENES_ARG \
    --duration "$DURATION" --count "$COUNT" \
    --output "$TMPDIR/segments.json" 2>&1 | tee "$TMPDIR/step3.log"

echo ""

# ── Steps 4-9: Process each segment ──────────────────────────
MANIFEST_SHORTS="[]"
SEGMENT_COUNT=$(python3 -c "import json; d=json.load(open('$TMPDIR/segments.json')); print(len(d['top_segments']))")

echo "Processing $SEGMENT_COUNT segments..."
echo ""

for i in $(seq 1 "$SEGMENT_COUNT"); do
    IDX=$(printf "%02d" "$i")

    # Read segment timing
    START=$(python3 -c "import json; d=json.load(open('$TMPDIR/segments.json')); print(d['top_segments'][$i-1]['start'])")
    END=$(python3 -c "import json; d=json.load(open('$TMPDIR/segments.json')); print(d['top_segments'][$i-1]['end'])")
    SCORE=$(python3 -c "import json; d=json.load(open('$TMPDIR/segments.json')); print(d['top_segments'][$i-1]['score'])")

    echo "── Short $IDX (score: $SCORE, ${START}s-${END}s) ──"

    # ── Step 4: Extract segment ───────────────────────────────
    echo "  [4/9] Extracting segment..."
    SEGMENT="$TMPDIR/segment_${IDX}.mp4"
    ffmpeg -y -ss "$START" -to "$END" -i "$INPUT" -c copy "$SEGMENT" 2>/dev/null

    CURRENT="$SEGMENT"

    # ── Step 5: Smart crop to 9:16 ────────────────────────────
    if [[ "$SKIP_CROP" = false ]]; then
        echo "  [5/9] Smart cropping to 9:16 with face tracking..."
        CROPPED="$TMPDIR/segment_${IDX}_cropped.mp4"
        python3 "$SCRIPT_DIR/face_tracker.py" "$CURRENT" "$CROPPED" \
            --aspect 9:16 --smoothing 0.1 \
            --output-width 1080 --output-height 1920 2>&1 | tail -1
        CURRENT="$CROPPED"
    else
        echo "  [5/9] Skipping crop (--skip-crop)"
    fi

    # ── Step 6: Add animated captions ─────────────────────────
    if [[ "$SKIP_CAPTIONS" = false ]]; then
        echo "  [6/9] Adding animated captions ($STYLE style)..."
        CAPTIONED="$TMPDIR/segment_${IDX}_captioned.mp4"
        if [[ -f "$SCRIPT_DIR/caption_pipeline.sh" ]]; then
            bash "$SCRIPT_DIR/caption_pipeline.sh" "$CURRENT" "$CAPTIONED" "$LANGUAGE" "$STYLE" 2>&1 | tail -1
            if [[ -f "$CAPTIONED" ]]; then
                CURRENT="$CAPTIONED"
            else
                echo "  Warning: Caption pipeline failed, continuing without captions"
            fi
        else
            echo "  Warning: caption_pipeline.sh not found, skipping captions"
        fi
    else
        echo "  [6/9] Skipping captions (--skip-captions)"
    fi

    # ── Step 7: Hook text overlay ─────────────────────────────
    echo "  [7/9] Adding hook text overlay..."
    HOOKED="$TMPDIR/segment_${IDX}_hooked.mp4"

    if [[ -n "$HOOK_TEXT" ]]; then
        HOOK="$HOOK_TEXT"
    else
        # Extract first sentence from segment transcript as hook
        HOOK=$(python3 -c "
import json
d = json.load(open('$TMPDIR/segments.json'))
excerpt = d['top_segments'][$i-1].get('transcript_excerpt', '')
first_sentence = excerpt.split('.')[0].split('?')[0].split('!')[0]
if len(first_sentence) > 60:
    first_sentence = first_sentence[:57] + '...'
print(first_sentence.strip())
" 2>/dev/null || echo "")
    fi

    if [[ -n "$HOOK" ]]; then
        ffmpeg -y -i "$CURRENT" \
            -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${HOOK}':fontcolor=white:fontsize=48:borderw=3:bordercolor=black:x=(w-text_w)/2:y=h*0.15:enable='between(t,0,3)'" \
            -c:v libx264 -crf 18 -c:a copy "$HOOKED" 2>/dev/null
        CURRENT="$HOOKED"
    fi

    # ── Step 8: Normalize audio to -14 LUFS ───────────────────
    echo "  [8/9] Normalizing audio to -14 LUFS..."
    NORMALIZED="$TMPDIR/segment_${IDX}_normalized.mp4"
    if command -v ffmpeg-normalize &>/dev/null; then
        ffmpeg-normalize "$CURRENT" -o "$NORMALIZED" \
            -t -14 -tp -1.5 -c:a aac -b:a 192k 2>/dev/null
        CURRENT="$NORMALIZED"
    else
        # Fallback to FFmpeg loudnorm (single pass, less precise)
        ffmpeg -y -i "$CURRENT" -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
            -c:v copy -c:a aac -b:a 192k "$NORMALIZED" 2>/dev/null
        CURRENT="$NORMALIZED"
    fi

    # ── Step 9: Export for platform ───────────────────────────
    echo "  [9/9] Exporting for $PLATFORM..."

    if [[ "$PLATFORM" = "all" ]]; then
        PLATFORMS=("tiktok" "reels" "shorts")
    else
        PLATFORMS=("$PLATFORM")
    fi

    for PLAT in "${PLATFORMS[@]}"; do
        FINAL="${OUTPUT_DIR}/${BASENAME}_short_${IDX}_${PLAT}.mp4"

        # Platform-specific encoding
        case "$PLAT" in
            tiktok|reels|shorts)
                ffmpeg -y -i "$CURRENT" \
                    -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
                    -c:v libx264 -preset medium -crf 18 -profile:v high -level 4.2 \
                    -pix_fmt yuv420p -c:a aac -b:a 192k -ar 44100 \
                    -movflags +faststart -r 30 \
                    "$FINAL" 2>/dev/null
                ;;
        esac

        echo "  Output: $FINAL"
    done

    echo ""
done

# ── Write manifest ────────────────────────────────────────────
MANIFEST="${OUTPUT_DIR}/${BASENAME}_shorts_manifest.json"
python3 -c "
import json, os, glob

segments = json.load(open('$TMPDIR/segments.json'))
shorts = []
for i, seg in enumerate(segments['top_segments']):
    idx = f'{i+1:02d}'
    files = glob.glob('$OUTPUT_DIR/${BASENAME}_short_' + idx + '_*.mp4')
    shorts.append({
        'index': i + 1,
        'score': seg['score'],
        'start': seg['start'],
        'end': seg['end'],
        'duration': seg['duration'],
        'output_files': [os.path.basename(f) for f in sorted(files)],
        'transcript_excerpt': seg.get('transcript_excerpt', '')
    })

manifest = {
    'input': '$INPUT',
    'total_duration': segments['total_duration'],
    'shorts_generated': len(shorts),
    'platform': '$PLATFORM',
    'target_duration': $DURATION,
    'caption_style': '$STYLE',
    'shorts': shorts
}

with open('$MANIFEST', 'w') as f:
    json.dump(manifest, f, indent=2)

print(json.dumps(manifest, indent=2))
"

echo ""
echo "=== Pipeline complete ==="
echo "Generated $SEGMENT_COUNT shorts in $OUTPUT_DIR/"
echo "Manifest: $MANIFEST"
