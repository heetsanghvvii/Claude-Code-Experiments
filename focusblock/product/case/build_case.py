#!/usr/bin/env python3
"""
nope puck v1.0 "pebble": parametric case generator.

Every dimension lives in the PARAMETERS block below. Change a number, run

    python3 build_case.py                 # build everything with defaults
    python3 build_case.py --svg logo.svg  # swap in the real brand lettering
    python3 build_case.py --sticker 18    # rebuild for an 18 mm NTAG213 sticker

and all STL files plus build_report.txt are regenerated next to this script.

Units: millimetres. Axis: Z up. The body sits with its underside on Z = 0.
Geometry kernel: manifold3d (guaranteed watertight booleans). Export: trimesh.

Parts
  nope_body.stl          the puck shell, printed TOP UP (underside on the bed)
  nope_base_cap.stl      bayonet base cap with sticker post, printed OUTER FACE DOWN
  nope_assembled.stl     body + locked cap + sticker, preview only, do not print
  nope_nest.stl          optional wall or desk cradle (no magnets), printed back plate down
  nfc_test_coupons.stl   5 flat coupons (1.0 / 1.6 / 2.2 / 3.0 / 4.0 mm) for the NFC test plan
  reference/*.stl        sticker and foam placeholders used by the renders
"""

import argparse
import math
import os
import sys

import numpy as np
import trimesh
from manifold3d import CrossSection, FillRule, Manifold

HERE = os.path.dirname(os.path.abspath(__file__))

# ============================================================================
# PARAMETERS (all mm unless noted)
# ============================================================================

# ---- Outer form (derived from panel 2 of the brand board, see README) -------
DIAMETER = 64.0          # overall diameter. Photo reads ~1 : 0.28 height to width
HEIGHT = 18.0            # body height, underside to top face (cap flush)
TOP_ROLL_W = 10.0        # horizontal reach of the pillow roll on the top edge
TOP_ROLL_H = 8.5         # vertical reach of the pillow roll
TOP_ROLL_EXP = 2.4       # superellipse exponent. 2.0 = plain ellipse, 3+ = boxier shoulder
CROWN = 0.0              # dome on the top face. Keep 0 for FDM (a shallow dome prints as
                         # visible contour rings). Use 0.3 to 0.5 for cast or molded parts.
BOTTOM_RADIUS = 3.0      # bottom edge round, cut off at BOTTOM_MAX_OVERHANG then chamfered
BOTTOM_MAX_OVERHANG = 45.0  # deg from vertical, keeps the bed-side edge printable

# ---- Top skin and lettering --------------------------------------------------
SKIN = 2.2               # plastic between the NFC sticker and the top face (phone side)
LETTER_TEXT = "nope"
LETTER_FONT = os.path.join(HERE, "fonts", "Corben-Bold.ttf")  # OFL, closest free match
LETTER_WIDTH = 32.0      # word width. Photo: wordmark spans ~50 % of the diameter
LETTER_DEPTH = 0.6       # deboss depth (3 layers at 0.2, 5 at 0.12)
LETTER_OFFSET_Y = 0.6    # small upward shift so the x-height, not the descender, is centred
LETTER_SVG = None        # path to an SVG with the real lettering (overrides font)
MIN_PRINTABLE_FEATURE = 0.8  # warn if lettering strokes or gaps are thinner than this

# ---- NFC sticker stack -------------------------------------------------------
STICKER_D = 25.0         # NTAG213 round sticker: 25 (recommended) or 18
STICKER_T = 0.3          # sticker + adhesive thickness (assumption, measure yours)
SHAFT_CLEARANCE = 0.45   # radial clearance between sticker and its shaft
USE_FOAM = True          # 1 mm EVA or PE foam disc under the sticker: anti-rattle spring
FOAM_T = 1.0             # foam thickness free
FOAM_COMPRESS = 0.4      # fraction the foam is squeezed when the cap locks
NO_FOAM_GAP = 0.3        # gap left above the post when USE_FOAM is False

