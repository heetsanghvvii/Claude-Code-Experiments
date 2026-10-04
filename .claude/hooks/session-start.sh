#!/bin/bash
# Install the engine's Python dependencies in fresh cloud sessions (used by scheduled sync runs too).
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
pip install -q -r "$CLAUDE_PROJECT_DIR/engine/requirements.txt" >/dev/null 2>&1 || pip install -q -r "$CLAUDE_PROJECT_DIR/engine/requirements.txt"
