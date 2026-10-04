#!/usr/bin/env bash
# End-to-end caption pipeline: extract audio → transcribe → generate ASS → burn-in
# Usage: bash scripts/caption_pipeline.sh <input_video> [output_video] [language] [style]
# Styles: default, bold, minimal, neon, shadow
set -euo pipefail

INPUT="${1:-}"
OUTPUT="${2:-}"
LANGUAGE="${3:-auto}"
STYLE="${4:-default}"
WORDS_PER_LINE=3

if [ -z "$INPUT" ]; then
    echo "Usage: caption_pipeline.sh <input_video> [output_video] [language] [style]"
    echo "Styles: default, bold, minimal, neon, shadow"
    exit 1
fi

if [ ! -f "$INPUT" ]; then
    echo "Error: Input file not found: $INPUT"
    exit 1
fi

# Default output name
if [ -z "$OUTPUT" ]; then
    BASENAME="${INPUT%.*}"
    EXT="${INPUT##*.}"
    OUTPUT="${BASENAME}_captioned.${EXT}"
fi

# Safety check
REAL_INPUT=$(realpath "$INPUT")
REAL_OUTPUT=$(realpath -m "$OUTPUT")
if [ "$REAL_INPUT" = "$REAL_OUTPUT" ]; then
    echo "Error: Output path equals input path"
    exit 1
fi

# Create temp directory
TMPDIR=$(mktemp -d /tmp/claude_video_caption_XXXXX)
trap 'rm -rf "$TMPDIR"' EXIT INT TERM

echo "=== Caption Pipeline ==="
echo "Input:    $INPUT"
echo "Output:   $OUTPUT"
echo "Language: $LANGUAGE"
echo "Style:    $STYLE"
echo ""

# Step 1: Extract audio
echo "[1/4] Extracting audio..."
ffmpeg -y -i "$INPUT" -vn -ar 16000 -ac 1 -f wav "$TMPDIR/audio.wav" 2>/dev/null
echo "  Audio extracted."

# Step 2: Transcribe with faster-whisper
echo "[2/4] Transcribing with Whisper..."
if ! command -v whisper-ctranslate2 &>/dev/null; then
    echo "Error: faster-whisper not installed. Run: pip install faster-whisper"
    exit 1
fi

LANG_FLAG=""
if [ "$LANGUAGE" != "auto" ]; then
    LANG_FLAG="--language $LANGUAGE"
fi

whisper-ctranslate2 "$TMPDIR/audio.wav" \
    --model large-v3-turbo \
    --output_format json \
    --word_timestamps True \
    --vad_filter True \
    --compute_type float16 \
    $LANG_FLAG \
    --output_dir "$TMPDIR/" 2>/dev/null

echo "  Transcription complete."

# Step 3: Convert to ASS with karaoke timing
echo "[3/4] Generating animated captions ($STYLE style)..."

python3 - "$TMPDIR/audio.json" "$TMPDIR/captions.ass" "$WORDS_PER_LINE" "$STYLE" << 'PYTHON_SCRIPT'
import json, sys

def words_to_ass(json_path, output_path, words_per_line=3, style="default"):
    with open(json_path) as f:
        data = json.load(f)

    words = []
    for segment in data.get("segments", []):
        for w in segment.get("words", []):
            words.append({
                "word": w["word"].strip(),
                "start": w["start"],
                "end": w["end"]
            })

    styles = {
        "default": {
            "font": "Arial", "size": 20,
            "primary": "&H00FFFFFF", "outline_c": "&H00000000",
            "outline": 2, "shadow": 1, "margin_v": 40
        },
        "bold": {
            "font": "Impact", "size": 24,
            "primary": "&H00FFFFFF", "outline_c": "&H00000000",
            "outline": 3, "shadow": 2, "margin_v": 40
        },
        "minimal": {
            "font": "Helvetica", "size": 18,
            "primary": "&H00FFFFFF", "outline_c": "&H80000000",
            "outline": 1, "shadow": 0, "margin_v": 30
        },
        "neon": {
            "font": "Arial Black", "size": 22,
            "primary": "&H0000FFFF", "outline_c": "&H00000000",
            "outline": 2, "shadow": 0, "margin_v": 40
        },
        "shadow": {
            "font": "Georgia", "size": 20,
            "primary": "&H00FFFFFF", "outline_c": "&H00000000",
            "outline": 0, "shadow": 3, "margin_v": 40
        },
    }
    s = styles.get(style, styles["default"])

    ass = f"""[Script Info]
Title: claude-video captions
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{s['font']},{s['size']},{s['primary']},&H000000FF,{s['outline_c']},&H00000000,0,0,0,0,100,100,0,0,1,{s['outline']},{s['shadow']},2,10,10,{s['margin_v']},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    def fmt(seconds):
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        sec = seconds % 60
        return f"{h}:{m:02d}:{sec:05.2f}"

    wpl = int(words_per_line)
    for i in range(0, len(words), wpl):
        chunk = words[i:i + wpl]
        if not chunk:
            continue
        start = chunk[0]["start"]
        end = chunk[-1]["end"]
        parts = []
        for w in chunk:
            dur_cs = max(1, int((w["end"] - w["start"]) * 100))
            parts.append(f"{{\\kf{dur_cs}}}{w['word']}")
        text = " ".join(parts)
        ass += f"Dialogue: 0,{fmt(start)},{fmt(end)},Default,,0,0,0,,{text}\n"

    with open(output_path, "w") as f:
        f.write(ass)
    print(f"  Generated {len(words)} words in {len(range(0, len(words), wpl))} lines")

words_to_ass(sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4])
PYTHON_SCRIPT

echo "  ASS captions generated."

# Step 4: Burn subtitles into video
echo "[4/4] Burning captions into video..."
ffmpeg -n -i "$INPUT" -vf "ass=$TMPDIR/captions.ass" -c:a copy "$OUTPUT" 2>/dev/null

echo ""
echo "Done! Output: $OUTPUT"
echo ""

# Show subtitle file paths for manual editing
echo "Intermediate files (auto-cleaned):"
echo "  Transcript: $TMPDIR/audio.json"
echo "  Captions:   $TMPDIR/captions.ass"