# ---- Base cap and bayonet (quarter-turn, wedge lock, coin slot) --------------
BORE_D = 44.0            # cap opening in the body underside
BORE_DEPTH = 4.6         # straight part of the opening, then a 45 deg cone (no bridges)
CAP_T = 4.0              # cap plate thickness
CAP_RECESS = 0.2         # cap face sits this far inside the body underside when locked
CAP_RAD_CLEARANCE = 0.25 # radial clearance cap to bore (FDM PETG: 0.2 to 0.3)
LUG_COUNT = 3
LUG_WIDTH_DEG = 18.0     # angular width of each lug
LUG_PROTRUDE = 1.4       # how far a lug sticks out past the cap edge
LUG_Z0 = 2.0             # lug bottom, measured from the cap outer face
LUG_T = 1.6              # lug thickness (Z)
LUG_RAD_CLEARANCE = 0.3  # radial clearance lug tip to slot wall
LUG_ANG_CLEARANCE = 2.0  # deg each side of the lug in the entry slot
TWIST_DEG = 30.0         # rotation from "open" to "locked"
ENTRY_AX_CLEARANCE = 0.4 # vertical play at the channel entry (loose, easy to start)
LOCK_INTERFERENCE = 0.10 # vertical squeeze at the locked end (wedge lock)
RAMP_STEPS = 12          # resolution of the wedge ramp
POST_CLEARANCE = 0.4     # radial clearance post to sticker shaft
SEAT_RECESS = 0.2        # centring recess on the post top for foam or sticker
COIN_SLOT_L = 20.0       # coin or screwdriver slot on the cap underside
COIN_SLOT_W = 2.6
COIN_SLOT_DEPTH = 2.0
FEET_COUNT = 3           # pockets for self-adhesive silicone bumpers (non-slip, lifts the puck)
FEET_D = 10.5            # pocket diameter for 10 mm bumpers
FEET_DEPTH = 0.5
FEET_RADIUS = 16.0       # pitch radius of the bumper pockets
CAP_TEXT = "put it down."  # debossed on the cap underside, set "" to disable
CAP_TEXT_WIDTH = 22.0
CAP_TEXT_DEPTH = 0.4
MARK_DEPTH = 0.4         # open / locked alignment marks on the underside

# ---- Felt fallback -----------------------------------------------------------
FELT_PAD_D = 58.0        # if the cap is skipped, a self-adhesive felt disc of this size
                         # covers the opening and sticks to the flat underside ring

# ---- Nest accessory (wall or desk cradle, no magnets) ------------------------
NEST_CLEARANCE = 0.6     # radial clearance puck to cradle
NEST_WALL = 2.4          # cradle wall thickness
NEST_PLATE_T = 2.4       # back plate thickness
NEST_FOOT_GAP = 2.0      # bumper height under the puck (puck stands on its feet)
NEST_LIP_IN = 1.6        # how far the retaining lip reaches over the pillow roll
NEST_OPEN_DEG = 150.0    # opening arc at the top, the puck slides in from here
NEST_SCREW_D = 4.2       # two countersunk screws (No.8 / M4) for wall plugs
NEST_SCREW_HEAD_D = 8.4
NEST_SCREW_SPACING = 30.0

# ---- NFC test coupons --------------------------------------------------------
COUPON_THICKNESSES = [1.0, 1.6, 2.2, 3.0, 4.0]
COUPON_D = 40.0

# ---- Output resolution -------------------------------------------------------
SEGMENTS = 256           # circular resolution
ROLL_POINTS = 48         # points along the pillow roll

PETG_DENSITY = 1.27      # g/cm3 (typical datasheet value, assumption)

# ============================================================================


def apply_cli():
    global LETTER_SVG, STICKER_D, USE_FOAM
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--svg", help="SVG file with the brand lettering (filled paths, transforms flattened)")
    ap.add_argument("--sticker", type=float, help="sticker diameter, 18 or 25")
    ap.add_argument("--no-foam", action="store_true", help="design for no anti-rattle foam disc")
    ap.add_argument("--out", default=HERE, help="output directory")
    a = ap.parse_args()
    if a.svg:
        LETTER_SVG = a.svg
    if a.sticker:
        STICKER_D = a.sticker
    if a.no_foam:
        USE_FOAM = False
    return a.out


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def to_trimesh(m: Manifold) -> trimesh.Trimesh:
    mesh = m.to_mesh()
    v = np.asarray(mesh.vert_properties)[:, :3]
    f = np.asarray(mesh.tri_verts)
    return trimesh.Trimesh(vertices=v, faces=f, process=True)


