# Remotion Reference

## What is Remotion?

React-based framework for creating videos programmatically. Claude writes React components, Remotion renders each frame headlessly via Chrome, then FFmpeg assembles the video.

**Best for**: text animations, data visualizations, motion graphics, branded templates, anything that needs React/CSS power.
**Not for**: simple operations (trimming, transcoding, overlays) — use FFmpeg directly.

## Prerequisites

- Node.js 18+ (available via nvm)
- Chrome Headless Shell (auto-downloaded on first render, ~200MB)
- Remotion: `npx create-video@latest` or `npm install remotion @remotion/cli`

## Setup

```bash
# Create new project
npx create-video@latest --template blank my-video

# Or add to existing project
npm install remotion @remotion/cli @remotion/bundler
```

## Core Concepts

**Composition**: Video definition (width, height, fps, duration, default props)
**Component**: React component that renders for the current frame
**useCurrentFrame()**: Returns the current frame number (0-based)
**useVideoConfig()**: Returns { width, height, fps, durationInFrames }
**spring()**: Physics-based animation (damping, stiffness, mass)
**interpolate()**: Linear/eased interpolation between values
**Sequence**: Timed sub-section with from/duration

## Render Commands

```bash
# Render composition to MP4
npx remotion render src/index.ts CompositionId output.mp4 \
  --codec h264 --crf 18

# Render with props
npx remotion render src/index.ts CompositionId output.mp4 \
  --props='{"title":"Hello","data":[1,2,3]}'

# Render still frame (thumbnail)
npx remotion still src/index.ts CompositionId thumb.png --frame 45

# Preview in browser
npx remotion preview src/index.ts
```

## Render Options

| Flag | Purpose | Values |
|------|---------|--------|
| `--codec` | Output codec | h264, h265, vp8, vp9, prores |
| `--crf` | Quality | 0-51 (lower = better) |
| `--image-format` | Frame format | jpeg (fast), png (transparency) |
| `--scale` | Resolution multiplier | 0.5, 1, 2 |
| `--concurrency` | Parallel threads | Default: CPU cores / 2 |
| `--every-nth-frame` | Skip frames (preview) | 2, 5, 10 |
| `--props` | JSON props | '{"key":"value"}' |
| `--gl` | Renderer | angle, egl, swiftshader, vulkan |

## Common Patterns

### Title Card
- Background color/gradient
- Title text with spring scale animation
- Subtitle with delayed fade-in
- Duration: 2-5 seconds (60-150 frames at 30fps)

### Data Visualization
- Accept data as props (JSON array)
- Animate bars/lines growing with interpolate()
- Add labels with staggered Sequences
- Duration: 5-10 seconds

### Text Sequence
- Array of text lines
- Each in a Sequence with staggered `from` offsets
- Fade/slide/spring animations per line

### Branded Intro/Outro
- Logo with scale spring animation
- Tagline with delayed appearance
- Configurable colors, fonts, text via props

## Licensing

- Free for individuals and companies with ≤3 employees
- Company license required for 4+ employees ($100+/month)
- See remotion.dev/license for details

## Integration with claude-video

1. Claude generates React component code based on user's description
2. Writes to project's `src/` directory
3. Registers composition in `Root.tsx`
4. Renders headlessly via `npx remotion render`
5. Output video can be piped to other sub-skills (edit, caption, export)
