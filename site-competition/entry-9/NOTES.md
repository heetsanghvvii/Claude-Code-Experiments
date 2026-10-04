# Knock, entry 9

## Design direction
1. The page is an Indian inland letter card: pale postal blue, perforated edges, a stamp and a postmark. It's a letter written to one person, not a broadcast.
2. The hero is the letter. Its "To" line is the working action: type your target companies, press "Get my target list", and the intake form opens already filled in.
3. Deep fountain-pen navy for ink and for the bands. A postal vermilion only for stamps, marks and hover. Archivo condensed for display, Source Serif for the voice of the letters.

## Key decisions
- The hero shows a labelled sample target list below a "Fold here" line (roles, companies and the shared reason to talk). It shows how Knock works without inventing people or results.
- The problem section is a fading pile of unanswered portal applications with a "Still waiting / Return to sender" stamp.
- How it works is drawn as a postal route with four postmarks. "You approve every message" gets its own line.
- Packages are set as perforated postage stamps, with the price as the stamp value. Standard is inverted and marked most popular. Done for you sits in its own panel.
- The example message is a white note card. The three parts of the message are highlighted and explained next to it.
- The intake form checks each field and gives an error that says how to fix it. It has a sending state and a "Received" stamp on success, with the name and email filled in. Choosing a package card carries the package into a hidden field.
- No testimonials, logos, counts or statistics. Only the brief's own numbers are used (60/120/180 people, prices, the 5-reply guarantee).
- Text selection, caret, scrollbar and focus ring are styled to match the palette. Motion is one postmark stamping in on load (plus the success stamp). Reduced motion is respected.

## Could not do
- The page has no backend; the form success state is client-side only.
- Headless Chromium in this sandbox only loads Google Fonts through the proxy. Without them, the page falls back to system sans and serif, and the layout still holds.
