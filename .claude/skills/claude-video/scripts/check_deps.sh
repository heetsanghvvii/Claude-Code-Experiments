#!/usr/bin/env bash
# Check all claude-video dependencies and report status
# Usage: bash scripts/check_deps.sh
# Output: JSON with tool name, installed status, version, install command
set -euo pipefail

check_tool() {
    local name="$1"
    local cmd="$2"
    local version_cmd="$3"
    local install_cmd="$4"
    local required="$5"

    local installed="false"
    local version="none"

    if command -v "$cmd" &>/dev/null; then
        installed="true"
        version=$(eval "$version_cmd" 2>/dev/null | head -1 || echo "unknown")
    fi

    printf '{"name":"%s","command":"%s","installed":%s,"version":"%s","install":"%s","required":%s}' \
        "$name" "$cmd" "$installed" "$version" "$install_cmd" "$required"
}

echo "["

# Required tools
check_tool "FFmpeg" "ffmpeg" "ffmpeg -version 2>&1 | head -1 | grep -oP 'version \K[^ ]+'" "sudo apt install ffmpeg" "true"
echo ","
check_tool "FFprobe" "ffprobe" "ffprobe -version 2>&1 | head -1 | grep -oP 'version \K[^ ]+'" "sudo apt install ffmpeg" "true"
echo ","

# Recommended tools
check_tool "faster-whisper" "whisper-ctranslate2" "pip show faster-whisper 2>/dev/null | grep -oP 'Version: \K.*'" "pip install faster-whisper" "false"
echo ","
check_tool "Auto-Editor" "auto-editor" "auto-editor --version 2>&1" "pip install auto-editor" "false"
echo ","
check_tool "PySceneDetect" "scenedetect" "scenedetect version 2>&1 | head -1" "pip install 'scenedetect[opencv]'" "false"
echo ","
check_tool "yt-dlp" "yt-dlp" "yt-dlp --version" "pip install yt-dlp" "false"
echo ","
check_tool "MediaInfo" "mediainfo" "mediainfo --Version 2>&1 | tail -1" "sudo apt install mediainfo" "false"
echo ","
check_tool "jq" "jq" "jq --version" "sudo apt install jq" "false"
echo ","
check_tool "GNU-parallel" "parallel" "parallel --version 2>&1 | head -1" "sudo apt install parallel" "false"
echo ","
check_tool "ffmpeg-normalize" "ffmpeg-normalize" "ffmpeg-normalize --version 2>&1" "pip install ffmpeg-normalize" "false"

# AI tools (from venv)
VENV_DIR="$HOME/.video-skill"
echo ","
if [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/bin/python3" ]; then
    printf '{"name":"AI-venv","command":"~/.video-skill/bin/python3","installed":true,"version":"active","install":"bash scripts/setup.sh --ai","required":false}'
else
    printf '{"name":"AI-venv","command":"~/.video-skill/bin/python3","installed":false,"version":"none","install":"bash scripts/setup.sh --ai","required":false}'
fi

# Check venv packages if venv exists
if [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/bin/pip" ]; then
    check_venv_pkg() {
        local name="$1"
        local pkg="$2"
        local installed="false"
        local version="none"
        if "$VENV_DIR/bin/pip" show "$pkg" &>/dev/null; then
            installed="true"
            version=$("$VENV_DIR/bin/pip" show "$pkg" 2>/dev/null | grep -oP 'Version: \K.*' || echo "unknown")
        fi
        printf '{"name":"%s","command":"venv:%s","installed":%s,"version":"%s","install":"bash scripts/setup.sh --ai","required":false}' \
            "$name" "$pkg" "$installed" "$version"
    }

    echo ","
    check_venv_pkg "WhisperX" "whisperx"
    echo ","
    check_venv_pkg "MediaPipe" "mediapipe"
    echo ","
    check_venv_pkg "Playwright" "playwright"
    echo ","
    check_venv_pkg "Real-ESRGAN" "realesrgan"
    echo ","
    check_venv_pkg "rembg" "rembg"
    echo ","
    check_venv_pkg "Demucs" "demucs"
    echo ","
    check_venv_pkg "DeepFilterNet" "deepfilternet"
    echo ","
    check_venv_pkg "pyannote-audio" "pyannote-audio"
    echo ","
    check_venv_pkg "diffusers" "diffusers"
    echo ","
    check_venv_pkg "PyTorch" "torch"
fi

echo "]"
