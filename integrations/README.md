# Integrations

Plain Node.js (ES modules, Node 18.17+, built-in `fetch`, zero dependencies) scripts that publish approved queue files and read inboxes and stats for Instagram, YouTube and LinkedIn. Nothing needs `npm install`.

## Safety model

- **Dry run is the default.** Without `LIVE=1` a script prints the exact request(s) it would send (secrets shown as `<redacted>`) and never touches the network. Missing env vars become `<PLACEHOLDERS>` in dry run.
- **`LIVE=1` executes.** Only the scheduler agent sets it, and only when the human said so for that task.
- On success a publish script prints one line: `PUBLISHED <platform> <id> <url>`. The scheduler agent looks for it before moving a file to `queue/published/`.
- Errors exit non-zero with a plain message. HTTP 429 and 5xx (and Meta throttle codes 4, 17, 32, 613) retry with exponential backoff and `Retry-After`, up to `HTTP_MAX_RETRIES` (default 4).

```
node meta/publish.js queue/approved/<file>.md          # dry run
LIVE=1 node meta/publish.js queue/approved/<file>.md   # real publish
```

## Queue file fields the scripts read

Standard fields come from content-engine (`channel`, `format`, `# HOOK`, `# BODY / CAPTION`, `# HASHTAGS`). Media fields are added to the front matter at approval time (by the human or creative-studio):

| Field | Used by | Meaning |
| --- | --- | --- |
| `media_url` | Instagram image, reel | Public https URL of the image or video |
| `media_urls` | Instagram carousel | Comma separated public image URLs (2 to 10) |
| `cover_url` | Instagram reel | Optional cover image URL |
| `video_path` | YouTube | Local video file |
| `title`, `publish_at`, `privacy`, `category_id`, `made_for_kids` | YouTube | Title (defaults to hook), schedule time, etc. |
| `image_path`, `image_alt` | LinkedIn | Local image file for an image post |

## Layout

```
lib/env.js        .env loader, LIVE flag, required vars
lib/http.js       fetch wrapper: dry-run print, redaction, retry/backoff
lib/log.js        logging, PUBLISHED line
lib/queue.js      queue file parser, arg parser
meta/publish.js   Instagram container -> poll -> publish
meta/dms.js       comments, replies, conversations, messages, send DM, insights
youtube/upload.js resumable upload, schedule via publishAt
youtube/comments.js, youtube/stats.js, youtube/auth.js
linkedin/post.js  Posts API text and image posts
linkedin/stats.js org share statistics, post social counts
```

Verify syntax any time: `npm run check` (runs `node --check` on every file).

## Setup: Instagram (Meta Graph API)

1. You need an Instagram **Business or Creator** account linked to a Facebook Page.
2. Go to developers.facebook.com, **Create App**, type **Business**. Add the **Instagram** product (Instagram API with Facebook Login) and, for DMs, **Messenger** products as shown in the dashboard.
3. Permissions to request:
   - `instagram_basic`
   - `instagram_content_publish` (publish)
   - `instagram_manage_comments` (list and reply to comments)
   - `instagram_manage_messages` (DMs)
   - `instagram_manage_insights` (insights)
   - `pages_show_list`, `pages_read_engagement`, `business_management` (to reach the IG account through the Page)
4. In Graph API Explorer pick your app, select the permissions above, generate a user token, then exchange it for a **long-lived token** (about 60 days):
   `GET /oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=SHORT_TOKEN`. For unattended use create a **System User** in Business Settings and generate a token for it; it does not expire in the same way.
5. Find your IG user id: `GET /me/accounts` for the Page id, then `GET /PAGE_ID?fields=instagram_business_account`. Put the id in `IG_USER_ID`, the token in `IG_ACCESS_TOKEN`.
6. **App review:** while the app is in Development mode, only people with a role on the app (you, testers) can use these permissions, which is enough to run your own account. To serve other accounts you must pass **App Review** and **Business Verification** with screencasts per permission. For a single owned account, Development mode is normally enough.

Known limits (Instagram):
- Media must be reachable at a **public https URL** at publish time. No file upload in this flow.
- Publishing limit: about 100 API-published posts per 24 hours per account (carousels count as one).
- Reels: MP4/MOV, 9:16, up to about 90 seconds via API, container processing can take minutes. The script polls for `FINISHED`.
- Single posts and carousels: JPEG images only. Carousels 2 to 10 items.
- **DMs: you can only send a message within 24 hours of the user's last message to you.** Outside the window the API errors. Human-agent tag extends to 7 days for human replies only. You cannot start a DM with someone who has not messaged you first.
- Comments: you can reply to comments and hide them, not edit others' comments. Hashtag search and mentions need extra access.
- Insights metrics change by Graph API version and media type. If a metric is rejected, check the current docs for that media type.

