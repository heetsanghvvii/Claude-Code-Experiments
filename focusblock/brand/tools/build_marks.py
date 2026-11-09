import json
OUT='/home/user/Claude-Code-Experiments/focusblock/brand/logo'
n=json.load(open('n.json')); d=n['d']; nw=n['w']; nh=n['h']
INK='#1C1C1E'; CHALK='#F5F4F1'; SAF='#FF8A1F'
def place(size, height, fill, dy=0):
    s=height/nh; w=nw*s
    x=(size-w)/2; y=(size-height)/2+dy
    return f'<path fill="{fill}" fill-rule="evenodd" transform="translate({x:.2f} {y:.2f}) scale({s:.4f})" d="{d}"/>'
def svg(size, body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">{body}</svg>'
S=1024
files={
 # full-bleed square icon (stores and launchers apply their own mask)
 'app-icon.svg': svg(S, f'<rect width="{S}" height="{S}" fill="{SAF}"/>'+place(S,430,CHALK,-8)),
 # rounded preview for decks and the website
 'app-icon-rounded.svg': svg(S, f'<rect width="{S}" height="{S}" rx="230" fill="{SAF}"/>'+place(S,430,CHALK,-8)),
 'app-icon-charcoal-alt.svg': svg(S, f'<rect width="{S}" height="{S}" rx="230" fill="{INK}"/>'+place(S,430,SAF,-8)),
 # Android adaptive: 108dp canvas, 66dp safe circle -> 626 px of 1024. n at 330 tall keeps its corners inside.
 'android-foreground.svg': svg(S, place(S,330,CHALK,-6)),
 'android-background.svg': svg(S, f'<rect width="{S}" height="{S}" fill="{SAF}"/>'),
 'android-monochrome.svg': svg(S, place(S,330,'#FFFFFF',-6)),
 # favicon: charcoal n on saffron for small-size crispness
 'favicon.svg': svg(S, f'<rect width="{S}" height="{S}" rx="240" fill="{SAF}"/>'+place(S,560,INK,-10)),
 # puck mark: the round puck seen from above, n knocked through
 'puck-mark-charcoal.svg': svg(S, f'<circle cx="512" cy="512" r="512" fill="{INK}"/>'+place(S,400,CHALK,-6)),
 'puck-mark-saffron.svg': svg(S, f'<circle cx="512" cy="512" r="512" fill="{SAF}"/>'+place(S,400,INK,-6)),
 'puck-mark-stone.svg': svg(S, f'<circle cx="512" cy="512" r="512" fill="#C9C7C3"/>'+place(S,400,INK,-6)),
}
for k,v in files.items(): open(f'{OUT}/{k}','w').write(v)
print(list(files))
