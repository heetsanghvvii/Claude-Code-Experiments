# Knock brand kit

Derived from the winning site concept in `site-competition/entry-9/index.html` (airmail letter: powder-blue paper, navy ink, one red stamp, Archivo condensed headlines, Source Serif 4 body, perforated edges, postmark carrying "Knock on the right door.").

- `brand-guidelines.html`: self-contained guidelines page (Google Fonts is the only external request).
- `brand-guidelines.pdf`: printed from the HTML.
- `tokens.css`, `tokens.json`: colour (hex and usage), type scale, spacing, radii, shadows, light and dark roles.
- `logo/`
  - `knock-wordmark.svg`, `knock-wordmark-reverse.svg`
  - `knock-stamp.svg`, `knock-stamp-mono.svg`, `knock-favicon.svg`
  - PNG exports at 512 and 1024: `knock-wordmark-*`, `knock-stamp-*`, `knock-stamp-mono-*`, `knock-favicon-*` (transparent). Text in the SVGs is outlined, no fonts required.
- `templates/`
  - `linkedin-banner.html` / `.png` (1584x396)
  - `linkedin-post.html` / `.png` (1200x1200)
  - `og-image.html` / `.png` (1200x630)
  - `email-signature.html` (host the wordmark PNG and update the img src)

Notes: the domain knock.careers is used as a placeholder (preferred but not yet registered). The target list rows in the post card are labelled samples. To re-render the PNGs, open the HTML in Chromium at the stated size with Google Fonts reachable.
