#!/usr/bin/env python3
"""Builds renders/nope_vs_brand_photo.png: brand board panel 2 next to our renders.
Usage: python3 compare.py /path/to/brand_board.webp"""
import os
import sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(HERE, ".."))
board = Image.open(sys.argv[1]).convert("RGB")
panel = board.crop((422, 5, 834, 678))          # panel 2 of the 3x2 board (1254 px square)
H = 900


def fit(im, h=H):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)


photo = Image.open(os.path.join(OUT, "nope_photo_match.png")).convert("RGB")
# crop the render to the same portrait framing as the panel, puck centred similarly
pw, ph = photo.size
crop_w = round(ph * panel.width / panel.height)
x0 = max(0, min(pw - crop_w, 740 - crop_w // 2))
photo = photo.crop((x0, 0, x0 + crop_w, ph))
tq = Image.open(os.path.join(OUT, "nope_threequarter.png")).convert("RGB").crop((250, 150, 1350, 1050))

tiles = [(fit(panel), "Brand board, panel 2 (AI image, target)"),
         (fit(photo), "Our CAD, same scene attempt"),
         (fit(tq), "Our CAD, studio three-quarter")]
pad, top = 24, 70
W = sum(t.width for t, _ in tiles) + pad * (len(tiles) + 1)
canvas = Image.new("RGB", (W, H + top + pad + 60), (248, 241, 231))
d = ImageDraw.Draw(canvas)
try:
    f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
    fs = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
except OSError:
    f = fs = ImageFont.load_default()
x = pad
for im, label in tiles:
    canvas.paste(im, (x, top))
    d.text((x, 22), label, fill=(43, 43, 43), font=f)
    x += im.width + pad
d.text((pad, top + H + 18),
       "nope v1.0 pebble: 64 x 16 mm, pillow roll 10 x 7.5 mm, 'nope' 32 mm wide, 0.8 mm deboss. "
       "Renders are idealised: no FDM layer lines.", fill=(90, 90, 90), font=fs)
canvas.save(os.path.join(OUT, "nope_vs_brand_photo.png"))
print("wrote nope_vs_brand_photo.png", canvas.size)
