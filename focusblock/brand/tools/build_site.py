import base64, json, re
B='/home/user/Claude-Code-Experiments/focusblock/'
b64 = lambda p: base64.b64encode(open(p,'rb').read()).decode()
t = open('site/template.html').read()
wm = json.load(open('wordmark.json')); n = json.load(open('n.json'))
wm_svg = f'<svg viewBox="0 0 {wm["w"]:.1f} {wm["h"]:.1f}" role="img" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="{wm["d"]}"/></svg>'
# compact the path: 1 decimal place
def compact(d): return re.sub(r'(\d+\.\d)\d+', r'\1', d)
wm_svg = compact(wm_svg)
lock = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="3" fill="currentColor" stroke="none"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
check = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
rep = {
 'FONT_B64': b64(B+'brand/fonts/outfit-latin-variable.woff2'),
 'FAVICON_B64': b64(B+'brand/logo/favicon.svg'),
 'TOUCH_B64': b64(B+'brand/logo/favicon-180.png'),
 'WORDMARK_SVG': wm_svg,
 'N_PATH': compact(n['d']),
 'LOCK_SVG': lock, 'CHECK_SVG': check,
 'IMG_hero': b64('site/hero.webp'), 'IMG_tap': b64('site/tap.webp'),
 'IMG_home': b64('site/screen-home-locked.webp'), 'IMG_permission': b64('site/screen-permission.webp'), 'IMG_rescue': b64('site/screen-rescue-code.webp'),
}
for k,v in rep.items(): t = t.replace('{{'+k+'}}', v)
assert '{{' not in t, re.findall(r'\{\{\w+\}\}', t)
assert '—' not in t and '–' not in t
open(B+'landing/index.html','w').write(t)
print('bytes', len(t))
