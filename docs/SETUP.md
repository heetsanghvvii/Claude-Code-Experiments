# Running MANHUNT locally

This gets the repo running on your machine: the game rules, the database tests, and the app.

## Layout

```
packages/engine      pure TypeScript game rules and their unit tests (vitest)
supabase/migrations  SQL for the manhunt schema, RLS and game functions
supabase/tests       database tests (run against a throwaway local Postgres)
apps/mobile          Expo app (the native app; web runs from it too for now)
apps/web             planned PWA (not in the repo yet, see DEPLOY.md)
docs/                RISKS, STRUCTURE, PRIVACY, SAFETY, SETUP, DEPLOY
```

## 1. Prerequisites

- **Node.js**: a current LTS release (Node 22 works). Check the Expo docs for the minimum that the Expo SDK in `apps/mobile` needs.
- **npm**: comes with Node. The repo uses npm workspaces, so use npm (not yarn or pnpm) at the root.
- **Git**.
- **PostgreSQL 16 with PostGIS 3** (only for the database tests). On Debian or Ubuntu:

  ```bash
  sudo apt install postgresql-16 postgresql-16-postgis-3
  ```

  If the binaries are somewhere else, set `PGBIN` to the folder that contains `pg_ctl` and `initdb`.
- **Expo Go** on a phone is useful for a quick look, but it cannot run background location. For real rounds you need a development build (see section 5).

## 2. Install

From the repo root:

```bash
npm install
```

This installs every workspace (`packages/*` and `apps/*`) in one go. Do not run `npm install` inside a single app folder.

## 3. Environment variables

The app reads its Supabase settings from environment variables. They are public values, but keep them out of git anyway.

1. Copy the example:

   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   ```

2. Fill in the values from your Supabase project (Project Settings, then API):

   | Variable | What it is | Where it is used |
   | --- | --- | --- |
   | `EXPO_PUBLIC_SUPABASE_URL` | Project URL, `https://<project-ref>.supabase.co` | Client, at build time |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Client. Safe to ship, because RLS protects the data |
   | `GOOGLE_MAPS_IOS_API_KEY` | Optional, build time only | `apps/mobile/app.config.ts`. Empty means Apple Maps on iOS |
   | `GOOGLE_MAPS_ANDROID_API_KEY` | Optional, build time only | `apps/mobile/app.config.ts` |

**Never put the `service_role` key in an app, an `EXPO_PUBLIC_` variable, or a file in git.** It bypasses all row-level security. It is only for trusted server jobs.

`apps/mobile/.env` is gitignored. Restart the dev server after changing it, because `EXPO_PUBLIC_` values are inlined when the bundle is built.

## 4. Run the engine tests

The engine holds the reference rules. It has no I/O and is deterministic.

```bash
npm test            # runs vitest in @outrun/engine
npm run typecheck   # runs tsc in every workspace that has a typecheck script
```

To run one test file:

```bash
npm test -w @outrun/engine -- game.test.ts
```

## 5. Run the database tests

The database tests start a throwaway Postgres cluster, stub the parts of Supabase the migrations need (`auth.users`, `auth.uid()`, roles), apply every migration in order, and run the SQL tests.

```bash
npm run db:test
# or
bash supabase/tests/run.sh
```

What to expect:

- The script prints `migrate:` for each file in `supabase/migrations/` and `test:` for each `supabase/tests/test_*.sql` file, with the number of assertions passed.
- It ends with `ALL DB TESTS PASSED`. Any failing assertion stops the run and prints the error.
- The cluster is stopped and its data folder is deleted when the script exits, even on failure.
- The test database is called `outrun_test` (a name carried over from before the rename). It exists only inside the temporary cluster.

Options:

- `PGBIN=/path/to/pg16/bin bash supabase/tests/run.sh` to use another Postgres install.
- `PGPORT_TEST=54330 bash supabase/tests/run.sh` if port 54329 is in use.

If you run the script as root, it runs `initdb` and Postgres as the `postgres` user automatically.

Keep the migrations and the engine in step. `docs/STRUCTURE.md` explains that the rules currently exist twice (TypeScript and PL/pgSQL), and parity tests are planned.

## 6. Run the app

### Native app (Expo)

```bash
npm run start -w @outrun/mobile     # Expo dev server
```

- Scan the QR code with Expo Go for a quick look at screens. Expo Go does not include the native modules needed for background location or the map, so some screens will be limited.
- For background location and the full map, build a development client with EAS or locally:

  ```bash
  npx expo run:android     # or run:ios on a Mac
  npx eas-cli@latest build --profile development --platform android
  ```

  Expo's own docs say which commands apply to the installed SDK. Check them before you run anything, because the Expo SDK changes often.

### Web (PWA)

The PWA is planned as `apps/web` (see `docs/DEPLOY.md`). It does not exist in the repo yet. The Expo project can run in a browser for quick UI checks only:

```bash
npm run web -w @outrun/mobile
```

Browsers do not give the same background location behaviour as the native app, so do not test live location in a desktop browser and assume it matches a phone.

## 7. Before you commit

```bash
npm test
npm run typecheck
npm run db:test
```

Also run `npx expo lint` in `apps/mobile` if you changed app code.

## 8. Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| The app shows a configuration warning | `apps/mobile/.env` is missing or the URL does not start with `https://`. Restart Expo after fixing it. |
| `permission denied for schema manhunt` or calls return 404 | The `manhunt` schema is not exposed to the API, or the client is not using it. See `docs/DEPLOY.md` section 2. |
| `run.sh` fails with `initdb` or `pg_ctl` not found | Set `PGBIN` to the Postgres 16 `bin` folder. |
| Migration fails on `extension "postgis"` | PostGIS is not installed for Postgres 16. Install `postgresql-16-postgis-3`. |
| Port already in use | Set `PGPORT_TEST` to a free port. |
| Map is blank | Expected offline or with no map key. The arena circle and players still render. |