## Setup: YouTube (Data API v3)

1. console.cloud.google.com: create a project. **APIs & Services > Library**, enable **YouTube Data API v3**.
2. **OAuth consent screen:** User type External, add your Google account as a test user. Scopes: `https://www.googleapis.com/auth/youtube.upload`, `https://www.googleapis.com/auth/youtube.force-ssl` (comments, reading), `https://www.googleapis.com/auth/youtube.readonly`.
3. **Credentials > Create credentials > OAuth client ID**, type Web application, add redirect URI `https://developers.google.com/oauthplayground`. Copy client id and secret into `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
4. Get a refresh token once: open OAuth 2.0 Playground, gear icon, tick **Use your own OAuth credentials**, paste the client id and secret, authorize the scopes above, **Exchange authorization code for tokens**, copy the **refresh token** into `GOOGLE_REFRESH_TOKEN`. The scripts then exchange it for short-lived access tokens on every run.
5. Optional: set `YOUTUBE_CHANNEL_ID`.

Known limits (YouTube):
- **Testing-mode consent screens issue refresh tokens that expire after 7 days.** Publish the consent screen to Production (unverified is fine for personal use, with a warning screen) to avoid weekly re-auth.
- **Videos uploaded by an unaudited API project are locked to private** (since July 2020). Request an API compliance audit for your project before expecting public or scheduled-public uploads.
- Quota: 10,000 units per day by default. `videos.insert` costs 1,600 (about 6 uploads a day), a comment reply costs 50, reads cost 1.
- Scheduling: `status.publishAt` requires `privacyStatus: private`; YouTube flips it to public at that time. The script does this automatically when `publish_at` is set.
- The script reads the whole video into memory for a single PUT. Fine for typical files; use a chunked uploader for multi-GB files.
- A Short is a vertical video under 3 minutes with `#Shorts`; there is no separate API flag.

## Setup: LinkedIn (Posts API)

1. linkedin.com/developers: **Create app**, associate it with a LinkedIn **Company Page** (required) and verify the app on that Page.
2. **Products** tab: request **Share on LinkedIn** (member posting, scope `w_member_social`) and **Sign In with LinkedIn using OpenID Connect**. For Page posting, comments and analytics request **Community Management API** (scopes `w_organization_social`, `r_organization_social`, `rw_organization_admin`). Community Management API needs an application and review, and LinkedIn asks for a use case description; expect days to weeks.
3. **Auth** tab: add a redirect URL (for example `http://localhost:3000/callback`). Run the 3-legged OAuth authorization code flow once with the scopes you were granted, exchange the code at `https://www.linkedin.com/oauth/v2/accessToken`, and put the access token in `LINKEDIN_ACCESS_TOKEN`. LinkedIn also offers a token generator under Tools in the developer portal for testing.
4. Author URN: member = `urn:li:person:<id>` (id from `/v2/userinfo` field `sub`); Page = `urn:li:organization:<id>`. Put it in `LINKEDIN_AUTHOR_URN`.
5. `LINKEDIN_VERSION` is the monthly API version header (`YYYYMM`). LinkedIn sunsets old versions after about a year; bump it when you get a version error.

Known limits (LinkedIn):
- Access tokens last about 60 days; refresh tokens (about 1 year) are only issued to approved partner apps. Plan to re-run the auth flow roughly every two months.
- This uses the **Posts API** (`/rest/posts`), the replacement for the legacy UGC Posts API (`/v2/ugcPosts`). Same post types (text, image) with a newer, versioned contract.
- Commentary has reserved characters that must be escaped; the script does this. Do not put external links in the body per the playbook rule.
- Member (personal) post analytics are restricted by LinkedIn. Organization share statistics need `r_organization_social`.
- Daily call limits are per application and per member and reset at midnight UTC; the script backs off on 429.

## Security note

- **Tokens live in environment variables only** (`integrations/.env`, which is git-ignored via the repo `.gitignore` rules for `.env` and `.env.*`; only `.env.example` is committed). Never paste a token into a queue file, brief, log, issue or chat.
- Dry-run output and error messages redact `access_token`, `Authorization`, `client_secret` and `refresh_token` values.
- Use the least permissions you need, a System User or dedicated Google account for automation, and rotate tokens on a schedule. If a token leaks, revoke it in the platform dashboard first, then replace it.
- `LIVE=1` is a deliberate act. Do not export it in a shell profile or a scheduled task unless every run is meant to publish.
