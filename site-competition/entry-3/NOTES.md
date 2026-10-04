# Knock, entry 3

## Design direction
- The tagline taken literally: a lacquered peacock-green arched door with a brass knocker, set in a cool lime-washed wall
- Peacock, brass and a pale green wall colour come from painted Indian doors. The brief asked for calm, premium and human, so there is no cream and no tech gradients
- Gloock (display serif) is used for headlines and big statements, Onest for everything else. Text is left-aligned, the door is the one bold element and the rest stays quiet

## Key decisions
- **One motion moment.** On load the knocker taps twice, then the door swings inward and warm light shows through the gap. With reduced motion it renders already open and nothing moves. The FAQ and the form success state animate only when someone uses them
- **The problem section repeats the motif.** A grid of 24 small closed doors with one open one, standing for "portals are a queue, people open doors". It shows no numbers, because the brief bans invented statistics
- **Numbers only where the content is a sequence.** The 4 steps have numbered circles joined by a line. "You approve every message" is a separate callout so it is not lost inside a step
- **Why it works** leads with an oversized "60 hand-picked people. Not 6,000 messages." followed by three plain points, not an icon-card grid
- **The example message** is shown as a plain message on a white surface: the recipient's line, the text, and "Drafted by Knock, approved by you". It is not an app screenshot. Highlighted phrases match three margin notes that explain why it works
- **Packages** are columns separated by rules. Only Standard gets a filled peacock ground and a "Most popular" tag. The shared inclusions are listed once, and done-for-you sits in its own row. The package buttons all say "Get my target list", record which package was clicked in a hidden field, and scroll to the form
- **The primary CTA** reads "Get my target list" everywhere: header, hero, every package, the form heading and the submit button
- **Form**: native fields with labels, inline error messages linked through aria-describedby, and focus moves to the first invalid field. A LinkedIn link without `https://` gets it added automatically. On success the form is replaced by a personalised confirmation that uses the person's first name and email, and focus moves to it
- **Accessibility**: skip link, visible brass/peacock focus rings, `prefers-reduced-motion` respected. Contrast checked: secondary text is 5.3:1 on the page and 4.9:1 on the example band, muted text on dark is 6.0:1 or better
- **Brief rules**: no testimonials, logos, counts or stats. I removed a "one-time payment" line I had drafted because the brief does not state it. No exclamation marks, no em dashes, no "AI" in the copy

## What I could not do
- In the sandbox the Google Fonts request fails with a proxy certificate error, so my screenshots show the fallback serif and sans. On the open web Gloock and Onest will load. The layout was sized so it also holds up with the fallbacks
- The form is static, with no backend, as the brief allows
