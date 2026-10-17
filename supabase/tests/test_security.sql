-- Security regression tests from the adversarial review (docs/PARITY.md, "Security review").
-- Catalog checks (privileges, RLS, search_path) plus behavioural RLS checks not covered by
-- test_game_flow.sql. Self-contained: own schema `sec`, own users.

\set QUIET on
create schema sec;
grant usage on schema sec to anon, authenticated, service_role;

create function sec.ok(p_cond boolean, p_msg text) returns void language plpgsql as $$
begin
  if p_cond is distinct from true then raise exception 'ASSERTION FAILED: %', p_msg; end if;
  raise notice 'ok - %', p_msg;
end $$;
create function sec.expect_error(p_sql text, p_prefix text, p_msg text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when others then
    if sqlerrm like p_prefix || '%' then raise notice 'ok - % (% )', p_msg, sqlerrm; return; end if;
    raise exception 'ASSERTION FAILED: % - expected "%", got "%"', p_msg, p_prefix, sqlerrm;
  end;
  raise exception 'ASSERTION FAILED: % - expected "%" but it succeeded', p_msg, p_prefix;
end $$;
create function sec.as_user(p_name text) returns void language sql as $$
  select set_config('request.jwt.claim.sub', md5('sec:' || p_name)::uuid::text, false);
$$;
create function sec.uid(p_name text) returns uuid language sql immutable as $$ select md5('sec:' || p_name)::uuid $$;
create table sec.ctx (k text primary key, v uuid);
grant select, insert on sec.ctx to authenticated;
grant execute on all functions in schema sec to anon, authenticated, service_role;

-- ================================================================ catalog: privileges
select sec.ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'manhunt' and has_function_privilege('anon', p.oid, 'execute')),
  'anon can execute no manhunt function');

select sec.ok((
  select array_agg(p.proname::text order by p.proname::text collate "C")
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'manhunt' and has_function_privilege('authenticated', p.oid, 'execute'))
  = array['acknowledge_tag', 'advance_game', 'assign_teams', 'cancel_game', 'create_game', 'emergency_stop',
          'is_game_hunter', 'is_game_member', 'join_game', 'leave_game', 'record_location', 'set_player_role',
          'shares_game_with', 'start_game', 'submit_tag', 'withdraw_tag'],
  'authenticated can execute exactly the public RPCs and the RLS helpers');

select sec.ok(not exists (
  select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'manhunt' and c.relkind = 'r' and not c.relrowsecurity),
  'RLS is enabled on every manhunt table');

select sec.ok(not exists (
  select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace,
         unnest(array['anon', 'authenticated']) r, unnest(array['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE']) priv
   where n.nspname = 'manhunt' and c.relkind = 'r' and has_table_privilege(r, c.oid, priv)),
  'clients have no table-level write privilege on any manhunt table');

select sec.ok(not exists (
  select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'manhunt' and c.relkind = 'r' and has_table_privilege('anon', c.oid, 'SELECT')),
  'anon cannot read any manhunt table');

select sec.ok((
  select array_agg(a.attname::text order by a.attname::text)
    from pg_attribute a
   where a.attrelid = 'manhunt.profiles'::regclass and a.attnum > 0
     and has_column_privilege('authenticated', a.attrelid, a.attnum, 'UPDATE')) = array['display_name'],
  'the only client-writable column is profiles.display_name');

-- ================================================================ catalog: search_path
select sec.ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'manhunt' and p.prokind = 'f'
     and not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')),
  'every manhunt function pins its search_path');

select sec.ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace,
         lateral (select substr(c, 13) as sp from unnest(p.proconfig) c where c like 'search_path=%') s
   where n.nspname = 'manhunt' and p.prosecdef
     and (s.sp ~ '(^|[ ,])"?public"?($|,)' or s.sp ~ '(^|[ ,])"?\$user"?($|,)' or s.sp !~ 'pg_temp$')),
  'SECURITY DEFINER search_paths exclude public/$user and put pg_temp last');

select sec.ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'manhunt' and p.prosecdef and pg_get_userbyid(p.proowner) not in ('postgres', 'supabase_admin')),
  'SECURITY DEFINER functions are owned by the migration owner');

-- ================================================================ behaviour
insert into auth.users (id, email) select sec.uid(n), n || '@sec' from unnest(array['h1', 'h2', 'r', 'x']) n;

-- Game: h1 + h2 hunters, r runner; no head start, 30 s snapshots.
select sec.as_user('h1'); set role authenticated;
insert into sec.ctx select 'g', id from manhunt.create_game(51.5, -0.12, 300, 600, 0, 30);
reset role;
select code as gcode from manhunt.games where id = (select v from sec.ctx where k = 'g') \gset
select sec.as_user('r');  set role authenticated;
select manhunt.join_game(:'gcode');
reset role;
select sec.as_user('h2'); set role authenticated;
select manhunt.join_game(:'gcode');
reset role;
\set G '(select v from sec.ctx where k = \'g\')'
select sec.as_user('h1'); set role authenticated;
select manhunt.set_player_role(:G, sec.uid('h1'), 'HUNTER');
select manhunt.set_player_role(:G, sec.uid('h2'), 'HUNTER');
select manhunt.set_player_role(:G, sec.uid('r'), 'RUNNER');
select manhunt.start_game(:G);
reset role;
-- countdown (10 s) elapses
set session_replication_role = replica;
update manhunt.games set created_at = created_at - interval '11 s', countdown_started_at = countdown_started_at - interval '11 s',
       active_at = active_at - interval '11 s', hunters_released_at = hunters_released_at - interval '11 s',
       ends_at = ends_at - interval '11 s' where id = :G;
