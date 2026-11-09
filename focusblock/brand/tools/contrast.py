def lum(h):
    h=h.lstrip('#'); r,g,b=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    f=lambda c: c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
P={'charcoal':'#1C1C1E','charcoal-800':'#262628','charcoal-700':'#323235','charcoal-600':'#48484C',
'grey-300':'#C9C7C3','grey-500':'#9C9993','grey-700':'#5C5A56','offwhite':'#F5F4F1','paper-200':'#E9E7E2',
'saffron':'#FF8A1F','saffron-600':'#F27A0C','ember':'#A84A00','saffron-tint-dark':'#3A2817','saffron-tint-light':'#FFE7D1'}
import itertools,sys
fg=['offwhite','grey-300','grey-500','grey-700','charcoal','saffron','ember']
bg=['charcoal','charcoal-800','charcoal-700','offwhite','paper-200','grey-300','saffron','saffron-tint-dark','saffron-tint-light']
for f in fg:
    print(f.ljust(10),' '.join(f"{b[:14]}={cr(P[f],P[b]):.2f}" for b in bg if b!=f))
