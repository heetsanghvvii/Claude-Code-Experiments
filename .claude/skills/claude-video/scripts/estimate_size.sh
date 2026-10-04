#!/usr/bin/env bash
# Estimate output file size and check available disk space
# Usage: bash scripts/estimate_size.sh <input_file> [target_bitrate_kbps] [output_dir]
# Output: JSON with estimated size, available space, and safety status
set -euo pipefail

INPUT="${1:-}"
TARGET_BITRATE_KBPS="${2:-5000}"  # Default 5 Mbps for 1080p H.264
OUTPUT_DIR="${3:-.}"

if ! command -v bc &>/dev/null; then
    echo '{"error":"bc not found. Install with: sudo apt install bc"}'
    exit 1
fi

if [ -z "$INPUT" ] || [ ! -f "$INPUT" ]; then
    echo '{"error":"Input file not found or not specified"}'
    exit 1
fi

# Get duration in seconds
DURATION=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$INPUT" 2>/dev/null)
if [ -z "$DURATION" ] || [ "$DURATION" = "N/A" ]; then
    echo '{"error":"Cannot determine input duration"}'
    exit 1
fi

# Get input file size
INPUT_SIZE_BYTES=$(stat -c%s "$INPUT" 2>/dev/null || stat -f%z "$INPUT" 2>/dev/null)
INPUT_SIZE_MB=$(echo "$INPUT_SIZE_BYTES / 1048576" | bc)

# Estimate output size: (bitrate_kbps * duration_seconds) / 8 / 1024 = MB
EST_MB=$(echo "$TARGET_BITRATE_KBPS * $DURATION / 8 / 1024" | bc 2>/dev/null || echo "0")

# Get available disk space
AVAIL_KB=$(df -k "$OUTPUT_DIR" 2>/dev/null | tail -1 | awk '{print $4}')
AVAIL_MB=$((AVAIL_KB / 1024))

# Safety check: need at least estimated size + 10% margin
SAFE="true"
NEEDED_MB=$((EST_MB + EST_MB / 10))
if [ "$AVAIL_MB" -lt "$NEEDED_MB" ]; then
    SAFE="false"
fi

cat <<EOF
{
  "input_file": "$INPUT",
  "input_size_mb": $INPUT_SIZE_MB,
  "duration_seconds": $DURATION,
  "target_bitrate_kbps": $TARGET_BITRATE_KBPS,
  "estimated_output_mb": $EST_MB,
  "available_space_mb": $AVAIL_MB,
  "space_sufficient": $SAFE
}
EOF
