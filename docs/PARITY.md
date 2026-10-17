# Engine vs SQL parity, and the SQL security review

The game rules exist twice:

- `packages/engine`: pure TypeScript. This is the reference, and it is easy to unit test.
- `supabase/migrations`, schema `manhunt`: PL/pgSQL `SECURITY DEFINER` RPCs. This version is authoritative. Clients can only call these RPCs, and the server clock decides outcomes.

This document covers how we check that the two agree, what the review of the SQL found, what was fixed, and what is still open.

## How to run

```sh
npm test                                  # engine unit tests + parity scenarios against the engine only
PGPORT_TEST=54399 bash supabase/tests/run.sh          # everything below (needs postgresql-16 + postgis 3)
PGPORT_TEST=54399 bash supabase/tests/run.sh parity   # or: sql | race | parity
```

`run.sh` does the following:

1. Creates a throwaway Postgres.
2. Applies `supabase_stub.sql`, which stands in for the `anon`/`authenticated` roles, `auth.uid()` and the publication.
3. Applies every migration in order.
4. Runs `test_*.sql`, then `race_tests.sh`, then the parity suite. For the parity suite it loads `supabase/tests/parity/parity_setup.sql` and runs `packages/engine/test/parity.test.ts` with `PARITY_PGHOST` set, so the SQL half is not skipped.

Test counts at the time of writing:

| Suite | Count |
| --- | --- |
| `npm test` (engine) | 115 passed. 39 skipped: the SQL half of the parity suite, which needs the database |
| `test_game_flow.sql` | 77 assertions |
| `test_security.sql` (new) | 31 assertions |
| `race_tests.sh` | 6 assertions (2 new) |
| parity, with the database | 79 tests: 39 scenarios x (engine, SQL + step-by-step diff) + 1 loader check |

## How parity works

**Scenarios.** Scenarios live in `supabase/tests/parity/scenarios/*.json`: 39 scenarios, 536 steps and 184 explicit expectations. A step is one command, run as one user at a virtual time in whole seconds after creation. Examples: `join`, `setRole`, `start`, `tag`, `ack`, and `location` with metres north/east of the arena centre, accuracy, a backdate (`ago`) and `mocked`. A step can carry a partial `expect`.

**Engine side.** `packages/engine/test/parity/engineRunner.ts` feeds the steps to the engine. The adapter adds only what the RPC layer adds on top of the rules:

- the membership check on `advance_game`;
- `record_location` acceptance, followed by a proximity attempt on every pending tag that involves that player;
- a proximity attempt at `submit_tag`;
- snapshot release on each clock tick, using `snapshotDue` and `selectSnapshotReadings`.

Everything else comes from the engine.

**SQL side.** `packages/engine/test/parity/sqlRunner.ts` builds one psql script per scenario. Each step:

- runs as role `authenticated` with that user's JWT `sub`;
- goes through the real RPC, inside a subtransaction, so a failed call rolls back the way a failed PostgREST call does;
- is followed by a normalised read of the game, done as superuser.

**Comparison.** For every step, the suite:

1. checks both sides against the step's `expect`;
2. diffs the full observation: result/error code, status, winner, end reason, host, times, role counts, every player, every tag, every snapshot row, and the exact ordered list of events that step emitted.

**Time travel.** Before each step, `parity.at(t)` moves every stored timestamp of the game so that `now() - created_at = t`. It also snaps stored instants to whole seconds. Production functions keep reading the real `now()`. Only test data moves.

### Coverage

| Rule | Scenarios |
| --- | --- |
| Team size `round(n x 0.25)` clamped to [1, n-1], n = 2..20 | `teams-count-*` (11) |
| Who may assign/set roles and when; start needs min players, every role, one of each team; max players | `team-constraints`, `team-game-full`, `lobby-join-replay` |
| COUNTDOWN -> ACTIVE exactly at `active_at`; cancel in countdown; team empties in countdown -> CANCELLED; one late tick applies all transitions in order | `countdown-*` |
| Head start: no tags before `hunters_released_at`, allowed exactly at it, no snapshots before it | `head-start` |
| Snapshot release times, latest fresh reading per ACTIVE runner, stale/eliminated runners left out, device time wins over arrival order | `snapshot-release-timing`, `snapshot-backdated-reading` |
| Confirmation by runner ack, only by the tagged runner, rejects other pending tags on that runner | `tag-runner-ack` |
| Confirmation by 2 close GPS pairs; a single pair, inaccurate, far or skewed pairs never eliminate; no reading reuse; window; evidence before the tag; mocked readings ignored | `proximity-*` |
| Expiry exactly at the window end; tags still pending at the deadline expire at the deadline | `tag-expiry`, `tag-expiry-at-deadline` |
| Wins: all runners eliminated or left, time expired (`ended_at` = deadline), hunters forfeit | `win-*` |
| Immutable after completion: every command refused or a pure replay | `immutable-after-completion` |
| Idempotent tags: replay, conflict on reuse, replay after the end | `tag-idempotency` |
| Lobby timeout exactly at 1800 s; host hand-off; last player leaves -> cancelled | `lobby-*` |
| Eliminated runner leaves (review finding) | `eliminated-runner-leaves` |

