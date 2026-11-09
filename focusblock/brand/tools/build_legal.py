import json, re, html
L='/home/user/Claude-Code-Experiments/focusblock/landing/'
wm=json.load(open('wordmark.json'))
svg=re.sub(r'(\d+\.\d)\d+', r'\1', f'<svg viewBox="0 0 {wm["w"]:.1f} {wm["h"]:.1f}" width="72" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="{wm["d"]}"/></svg>')
def ph(t):  # mark [placeholders]
    return re.sub(r'\[([^\]]+)\]', r'<mark>[\1]</mark>', t)
pages = {
 'terms': ('Terms of sale', [
   'These terms apply to purchases from [name], [address] ("we"). Contact: [email], [WhatsApp].',
   'Product: nope NFC puck with an Android app. It needs an Android phone with NFC; please confirm yours before paying.',
   'Price: Rs 1,999, MRP inclusive of all taxes, no subscription.',
   'Orders are confirmed when we accept your payment and message you. If we cannot supply, we refund in full.',
   'The product helps you make opening apps a deliberate act; we do not promise any particular result and it is not a medical product.',
   'The app may need extra Android permissions and, on some phones, a manual allow step; setup steps are in the guide.',
   'Backup code and emergency unlock exist so you can always get back into your apps; keep your backup code safe.',
   'Refunds: see the <a href="refund.html">Refund policy</a>.',
   'Complaints: [grievance officer name], [email]. We acknowledge within 48 hours and aim to resolve within one month.',
   'Nothing here limits your legal rights. Disputes: Indian law applies; courts at [city] (lawyer to confirm).']),
 'refund': ('Refund policy', [
   'You can ask for a full refund within 30 days of delivery. Delivery date means the date the courier marks the parcel delivered. If the courier shows no delivered date, the 30 days start 7 days after we dispatch.',
   'Message us on [WhatsApp or email] with your order number. We refund to the payment method you used within 3 working days of your request.',
   'In the first batch you do not need to send the puck back; please send a photo of the setup problem, or return it if you are happy to.',
   'If the unit is faulty, we pay return shipping and replace or refund.',
   'If we miss the ship-by date we gave you by more than 7 days, you can ask for a full refund.',
   'A Rs 199 reservation can be refunded before shipping within 3 working days of your request.',
   'This policy does not limit your legal rights.']),
 'shipping': ('Shipping', [
   'We ship within India to the address you give.',
   'Dispatch date: [ship-by date, set only after our phone tests; not published until set].',
   'Courier: [name]; you get tracking by WhatsApp or email.',
   'Shipping charge: [Rs 0 or amount, shown before you pay].',
   'If we miss our dispatch date by more than 7 days you can ask for a full refund.',
   'Delivery time after dispatch: [days, only when known].',
   'If a parcel arrives damaged, message us with a photo within [x] days and we replace or refund.',
   'Wrong address: contact us before dispatch.']),
 'privacy': ('Privacy notice', [
   'Who we are: [name], [address], [email].',
   'What we collect: name, phone number, email, delivery address, phone model, whether your phone has NFC, and payment reference.',
   'We use it to take and deliver your order, message you about it, and, if you agree, send check-in questions on WhatsApp.',
   'The website: it uses Meta\'s pixel to measure our ads. [Cookie and consent wording: lawyer to confirm.]',
   'The app: [CTO to confirm after the manifest check: what the app stores and whether anything leaves the phone].',
   'We keep order records as long as needed for accounts and tax [period: ask CA]; other data until you ask us to delete it.',
   'We do not sell your data. Payments are handled by [gateway or bank]; we do not see your card details.',
   'Your choices: ask us to see, correct or delete your data, or withdraw consent, by emailing [email].',
   'Complaints: [grievance officer name], [email].',
   'Updated: [date].']),
}
css='''@font-face{font-family:"Outfit";src:local("Outfit");}
:root{color-scheme:dark}*{box-sizing:border-box;margin:0;padding:0}
body{background:#1C1C1E;color:#F5F4F1;font-family:"Outfit",ui-rounded,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:680px;margin:0 auto;padding:0 20px}
header{height:64px;display:flex;align-items:center}header a{color:#F5F4F1}
.draft{background:#3A2817;color:#F5F4F1;border-radius:12px;padding:12px 16px;font-size:.9375rem;margin:16px 0 28px}
h1{font-size:clamp(2.2rem,9vw,3.2rem);font-weight:800;letter-spacing:-.035em;line-height:1.02;margin:24px 0 8px}
p{color:#C9C7C3;margin-top:14px;max-width:38em}
a{color:#FF8A1F;font-weight:600}
mark{background:transparent;color:#FF8A1F;font-weight:600}
:focus-visible{outline:3px solid #FF8A1F;outline-offset:3px;border-radius:4px}
nav{display:flex;flex-wrap:wrap;gap:6px 20px;margin:48px 0 56px;padding-top:24px;border-top:1px solid #3A3A3E}
nav a{color:#F5F4F1;text-decoration:none}nav a:hover{color:#FF8A1F}'''
for slug,(title,paras) in pages.items():
    body=''.join(f'<p>{ph(p)}</p>' for p in paras)
    doc=f'''<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}: nope</title><meta name="robots" content="noindex"><meta name="theme-color" content="#1C1C1E">
<link rel="icon" href="index.html#">
<style>{css}</style></head>
<body><div class="wrap">
<header><a href="index.html" aria-label="nope home">{svg}</a></header>
<main>
<h1>{title}</h1>
<!-- Draft text from ceo/reports/CLO.md (LIKELY wording, lawyer to review). Replace every [bracketed] placeholder before publishing. -->
<p class="draft">Draft. Items in orange brackets are placeholders the founder fills in before this page goes live. A lawyer reviews the wording first.</p>
{body}
</main>
<nav aria-label="Policies"><a href="index.html">Home</a><a href="terms.html">Terms</a><a href="refund.html">Refund policy</a><a href="shipping.html">Shipping</a><a href="privacy.html">Privacy</a></nav>
</div></body></html>
'''
    assert '—' not in doc and '–' not in doc
    open(L+slug+'.html','w').write(doc)
print('ok')
