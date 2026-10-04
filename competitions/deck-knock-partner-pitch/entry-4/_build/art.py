from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "art")
FONTS = "/root/.claude/skills/synced/39c3c816-482d-4053-b2d5-34d56ef9b24d_3824c06c-5de9-44c0-86b7-ff7177e8d44b/canvas-design/canvas-fonts"
MONO = os.path.join(FONTS, "DMMono-Regular.ttf")

INK = (20, 33, 29)
INK_LINE = (44, 63, 56)
INK_FAINT = (34, 50, 44)
LABEL = (78, 99, 91)
BRASS = (200, 154, 88)
BRASS_HI = (238, 205, 148)
PAPER = (247, 246, 242)
STONE = (217, 214, 206)


def mono(sz):
    return ImageFont.truetype(MONO, sz)


def light_layer(size, poly, color, alpha, blur):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.polygon(poly, fill=color + (alpha,))
    return layer.filter(ImageFilter.GaussianBlur(blur))


def door_field(W, H, cols, rows, open_cell, margin, gap_x, gap_y, labels=True, fig="fig. 01"):
    img = Image.new("RGBA", (W, H), INK + (255,))
    d = ImageDraw.Draw(img)
    cw = (W - 2 * margin - (cols - 1) * gap_x) / cols
    ch = (H - 2 * margin - (rows - 1) * gap_y) / rows
    lw = max(2, W // 900)
    cells = {}
    for r in range(rows):
        for c in range(cols):
            x0 = margin + c * (cw + gap_x)
            y0 = margin + r * (ch + gap_y)
            cells[(c, r)] = (x0, y0, x0 + cw, y0 + ch)
            if (c, r) == open_cell:
                continue
            d.rectangle((x0, y0, x0 + cw, y0 + ch), outline=INK_LINE, width=lw)
            # tiny knob
            kx = x0 + cw * 0.80
            ky = y0 + ch * 0.55
            rr = lw * 1.6
            d.ellipse((kx - rr, ky - rr, kx + rr, ky + rr), fill=INK_LINE)
    # open door
    x0, y0, x1, y1 = cells[open_cell]
    cw_, ch_ = x1 - x0, y1 - y0
    # light spill on the floor: a wedge fading with distance
    spill = [(x0, y1), (x1, y1), (x1 + cw_ * 1.6, H), (x0 - cw_ * 0.3, H)]
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(spill, fill=255)
    grad = Image.new("L", (W, H), 0)
    gd = ImageDraw.Draw(grad)
    span = H - y1
    for yy in range(int(y1), H):
        t = (yy - y1) / span
        gd.line((0, yy, W, yy), fill=int(150 * (1 - t) ** 1.6))
    from PIL import ImageChops
    mask = ImageChops.multiply(mask, grad).filter(ImageFilter.GaussianBlur(W / 120))
    layer = Image.new("RGBA", (W, H), BRASS + (0,))
    layer.putalpha(mask)
    img = Image.alpha_composite(img, layer)
    # glow around aperture
    glow = [(x0 - cw_ * 0.25, y0 - ch_ * 0.12), (x1 + cw_ * 0.25, y0 - ch_ * 0.12), (x1 + cw_ * 0.25, y1 + ch_ * 0.05), (x0 - cw_ * 0.25, y1 + ch_ * 0.05)]
    img = Image.alpha_composite(img, light_layer((W, H), glow, BRASS, 55, W / 45))
    d = ImageDraw.Draw(img)
    # lit aperture
    d.rectangle((x0, y0, x1, y1), fill=BRASS_HI)
    # inner gradient: brighter near the opening edge
    for i in range(int(cw_)):
        t = i / cw_
        col = tuple(int(BRASS_HI[k] * (1 - t) + BRASS[k] * t) for k in range(3))
        d.line((x0 + i, y0, x0 + i, y1), fill=col)
    # door leaf swung inward, hinged on the right, in perspective
    leaf = [(x1, y0), (x1, y1), (x1 - cw_ * 0.42, y1 - ch_ * 0.06), (x1 - cw_ * 0.42, y0 + ch_ * 0.06)]
    d.polygon(leaf, fill=INK_FAINT)
    d.line(leaf + [leaf[0]], fill=BRASS, width=lw)
    d.rectangle((x0, y0, x1, y1), outline=BRASS, width=lw + 1)
    if labels:
        f = mono(max(14, W // 95))
        # column indices along the top
        for c in range(cols):
            cx0, _, cx1, _ = cells[(c, 0)]
            t = f"{c + 1:02d}"
            tw = d.textlength(t, font=f)
            d.text(((cx0 + cx1) / 2 - tw / 2, margin * 0.42), t, font=f, fill=BRASS if c == open_cell[0] else LABEL)
        for r in range(rows):
            _, ry0, _, ry1 = cells[(0, r)]
            t = chr(65 + r)
            d.text((margin * 0.38, (ry0 + ry1) / 2 - f.size / 2), t, font=f, fill=BRASS if r == open_cell[1] else LABEL)
        lab = f"{fig}   {chr(65 + open_cell[1])}{open_cell[0] + 1:02d}   open"
        d.text((margin, H - margin * 0.62), lab, font=f, fill=LABEL)
    return img


def title_art():
    W, H = 2560, 3000
    img = door_field(W, H, 6, 4, (3, 1), 210, 70, 110, fig="fig. 01")
    img.convert("RGB").save(os.path.join(OUT, "title.png"), optimize=True)


def close_art():
    W, H = 2400, 3000
    img = door_field(W, H, 5, 4, (1, 1), 210, 80, 110, fig="fig. 11")
    img.convert("RGB").save(os.path.join(OUT, "close.png"), optimize=True)


def portal_art():
    # many identical applications, a handful answered
    W, H = 2200, 2200
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    cols, rows = 22, 22
    m = 120
    g = 22
    cw = (W - 2 * m - (cols - 1) * g) / cols
    ch = (H - 2 * m - (rows - 1) * g) / rows
    answered = {(17, 4), (5, 13), (12, 19)}
    for r in range(rows):
        for c in range(cols):
            x0 = m + c * (cw + g)
            y0 = m + r * (ch + g)
            if (c, r) in answered:
                d.rectangle((x0, y0, x0 + cw, y0 + ch), fill=BRASS)
            else:
                d.rectangle((x0, y0, x0 + cw, y0 + ch), outline=STONE, width=3)
    img.save(os.path.join(OUT, "portal.png"), optimize=True)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    title_art()
    close_art()
    portal_art()
