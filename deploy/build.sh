#!/bin/bash
# Copy the engine package next to the API so Vercel bundles it. Run before every deploy.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf outreach && cp -r ../engine/outreach outreach && find outreach -name __pycache__ -prune -exec rm -rf {} +
echo "engine copied"
