# Claude Code Experiments

Project skills live in `.claude/skills/` and load automatically in Claude Code sessions opened in this repo.

## Vendored skill packs

| Source | Skills added | Purpose |
| --- | --- | --- |
| [charlesdove977/claude-x-jev](https://github.com/charlesdove977/claude-x-jev) @ `c8662b0` | `claude-x-jev` | Jev sorts/checks/scores items so Claude focuses on reading and writing (needs OpenRouter key) |
| [uizze/uizze](https://github.com/uizze/uizze) @ `4a0224f` | `ui-design`, `ui-radar`, `anti-ui-slop` | Product-specific interfaces, flags generic UI and unfinished states |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) @ `6e802bd` | `impeccable` | Hierarchy, typography, spacing, color, responsive behavior |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) @ `ce26fc2` | `taste-skill`, `taste-skill-v1`, `gpt-tasteskill`, `redesign-skill`, `soft-skill`, `brutalist-skill`, `minimalist-skill`, `brandkit`, `stitch-skill`, `output-skill`, `image-to-code-skill`, `imagegen-frontend-web`, `imagegen-frontend-mobile` | Frontend design against generic layouts: typography, spacing, motion |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) @ `e8a175d` | `emil-design-eng`, `animate`, `animate-expo`, `animation-vocabulary`, `improve-animations`, `review-animations`, `find-animation-opportunities`, `apple-design`, `break-ui`, `prototype`, `pick-ui-library`, `mobile-native`, `write-swift`, `ask-sonner` | Interface design and animation: easing, interactions, polished UI |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) @ `063bee9` | `web-design-guidelines` | Accessibility, forms, focus states, UX details |
| [ootto-ai/claude-content-skills](https://github.com/ootto-ai/claude-content-skills) @ `07b5294` | 52 skills (`viral-hook-writer`, `reel-scripter`, `caption-and-hashtags`, `content-calendar`, `carousel-builder`, ...) | Hooks, scripts, captions, reels, IG content planning |

Upstream licenses are in `third_party_licenses/`. Jev's optional PreToolUse hook (`.claude/skills/claude-x-jev/hooks/pre-tool-gate.sh`) is not enabled.