set session_replication_role = origin;

select now() as t0 \gset
select sec.as_user('r'); set role authenticated;
select sec.ok(manhunt.record_location(:G, 51.5, -0.12, 5, :'t0'), 'runner reading accepted');
select sec.ok(manhunt.record_location(:G, 51.5, -0.12, 5, now() + interval '10 s') = false,
              'reading dated more than 5 s in the future is dropped (spoofed clock)');
select sec.ok(manhunt.record_location(:G, 51.5, -0.12, 5, now() - interval '31 s') = false,
              'reading dated more than 30 s in the past is dropped (replayed/backdated)');
select sec.ok(manhunt.record_location(:G, 51.5, -0.12, 5, :'t0') = false, 'exact replay of a reading is dropped');
select sec.expect_error($$select manhunt.record_location((select v from sec.ctx where k = 'g'), 'NaN', -0.12, 5, now())$$,
                        'INVALID_READING', 'NaN latitude rejected');
select sec.expect_error($$select manhunt.record_location((select v from sec.ctx where k = 'g'), 51.5, -0.12, 'Infinity', now())$$,
                        'INVALID_READING', 'infinite accuracy rejected');
reset role;
-- The first tick released an empty snapshot round; make the next round due and tick.
set session_replication_role = replica;
update manhunt.games set last_snapshot_at = last_snapshot_at - interval '30 s' where id = :G;
set session_replication_role = origin;
select sec.as_user('h1'); set role authenticated;
select manhunt.advance_game(:G);
select sec.ok((select count(*) from manhunt.location_snapshots) = 1, 'active hunter sees the released snapshot');
select sec.ok((select count(*) from manhunt.player_locations) = 0, 'hunter reads no raw runner locations');
select sec.expect_error($$insert into manhunt.location_snapshots (game_id, player_id, location, accuracy_m, recorded_at, released_at)
                          values ((select v from sec.ctx where k = 'g'), md5('sec:r')::uuid, 'POINT(0 0)', 1, now(), now())$$,
                        'permission denied', 'hunter cannot forge a snapshot');
select sec.expect_error($$update manhunt.game_players set status = 'ELIMINATED', eliminated_at = now()
                          where player_id = md5('sec:r')::uuid$$,
                        'permission denied', 'hunter cannot eliminate a runner by writing the table');
select sec.expect_error($$update manhunt.games set winner = 'HUNTERS' where id = (select v from sec.ctx where k = 'g')$$,
                        'permission denied', 'hunter cannot write the game row');
reset role;

select sec.as_user('h2'); set role authenticated;
select sec.ok((select count(*) from manhunt.location_snapshots) = 1, 'second hunter sees the snapshot');
select manhunt.leave_game(:G);
select sec.ok((select count(*) from manhunt.location_snapshots) = 0, 'a hunter who LEFT no longer sees snapshots');
select sec.expect_error($$select manhunt.record_location((select v from sec.ctx where k = 'g'), 51.5, -0.12, 5, now())$$,
                        'NOT_A_PLAYER', 'a player who LEFT cannot send readings');
reset role;

select sec.as_user('x'); set role authenticated;
select sec.ok((select count(*) from manhunt.games) = 0 and (select count(*) from manhunt.game_events) = 0
              and (select count(*) from manhunt.tag_requests) = 0 and (select count(*) from manhunt.location_snapshots) = 0,
              'outsider sees no game, events, tags or snapshots');
select sec.expect_error($$select manhunt.submit_tag(gen_random_uuid(), (select v from sec.ctx where k = 'g'), md5('sec:r')::uuid)$$,
                        'NOT_HUNTER', 'outsider cannot tag');
select sec.expect_error($$select manhunt.emergency_stop((select v from sec.ctx where k = 'g'))$$,
                        'NOT_A_PLAYER', 'outsider cannot emergency-stop');
select sec.expect_error($$select manhunt.leave_game((select v from sec.ctx where k = 'g'))$$,
                        'NOT_A_PLAYER', 'outsider cannot leave (and its clock tick rolls back)');
reset role;
select sec.ok((select status from manhunt.games where id = :G) = 'ACTIVE', 'game still ACTIVE after outsider calls');

-- Tag ids are scoped to the hunter: another member reusing one gets TAG_CONFLICT, not the tag.
select sec.as_user('h1'); set role authenticated;
insert into sec.ctx values ('t', gen_random_uuid());
select manhunt.submit_tag((select v from sec.ctx where k = 't'), :G, sec.uid('r'));
reset role;
select sec.as_user('r'); set role authenticated;
select sec.expect_error($$select manhunt.submit_tag((select v from sec.ctx where k = 't'), (select v from sec.ctx where k = 'g'), md5('sec:r')::uuid)$$,
                        'TAG_CONFLICT', 'another player replaying a tag id gets TAG_CONFLICT');
select sec.expect_error($$select manhunt.withdraw_tag((select v from sec.ctx where k = 't'))$$,
                        'NOT_HUNTER', 'only the tagging hunter can withdraw');
reset role;
select sec.as_user('h1'); set role authenticated;
select sec.expect_error($$select manhunt.acknowledge_tag((select v from sec.ctx where k = 't'))$$,
                        'NOT_RUNNER', 'the hunter cannot acknowledge their own tag');
reset role;
