#!/usr/bin/env bash
# Install all claude-video dependencies
# Usage: bash scripts/setup.sh [--check-only] [--ai] [--all]
#   --check-only   Only check what's missing, don't install
#   --ai           Install AI venv with PyTorch + AI packages
#   --all          Install core + AI dependencies
set -euo pipefail

CHECK_ONLY=false
INSTALL_AI=false

for arg in "$@"; do
    case "$arg" in
        --check-only) CHECK_ONLY=true ;;
        --ai) INSTALL_AI=true ;;
        --all) INSTALL_AI=true ;;
    esac
done

MISSING=()
INSTALLED=()

check_and_install() {
    local name="$1"
    local cmd="$2"
    local install_cmd="$3"
    local needs_sudo="$4"

    if command -v "$cmd" &>/dev/null; then
        INSTALLED+=("$name")
        return 0
    fi

    MISSING+=("$name")

    if [ "$CHECK_ONLY" = true ]; then
        return 0
    fi

    echo "Installing $name..."
    if [ "$needs_sudo" = "true" ]; then
        echo "  Running: sudo $install_cmd"
        eval "sudo $install_cmd"
    else
        echo "  Running: $install_cmd"
        eval "$install_cmd"
    fi

    if command -v "$cmd" &>/dev/null; then
        echo "  $name installed successfully"
    else
        echo "  WARNING: $name may not be in PATH yet"
    fi
}

echo "=== claude-video dependency setup ==="
echo ""

# Required: FFmpeg (should already be installed)
check_and_install "FFmpeg" "ffmpeg" "apt install -y ffmpeg" "true"

# Required: jq for JSON processing in scripts
check_and_install "jq" "jq" "apt install -y jq" "true"

# Recommended: faster-whisper for speech-to-text
check_and_install "faster-whisper" "whisper-ctranslate2" "pip install faster-whisper" "false"

# Recommended: Auto-Editor for silence removal
check_and_install "Auto-Editor" "auto-editor" "pip install auto-editor" "false"

# Recommended: PySceneDetect for scene detection
check_and_install "PySceneDetect" "scenedetect" "pip install 'scenedetect[opencv]'" "false"

# Recommended: yt-dlp for video downloads
check_and_install "yt-dlp" "yt-dlp" "pip install yt-dlp" "false"

# Recommended: MediaInfo for detailed file analysis
check_and_install "MediaInfo" "mediainfo" "apt install -y mediainfo" "true"

echo ""
echo "=== Summary ==="
echo "Already installed: ${INSTALLED[*]:-none}"
echo "Missing/installed: ${MISSING[*]:-none}"

if [ "$CHECK_ONLY" = true ] && [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    echo "Run 'bash scripts/setup.sh' (without --check-only) to install missing tools."
fi

echo ""
echo "Optional (install manually if needed):"
echo "  Remotion: npx create-video@latest (requires Node.js)"
echo "  Gifski:   cargo install gifski (high-quality GIFs)"

# --- AI Dependencies (--ai or --all flag) ---

VENV_DIR="$HOME/.video-skill"

if [ "$INSTALL_AI" = true ]; then
    echo ""
    echo "=== AI dependency setup ==="
    echo ""

    if [ "$CHECK_ONLY" = true ]; then
        if [ -d "$VENV_DIR" ] && [ -f "$VENV_DIR/bin/python3" ]; then
            echo "AI venv: installed ($VENV_DIR)"
            echo "Packages:"
            "$VENV_DIR/bin/pip" list --format=columns 2>/dev/null | grep -iE "torch|whisperx|diffusers|realesrgan|rife|rembg|demucs|deepfilter|pyannote|playwright|mediapipe|librosa|opencv" || echo "  (none found)"
        else
            echo "AI venv: NOT INSTALLED"
            echo "Run 'bash scripts/setup.sh --ai' to create it."
        fi
    else
        # Create venv if it doesn't exist
        if [ ! -d "$VENV_DIR" ]; then
            echo "Creating Python venv at $VENV_DIR..."
            python3 -m venv "$VENV_DIR"
        else
            echo "Venv already exists at $VENV_DIR"
        fi

        echo "Activating venv..."
        source "$VENV_DIR/bin/activate"

        echo "Installing PyTorch nightly (cu128 for RTX 5070 Ti Blackwell)..."
        pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128

        echo "Installing AI packages..."
        pip install \
            whisperx \
            mediapipe \
            opencv-python-headless \
            librosa \
            soundfile \
            diffusers transformers accelerate safetensors \
            realesrgan basicsr \
            rembg[gpu] \
            demucs \
            deepfilternet \
            pyannote-audio \
            playwright \
            openai \
            google-genai \
            elevenlabs \
            Pillow \
            numpy \
            scipy

        echo "Installing Playwright browsers..."
        playwright install --with-deps chromium

        echo ""
        echo "=== AI Setup Complete ==="
        echo "Venv location: $VENV_DIR"
        echo "Activate with: source $VENV_DIR/bin/activate"
        echo ""
        echo "Note: Some models download on first use:"
        echo "  - FLUX.2 klein (~8GB), SD 3.5 Medium (~5GB)"
        echo "  - Real-ESRGAN models (~100MB each)"
        echo "  - WhisperX large-v2 (~3GB)"
        echo "  - Demucs htdemucs_ft (~200MB)"
    fi
elif [ -d "$VENV_DIR" ]; then
    echo ""
    echo "AI venv: installed ($VENV_DIR)"
    echo "Use --ai flag to update AI packages."
else
    echo ""
    echo "AI features: Run 'bash scripts/setup.sh --ai' to install."
fi
