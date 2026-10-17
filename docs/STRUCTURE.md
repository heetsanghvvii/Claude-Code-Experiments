# OUTRUN: repository layout

The repo already holds Claude Code skill packs (`.claude/`, `third_party_licenses/`). OUTRUN goes beside them as an npm-workspaces monorepo.

```
package.json               npm workspaces root (apps/*, packages/*)
docs/
  STRUCTURE.md             this file
  RISKS.md                 GPS, background execution and map SDK risks
packages/
  engine/                  @outrun/engine: pure TypeScript game rules, no I/O
    src/                   types, config, state machine, teams, tagging, geo, rng
    test/                  vitest unit tests
supabase/
  migrations/              ordered SQL: schema, RLS, trusted RPC functions
  tests/                   local harness: stub Supabase auth, apply migrations, run SQL tests
apps/
  mobile/                  Expo (dev build) + Expo Router app
    app/                   routes: (auth)/sign-in, sign-up; (app)/index, create, join, lobby/[id], map/[id]
    src/lib/               supabase client, env, game API (RPC wrappers)
    src/components/        ArenaMap (map SDK hidden behind one component)
```

## Where the logic lives

- `@outrun/engine` is the reference implementation of the rules. It is deterministic: every function takes `now` and returns new state plus events, with no clock, network or randomness of its own (team shuffles take a seed).
- The server is the authority. The Postgres functions in `supabase/migrations` (SECURITY DEFINER, one transaction each) own the clock (`now()`), team assignment, snapshot release, tag confirmation, elimination and the winner. Clients only call RPCs; they cannot write `games`, `game_players`, `location_snapshots` or `game_events` directly.
- The rules currently exist twice, in TypeScript and in PL/pgSQL. Planned follow-up: run the engine in a Supabase Edge Function that reads and writes inside one RPC transaction, or add parity tests that run shared scenarios against both.
- The app imports `@outrun/engine` only for display helpers (phase timers, distances). It never decides an outcome.

## Map SDK

Undecided between Mapbox and Google. The scaffold uses `react-native-maps` behind `src/components/ArenaMap.tsx`, so switching SDKs touches one file. See RISKS.md.
