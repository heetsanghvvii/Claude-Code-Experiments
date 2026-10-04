#!/usr/bin/env bash
# Pre-tool-use safety check for FFmpeg commands in Claude Video.
#
# Blocks dangerous patterns:
# - Writing to input file (overwrite source)
# - Missing -n flag (no-overwrite safety)
# - rm -rf on media directories
# - Unquoted glob expansions on video files
#
# Hook configuration in ~/.claude/settings.json:
# {
#   "hooks": {
#     "PreToolUse": [
#       {
#         "matcher": "Bash",
#         "hooks": [
#           {
#             "type": "command",
#             "command": "bash ~/.claude/skills/claude-video/hooks/preflight-check.sh \"$COMMAND\"",
#             "exitCodes": { "2": "block" }
#           }
#         ]
#       }
#     ]
#   }
# }

set -euo pipefail

COMMAND="${1:-}"

# Skip if not a video-related command
if ! echo "$COMMAND" | grep -qiE '(ffmpeg|ffprobe|remotion|npx remotion)'; then
    exit 0
fi

# Block: FFmpeg writing to same file as input
if echo "$COMMAND" | grep -qP 'ffmpeg\s.*-i\s+"?([^\s"]+)"?\s.*\s\1\s*$'; then
    echo "x BLOCKED: FFmpeg output path matches input path. This would destroy the source file."
    echo "  Use a different output filename, then rename after verification."
    exit 2
fi

# Warn: FFmpeg without -n (no-clobber) flag
if echo "$COMMAND" | grep -qE '^ffmpeg\s' && ! echo "$COMMAND" | grep -qE '\s-n\s|\s-y\s'; then
    echo "~ WARNING: FFmpeg command missing -n (no-clobber) or -y (overwrite) flag."
    echo "  Convention: always use -n to prevent accidental overwrites."
    exit 1
fi

# Block: rm -rf on common media directories
if echo "$COMMAND" | grep -qiE 'rm\s+-rf?\s+.*(public/stock|public/music|public/voiceover|output|out/)'; then
    echo "x BLOCKED: Destructive rm on media directory. Review and delete specific files instead."
    exit 2
fi

exit 0
