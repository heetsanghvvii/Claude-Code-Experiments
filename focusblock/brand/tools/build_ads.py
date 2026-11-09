# Generates HTML sources for every nope ad and print asset, in the shared brand system.
import json, re, os
V = '/home/user/Claude-Code-Experiments/focusblock/marketing/assets/visual/'
SRC = V + 'src/'
WORK = os.path.dirname(os.path.abspath(__file__))
trim = json.load(open(os.path.join(WORK, 'trim.json')))
wmj = json.load(open(os.path.join(WORK, 'wordmark.json')))
nj = json.load(open(os.path.join(WORK, 'n.json')))
c1 = lambda d: re.sub(r'(\d+\.\d)\d+', r'\1', d)
WMD = c1(wmj['d']); WMW, WMH = wmj['w'], wmj['h']

INK, INK2, INK3, CHALK, STONE, STONE5, SAF = '#1C1C1E', '#262628', '#323235', '#F5F4F1', '#C9C7C3', '#9C9993', '#FF8A1F'

def wm(x, y, w, color=CHALK):
    h = w * WMH / WMW
    return f'<svg class="wm" style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h:.1f}px;color:{color}" viewBox="0 0 {WMW:.1f} {WMH:.1f}" aria-label="nope"><path fill-rule="evenodd" d="{WMD}"/></svg>'

def puck(kind, left, bottom, width, view='34'):
    t = trim[f'puck-{view}-{kind}']
    s = width / t['body_w']
    W = t['w'] * s; top = bottom - t['body_bottom'] * s; x = left - t['body_x'] * s
    return f'<img class="render" src="../renders/puck-{view}-{kind}-trim.png" style="left:{x:.0f}px;top:{top:.0f}px;width:{W:.0f}px" alt="">'

def text(x, y, w, size, content, color=CHALK, weight=800, ls=-0.045, lh=0.92, extra=''):
    return f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;font-size:{size}px;font-weight:{weight};letter-spacing:{ls}em;line-height:{lh};color:{color};{extra}">{content}</div>'

def shelf(y, x1=0, x2=None, W=1080, thick=26):
    x2 = W if x2 is None else x2
    return (f'<div style="position:absolute;left:{x1}px;top:{y}px;width:{x2-x1}px;height:{thick}px;background:linear-gradient(#3E3E42,#2E2E31 40%,#262628);border-radius:3px"></div>'
            f'<div style="position:absolute;left:{x1}px;top:{y+thick}px;width:{x2-x1}px;height:90px;background:linear-gradient(rgba(0,0,0,0.35),rgba(0,0,0,0))"></div>')

LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="3" fill="currentColor" stroke="none"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'

PLAN = '''<svg viewBox="0 0 640 300" fill="none" style="width:100%;height:auto;display:block">
<g stroke="#48484C" stroke-width="3" stroke-linecap="round"><path d="M20 20 H620 V280 H20 Z"/><path d="M330 20 V120"/><path d="M330 196 V280"/></g>
<rect x="52" y="120" width="150" height="128" rx="14" fill="#262628"/><rect x="62" y="130" width="62" height="34" rx="8" fill="#323235"/><rect x="130" y="130" width="62" height="34" rx="8" fill="#323235"/>
<rect x="112" y="186" width="32" height="54" rx="7" fill="#F5F4F1"/><rect x="116" y="191" width="24" height="44" rx="4" fill="#1C1C1E"/>
<rect x="360" y="34" width="246" height="40" rx="6" fill="#262628"/><circle cx="560" cy="54" r="15" fill="#FF8A1F"/>
<path d="M150 200 C 240 190, 300 160, 330 158 S 470 140, 548 72" stroke="#9C9993" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 11"/>
<g font-family="Outfit, Arial, sans-serif" font-size="17" font-weight="600" fill="#9C9993"><text x="52" y="56">Bedroom</text><text x="52" y="78" font-weight="400" font-size="15">Your phone</text>
<text x="360" y="112">Kitchen</text><text x="360" y="134" font-weight="400" font-size="15">The puck</text><text x="380" y="236" fill="#C9C7C3" font-size="18">A walk, not a thumb.</text></g></svg>'''

MICRO = 'Rs 1,999 once · No subscription · 30 day refund'
NFC = 'Android with NFC only.'

def page(name, w, h, bg, body, note=''):
    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>{name}</title>