def annular_sector(r_in, r_out, a0, a1, z0, z1, steps=None):
    """Solid annular sector between angles a0..a1 (deg) and heights z0..z1."""
    if steps is None:
        steps = max(4, int(abs(a1 - a0) / 2))
    angs = np.radians(np.linspace(a0, a1, steps + 1))
    outer = [(r_out * math.cos(a), r_out * math.sin(a)) for a in angs]
    inner = [(r_in * math.cos(a), r_in * math.sin(a)) for a in angs[::-1]]
    cs = CrossSection([outer + inner])
    return Manifold.extrude(cs, z1 - z0).translate([0, 0, z0])


def cyl(r, z0, z1, x=0.0, y=0.0, seg=SEGMENTS):
    return Manifold.cylinder(z1 - z0, r, r, seg).translate([x, y, z0])


def box(x0, x1, y0, y1, z0, z1):
    return Manifold.cube([x1 - x0, y1 - y0, z1 - z0]).translate([x0, y0, z0])


# ---------------------------------------------------------------------------
# outer profile
# ---------------------------------------------------------------------------

def outer_profile():
    """(r, z) points of the outer silhouette, from the axis on the underside,
    out along the bottom, up the wall, over the pillow roll and back to the axis."""
    R, H = DIAMETER / 2, HEIGHT
    rb = BOTTOM_RADIUS
    pts = [(0.0, 0.0)]
    # bottom: 45 deg chamfer from the bed, then an arc that becomes vertical
    a_lim = math.radians(90 - BOTTOM_MAX_OVERHANG)  # arc angle measured from the wall
    cx, cz = R - rb, rb
    # arc point where the tangent is at BOTTOM_MAX_OVERHANG from vertical
    px = cx + rb * math.cos(-a_lim)
    pz = cz + rb * math.sin(-a_lim)
    r0 = px - pz * math.tan(math.radians(BOTTOM_MAX_OVERHANG))  # chamfer foot on the bed
    pts.append((r0, 0.0))
    for t in np.linspace(-a_lim, 0, 10):
        pts.append((cx + rb * math.cos(t), cz + rb * math.sin(t)))
    # vertical wall up to the roll
    z_roll = H - TOP_ROLL_H
    pts.append((R, z_roll))
    # superellipse pillow roll
    e = 2.0 / TOP_ROLL_EXP
    for t in np.linspace(0, math.pi / 2, ROLL_POINTS)[1:]:
        r = (R - TOP_ROLL_W) + TOP_ROLL_W * (math.cos(t) ** e)
        z = z_roll + TOP_ROLL_H * (math.sin(t) ** e)
        pts.append((r, z))
    # top face, with optional crown
    r_flat = R - TOP_ROLL_W
    if CROWN > 0:
        for r in np.linspace(r_flat, 0, 24)[1:]:
            pts.append((r, H + CROWN * (1 - (r / r_flat) ** 2)))
    else:
        pts.append((0.0, H))
    return pts, r0


def puck_radius_at(z):
    pts, _ = outer_profile()
    best = 0
    for (r1, z1), (r2, z2) in zip(pts, pts[1:]):
        if min(z1, z2) <= z <= max(z1, z2) and z1 != z2:
            r = r1 + (r2 - r1) * (z - z1) / (z2 - z1)
            best = max(best, r)
    return best


# ---------------------------------------------------------------------------
# lettering
# ---------------------------------------------------------------------------

def text_polygons_font(text, font_path):
    from matplotlib.font_manager import FontProperties
    from matplotlib.textpath import TextPath
    tp = TextPath((0, 0), text, size=10, prop=FontProperties(fname=font_path))
    return [np.asarray(p) for p in tp.to_polygons(closed_only=True) if len(p) >= 3]


def text_polygons_svg(svg_path):
    from svgpathtools import svg2paths
    paths, _ = svg2paths(svg_path)
    polys = []
    for p in paths:
        for sub in p.continuous_subpaths():
            n = max(16, int(sub.length() / 0.2)) if sub.length() > 0 else 16
            pts = [sub.point(t) for t in np.linspace(0, 1, n)]
            arr = np.array([[c.real, -c.imag] for c in pts])  # SVG y points down
            if len(arr) >= 3:
                polys.append(arr)
    return polys


