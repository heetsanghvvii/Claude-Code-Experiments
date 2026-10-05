# Entry 8 notes

## Direction (3 lines)
Private-concierge editorial look: warm paper (#F3EEE5) content slides, deep forest green (#1F3A31) for opening, offer and close, brass (#B08442) as the only accent.
Newsreader serif action titles over Hanken Grotesk text (Georgia/Times and Helvetica/Arial fallbacks), hairline rules instead of boxes, one arched-doorway line motif on the title and close slides.
12 slides, one idea each, following the brief's storyline plus a "your batch stays in control" slide for protective committee heads; no invented numbers, <Club name> placeholders kept.

## Skill steps followed
- Read the skill, output-formats (slide deck) and design-principles. Skipped questions, the Core Asset Protocol, web research and variations, as the brief instructed.
- Wrote the system down before building (type scale, two backgrounds, one accent, kicker + action-title header, footer pattern) as a comment at the top of deck.html.
- Built a single 1920x1080 HTML deck with a scaling stage, keyboard and button navigation, and localStorage for the current slide. @media print uses @page 1920x1080 and shows every slide, one per page.
- Followed the craft rules: body text at 24px or more, no emoji, no gradients, no left-border accent cards, labelled placeholders (avatar "photo", <Club name>) instead of fake assets.
- Self-check: rendered to PDF and PNG once, reviewed the contact sheet and individual slides, fixed everything in one batch, re-rendered to confirm.

## Problems
- Google Fonts do not load in the offline render, so the PNGs show Times/Arial-style fallbacks. The layout holds up either way.
- First render: the approval bar on slide 4 overlapped the footer, the email on slide 12 picked up the small-caps label style, and the placeholder spacing on slide 7 was off. All three fixed.
- It is an HTML deck, so text is editable in code rather than in PowerPoint.
