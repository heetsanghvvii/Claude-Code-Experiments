# Deploying MANHUNT

This covers the database, the web app (PWA) on Vercel, scheduled jobs, and how players install the app on their phones.

Before you start, read `docs/PRIVACY.md` (the notice must match what you ship) and `docs/SETUP.md` (local checks).

## 0. What runs where

| Piece | Host | Notes |
| --- | --- | --- |
| Database, auth, realtime | Supabase project (shared with another app) | MANHUNT lives only in the `manhunt` schema |
| PWA | Vercel, from `apps/web` | Planned. Not in the repo yet |
| Native app | EAS Build and stores | `apps/mobile`. Use a development build for background location |
| Scheduled jobs | `pg_cron` inside Supabase | `advance_all_games` and `purge_expired_locations` |

## 1. Apply the migrations

Apply the three files in `supabase/migrations/` in order. Name order matters:

1. `20261017000001_schema.sql`: schema, types, tables, integrity triggers
2. `20261017000002_rls.sql`: row-level security, grants, realtime publication
3. `20261017000003_functions.sql`: game functions and privileges

Use the Supabase CLI (`supabase db push`) or paste each file into the SQL editor, one at a time. Run `npm run db:test` locally first (see `docs/SETUP.md`).

Things to check after applying:

- `select * from manhunt.games limit 1;` works in the SQL editor (it runs as the owner, so it bypasses RLS).
- The other app's tables and schemas are unchanged.

## 2. Expose the `manhunt` schema to the API

The Supabase project is shared, so the API only exposes schemas you name. `manhunt` must be added to the list, and `public` must stay in it for the other app.

1. Open the Supabase dashboard, then **Project Settings > Data API** (older projects show this as **API settings**).
2. Under **Exposed schemas**, add `manhunt` to the existing list (for example `public, graphql_public, manhunt`). Do not remove anything the other app uses.
3. Save. Supabase updates the API config (`pgrst.db_schemas`). If calls still return 404 after a minute, reload the API config from the SQL editor:

   ```sql
   notify pgrst, 'reload config';
   ```

4. The migrations already grant `usage` on the schema, `select` on the tables (to `authenticated` only), and `execute` on the player RPCs. Anonymous callers get no table access.

### The client must target the schema

