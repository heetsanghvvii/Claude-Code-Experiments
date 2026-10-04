# Web Capture Reference

## Playwright Setup

```bash
pip install playwright
playwright install --with-deps chromium
```

**Version**: 1.58+ (Python API)

## Screenshot Patterns

### Full Page
```python
page.screenshot(path="full.png", full_page=True)
```

### Element Capture
```python
page.locator(".chart-container").screenshot(path="chart.png")
```

### Transparent Background
```python
page.screenshot(path="overlay.png", omit_background=True)
```

### With CSS Injection
```python
page.evaluate("""
    document.querySelectorAll('.ads, .cookie-banner, .popup').forEach(el => {
        el.style.display = 'none';
    });
""")
page.screenshot(path="clean.png")
```

## Device Emulation

Playwright includes 100+ device presets:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    device = p.devices["iPhone 15 Pro"]
    context = browser.new_context(**device)
    page = context.new_page()
```

**Common devices:**
| Device | Width | Height | Scale |
|--------|-------|--------|-------|
| iPhone 15 Pro | 393 | 852 | 3 |
| iPhone 15 Pro Max | 430 | 932 | 3 |
| Pixel 7 | 412 | 915 | 2.625 |
| iPad Pro 11 | 834 | 1194 | 2 |
| Galaxy S21 | 360 | 800 | 3 |

## Authentication Persistence

```python
# Save login state
context = browser.new_context(storage_state="auth.json")
page = context.new_page()
# ... log in ...
context.storage_state(path="auth.json")

# Reuse login state
context = browser.new_context(storage_state="auth.json")
```

## Browser Recording

```python
context = browser.new_context(
    record_video_dir="./recordings/",
    record_video_size={"width": 1920, "height": 1080}
)
page = context.new_page()
page.goto("https://example.com")
page.wait_for_timeout(10000)  # Record for 10 seconds
video_path = page.video.path()
context.close()
```

## Ken Burns Effect (FFmpeg)

### Zoom In (Default)
```bash
ffmpeg -loop 1 -framerate 60 -i photo.jpg \
  -vf "scale=8000:-1,zoompan=z='zoom+0.001':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=5*60:s=1920x1080:fps=60" \
  -t 5 -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Zoom Out
```bash
ffmpeg -loop 1 -framerate 60 -i photo.jpg \
  -vf "scale=8000:-1,zoompan=z='1.5-on/300*0.5':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=60" \
  -t 5 -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Pan Left to Right
```bash
ffmpeg -loop 1 -framerate 60 -i photo.jpg \
  -vf "scale=8000:-1,zoompan=z='1.2':x='on/(on+1)*(iw-iw/zoom)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=60" \
  -t 5 -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Pan Right to Left
```bash
ffmpeg -loop 1 -framerate 60 -i photo.jpg \
  -vf "scale=8000:-1,zoompan=z='1.2':x='iw-iw/zoom-on/(on+1)*(iw-iw/zoom)':y='ih/2-(ih/zoom/2)':d=300:s=1920x1080:fps=60" \
  -t 5 -c:v libx264 -pix_fmt yuv420p output.mp4
```

### Key Parameters
- `z='zoom+0.001'`: Zoom increment per frame
- `d=300`: Total frames (5 seconds x 60fps = 300)
- `s=1920x1080`: Output resolution
- `fps=60`: Smooth animation
- Initial `scale=8000:-1`: Overscale source for zoom headroom

## Screenshots to Slideshow

```bash
# Create slideshow from screenshots with crossfade transitions
ffmpeg -framerate 1/3 -i captures/%03d.png \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 18 -pix_fmt yuv420p -r 30 slideshow.mp4
```

With crossfade between each:
```bash
# For 2 images with 1s crossfade:
ffmpeg -loop 1 -t 3 -i img1.png -loop 1 -t 3 -i img2.png \
  -filter_complex "xfade=transition=fade:duration=1:offset=2" \
  -c:v libx264 -pix_fmt yuv420p output.mp4
```

## Batch Processing

```python
urls = ["https://site1.com", "https://site2.com", "https://site3.com"]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})

    for i, url in enumerate(urls):
        page = context.new_page()
        page.goto(url, wait_until="networkidle")
        page.screenshot(path=f"capture_{i:03d}.png")
        page.close()

    context.close()
    browser.close()
```
