#!/usr/bin/env python3
"""Render every entry's deck to PNG slides plus one contact sheet per entry, for blind judging.

Usage: python3 render_deck.py <competition_dir>

Each entry-*/ folder may contain deck.pptx, deck.pdf or deck.html (first found wins).
Output: <competition_dir>/renders/<entry>/slide-NN.png and <competition_dir>/renders/<entry>-sheet.png
Prints a JSON report: slide count, source format, errors.
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

PLAYWRIGHT = "/opt/node22/lib/node_modules/playwright/index.mjs"


def html_to_pdf(html: Path, pdf: Path) -> None:
    script = pdf.with_suffix(".mjs")
    script.write_text(f"""
import {{ chromium }} from '{PLAYWRIGHT}';
const b = await chromium.launch();
const p = await b.newPage({{ viewport: {{ width: 1920, height: 1080 }} }});
await p.goto('file://{html}', {{ waitUntil: 'networkidle', timeout: 30000 }}).catch(() => {{}});
await p.waitForTimeout(1500);
await p.emulateMedia({{ media: 'print' }});
await p.pdf({{ path: '{pdf}', width: '1920px', height: '1080px', printBackground: true }});
await b.close();
""")
    subprocess.run(["node", str(script)], check=True, capture_output=True, timeout=120)
    script.unlink()


def contact_sheet(slides: list[Path], out: Path, cols: int = 4, thumb_w: int = 480) -> None:
    thumbs = []
    for s in slides:
        im = Image.open(s).convert("RGB")
        im.thumbnail((thumb_w, thumb_w))
        thumbs.append(im)
    if not thumbs:
        return
    th = max(t.height for t in thumbs)
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (thumb_w + 16) + 16, rows * (th + 16) + 16), (128, 128, 128))
    for i, t in enumerate(thumbs):
        sheet.paste(t, (16 + (i % cols) * (thumb_w + 16), 16 + (i // cols) * (th + 16)))
    sheet.save(out)


def main(root: Path) -> None:
    renders = root / "renders"
    renders.mkdir(exist_ok=True)
    report = []
    for entry in sorted(p for p in root.iterdir() if p.is_dir() and p.name.startswith("entry-")):
        src = next((entry / f for f in ("deck.pptx", "deck.pdf", "deck.html") if (entry / f).exists()), None)
        row = {"entry": entry.name, "source": src.name if src else None, "slides": 0, "errors": []}
        if not src:
            row["errors"].append("no deck.pptx / deck.pdf / deck.html")
            report.append(row)
            continue
        out = renders / entry.name
        shutil.rmtree(out, ignore_errors=True)
        out.mkdir()
        try:
            pdf = out / "deck.pdf"
            if src.suffix == ".pptx":
                subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", str(out), str(src)],
                               check=True, capture_output=True, timeout=180)
            elif src.suffix == ".html":
                html_to_pdf(src.resolve(), pdf.resolve())
            else:
                shutil.copy(src, pdf)
            subprocess.run(["pdftoppm", "-png", "-r", "60", str(pdf), str(out / "slide")],
                           check=True, capture_output=True, timeout=180)
            slides = sorted(out.glob("slide-*.png"))
            row["slides"] = len(slides)
            contact_sheet(slides, renders / f"{entry.name}-sheet.png")
        except Exception as e:  # report and keep going; a broken entry scores low, it does not stop the run
            row["errors"].append(f"{type(e).__name__}: {e}"[:300])
        report.append(row)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main(Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve())
