import trimesh, numpy as np, json, sys
sys.path.insert(0,'.')
import manifold3d as m3
from shapely.geometry import Polygon
m = trimesh.load('/home/user/Claude-Code-Experiments/focusblock/product/case/nope_body.stl')
# outer profile: max radius per z band
zs = np.linspace(0.02, 17.98, 300)
prof=[]
for ang in [0.3, 1.9, 3.7, 5.1]:
    d = np.array([np.cos(ang), np.sin(ang), 0])
    origins = np.array([[60*d[0], 60*d[1], zz] for zz in zs]); dirs = np.tile(-d, (len(zs),1))
    locs, idx, _ = m.ray.intersects_location(origins, dirs, multiple_hits=False)
    rr = np.full(len(zs), np.nan); rr[idx] = np.hypot(locs[:,0], locs[:,1])
    prof.append(rr)
rr = np.nanmax(np.array(prof), axis=0)
ok = ~np.isnan(rr)
prof = np.stack([rr[ok], zs[ok]], 1)
# flat top: r up to 22 at z=18
print(prof[:5], prof[-8:])
pts = [(0,0)] + [(float(a), float(b)) for a,b in prof] + [(0,18.0)]
# ensure top closes at z=18 with radius of last sample
pts = [(0,0),(prof[0][0],0)] + [(float(a), float(b)) for a,b in prof] + [(float(prof[-1][0]),18.0),(0,18.0)]
from shapely.geometry.polygon import orient
poly = orient(Polygon(pts).buffer(0), 1.0)
cs = m3.CrossSection([list(poly.exterior.coords)[:-1]])
print("poly", poly.geom_type, poly.area, cs.area()); solid = m3.Manifold.revolve(cs, 256); print("solid vol", solid.volume())
# wordmark: width 30 mm centred on top, debossed 0.7 mm
wm = json.load(open('wordmark.json'))
from glyphs import wordmark
from shapely import affinity
g = wordmark()
minx,miny,maxx,maxy = g.bounds
scale = 30/(maxx-minx)
g = affinity.scale(affinity.translate(g, -(minx+maxx)/2, -(50)), scale, scale, origin=(0,0))  # centre on x-height middle
g = g.simplify(0.01)
polys = [g] if g.geom_type=='Polygon' else list(g.geoms)
loops=[]
for p in polys:
    loops.append([tuple(c) for c in list(p.exterior.coords)[:-1]])
    for h in p.interiors: loops.append([tuple(c) for c in list(h.coords)[:-1]])
cs2 = m3.CrossSection(loops, m3.FillRule.EvenOdd)
cut = m3.Manifold.extrude(cs2, 2.0).translate((0,0,18-0.7))
print("cut vol", cut.volume(), cs2.area()); final = solid - cut; print("final", final.volume())
mesh = final.to_mesh()
tm = trimesh.Trimesh(vertices=np.array(mesh.vert_properties)[:,:3], faces=np.array(mesh.tri_verts))
print('watertight', tm.is_watertight, tm.bounds.tolist(), len(tm.faces))
tm.export('srv/puck_brand.stl')
