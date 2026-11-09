import sys; sys.path.insert(0,'.')
from glyphs import *
import os
OUT='/home/user/Claude-Code-Experiments/focusblock/brand/logo'
os.makedirs(OUT, exist_ok=True)
C={'ink':'#1C1C1E','chalk':'#F5F4F1','saffron':'#FF8A1F','stone':'#C9C7C3'}
wm = wordmark()
minx,miny,maxx,maxy = wm.bounds
pad=0
Wd = maxx-minx; Ht = maxy-miny
d = to_path(affinity.translate(wm, xoff=-minx), flip_h=maxy)
def svg(fill, bg=None, padx=0, pady=0):
    vw=Wd+2*padx; vh=Ht+2*pady
    bgr = f'<rect width="{vw:.2f}" height="{vh:.2f}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vw:.2f} {vh:.2f}" width="{vw*4:.0f}" height="{vh*4:.0f}" role="img" aria-label="nope">{bgr}<path transform="translate({padx} {pady})" fill="{fill}" fill-rule="evenodd" d="{d}"/></svg>'
open(f'{OUT}/nope-wordmark-dark.svg','w').write(svg(C['ink']))
open(f'{OUT}/nope-wordmark-light.svg','w').write(svg(C['chalk']))
open(f'{OUT}/nope-wordmark-saffron.svg','w').write(svg(C['saffron']))
# path data for reuse
import json
json.dump({'d':d,'w':Wd,'h':Ht,'baseline_from_top':maxy,'xheight':100}, open('wordmark.json','w'))
print('wordmark', Wd, Ht, 'baseline', maxy)

# n mark on its own, for the app icon
n,_ = glyph_n(width=104)
b = n.bounds
nd = to_path(affinity.translate(n, xoff=-b[0]), flip_h=b[3])
json.dump({'d':nd,'w':b[2]-b[0],'h':b[3]-b[1]}, open('n.json','w'))
print('n', b)