def lettering_section(text, width, center=(0.0, 0.0), svg=None):
    polys = text_polygons_svg(svg) if svg else text_polygons_font(text, LETTER_FONT)
    allp = np.vstack(polys)
    mn, mx = allp.min(0), allp.max(0)
    s = width / (mx[0] - mn[0])
    c = (mn + mx) / 2
    contours = [((p - c) * s + np.array(center)).tolist() for p in polys]
    cs = CrossSection(contours, FillRule.EvenOdd)
    return cs, s * (mx[1] - mn[1])


def thin_feature_check(cs: CrossSection, min_feat):
    """Area of strokes thinner than min_feat (opening test) and of gaps narrower
    than min_feat (closing test), as % of the lettering area."""
    a = cs.area()
    h = min_feat / 2
    opened = cs.offset(-h, 1).offset(h, 1)
    closed = cs.offset(h, 1).offset(-h, 1)
    thin_strokes = (a - opened.area()) / a * 100
    thin_gaps = (closed.area() - a) / a * 100
    return thin_strokes, thin_gaps


# ---------------------------------------------------------------------------
# parts
# ---------------------------------------------------------------------------

def derived():
    d = {}
    d["R"] = DIAMETER / 2
    d["z_ceil"] = HEIGHT - SKIN
    d["shaft_r"] = STICKER_D / 2 + SHAFT_CLEARANCE
    d["bore_r"] = BORE_D / 2
    d["cap_r"] = d["bore_r"] - CAP_RAD_CLEARANCE
    d["lug_r_out"] = d["cap_r"] + LUG_PROTRUDE
    d["slot_r_out"] = d["lug_r_out"] + LUG_RAD_CLEARANCE
    # lug position in body coordinates when locked
    d["zl0"] = CAP_RECESS + LUG_Z0
    d["zl1"] = d["zl0"] + LUG_T
    d["ceil_ch"] = d["zl1"] - LOCK_INTERFERENCE / 2
    d["floor_lock"] = d["zl0"] + LOCK_INTERFERENCE / 2
    d["floor_entry"] = d["ceil_ch"] - LUG_T - ENTRY_AX_CLEARANCE
    foam_c = FOAM_T * (1 - FOAM_COMPRESS) if USE_FOAM else NO_FOAM_GAP
    d["post_top"] = d["z_ceil"] - STICKER_T - foam_c
    d["post_r"] = d["shaft_r"] - POST_CLEARANCE
    return d