`apps/mobile/src/lib/supabase.ts` currently calls `createClient` without a schema, so requests go to `public` and fail. Set the schema on the client (this is a code change, not in this document's scope):

```ts
createClient(url, anonKey, {
  db: { schema: 'manhunt' },
  // ...auth options as before
});
```

Realtime subscriptions must also name the schema, for example `{ event: '*', schema: 'manhunt', table: 'games' }`.

### Shared project warning: the auth trigger is global

Migration 1 adds `on_auth_user_created` on `auth.users`. It runs for every new sign-up in the project, including the other app's users, and creates a `manhunt.profiles` row for each one. This is harmless for the other app but it does store other users' display names in the MANHUNT schema, which is a privacy issue.

Before launch, decide one of these and record it in `docs/PRIVACY.md`:

- Keep it, and say so in the notice.
- Restrict it, for example by only inserting when `raw_user_meta_data` contains a MANHUNT marker set by the sign-up screen, or by moving sign-up for MANHUNT behind its own project.

## 3. Deploy the PWA on Vercel

`apps/web` does not exist yet. When it does, deploy it like this.

1. In Vercel, **Add New > Project**, and import this repo.
2. Set **Root Directory** to `apps/web`.
3. Turn on **Include source files outside of the Root Directory in the Build Step**. The workspace packages (for example `packages/engine`) must be present for the build.
4. Install command: `npm install` at the repo root (run from the workspace root so the lockfile is used). Build command: the app's build script.
5. Add the environment variables in section 4 for **Production** and **Preview**.
6. Deploy. Check the build log for errors, then open the production URL on a phone.

### HTTPS and auth

- Location and the service worker only work on HTTPS. Vercel gives you this.
- In Supabase, **Authentication > URL Configuration**, set the Site URL to the production domain and add the Vercel preview and production URLs to the redirect allowlist. Otherwise sign-in links fail.

## 4. Environment variables

| Name | Where to get it | Used by | Public? |
| --- | --- | --- | --- |
| Project URL (`https://<ref>.supabase.co`) | Supabase, Project Settings > API | PWA and app | Yes |
| Anon (public) key | Supabase, Project Settings > API | PWA and app | Yes. RLS protects the data |
| `GOOGLE_MAPS_IOS_API_KEY`, `GOOGLE_MAPS_ANDROID_API_KEY` | Google Cloud | Native build only (`apps/mobile/app.config.ts`) | Restrict by bundle ID or SHA-1 |
| Map token (Mapbox public token, if chosen) | Mapbox | PWA and app | Yes, but restrict by domain |

Names: the native app reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. The PWA should use the same values under the prefix its framework needs (for example `VITE_` or `NEXT_PUBLIC_`). Keep one source of truth in the Supabase dashboard.

Never add the service role key to Vercel's browser variables. If a server function needs it, add it as a server-only variable and keep it out of client code. Rotate it if it is ever committed or shared.

## 5. Scheduled jobs with pg_cron

The game clock only advances when a player calls an RPC, or when a scheduled job runs. Without the job, rounds that nobody touches never end. The purge deletes precise locations on schedule.

1. Enable the extension: **Database > Extensions**, search for `pg_cron`, and enable it.
2. Open the SQL editor and schedule both jobs. Times are UTC:

   ```sql
   select cron.schedule('manhunt-advance', '* * * * *', $$select manhunt.advance_all_games()$$);
   select cron.schedule('manhunt-purge', '*/15 * * * *', $$select manhunt.purge_expired_locations()$$);
   ```

   The migration comment still shows `outrun-advance` and `outrun-purge` as job names. Use one set of names and keep them consistent.

3. Check that they run:

   ```sql
   select jobid, jobname, schedule, active from cron.job;
   select jobname, status, return_message, start_time
     from cron.job_run_details order by start_time desc limit 20;
   ```

4. To change a job, unschedule it first, then schedule it again:

   ```sql
   select cron.unschedule('manhunt-purge');
   ```

Notes:

- `advance_all_games` returns the number of live games it touched. It is idempotent, so a missed run is harmless.
- Purge runs every 15 minutes, so data can sit up to about 15 minutes past its deadline. This is stated in `docs/PRIVACY.md`.
- If the job history shows errors, fix them before launch. A failing purge means location data is kept longer than promised.

## 6. Install the PWA on a phone

Share these steps with players once the PWA is live.

### iPhone (Safari)

1. Open the MANHUNT link in **Safari**. The Add to Home Screen option is in Safari's Share menu, so use Safari rather than another browser.
2. Tap the **Share** button (square with an up arrow).
3. Scroll and tap **Add to Home Screen**, then **Add**.
4. Open MANHUNT from the new home screen icon. Sign in, then allow location when the app asks.

### Android (Chrome)

1. Open the MANHUNT link in **Chrome**.
2. Tap the **three-dot menu**, then **Install app** (or **Add to Home screen**, depending on the Chrome version).
3. Confirm. Open MANHUNT from the app drawer or home screen.

Players should keep the phone unlocked and the app open during a round unless the native app is installed. Browsers pause location when the screen locks, so live sharing is less reliable in a PWA. This is listed as a known gap in `docs/PRIVACY.md` section 11.

## 7. Native builds (optional, later)

For background location and stores, build the native app with EAS:

```bash
npx eas-cli@latest build --profile production --platform android
npx eas-cli@latest build --profile production --platform ios
```

Check the current EAS and Expo docs before running these, because the SDK changes often. Store submission needs the privacy policy URL and the account deletion path from `docs/PRIVACY.md` sections 9 and 10.

## 8. Launch checklist

- [ ] Migrations applied in order, `npm run db:test` green on the same commit
- [ ] `manhunt` added to Exposed schemas, and the other app still works
- [ ] Client uses `db.schema = 'manhunt'`, and realtime subscriptions name the schema
- [ ] Auth trigger decision recorded (section 2)
- [ ] Auth URL configuration includes production and preview URLs
- [ ] Vercel env vars set for Production and Preview, no service role key in the browser
- [ ] `manhunt-advance` and `manhunt-purge` scheduled and showing successful runs
- [ ] Privacy notice and consent screen match `docs/PRIVACY.md` and `apps/web/src/content/privacy.ts`
- [ ] Safety copy and host guidelines reviewed (`docs/SAFETY.md`)
- [ ] Legal review of `docs/PRIVACY.md` completed, and every **Verify** item closed
