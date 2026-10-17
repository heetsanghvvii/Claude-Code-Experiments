-- End-to-end DB tests: RPCs, RLS, idempotency, immutability, retention.
-- Runs as superuser; switches identity with test.as_user() + `set role authenticated`.
-- Time passing is simulated by shifting a game's stored timestamps into the past (test.shift).

\set QUIET on
create schema test;
grant usage on schema test to anon, authenticated, service_role;

create function test.ok(p_cond boolean, p_msg text) returns void language plpgsql as $$
begin
  if p_cond is distinct from true then raise exception 'ASSERTION FAILED: %', p_msg; end if;
  raise notice 'ok - %', p_msg;
end $$;

create function test.expect_error(p_sql text, p_prefix text, p_msg text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlerrm like p_prefix || '%' then
      raise notice 'ok - % (% )', p_msg, sqlerrm;
      return;
    end if;
    raise exception 'ASSERTION FAILED: % - expected "%", got "%"', p_msg, p_prefix, sqlerrm;
  end;
  raise exception 'ASSERTION FAILED: % - expected "%" but it succeeded', p_msg, p_prefix;
end $$;

create function test.as_user(p_uid uuid) returns void language sql as $$
  select set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), false);
$$;

-- Moves every stored timestamp of a game p_secs into the past (as if p_secs elapsed).
create function test.shift(p_game uuid, p_secs int) returns void language plpgsql as $$
declare d interval := make_interval(secs => p_secs);
begin
  set session_replication_role = replica; -- bypass immutability triggers for test time travel only
  update public.games set created_at = created_at - d, countdown_started_at = countdown_started_at - d,
         active_at = active_at - d, hunters_released_at = hunters_released_at - d, ends_at = ends_at - d,
         last_snapshot_at = last_snapshot_at - d, ended_at = ended_at - d where id = p_game;
  update public.tag_requests set created_at = created_at - d, resolved_at = resolved_at - d where game_id = p_game;
  update public.player_locations set recorded_at = recorded_at - d, received_at = received_at - d where game_id = p_game;
  update public.location_snapshots set recorded_at = recorded_at - d, released_at = released_at - d where game_id = p_game;
  set session_replication_role = origin;
end $$;

grant execute on all functions in schema test to anon, authenticated, service_role;