def make_body(d, report):
    pts, r_bed = outer_profile()
    body = Manifold.revolve(CrossSection([pts]), SEGMENTS)
    report["bed_contact_d"] = 2 * r_bed

    # internal cavity: straight bore, 45 deg cone, sticker shaft (all revolved)
    br, sr = d["bore_r"], d["shaft_r"]
    z_cone_top = BORE_DEPTH + (br - sr)  # 45 deg
    if z_cone_top > d["z_ceil"] - 0.5:
        raise SystemExit("cone reaches the ceiling, lower BORE_D or raise HEIGHT")
    cav = [(0, -1), (br, -1), (br, BORE_DEPTH), (sr, z_cone_top), (sr, d["z_ceil"]), (0, d["z_ceil"])]
    body = body - Manifold.revolve(CrossSection([cav]), SEGMENTS)

    # bayonet: vertical entry slots + ramped channels
    cut = []
    W, c = LUG_WIDTH_DEG, LUG_ANG_CLEARANCE
    for k in range(LUG_COUNT):
        th = k * 360.0 / LUG_COUNT
        cut.append(annular_sector(br - 0.5, d["slot_r_out"], th - W / 2 - c, th + W / 2 + c, -1, d["ceil_ch"]))
        a_start = th + W / 2 + c          # ramp starts where the slot ends
        a_lock = th + W / 2 + TWIST_DEG   # lug leading edge when locked
        a_end = a_lock + c
        for i in range(RAMP_STEPS):
            a0 = a_start + (a_lock - a_start) * i / RAMP_STEPS
            a1 = a_start + (a_lock - a_start) * (i + 1) / RAMP_STEPS
            f = d["floor_entry"] + (d["floor_lock"] - d["floor_entry"]) * (i + 0.5) / RAMP_STEPS
            # extend each step back into the previous one so the cut is one solid
            cut.append(annular_sector(br - 0.5, d["slot_r_out"], th - W / 2 - c, a1, f, d["ceil_ch"]))
        cut.append(annular_sector(br - 0.5, d["slot_r_out"], th - W / 2 - c, a_end, d["floor_lock"], d["ceil_ch"]))
    body = body - Manifold.batch_boolean(cut, __import__("manifold3d").OpType.Add)

    # underside marks: dot = open, bar = locked (read with the cap arrow at 0 deg)
    rm = (br + r_bed) / 2
    marks = [cyl(0.9, -1, MARK_DEPTH, rm, 0.0, 32)]
    a = math.radians(TWIST_DEG)
    marks.append(box(-0.6, 0.6, -2.0, 2.0, -1, MARK_DEPTH)
                 .rotate([0, 0, 90]).rotate([0, 0, TWIST_DEG])
                 .translate([rm * math.cos(a), rm * math.sin(a), 0]))
    for m in marks:
        body = body - m

    # top lettering, depth measured along Z from the (possibly crowned) surface
    cs, letter_h = lettering_section(LETTER_TEXT, LETTER_WIDTH, (0, LETTER_OFFSET_Y), LETTER_SVG)
    report["letter_size"] = (LETTER_WIDTH, letter_h)
    report["letter_thin"] = thin_feature_check(cs, MIN_PRINTABLE_FEATURE)
    prism = Manifold.extrude(cs, 6.0).translate([0, 0, HEIGHT - 4.0])
    cutter = prism - Manifold.revolve(CrossSection([pts]), SEGMENTS).translate([0, 0, -LETTER_DEPTH])
    body = body - cutter
    return body


def make_cap(d, report):
    """Cap in its own print coordinates: outer face on Z = 0."""
    cr = d["cap_r"]
    cap = cyl(cr, 0, CAP_T)
    # lugs
    for k in range(LUG_COUNT):
        th = k * 360.0 / LUG_COUNT
        cap = cap + annular_sector(cr - 0.6, d["lug_r_out"], th - LUG_WIDTH_DEG / 2, th + LUG_WIDTH_DEG / 2,
                                   LUG_Z0, LUG_Z0 + LUG_T)
    # sticker post (solid, slicer infill inside, flat top = good sticker seat)
    post_top_local = d["post_top"] - CAP_RECESS
    cap = cap + cyl(d["post_r"], CAP_T - 0.01, post_top_local)
    seat_d = (STICKER_D + 0.6) / 2 if not USE_FOAM else (STICKER_D + 0.6) / 2
    cap = cap - cyl(min(seat_d, d["post_r"] - 0.8), post_top_local - SEAT_RECESS, post_top_local + 1)
    # guide ring for the other sticker size (0.2 mm groove)
    other = 18.0 if STICKER_D > 20 else 25.0
    if other / 2 + 0.3 < d["post_r"] - 0.8:
        g = cyl(other / 2 + 0.3, post_top_local - SEAT_RECESS - 0.2, post_top_local + 1) - \
            cyl(other / 2 - 0.1, post_top_local - 1, post_top_local + 2)
        cap = cap - g
    report["post_top_local"] = post_top_local

    # underside: coin slot, bumper pockets, arrow, text
    cap = cap - box(-COIN_SLOT_L / 2, COIN_SLOT_L / 2, -COIN_SLOT_W / 2, COIN_SLOT_W / 2, -1, COIN_SLOT_DEPTH)
    for k in range(FEET_COUNT):
        a = math.radians(90 + k * 360.0 / FEET_COUNT)
        cap = cap - cyl(FEET_D / 2, -1, FEET_DEPTH, FEET_RADIUS * math.cos(a), FEET_RADIUS * math.sin(a), 64)
    # arrow at 0 deg pointing outward (aligns with the dot = open, twist to the bar = locked)
    ra = cr - 3.2
    tri = CrossSection([[(ra - 1.6, -1.5), (ra + 1.6, 0.0), (ra - 1.6, 1.5)]])
    cap = cap - Manifold.extrude(tri, MARK_DEPTH + 1).translate([0, 0, -1])
    if CAP_TEXT:
        cs, _ = lettering_section(CAP_TEXT, CAP_TEXT_WIDTH, (0, 0))
        # bed face: mirror so it reads correctly when you look at the underside
        cs = cs.mirror([1, 0]).translate([0, 7.0])
        report["cap_text_thin"] = thin_feature_check(cs, 0.6)
        cap = cap - Manifold.extrude(cs, CAP_TEXT_DEPTH + 1).translate([0, 0, -1])
    return cap


