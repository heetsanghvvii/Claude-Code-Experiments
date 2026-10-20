# Inbox

Drop incoming DMs, comments, and reviews here for the `engagement` agent. One markdown file per message. Nothing here is ever sent by the agents.

## File name
`YYYY-MM-DD_<platform>_<short-slug>.md`

## Format
```
---
from: <handle or name>
platform: instagram | youtube | linkedin | other
type: dm | comment | review
rating: <1-5, reviews only, otherwise omit>
received: YYYY-MM-DD
---

<exact message text, unedited>
```

## Notes
- Paste the message exactly as received. Do not clean it up.
- For comments, add the post it was left on as a line `post: <link or title>` in the front matter.
- Processed replies and escalation cards appear in `queue/pending/`.