### Accepted divergences

These are differences in the API surface, not in the rules. Each one is declared on its step (`divergence`), and each side is checked against its own expectation:

1. **`join_game` is idempotent in SQL.** Rejoining returns the game, which the app relies on after a restart. The engine returns `ALREADY_JOINED` (2 steps).
2. **Joining a finished game's code** returns `GAME_NOT_FOUND` in SQL, because codes are released for reuse. The engine has no codes, so it returns `GAME_FINISHED` (2 steps).
3. **Error precedence for a non-host after LOBBY.** SQL checks host first (`NOT_HOST`); the engine checks status first (`WRONG_STATUS`). Both reject (1 step).

## Bugs found and fixed

Each bug got a failing test first. The fix is a new migration; the four original migrations are untouched.

| # | Bug | Failing test | Fix |
| --- | --- | --- | --- |
| 1 | **Mocked GPS readings counted as elimination evidence in SQL.** `_try_proximity` ignored `player_locations.is_mocked`. In the scenario, a mocked hunter pair eliminated a runner at 103 s. | parity `proximity-mocked-readings-ignored` | `20261017000110_proximity_ignore_mocked.sql` |
| 2 | **Wrong hunter count for 10, 18, ... players.** `round()` on a float rounds half to even in Postgres, so 10 players got 2 hunters instead of 3, and 18 got 4 instead of 5. The engine uses `Math.round` (half up). | parity `teams-count-10`, `teams-count-18` | `20261017000111_assign_teams_round_half_up.sql` |
| 3 | **`submit_tag` checked the tag id before taking the game lock.** With two concurrent calls on one id, a replay logged `TAG_REQUESTED` twice. Reusing an id for a different runner silently returned the other runner's tag instead of `TAG_CONFLICT`. | `race_tests.sh` cases 1, 2 | `20261017000112_tag_rpc_races.sql`: the game row is locked first, and a lost insert is re-checked |
| 4 | **Concurrent client retries of `acknowledge_tag` / `withdraw_tag` failed.** The retry re-read the tag after the lock but treated "already CONFIRMED/REJECTED" as `TAG_NOT_PENDING`. If the first ack had ended the game, the retry got `GAME_FINISHED`. A sequential retry succeeds, and so does the engine. | `race_tests.sh` cases 5, 6 | `20261017000112_tag_rpc_races.sql` |
| 5 | **An ELIMINATED runner calling `leave_game` got a raw `23514` check-constraint error.** The function set status LEFT while `eliminated_at` stayed set. The engine accepted the call but overwrote ELIMINATED with LEFT, which erased the result. Leaving after elimination is now a no-op on both sides. | engine `game.test.ts` "an eliminated runner who leaves stays ELIMINATED"; parity `eliminated-runner-leaves` | `20261017000113_leave_after_elimination.sql`; engine `leaveGame` |
| 6 | Hardening, not exploitable: `_err` was the only function without a pinned `search_path`. | `test_security.sql` "every manhunt function pins its search_path" | `20261017000114_pin_err_search_path.sql` |

Engine source changes, each justified by a test that failed first:

- `LocationReading.isMocked`, and `evaluateProximity` ignoring mocked readings. Tests: `game.test.ts` "rejects evidence with mocked hunter/runner readings". This change came from the earlier pass of this work.
- `leaveGame` is a no-op for any non-ACTIVE player (bug 5).

## Security review: what was checked and holds

The tests are in `supabase/tests/test_security.sql` unless noted.

