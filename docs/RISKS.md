# OUTRUN: technical risks

Rated by likelihood x impact. Each risk has a mitigation and says where in the code it applies.

## 1. GPS accuracy

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Urban canyons, tree cover and indoor areas give 20-100 m error and multipath jumps | False tags, or real tags that never confirm | Every reading stores `accuracy_m`. Readings above `max_accuracy_m` (default 25 m) are ignored for tag evidence. Proximity needs **at least 2 independent reading pairs** in the confirm window, and one reading never eliminates anyone (`engine/tagging.ts`, `submit_tag`/`confirm_tag` SQL). |
| Typical tag distance (1-5 m) is smaller than GPS error | GPS cannot prove a physical tag | GPS is corroborating evidence only. The main confirmation is the runner acknowledging the tag, with GPS proximity as a fallback. Later options: BLE/UWB proximity, QR tag codes. |
| Stale fixes (cached last-known location) | Teleporting players, false proximity | Store the device's `recorded_at`. Reject readings older than 30 s, or from more than 5 s in the future, against server `now()`. |
| Spoofed or mock locations (Android mock provider, jailbreak) | Cheating | Record `is_mocked` when the OS reports it (Android). Rate-limit readings, flag implausible speeds (over 12 m/s on foot) and surface them in `game_events`. Full anti-cheat is out of scope. |
| Altitude and indoor floors ignored | Wrong-floor "tags" | Document it as a rule: play outdoors only. |

## 2. Background execution and battery

| Risk | Impact | Mitigation |
| --- | --- | --- |
| iOS suspends apps; background location needs the "Always" permission and `UIBackgroundModes: location` | Runner locations stop when the phone is pocketed | Use `expo-location` + `expo-task-manager` background updates in a dev build (Expo Go does not support them). Show the iOS blue indicator. Request "When In Use" first, then upgrade with an explanation. |
| Android Doze, OEM battery killers (Xiaomi, Samsung, Huawei) | Updates stop or batch | A foreground service with a persistent notification (`foregroundService` option), plus in-app instructions per OEM. Test on at least Pixel, Samsung and one Chinese OEM. |
| App Store / Play review of background location | Rejection | Location is collected only during an ACTIVE game, with a clear purpose string and an in-app disclosure screen. Play needs a prominent-disclosure video and declaration form. |
| Battery drain at high accuracy | Players quit mid-game | Balanced accuracy, 5-10 s interval, a distance filter, and tracking stops at COMPLETED/CANCELLED or on elimination. The server also rejects readings outside ACTIVE (`record_location`). |
| Location keeps flowing after game end (privacy) | Trust and legal exposure | Server rejects writes when not ACTIVE, the client stops the task when it sees the status change, and retention purges raw points (`purge_expired_locations`). |
| Network loss mid-game | Missed snapshots, tags | Queue readings locally with their device timestamp, upload on reconnect, and let the server drop readings that are too stale. Game clock is server-side, so client clock drift does not change outcomes. |

## 3. Map SDK

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Mapbox: needs a secret download token at build time, a public token at runtime, and native config via `@rnmapbox/maps` | Build complexity, secrets in CI | Keep tokens in EAS secrets / `.env` (gitignored) only. Never commit them. |
| Google Maps: API key per platform, billing account, iOS needs Google provider config | Cost spikes, key leakage | Restrict keys by bundle ID / SHA-1, set quotas. |
| Pricing changes (MAU / map loads) | Cost | Hide the SDK behind `ArenaMap` so it can be swapped; cache tiles where the licence allows. |
| `react-native-maps` on iOS defaults to Apple Maps | Visual mismatch between platforms | Acceptable for the prototype. Decide Mapbox vs Google before beta. |
| New Architecture / SDK upgrades break native map modules | Blocked upgrades | Pin versions, test each Expo SDK bump in a dev build. |
| Offline / poor signal in parks | Blank map | Arena circle and players still render over a blank map. Mapbox offline packs are an option later. |

## 4. Backend / realtime

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Hunters seeing unreleased runner locations | Breaks the core rule | `player_locations` is readable only by its owner. Hunters read only `location_snapshots` rows with `released_at <= now()` for their own game (RLS). Snapshots are inserted with `released_at` already set by the server, so no unreleased snapshot rows exist for hunters to see. Covered by SQL tests. |
| Realtime `postgres_changes` and RLS | Leaks if misconfigured | Realtime applies RLS for `authenticated`. Publish only `games`, `game_players`, `location_snapshots`, `game_events`, never `player_locations`. |
| Nothing ticks the server clock (no cron) | Games never end | `advance_game` is called on every RPC and by any client polling; schedule it with `pg_cron` each minute in production. Its result is idempotent. |
| Rules duplicated in TS and SQL | Drift | Parity tests (planned). |

## 5. Known gaps found while testing

- A snapshot is released when the server clock ticks (any RPC, or the cron). It uses each runner's latest reading from the last `snapshot_interval_s`. A runner who has not reported in that window is left out of that round, and an `ADVANCE` that lands just before a runner's next reading releases the previous one. Mitigation: clients report every 5-10 s. Consider marking "no fresh fix" runners explicitly in the snapshot.
- The deadline is hard: a tag pending at `ends_at` expires, and runners win if any remain. This is deliberate; it matches the engine.
- `join_game` is idempotent in SQL (rejoin after an app restart), whereas the engine returns `ALREADY_JOINED`. The API layer adds the idempotency.