def make_sticker(d):
    return cyl(STICKER_D / 2, d["z_ceil"] - STICKER_T, d["z_ceil"] - 0.001, seg=96)


def make_foam(d):
    return cyl(STICKER_D / 2, d["post_top"], d["z_ceil"] - STICKER_T, seg=96)


def make_nest(d, report):
    """Cradle that holds the puck by its rim. Wall mounted: opening points up and
    the puck slides in from above. On a desk: lay it flat, drop the puck in.
    No magnets, so nothing near the antenna."""
    R = d["R"]
    ri = R + NEST_CLEARANCE
    ro = ri + NEST_WALL
    z_puck0 = NEST_PLATE_T + NEST_FOOT_GAP  # body underside height inside the nest
    # lip height: where the pillow roll has pulled in enough for the lip to hook over it
    lip_r = ri - NEST_LIP_IN
    z_rel = None
    for z in np.linspace(HEIGHT - TOP_ROLL_H, HEIGHT, 400):
        if puck_radius_at(z) <= lip_r - 0.4:
            z_rel = z
            break
    lip_z = z_puck0 + z_rel
    lip_t = 1.6
    top = lip_z + lip_t
    plate = cyl(ro, 0, NEST_PLATE_T)
    ring = cyl(ro, 0, top) - cyl(ri, -1, top + 1)
    # lip with a 45 deg underside so it prints without support
    lip_prof = [(lip_r, lip_z), (ri + 0.01, lip_z - (ri - lip_r)), (ro, lip_z - (ri - lip_r)), (ro, top), (lip_r, top)]
    lip = Manifold.revolve(CrossSection([lip_prof]), SEGMENTS)
    nest = plate + ring + lip
    # opening at the top (+Y): remove ring and lip over NEST_OPEN_DEG
    half = NEST_OPEN_DEG / 2
    nest = nest - annular_sector(ri - NEST_LIP_IN - 1, ro + 1, 90 - half, 90 + half, NEST_PLATE_T, top + 1)
    # thumb window at the bottom so the puck can be pushed up and out
    nest = nest - annular_sector(ri - NEST_LIP_IN - 1, ro + 1, 270 - 12, 270 + 12, NEST_PLATE_T + 3, top + 1)
    # screw holes, countersunk, hidden behind the puck
    for sx in (-NEST_SCREW_SPACING / 2, NEST_SCREW_SPACING / 2):
        nest = nest - cyl(NEST_SCREW_D / 2, -1, NEST_PLATE_T + 1, sx, 0, 48)
        cs_depth = (NEST_SCREW_HEAD_D - NEST_SCREW_D) / 2
        cone = Manifold.cylinder(cs_depth + 0.01, NEST_SCREW_D / 2, NEST_SCREW_HEAD_D / 2, 48) \
            .translate([sx, 0, NEST_PLATE_T - cs_depth])
        nest = nest - cone
    report["nest"] = dict(outer_d=2 * ro, height=top, lip_z=lip_z, lip_inner_d=2 * lip_r)
    return nest


def make_coupons(report):
    parts = []
    n = len(COUPON_THICKNESSES)
    pitch = COUPON_D + 4
    for i, t in enumerate(COUPON_THICKNESSES):
        x = (i - (n - 1) / 2) * pitch
        c = cyl(COUPON_D / 2, 0, t, x, 0, 128)
        label = f"{t:.1f}"
        cs, _ = lettering_section(label, 16.0, (x, 0))
        depth = min(0.4, t - 0.6)
        c = c - Manifold.extrude(cs, 2).translate([0, 0, t - depth])
        # orientation notch so stacks line up
        c = c - box(x - 1, x + 1, COUPON_D / 2 - 2, COUPON_D / 2 + 1, -1, t + 1)
        parts.append(c)
    return Manifold.batch_boolean(parts, __import__("manifold3d").OpType.Add)