-- Users: A = host/hunter, B and C = runners, D = outsider.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@x', '{"display_name":"Alice"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@x', '{"display_name":"Bob"}'),
  ('00000000-0000-0000-0000-00000000000c', 'c@x', '{}'),
  ('00000000-0000-0000-0000-00000000000d', 'd@x', '{}');
select test.ok((select count(*) from public.profiles) = 4, 'profiles created by auth trigger');
select test.ok((select display_name from public.profiles where id = '00000000-0000-0000-0000-00000000000c') = 'Player',
               'default display name');

\set A '\'00000000-0000-0000-0000-00000000000a\''
\set B '\'00000000-0000-0000-0000-00000000000b\''
\set C '\'00000000-0000-0000-0000-00000000000c\''
\set D '\'00000000-0000-0000-0000-00000000000d\''

-- ----------------------------------------------------------------- anon
set role anon;
select test.expect_error($$select public.create_game(51.5, -0.12, 300)$$, 'permission denied', 'anon cannot call RPCs');
select test.expect_error($$select * from public.games$$, 'permission denied', 'anon cannot read games');
reset role;

-- ----------------------------------------------------------------- lobby
select test.as_user(:A);
set role authenticated;
select id as g1, code as code1 from public.create_game(51.5074, -0.1278, 400, 600, 60, 30) \gset
select test.ok(:'code1' ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$', 'game code is 6 unambiguous chars');
select test.ok((select status from public.games where id = :'g1') = 'LOBBY', 'new game is LOBBY');
select test.ok(abs((select arena_lat from public.games where id = :'g1') - 51.5074) < 1e-9, 'arena_lat exposed');
select test.expect_error($$select public.create_game(95, 0, 100)$$, 'INVALID_CONFIG', 'invalid arena rejected');
select test.expect_error($$select public.create_game(10, 0, 100, 60, 60)$$, 'INVALID_CONFIG', 'head start >= duration rejected');

-- Direct writes are impossible: no table grants beyond SELECT.
select test.expect_error(format($$insert into public.games (code, host_id, arena_center, arena_radius_m)
  values ('ZZZZZZ', %L, 'POINT(0 0)', 10)$$, :A), 'permission denied', 'no direct insert into games');
select test.expect_error(format($$update public.games set status = 'COMPLETED' where id = %L$$, :'g1'),
  'permission denied', 'no direct update of games');
select test.expect_error(format($$update public.game_players set role = 'HUNTER' where game_id = %L$$, :'g1'),
  'permission denied', 'no direct update of game_players');
select test.expect_error(format($$insert into public.game_events (game_id, type) values (%L, 'x')$$, :'g1'),
  'permission denied', 'no direct insert into game_events');
reset role;

select test.as_user(:B); set role authenticated;
select test.ok((select id from public.join_game(lower(:'code1'))) = :'g1', 'B joins by lowercase code');
select test.ok((select id from public.join_game(:'code1')) = :'g1', 'join is idempotent');
select test.expect_error(format($$select public.assign_teams(%L)$$, :'g1'), 'NOT_HOST', 'only host assigns teams');
reset role;
select test.as_user(:C); set role authenticated;
select public.join_game(:'code1');
select test.expect_error($$select public.join_game('AAAAAA')$$, 'GAME_NOT_FOUND', 'unknown code');
reset role;

select test.as_user(:D); set role authenticated;
select test.ok((select count(*) from public.games where id = :'g1') = 0, 'outsider cannot see the game');
select test.ok((select count(*) from public.game_players where game_id = :'g1') = 0, 'outsider cannot see players');
select test.ok((select count(*) from public.profiles) = 1, 'outsider sees only own profile');
select test.expect_error(format($$select public.advance_game(%L)$$, :'g1'), 'NOT_A_PLAYER', 'outsider cannot tick');
reset role;

select test.as_user(:A); set role authenticated;
select test.ok((select count(*) from public.profiles) = 3, 'member sees co-player profiles');
select test.expect_error(format($$select public.start_game(%L)$$, :'g1'), 'TEAMS_NOT_ASSIGNED', 'cannot start without teams');
select public.assign_teams(:'g1');
select test.ok((select count(*) filter (where role = 'HUNTER') = 1 and count(*) filter (where role = 'RUNNER') = 2
                from public.game_players where game_id = :'g1'), 'assign_teams: 1 hunter, 2 runners for 3 players');
-- Make roles deterministic for the rest of the test.
select public.set_player_role(:'g1', :A, 'HUNTER');
select public.set_player_role(:'g1', :B, 'RUNNER');
select public.set_player_role(:'g1', :C, 'RUNNER');
select test.ok((select status from public.start_game(:'g1')) = 'COUNTDOWN', 'start -> COUNTDOWN');
select test.expect_error(format($$select public.record_location(%L, 51.5, -0.12, 5, now())$$, :'g1'),
  'WRONG_STATUS', 'no location sharing during COUNTDOWN');
reset role;
select test.as_user(:D); set role authenticated;
select test.expect_error(format($$select public.join_game(%L)$$, :'code1'), 'WRONG_STATUS', 'cannot join after start');
reset role;

-- ----------------------------------------------------------------- active, head start
select test.shift(:'g1', 10);
select test.as_user(:A); set role authenticated;
select test.ok((select status from public.advance_game(:'g1')) = 'ACTIVE', 'countdown elapses -> ACTIVE');
select test.expect_error(format($$select public.submit_tag(gen_random_uuid(), %L, %L)$$, :'g1', :B),
  'HEAD_START', 'no tagging during head start');
reset role;

select test.as_user(:B); set role authenticated;
select test.ok(public.record_location(:'g1', 51.5074, -0.1278, 6, now()), 'runner reading accepted');
select test.ok(not public.record_location(:'g1', 51.5074, -0.1278, 6, now() - interval '5 minutes'), 'stale reading dropped');
select test.expect_error(format($$select public.record_location(%L, 51.5, -0.12, -1, now())$$, :'g1'),
  'INVALID_READING', 'negative accuracy rejected');
select test.ok((select count(*) from public.player_locations) = 1, 'runner sees own raw location');
reset role;

select test.as_user(:A); set role authenticated;
select test.ok((select count(*) from public.player_locations) = 0, 'hunter cannot read raw runner locations');
select test.ok((select count(*) from public.location_snapshots) = 0, 'no snapshots during head start');
reset role;

-- An unreleased snapshot (released_at in the future) must be invisible to hunters.
insert into public.location_snapshots (game_id, player_id, location, accuracy_m, recorded_at, released_at)
values (:'g1', :B, 'POINT(-0.1278 51.5074)', 5, now(), now() + interval '1 hour');
select test.as_user(:A); set role authenticated;
select test.ok((select count(*) from public.location_snapshots) = 0, 'hunter cannot see unreleased snapshot (RLS)');
reset role;
delete from public.location_snapshots;

-- ----------------------------------------------------------------- hunt: snapshots
-- B keeps reporting during the head start (as a live client would), then the head start ends.
select test.shift(:'g1', 55);
select test.as_user(:B); set role authenticated;
select public.record_location(:'g1', 51.5080, -0.1278, 8, now());
reset role;
select test.shift(:'g1', 5);
select test.as_user(:A); set role authenticated;
select public.advance_game(:'g1');
select test.ok((select count(*) from public.location_snapshots where player_id = :B) = 1, 'hunter sees released snapshot of B');
select test.ok((select accuracy_m from public.location_snapshots where player_id = :B) = 8, 'snapshot keeps accuracy');
select test.ok((select released_at <= now() and recorded_at <= released_at from public.location_snapshots limit 1),
               'snapshot is timestamped');
select test.ok((select count(*) from public.game_events where game_id = :'g1' and type = 'HUNTERS_RELEASED') = 1,
               'HUNTERS_RELEASED logged once');
select public.advance_game(:'g1');
select test.ok((select count(*) from public.location_snapshots) = 1, 'no extra snapshot before interval');
reset role;
select test.as_user(:C); set role authenticated;
select test.ok((select count(*) from public.location_snapshots) = 0, 'runner C cannot see runner B snapshot');
reset role;

-- ----------------------------------------------------------------- tags: idempotency + GPS evidence
\set T1 '\'11111111-1111-1111-1111-111111111111\''
\set T2 '\'22222222-2222-2222-2222-222222222222\''
select test.as_user(:A); set role authenticated;
select test.ok((select status from public.submit_tag(:T1, :'g1', :B)) = 'PENDING', 'tag request is PENDING');
select test.ok((select status from public.submit_tag(:T1, :'g1', :B)) = 'PENDING', 'tag replay returns same row');
select test.ok((select count(*) from public.game_events where type = 'TAG_REQUESTED') = 1, 'replay did not log twice');
select test.ok((select count(*) from public.tag_requests) = 1, 'replay did not insert twice');
select test.expect_error(format($$select public.submit_tag(%L, %L, %L)$$, :T1, :'g1', :C), 'TAG_CONFLICT', 'tag id reuse with other runner');
select test.expect_error(format($$select public.acknowledge_tag(%L)$$, :T1), 'NOT_RUNNER', 'hunter cannot self-confirm');
select test.ok((select status from public.game_players where game_id = :'g1' and player_id = :B) = 'ACTIVE',
               'B still active after tag request alone');
-- Pair 1: hunter and runner at the same spot, 10 s ago.
select public.record_location(:'g1', 51.5100, -0.1278, 5, now() - interval '10 seconds');
reset role;
select test.as_user(:B); set role authenticated;
select public.record_location(:'g1', 51.5100, -0.1278, 5, now() - interval '10 seconds');
select test.ok((select status from public.tag_requests where id = :T1) = 'PENDING', 'one close reading pair does not eliminate');
-- An inaccurate pair does not count either.
select public.record_location(:'g1', 51.5100, -0.1278, 80, now() - interval '5 seconds');
reset role;
select test.as_user(:A); set role authenticated;
select public.record_location(:'g1', 51.5100, -0.1278, 80, now() - interval '5 seconds');
select test.ok((select status from public.tag_requests where id = :T1) = 'PENDING', 'inaccurate pair ignored');
-- Pair 2: accurate, 1 s ago -> confirmed by proximity.
select public.record_location(:'g1', 51.5100, -0.1278, 4, now() - interval '1 second');
reset role;
select test.as_user(:B); set role authenticated;
select public.record_location(:'g1', 51.51002, -0.1278, 4, now() - interval '1 second');
select test.ok((select status = 'CONFIRMED' and confirmation = 'PROXIMITY' from public.tag_requests where id = :T1),
               'two independent close pairs confirm the tag');
select test.ok((select status from public.game_players where game_id = :'g1' and player_id = :B) = 'ELIMINATED',
               'B eliminated after confirmed tag');
select test.expect_error(format($$select public.record_location(%L, 51.5, -0.12, 5, now())$$, :'g1'),
  'NOT_A_PLAYER', 'eliminated runner location sharing stops');
reset role;
select test.as_user(:A); set role authenticated;
select test.expect_error(format($$select public.submit_tag(gen_random_uuid(), %L, %L)$$, :'g1', :B),
  'TARGET_NOT_ACTIVE', 'cannot tag an eliminated runner');
select test.ok((select status from public.games where id = :'g1') = 'ACTIVE', 'game continues while C remains');

-- ----------------------------------------------------------------- runner ack, hunters win
select public.submit_tag(:T2, :'g1', :C);
reset role;
select test.as_user(:C); set role authenticated;
select test.ok((select status from public.acknowledge_tag(:T2)) = 'CONFIRMED', 'runner acknowledgement confirms');
select test.ok((select status from public.acknowledge_tag(:T2)) = 'CONFIRMED', 'acknowledge is idempotent');
select test.ok((select status = 'COMPLETED' and winner = 'HUNTERS' and end_reason = 'ALL_RUNNERS_ELIMINATED'
                from public.games where id = :'g1'), 'hunters win when all runners eliminated');
select test.expect_error(format($$select public.record_location(%L, 51.5, -0.12, 5, now())$$, :'g1'),
  'WRONG_STATUS', 'location sharing stops at game end');
reset role;
select test.as_user(:A); set role authenticated;
select test.expect_error(format($$select public.submit_tag(gen_random_uuid(), %L, %L)$$, :'g1', :C),
  'GAME_FINISHED', 'no new tags after completion');
select test.ok((select status from public.submit_tag(:T2, :'g1', :C)) = 'CONFIRMED', 'tag replay after completion is a no-op');
select test.expect_error(format($$select public.leave_game(%L)$$, :'g1'), 'GAME_FINISHED', 'cannot leave a finished game');
reset role;
-- Even the database owner cannot alter a completed result.
select test.expect_error(format($$update public.games set winner = 'RUNNERS' where id = %L$$, :'g1'),
  'GAME_FINISHED', 'completed result immutable (trigger)');
select test.expect_error(format($$update public.game_players set status = 'ACTIVE', eliminated_at = null where game_id = %L and player_id = %L$$, :'g1', :B),
  'GAME_FINISHED', 'players of finished game immutable');
select test.expect_error(format($$update public.game_events set type = 'x' where game_id = %L$$, :'g1'),
  'game_events is append-only', 'events append-only');

-- ----------------------------------------------------------------- time expiry, runners win
select test.as_user(:A); set role authenticated;
select id as g2, code as code2 from public.create_game(51.5, -0.12, 300, 120, 30, 30) \gset
reset role;
select test.as_user(:B); set role authenticated; select public.join_game(:'code2'); reset role;
select test.as_user(:A); set role authenticated;
select public.set_player_role(:'g2', :A, 'HUNTER');
select public.set_player_role(:'g2', :B, 'RUNNER');
select public.start_game(:'g2');
reset role;
select test.shift(:'g2', 10 + 125);
select test.as_user(:B); set role authenticated;
select public.advance_game(:'g2');
select test.ok((select status = 'COMPLETED' and winner = 'RUNNERS' and end_reason = 'TIME_EXPIRED' and ended_at = ends_at
                from public.games where id = :'g2'), 'runners win at expiry; ended_at = deadline');
reset role;

-- ----------------------------------------------------------------- hunters forfeit
select test.as_user(:A); set role authenticated;
select id as g3, code as code3 from public.create_game(51.5, -0.12, 300) \gset
reset role;
select test.as_user(:B); set role authenticated; select public.join_game(:'code3'); reset role;
select test.as_user(:A); set role authenticated;
select public.set_player_role(:'g3', :A, 'HUNTER');
select public.set_player_role(:'g3', :B, 'RUNNER');
select public.start_game(:'g3');
reset role;
select test.shift(:'g3', 15);
select test.as_user(:A); set role authenticated;
select test.ok((select winner = 'RUNNERS' and end_reason = 'HUNTERS_FORFEIT' from public.leave_game(:'g3')),
               'last hunter leaving forfeits to runners');
reset role;

-- ----------------------------------------------------------------- lobby: host leave, timeout, cancel
select test.as_user(:A); set role authenticated;
select id as g4, code as code4 from public.create_game(51.5, -0.12, 300) \gset
reset role;
select test.as_user(:B); set role authenticated; select public.join_game(:'code4'); reset role;
select test.as_user(:A); set role authenticated;
select test.ok((select host_id from public.leave_game(:'g4')) = :B, 'host leaving lobby hands host to next player');
reset role;
select test.shift(:'g4', 1801);
select test.as_user(:B); set role authenticated;
select test.ok((select status = 'CANCELLED' and end_reason = 'LOBBY_TIMEOUT' from public.advance_game(:'g4')), 'lobby times out');
select test.ok(not exists (select 1 from public.games where code = :'code4' and status = 'LOBBY'), 'code released');
reset role;

-- ----------------------------------------------------------------- retention
select test.ok((select count(*) from public.player_locations where game_id = :'g1') > 0, 'g1 has raw locations before purge');
select test.shift(:'g1', 3601);
set role service_role;
select public.purge_expired_locations();
reset role;
select test.ok((select count(*) from public.player_locations where game_id = :'g1') = 0, 'raw locations purged 1h after game end');
set role authenticated;
select test.expect_error($$select public.purge_expired_locations()$$, 'permission denied', 'clients cannot call purge');
select test.expect_error($$select public._advance(gen_random_uuid())$$, 'permission denied', 'internal functions not exposed');
reset role;

-- ----------------------------------------------------------------- realtime publication
select test.ok(not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'player_locations'),
               'raw locations are not published to realtime');
select test.ok((select count(*) from pg_publication_tables where pubname = 'supabase_realtime') = 5, '5 tables published');