- **Privileges.** `anon` cannot execute any `manhunt` function or read any table. `authenticated` can execute exactly the 13 public RPCs plus the 3 RLS helpers. No client has INSERT/UPDATE/DELETE/TRUNCATE on any table. The only client-writable column is `profiles.display_name`. RLS is on for every table. Hunters cannot forge snapshots, eliminate runners or set a winner by writing tables.
- **SECURITY DEFINER.** Every function pins `search_path`. Definer paths never include `public` or `$user`, and `pg_temp` is last. Definer functions are owned by the migration owner. Internal `_*` helpers are not executable by clients (also covered in `test_game_flow.sql`).
- **RLS leaks.**
  - Raw `player_locations` are visible only to their owner, and the table is not in the realtime publication.
  - Only ACTIVE hunters of the game see snapshots, and only released ones. A hunter who LEFT loses access.
  - A runner sees only their own snapshots.
  - Outsiders see no game, players, events, tags or snapshots.
  - Event payloads carry no coordinates.
- **Outsider calls.** RPCs that tick the clock before checking membership (`leave_game`, `cancel_game`, `submit_tag`, `record_location`) raise, so the tick rolls back. An outsider cannot move a game's clock or state.
- **Out-of-order RPCs.** Every RPC locks the game row and applies due time transitions before it checks any game rule (only identity checks come first), so the clock cannot be beaten. Examples: an ack at or after the window end, or after the deadline, fails; a tag in the head start fails. The parity scenarios cover the ordering cases listed above.
- **Spoofed or replayed timestamps.** The only client time is `record_location.recorded_at`:
  - more than 5 s in the future: dropped;
  - more than 30 s in the past: dropped;
  - exact replay: dropped;
  - NaN or infinite values: rejected.

  Tag times, release times and deadlines are always server `now()`.
- **Races.** `race_tests.sh` covers concurrent tag replay, tag id reuse, joins at the player cap, acks of two tags on one runner, and duplicate ack/withdraw retries.

## Open risks (not fixed; deliberate, or out of scope)

- **GPS evidence is client-reported.** A hunter can send fabricated coordinates. For a runner who stays still, the last released snapshot tells the hunter where to "be". That is enough for two close pairs if the runner keeps reporting from the same spot. `is_mocked` is self-reported, so a cheating client sends `false`. Runner acknowledgement stays the primary confirmation; GPS is a fallback. Real mitigations (BLE/UWB, QR tag codes, speed plausibility checks) are listed in `RISKS.md`.
- **Runners can avoid GPS confirmation.** A runner can flag every reading as mocked, or stop reporting, and then no GPS confirmation is possible. Mocked readings still appear in snapshots, in both the engine and SQL. Whether snapshots should drop them is a product decision, so it was left as is.
- **No rate limits.** `record_location` and `join_game` have none. Distinct microsecond timestamps let a client insert many readings. This cannot inflate proximity pairs, because each runner reading pairs at most once, but it costs storage and CPU. A 6-character code is about 2^30, so it can be brute-forced without a gateway rate limit.
- **Cron batch fragility.** `advance_all_games` locks games in an unspecified order inside one transaction. Two overlapping cron runs could deadlock, and one failing game aborts the batch. Clients also tick on every RPC, so games still progress. The fix is per-game transactions with `order by id`.
- **Members who LEFT keep read access.** They can still read their game's players, tags and events, and they can call `emergency_stop`. Neither exposes locations. Being able to stop the game is arguably right for safety.

## Limits of the parity tests (read before trusting them)

- **The adapter has to be right.** The engine adapter re-implements the RPC orchestration: which commands tick, when snapshots release, and proximity attempts. If the adapter and SQL are wrong in the same way, parity passes.
- **Random roles.** `assign_teams` is random in SQL and seeded in the engine. Scenarios that use it compare role counts only. Scenarios that need specific roles set them with `setRole`.
- **Only three configuration values are exercised.** `create_game` exposes only duration, head start and snapshot interval, so every other rule constant is at its default. `hunter_ratio` is `real` in SQL and a double in the engine, which only agree for 0.25.
- **Timing epsilon.** SQL sees `now = t + a few ms` against whole-second stored instants. Rules written as `now >= boundary` land on the same side as the engine. Strict `>` freshness checks differ only inside that epsilon, and no scenario sits on such a boundary.
- **Duplicate detection.** It works at millisecond resolution in the engine and microsecond resolution in SQL. Clients send milliseconds.
- **Not real Supabase.** The SQL runs on stock Postgres with a stub. PostgREST, GoTrue and Realtime authorisation are not exercised; RLS is, under `set role authenticated`.
- **Race tests are timing-based.** Session A holds its locks for 1.5 s while session B calls. A heavily loaded machine could make them flaky, but not falsely green: B's call happens either during A's transaction or after it, and both orders must give the asserted result.