<link rel="stylesheet" href="brand.css">
<style>html,body{{margin:0;width:{w}px;height:{h}px;overflow:hidden}} .canvas{{width:{w}px;height:{h}px;background:{bg}}}</style></head>
<body><!-- {note} -->
<div class="canvas" id="c">{body}</div></body></html>'''
    assert '—' not in html and '–' not in html, name
    open(SRC + name + '.html', 'w').write(html)
    return {'name': name, 'w': w, 'h': h}

assets = []
A = assets.append

def endline(x, y, color=CHALK, sub=STONE5, size=40, w=900):
    return (text(x, y, w, size, 'Join the first 50.', color, 800, -0.025, 1.1) +
            text(x, y + size * 1.35, w, size * 0.62, MICRO + '<br>' + NFC, sub, 500, 0, 1.4))

# ---------- S1 room, 1080x1350 ----------
b = (text(80, 96, 920, 200, 'Put it<br>down.') +
     text(84, 520, 900, 64, 'Leave it in another room.', SAF, 700, -0.03, 1.05) +
     puck('saffron', 450, 1004, 520) + shelf(1000) +
     text(84, 1050, 700, 28, 'The kitchen shelf. Your phone is in the other room.', STONE5, 500, 0, 1.3) +
     wm(80, 1206, 170) +
     text(520, 1190, 480, 34, 'Join the first 50.', CHALK, 800, -0.02, 1.1, 'text-align:right') +
     text(380, 1238, 620, 22, MICRO + '<br>' + NFC, STONE5, 500, 0, 1.45, 'text-align:right'))
A(page('S1_room_1080x1350', 1080, 1350, INK, b, 'Meta feed static, angle A1. Product render, not a photo: swap for a real shelf photo when available.'))

# ---------- S3 room square ----------
b = (text(72, 72, 940, 168, 'Put it down.', CHALK, 800, -0.05, 0.92) +
     text(76, 250, 900, 56, 'Leave it in another room.', SAF, 700, -0.03, 1.05) +
     puck('saffron', 460, 756, 470) + shelf(752) +
     text(76, 800, 700, 26, 'The kitchen shelf. Your phone is in the other room.', STONE5, 500, 0, 1.3) +
     wm(72, 950, 150) +
     text(520, 930, 488, 32, 'Join the first 50.', CHALK, 800, -0.02, 1.1, 'text-align:right') +
     text(380, 974, 628, 21, MICRO + '<br>' + NFC, STONE5, 500, 0, 1.45, 'text-align:right'))
A(page('S3_room_1080x1080', 1080, 1080, INK, b, 'Square version of S1 for Facebook Feed.'))

# ---------- S2 price card, saffron ----------
checks = ''.join(f'<div style="display:flex;gap:22px;align-items:center;margin-bottom:22px"><span style="width:44px;height:44px;flex:none;color:{INK}">{CHECK}</span><span>{t}</span></div>' for t in ['No subscription.', '30 day refund from delivery.', 'Android with NFC only.'])
b = (wm(80, 84, 180, INK) +
     text(80, 250, 900, 120, 'Pay once.', INK, 800, -0.045, 0.95) +
     text(72, 390, 1000, 268, 'Rs 1,999', INK, 800, -0.06, 0.9) +
     text(80, 720, 620, 42, checks, INK, 600, -0.01, 1.2) +
     puck('charcoal', 640, 1150, 470) +
     text(80, 1150, 600, 44, 'Join the first 50.', INK, 800, -0.025, 1.1) +
     text(80, 1210, 600, 26, 'MRP inclusive of all taxes.', INK, 500, 0, 1.3))
A(page('S2_price_1080x1350', 1080, 1350, SAF, b, 'Meta feed static, angle A4. Charcoal on saffron, 7.2:1.'))

# ---------- C1 carousel ----------
b = (text(72, 80, 940, 230, 'Put it<br>down.') + puck('saffron', 380, 960, 640) + wm(72, 966, 140))
A(page('C1_1_put-it-down_1080x1080', 1080, 1080, INK, b))
tiles = ''
names = [('Instagram', 1), ('YouTube', 1), ('Phone', 0), ('WhatsApp', 0), ('Maps', 0), ('Camera', 0), ('Notes', 0), ('Music', 0)]
for i, (n, locked) in enumerate(names):
    x = 72 + (i % 4) * 240; y = 380 + (i // 4) * 290
    bgc = '#2A2A2C' if locked else INK3
    inner = f'<div style="position:absolute;inset:0;display:grid;place-items:center;color:{SAF}"><div style="width:64px;height:64px">{LOCK}</div></div>' if locked else f'<div style="position:absolute;left:50%;top:50%;width:62px;height:62px;margin:-31px;border-radius:{["50%","14px","50% 50% 50% 8px","50%","14px","50%","14px","50%"][i]};border:6px solid {STONE5};opacity:.7"></div>'
    tiles += f'<div style="position:absolute;left:{x}px;top:{y}px;width:180px;height:180px;border-radius:44px;background:{bgc}">{inner}</div>'
    tiles += text(x - 20, y + 196, 220, 28, n, STONE5 if locked else STONE, 600, 0, 1.2, 'text-align:center')
b = text(72, 80, 940, 120, 'Choose the apps.') + text(76, 216, 900, 40, 'Lock the feeds. Keep the rest.', STONE, 500, -0.01, 1.2) + tiles + wm(72, 990, 110)
A(page('C1_2_choose-apps_1080x1080', 1080, 1080, INK, b, 'Generic tiles only. No real app icons or logos.'))
b = (f'<img class="render" src="../renders/puck-tap-saffron.png" style="left:-40px;top:110px;width:1160px">' +
     f'<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(28,28,30,.92) 0%,rgba(28,28,30,0) 34%)"></div>' +
     text(72, 80, 940, 130, 'Tap to lock.') + text(76, 226, 900, 44, 'Tap again to unlock.', STONE, 600, -0.015, 1.1) + wm(72, 990, 110))
A(page('C1_3_tap_1080x1080', 1080, 1080, INK, b))
b = (text(72, 80, 940, 110, 'Leave the puck<br>in another room.') +
     f'<div style="position:absolute;left:72px;top:420px;width:936px;background:{INK};border-radius:28px">{PLAN}</div>' + wm(72, 990, 110))
A(page('C1_4_another-room_1080x1080', 1080, 1080, '#19191B', b))
b = (wm(72, 72, 150, INK) + text(72, 250, 960, 230, 'Rs 1,999', INK, 800, -0.06, 0.9) + text(80, 470, 900, 90, 'once.', INK, 800, -0.04, 1) +
     text(80, 640, 900, 40, '30 day refund from delivery.<br>No subscription.<br>Android with NFC only.', INK, 600, -0.01, 1.35) +
     text(80, 920, 900, 54, 'Join the first 50.', INK, 800, -0.03, 1.1))
A(page('C1_5_price_1080x1080', 1080, 1080, SAF, b))

# ---------- C2 FAQ retargeting carousel ----------
faq = [('What does it notice?', 'Only which app just opened. Not your screen, your messages or your payments. No account, no analytics.'),
       ('Lost the puck?', 'Your backup code unlocks everything and lets you pair a new puck. Plus two emergency unlocks a day.'),
       ('Does it need internet?', 'No. Locking and unlocking happen between your phone and the puck.'),
       ('How does the refund work?', '30 days from the courier delivered date. Back to the way you paid. No forms, no argument.'),
       ('Who makes this?', 'One person in [City], by hand, in a founding batch of 50. Ask anything on WhatsApp.')]
for i, (q, a) in enumerate(faq):
    b = (text(72, 80, 940, 92, q, SAF, 800, -0.035, 1.02) + text(76, 400 if len(q) > 20 else 300, 900, 56, a, CHALK, 600, -0.02, 1.22) +
         wm(72, 980, 120) + text(222, 988, 400, 24, NFC, STONE5, 500, 0, 1.3))
    if i < 4:
        b = puck(['saffron','charcoal','stone','saffron'][i], 620, 1240, 560, 'top') + b
    if i == 4:
        b += f'<div style="position:absolute;left:760px;top:640px;width:248px;height:248px;border-radius:50%;background:{INK3};display:grid;place-items:center;color:{STONE5};font-size:24px;text-align:center">Founder<br>photo</div>'
    A(page(f'C2_{i+1}_faq_1080x1080', 1080, 1080, INK, b, 'Retargeting FAQ card. [City] and founder photo are placeholders.'))

# ---------- Reel covers and end card, 1080x1920 (text kept inside y 270 to 1248) ----------
hooks = [('R1', 'My phone is here. My Instagram is in the kitchen.'), ('R2', 'One tap to lock. A walk to unlock.'),
         ('R3', 'It notices which app opened. Nothing else.'), ('R4', 'Rs 1,999 once. No subscription.'),
         ('R5', "Bedtime scroll? The puck's in the other room.")]
for rid, hook in hooks:
    size = 118 if len(hook) < 40 else 104
    b = (text(80, 300, 920, size, hook, CHALK, 800, -0.045, 0.98) + puck('saffron', 280, 1230, 520) + wm(80, 1290, 150) +
         f'<div style="position:absolute;left:0;right:0;bottom:0;height:672px;background:linear-gradient(rgba(28,28,30,0),rgba(28,28,30,.0))"></div>')
    A(page(f'{rid}_reel-cover_1080x1920', 1080, 1920, INK, b, 'Reel cover. Text sits between y 270 and 1248 (Reels UI covers about the bottom 35 percent). For a video cover, replace the puck with a frame from the footage.'))
b = (text(80, 300, 920, 200, 'Put it<br>down.') + puck('saffron', 300, 1000, 480) + shelf(996) +
     text(80, 1060, 920, 46, 'Join the first 50.', CHALK, 800, -0.025, 1.1) +
     text(80, 1124, 920, 28, MICRO + '<br>' + NFC, STONE5, 500, 0, 1.45))
A(page('REEL_end-card_1080x1920', 1080, 1920, INK, b, 'End card for every reels ad (R1 to R7). Text inside the safe zone.'))

# ---------- Story ads, 1080x1920 (text inside y 270 to 1536) ----------
def phone_img(file, left, top, width):
    return f'<img class="render" src="../app/{file}" style="left:{left}px;top:{top}px;width:{width}px">'
b = (text(80, 290, 920, 100, 'Lost the puck?', SAF, 800, -0.045, 1) + text(80, 400, 920, 100, 'Your backup code gets you back in.', CHALK, 800, -0.045, 1) +
     phone_img('screen-rescue-code.png', 345, 600, 390) + text(80, 1490, 920, 26, NFC + ' Two emergency unlocks a day.', STONE5, 500, 0, 1.4))
A(page('ST1_rescue_story_1080x1920', 1080, 1920, INK, b, 'Story ad, angle A8. Real app screen layout, illustrative code.'))
b = (text(80, 290, 920, 104, 'It notices which app opened.', CHALK, 800, -0.045, 1) + text(80, 520, 920, 104, 'Nothing else.', SAF, 800, -0.045, 1) +
     phone_img('screen-permission.png', 345, 680, 380) + text(80, 1490, 920, 26, 'No account. No analytics. ' + NFC, STONE5, 500, 0, 1.4))
A(page('ST2_privacy_story_1080x1920', 1080, 1920, INK, b, 'Story ad, angle A3. Wording per docs/CLAIMS_VERIFIED.md.'))
b = (text(80, 290, 920, 104, 'Who makes this?', CHALK, 800, -0.045, 1) +
     f'<div style="position:absolute;left:80px;top:560px;width:920px;height:760px;border-radius:40px;background:{INK3};display:grid;place-items:center;color:{STONE5};font-size:32px;text-align:center">Founder face photo or video frame<br>(placeholder)</div>' +
     text(80, 1360, 920, 40, '[Founder name], [City]. Made by hand, a founding batch of 50.', STONE, 600, -0.01, 1.3))
A(page('ST3_founder_story_1080x1920', 1080, 1920, INK, b, 'Story ad template. Needs a real founder photo.'))

# ---------- Organic post template: real quote (P1) ----------
b = (text(80, 100, 920, 30, 'One person\'s experience, shared with consent', STONE5, 500, 0, 1.3) +
     text(80, 220, 920, 76, '&ldquo;[Buyer\'s own words, unedited, with written consent. Keep it under three lines.]&rdquo;', CHALK, 700, -0.03, 1.15) +
     text(80, 760, 920, 34, '[First name], [City]', SAF, 600, -0.01, 1.3) + puck('saffron', 600, 1210, 340) + wm(80, 1190, 150))
A(page('P1_quote-template_1080x1350', 1080, 1350, INK, b, 'Fill only with consented, real quotes (CLO, PLAN.md section 8).'))

# ---------- OG share image and Play feature graphic ----------
b = (text(72, 92, 640, 150, 'Put it<br>down.') + text(76, 420, 600, 38, 'Leave it in another room.', SAF, 700, -0.02, 1.1) +
     puck('saffron', 640, 470, 500) + wm(72, 520, 120) + text(260, 528, 420, 22, 'Rs 1,999 once · Android with NFC', STONE5, 500, 0, 1.3))
A(page('og-image_1200x630', 1200, 630, INK, b, 'Open Graph share image, set as og:image on the landing page.'))
b = (wm(64, 70, 220) + text(64, 190, 520, 92, 'Put it<br>down.', CHALK, 800, -0.05, 0.92) + text(68, 380, 470, 26, 'Tap the puck to lock the apps you choose.', STONE, 500, -0.01, 1.3) +
     puck('saffron', 590, 390, 380))
A(page('play-feature-graphic_1024x500', 1024, 500, INK, b, 'Google Play feature graphic, no device frames, no price.'))

# ---------- Print: QR card (A6), sticker, poster, onboarding cards, gift note. Drawn at 1/2 scale, rendered x2 for 300 dpi. ----------
def qr(x, y, s, label='QR code'):
    return f'<div style="position:absolute;left:{x}px;top:{y}px;width:{s}px;height:{s}px;border-radius:16px;background:{CHALK};color:{INK};display:grid;place-items:center;font-size:{s*0.1:.0f}px;font-weight:700;text-align:center;outline:3px dashed {SAF};outline-offset:6px">{label}<br>placeholder</div>'
b = (wm(44, 44, 110) + text(44, 150, 540, 104, 'Put it<br>down.') + puck('saffron', 300, 560, 280) +
     text(44, 600, 300, 26, 'Scan to join the first 50.', CHALK, 700, -0.01, 1.2) + text(44, 668, 300, 15, MICRO + '<br>' + NFC, STONE5, 500, 0, 1.45) + qr(380, 600, 200))
A(page('qr-card_A6_105x148mm', 620, 874, INK, b, 'A6 card, 105 x 148 mm, render x2 = 1240 x 1748 px (300 dpi). Add 3 mm bleed at the printer. QR placeholder: short link we control.'))
b = (f'<div style="position:absolute;inset:0;border-radius:50%;background:{SAF}"></div>' + text(0, 160, 591, 120, 'put it<br>down.', INK, 800, -0.05, 0.9, 'text-align:center') +
     wm(225, 430, 140, INK))
A(page('sticker_round_50mm', 591, 591, 'transparent', b, '50 mm round vinyl sticker, 591 px = 50 mm at 300 dpi. Cut line = circle edge; add 2 mm bleed of saffron.'))
b = (wm(70, 70, 200) + text(70, 220, 1100, 300, 'Put it<br>down.') + text(76, 820, 1000, 74, 'Leave it in another room.', SAF, 700, -0.03, 1.05) +
     puck('saffron', 470, 1380, 600) + shelf(1376, 0, 1240, 1240, 34) +
     text(70, 1450, 700, 40, 'A palm-sized puck that locks the apps you choose. Unlocking takes a walk.', STONE, 500, -0.01, 1.3) +
     text(70, 1620, 640, 34, 'Scan to join the first 50.', CHALK, 800, -0.02, 1.2) + text(70, 1672, 640, 22, MICRO + '<br>' + NFC, STONE5, 500, 0, 1.45) + qr(940, 1500, 230))
A(page('poster_A4_210x297mm', 1240, 1754, INK, b, 'A4 poster, render x2 = 2480 x 3508 px (300 dpi). For A3: scale 141 percent, add 3 mm bleed on every edge, keep text 10 mm inside the trim.'))
# Onboarding cards (text from customer/ONBOARDING_CARD.md)
steps = ['Scan this code. Watch the 2 minute video.', 'Install the app. Your phone will warn you. That is normal for now. The video shows you why.', 'Pair your puck. Write your backup code on the other card.', 'Lock once. Try Instagram. See it bounce.']
st = ''.join(f'<div style="display:grid;grid-template-columns:40px 1fr;gap:14px;margin-bottom:18px"><span style="width:34px;height:34px;border-radius:50%;background:{SAF};color:{INK};display:grid;place-items:center;font-weight:800;font-size:18px">{i+1}</span><span>{t}</span></div>' for i, t in enumerate(steps))
b = (wm(44, 44, 100) + text(44, 120, 540, 54, 'Do this first.<br>It takes 10 minutes.', CHALK, 800, -0.035, 1.02) +
     text(44, 270, 380, 22, st, CHALK, 500, 0, 1.35) + qr(440, 300, 140, 'Setup video') +
     text(44, 720, 540, 21, 'Stuck? WhatsApp us: [WhatsApp number]. A real person replies, usually within [1 hour in daytime].', STONE, 500, 0, 1.4) +
     text(44, 810, 540, 19, NFC, STONE5, 600, 0, 1.3))
A(page('onboarding-card-front_A6', 620, 874, INK, b, 'Box card front. Text: customer/ONBOARDING_CARD.md (CCO). Placeholders in brackets.'))
places = ['<b>The kitchen shelf.</b> You walk there anyway.', '<b>By the front door or shoe rack.</b> Lock as you arrive, unlock as you leave.', '<b>A bag or locker away from your desk.</b> 30 seconds away, not 30 minutes.']
b = (text(40, 40, 540, 44, 'The one rule:<br>leave it in another room.', CHALK, 800, -0.03, 1.05) +
     text(40, 150, 540, 19, 'nope works because getting up to unlock is a small pause. A pause is enough to change your mind. If the puck sits next to your bed, it will not help.', STONE, 500, 0, 1.42) +
     text(40, 268, 540, 22, 'Three places to leave it', SAF, 700, -0.01, 1.2) +
     text(40, 304, 540, 19, '<br>'.join(places), CHALK, 400, 0, 1.55) +
     text(40, 470, 540, 19, 'Not in your pocket, on your bedside table, or inside your phone cover.', STONE5, 500, 0, 1.4) +
     text(40, 550, 540, 22, 'Need your phone?', SAF, 700, -0.01, 1.2) +
     text(40, 584, 540, 19, 'Keep calls, messages and payment apps open. You also have 2 emergency unlocks a day (hold 10 seconds). Lost the puck? Use your backup code.', STONE, 500, 0, 1.42) +
     text(40, 712, 540, 22, 'Not working for you?', SAF, 700, -0.01, 1.2) +
     text(40, 746, 540, 19, 'You have 30 days from delivery. Message us and we refund. No forms, no argument.', STONE, 500, 0, 1.42))
A(page('onboarding-card-back_A6', 620, 874, INK, b, 'Box card back. Text condensed from customer/ONBOARDING_CARD.md, CCO to approve the cuts.'))
b = (text(40, 40, 540, 44, 'Your backup code', INK, 800, -0.03, 1.05) +
     text(40, 104, 540, 19, 'Shown on your phone once, when you pair your puck. Write it here now:', INK, 500, 0, 1.4) +
     f'<div style="position:absolute;left:40px;top:180px;width:540px;height:120px;border-radius:18px;background:#FFFFFF;box-shadow:inset 0 0 0 2px {STONE};display:flex;align-items:center;justify-content:center;gap:16px;font-size:44px;font-weight:700;letter-spacing:0.12em;color:#5C5A56">_ _ _ _ _<span style="color:{INK}">-</span>_ _ _ _ _</div>' +
     text(40, 330, 540, 19, '<b>What it does:</b> if you lose or break your puck, this code unlocks your apps.<br><br><b>Keep it where you will not look in a weak moment:</b> with family, in your wallet at home, in a password manager. Not as your wallpaper.<br><br><b>Careful:</b> anyone with this code can unlock your apps. Want it strict? Give this card to a friend for a week.', INK, 400, 0, 1.45) +
     text(40, 780, 540, 17, 'If you lose both the puck and the code, message us: [WhatsApp number].', INK, 600, 0, 1.4))
A(page('backup-code-card_A6', 620, 874, CHALK, b, 'Backup code card on thicker stock. Light card so the code is written in pen. Charcoal on chalk 15.5:1.'))
b = (wm(40, 40, 90, INK) + text(40, 150, 360, 64, 'Not a lecture.<br>Just a puck.', INK, 800, -0.04, 1) +
     text(40, 540, 360, 17, 'From: ____________________', INK, 600, 0, 1.4))
A(page('gift-note_A7', 437, 620, SAF, b, 'Gift note card, A7 74 x 105 mm, render x2. Charcoal on saffron.'))

json.dump(assets, open(os.path.join(WORK, 'assets.json'), 'w'))
print(len(assets), 'assets')