# ---------------------------------------------------------------------------
# checks
# ---------------------------------------------------------------------------

def overhang_report(tm: trimesh.Trimesh, bed_z=0.0, limit=45.0):
    """Area of downward faces steeper than `limit` from vertical, excluding the
    bed face. Bridges show up here too, so read with the notes."""
    n = tm.face_normals
    a = tm.area_faces
    zc = tm.triangles_center[:, 2]
    down = n[:, 2] < -math.cos(math.radians(limit))
    off_bed = zc > bed_z + 0.05
    sel = down & off_bed
    return float(a[sel].sum()), float(a.sum())


def thickness_samples(tm: trimesh.Trimesh, n=3000, seed=1):
    """Ray-cast inward from random surface points, returns local wall thickness."""
    rng = np.random.default_rng(seed)
    pts, fi = trimesh.sample.sample_surface(tm, n, seed=seed)
    nrm = tm.face_normals[fi]
    origins = pts - nrm * 1e-3
    loc, idx_ray, _ = tm.ray.intersects_location(origins, -nrm, multiple_hits=False)
    th = np.full(len(pts), np.inf)
    th[idx_ray] = np.linalg.norm(loc - origins[idx_ray], axis=1)
    return pts, th


def est_mass(tm: trimesh.Trimesh, perim=1.2, infill=0.30):
    A = tm.area / 100.0       # cm2
    V = tm.volume / 1000.0    # cm3
    shell = min(V, A * perim / 10.0)
    return PETG_DENSITY * (shell + (V - shell) * infill), PETG_DENSITY * V


# ---------------------------------------------------------------------------

