# Knock: entry 4 notes

## Design direction (3 lines)
A private career concierge on warm paper: ivory background, deep "door green" for action, one brass accent.
Fraunces display serif (italic used as the "human voice") with Hanken Grotesk body; calm, editorial, no tech tropes.
The signature motif is a door: an arched SVG doorway that gets knocked on twice (rings) and opens a crack, letting warm light out.

## Key decisions
- Process: wrote DESIGN.md first (9 sections: tokens, type, component states, layout, elevation, motion, do/don't, responsive), then built strictly from it. All colors are CSS variables on :root; contrast pairs checked (body 8.3:1, tertiary 5.1:1, button text 9.8:1, ink section text 9.2:1 or more).
- Interaction tier L2, CSS + vanilla JS only (no libraries, no WebGL). Hero: word-by-word mask reveal, knock rings, door opening, cursor-following warm light, magnetic primary CTA (desktop only).
- First scroll: dark "queue" band with two marquee rows of struck-through "Application #… No response" lines, then "Portals are a queue. People hire people." fading in line by line.
- How it works: sticky intro on the left and a 4-step timeline whose progress rail fills as you scroll. "You approve every message" is called out on its own.
- Why it works: unequal bento grid (60 dots for the 60 hand-picked people, plus a sales-style flow from companies to people to first reply to referral or interview) with spotlight hover.
- Example message: shown as an annotated letter (no app chrome), with the three things that make it work highlighted and numbered.
- Packages: Standard is featured; "every package includes" and the done-for-you option sit below. Fine print says honestly that reply numbers are not promised.
- Form: client-side validation with inline errors (aria-invalid, polite live regions, focus moves to the first error). The success state is personalised with first name, companies, email and the package they clicked.
- Clever detail: a "Knock twice" button in the footer knocks and shows "Knock knock. Who's there? Your next interview." The arrows on CTA buttons also knock on hover.
- Every primary CTA reads exactly "Get my target list". No testimonials, logos, counts or invented stats. No em dashes, no exclamation marks, no "AI" headline.
- Accessibility: skip link, visible focus rings everywhere, 44px+ touch targets, native details/summary for the FAQ, prefers-reduced-motion turns off all motion (reveals shown immediately, marquee stopped, rings hidden, parallax and pointer effects skipped). Mobile nav collapses to a menu button that closes on Escape.

## Could not do / caveats
- Google Fonts could not be loaded in this sandbox (TLS interception), so the QA screenshots show the fallback serif and sans. The page links Fraunces and Hanken Grotesk and will use them when it is opened normally.
- No backend: the form is static and only shows the success state.
- The skill's reference-URL crawl and Unsplash image steps were skipped: there is no reference site and external images are not allowed. All visuals are inline SVG and CSS.
