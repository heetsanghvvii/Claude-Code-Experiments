# nope wordmark + n mark, built as geometry. Units: x-height = 100, baseline y = 0, y up.
from shapely.geometry import Point, box, Polygon
from shapely.ops import unary_union
from shapely import affinity
import math
RES = 128
W = 31          # stem weight
RW = 33         # round stroke weight (rounds look thinner, so a touch heavier)
XH = 100
OV = 2.5        # overshoot for rounds
DESC = 44

def ring(cx, cy, R, r):
    return Point(cx, cy).buffer(R, RES).difference(Point(cx, cy).buffer(r, RES))

def soften(g, k=2.6, kin=1.4):
    g = g.buffer(-k, RES).buffer(k, RES)      # round convex corners
    g = g.buffer(kin, RES).buffer(-kin, RES)  # ease concave joins
    return g

def glyph_n(width=94):
    R = width / 2
    stemL = box(0, 0, W, XH)
    stemR = box(width - W, 0, width, XH - R)
    arch = ring(R, XH - R, R, R - W).intersection(box(-1, XH - R, width + 1, XH + 10))
    return soften(unary_union([stemL, stemR, arch])), width

def glyph_o():
    R = 50 + OV
    g = ring(R, 50, R, R - RW)
    return soften(g), 2 * R

def glyph_p():
    R = 50 + OV
    stem = box(0, -DESC, W, XH)
    bowl = ring(R, 50, R, R - RW)
    return soften(unary_union([stem, bowl])), 2 * R

def glyph_e():
    R = 50 + OV
    cx, cy = R, 50
    r = R - RW + 1.5
    body = ring(cx, cy, R, r)
    bar_top, bar_bot = 55, 40.5
    bar = box(cx - r - 1, bar_bot, cx + r + 1, bar_top)
    g = unary_union([body, bar])
    # aperture: wedge on the lower right, cut on an angle
    a1, a2 = math.radians(-2), math.radians(-42)
    L = 200
    wedge = Polygon([(cx, cy), (cx + L * math.cos(a1), cy + L * math.sin(a1)), (cx + L, cy - L), (cx + L * math.cos(a2), cy + L * math.sin(a2))])
    cut = wedge.intersection(box(cx, -50, cx + 200, bar_bot))
    g = g.difference(cut)
    return soften(g), 2 * R

def wordmark(track=(4.0, 4.5, 5.0)):
    parts = []
    x = 0
    gl = [glyph_n(), glyph_o(), glyph_p(), glyph_e()]
    for i, (g, w) in enumerate(gl):
        parts.append(affinity.translate(g, xoff=x))
        x += w + (track[i] if i < len(track) else 0)
    return unary_union(parts)

def to_path(g, sx=1, ox=0, oy=0, flip_h=XH):
    # flip y so SVG is y-down; baseline maps to flip_h
    g = g.simplify(0.06, preserve_topology=True)
    polys = [g] if g.geom_type == 'Polygon' else list(g.geoms)
    d = []
    def ring_d(coords):
        pts = [(ox + (x) * sx, oy + (flip_h - y) * sx) for x, y in coords]
        return 'M' + ' L'.join(f'{px:.2f} {py:.2f}' for px, py in pts[:-1]) + ' Z'
    for p in polys:
        d.append(ring_d(p.exterior.coords))
        for h in p.interiors:
            d.append(ring_d(h.coords))
    return ' '.join(d)