def main():
    out = apply_cli()
    os.makedirs(out, exist_ok=True)
    os.makedirs(os.path.join(out, "reference"), exist_ok=True)
    rep = {}
    d = derived()

    body = make_body(d, rep)
    cap = make_cap(d, rep)
    cap_locked = cap.rotate([0, 0, TWIST_DEG]).translate([0, 0, CAP_RECESS])
    sticker = make_sticker(d)
    foam = make_foam(d) if USE_FOAM else None
    nest = make_nest(d, rep)
    coupons = make_coupons(rep)

    parts = [body, cap_locked, sticker] + ([foam] if foam is not None else [])
    assembled = Manifold.batch_boolean(parts, __import__("manifold3d").OpType.Add)

    files = {
        "nope_body.stl": body,
        "nope_base_cap.stl": cap,
        "nope_assembled.stl": assembled,
        "nope_nest.stl": nest,
        "nfc_test_coupons.stl": coupons,
        "reference/sticker_placeholder.stl": sticker,
        "reference/cap_locked_position.stl": cap_locked,
    }
    if foam is not None:
        files["reference/foam_placeholder.stl"] = foam
    tms = {}
    for name, m in files.items():
        tm = to_trimesh(m)
        tm.export(os.path.join(out, name))
        tms[name] = tm

    # ------------------------------------------------------------------ report
    L = []
    P = L.append
    P("nope puck v1.0 'pebble' build report (generated by build_case.py, do not edit)")
    P("")
    P(f"Outer: {DIAMETER:.1f} mm diameter x {HEIGHT:.1f} mm tall, ratio H/D = {HEIGHT / DIAMETER:.2f}")
    P(f"Pillow roll: {TOP_ROLL_W} mm wide x {TOP_ROLL_H} mm tall, superellipse n = {TOP_ROLL_EXP}")
    P(f"Flat top diameter: {DIAMETER - 2 * TOP_ROLL_W:.1f} mm.  Bed contact diameter: {rep['bed_contact_d']:.1f} mm")
    P(f"Lettering: '{LETTER_TEXT}' {rep['letter_size'][0]:.1f} x {rep['letter_size'][1]:.1f} mm, {LETTER_DEPTH} mm deep"
      + (f" (from SVG {LETTER_SVG})" if LETTER_SVG else f" (font {os.path.basename(LETTER_FONT)})"))
    ts, tg = rep["letter_thin"]
    P(f"  strokes thinner than {MIN_PRINTABLE_FEATURE} mm: {ts:.1f} % of letter area; gaps narrower: {tg:.1f} %")
    P(f"Skin over sticker: {SKIN} mm (under letters {SKIN - LETTER_DEPTH:.1f} mm)")
    P(f"Sticker: {STICKER_D} mm, shaft {2 * d['shaft_r']:.1f} mm, ceiling at Z {d['z_ceil']:.2f}")
    P(f"Stack: {'foam ' + str(FOAM_T) + ' mm squeezed to ' + str(round(FOAM_T * (1 - FOAM_COMPRESS), 2)) if USE_FOAM else 'no foam, post gap ' + str(NO_FOAM_GAP)}"
      f", post top Z {d['post_top']:.2f}")
    P(f"Bayonet: {LUG_COUNT} lugs x {LUG_WIDTH_DEG} deg, twist {TWIST_DEG} deg, radial clr {CAP_RAD_CLEARANCE}/{LUG_RAD_CLEARANCE},"
      f" entry play {ENTRY_AX_CLEARANCE}, lock squeeze {LOCK_INTERFERENCE}")
    P(f"  channel floor ramps Z {d['floor_entry']:.2f} -> {d['floor_lock']:.2f}, ceiling Z {d['ceil_ch']:.2f}")
    P(f"  body ledge under the lugs (thinnest, at the entry): {d['floor_entry']:.2f} mm")
    P(f"Cap: {2 * d['cap_r']:.2f} mm x {CAP_T} mm plate, post {2 * d['post_r']:.1f} mm to local Z {rep['post_top_local']:.2f}")
    if "cap_text_thin" in rep:
        P(f"  cap text strokes thinner than 0.6 mm: {rep['cap_text_thin'][0]:.1f} % (cosmetic only)")
    P(f"Felt fallback: {FELT_PAD_D} mm pad on a flat ring {BORE_D:.0f} to {rep['bed_contact_d']:.1f} mm")
    nr = rep["nest"]
    P(f"Nest: {nr['outer_d']:.1f} mm x {nr['height']:.1f} mm, lip {nr['lip_inner_d']:.1f} mm at Z {nr['lip_z']:.1f}")
    P("")
    P("Part checks")
    for name in ["nope_body.stl", "nope_base_cap.stl", "nope_nest.stl", "nfc_test_coupons.stl", "nope_assembled.stl"]:
        tm = tms[name]
        ext = tm.bounds[1] - tm.bounds[0]
        line = (f"  {name:22s} watertight={tm.is_watertight} vol={tm.volume / 1000:.2f} cm3 "
                f"bbox={ext[0]:.1f} x {ext[1]:.1f} x {ext[2]:.1f}")
        if name != "nope_assembled.stl":
            g30, gsolid = est_mass(tm, infill=0.30)
            line += f" est. mass {g30:.0f} g @30% infill ({gsolid:.0f} g solid)"
            oh, tot = overhang_report(tm)
            line += f" | >45deg down-facing area {oh:.0f} of {tot:.0f} mm2"
        P(line)
    # wall thickness sampling on the body
    tmb = tms["nope_body.stl"]
    pts, th = thickness_samples(tmb)
    finite = th[np.isfinite(th)]
    P("")
    P("Body wall thickness, ray samples (n=%d): min %.2f, 1st pct %.2f, median %.2f mm"
      % (len(finite), finite.min(), np.percentile(finite, 1), np.median(finite)))
    thin = pts[th < 1.6]
    if len(thin):
        P("  samples under 1.6 mm (expected only at lettering edges, marks and bayonet slot corners):")
        zs = thin[:, 2]
        rs = np.hypot(thin[:, 0], thin[:, 1])
        P(f"    count {len(thin)}, Z range {zs.min():.2f}..{zs.max():.2f}, R range {rs.min():.1f}..{rs.max():.1f}")
    P("")
    P("Unverified until a real print: fit of the bayonet, NFC read through the skin, mass.")
    txt = "\n".join(L)
    with open(os.path.join(out, "build_report.txt"), "w") as f:
        f.write(txt + "\n")
    print(txt)


if __name__ == "__main__":
    sys.exit(main())
