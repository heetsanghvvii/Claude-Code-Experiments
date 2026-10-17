-- Test-only harness objects for engine-vs-SQL parity (packages/engine/test/parity.test.ts).
-- Lives in its own schema `parity`; never part of supabase/migrations.
--
-- Time travel: a scenario step says "this happens at T0 + at seconds". Before each step the
-- harness moves every stored timestamp of the scenario's game so that
--   clock_timestamp() - games.created_at = at
-- and snaps every stored instant to a whole second after created_at (scenario times are whole
-- seconds; this strips the few ms of real execution time so SQL stores exactly what the engine
-- stores). The production functions keep reading the real now(); only data moves. The step's own
-- transaction starts a few milliseconds later, so SQL sees now = at + epsilon (epsilon > 0, a few
-- ms) against exact stored instants. Rules written as `now >= boundary` therefore fall on the same
-- side as in the engine. Rules written with a strict `>` against now (snapshot freshness) differ
-- from the engine only inside that epsilon; scenarios do not sit exactly on such a boundary.

create schema parity;
grant usage on schema parity to authenticated, anon, service_role;

create table parity.ctx (
  scenario text not null,
  game_id uuid,
  last_event bigint not null default 0
);
create table parity.names (kind text not null, name text not null, id uuid not null primary key);
create table parity.results (step int primary key, result jsonb, obs jsonb);
grant select on parity.ctx, parity.names to authenticated, anon, service_role;
grant insert, update, select on parity.results to authenticated, anon, service_role;

create function parity.uid(p_name text) returns uuid language sql stable as $$
  select md5((select scenario from parity.ctx) || ':user:' || p_name)::uuid
$$;
create function parity.tid(p_name text) returns uuid language sql stable as $$
  select md5((select scenario from parity.ctx) || ':tag:' || p_name)::uuid
$$;
create function parity.gid() returns uuid language sql stable as $$
  select game_id from parity.ctx
$$;
-- The join code, readable by the harness even for callers who are not members yet.
create function parity.code() returns text language sql stable security definer set search_path = manhunt, pg_temp as $$
  select code from manhunt.games where id = (select game_id from parity.ctx)
$$;
create function parity.name_of(p_id uuid) returns text language sql stable as $$
  select coalesce((select name from parity.names where id = p_id), p_id::text)
$$;

create function parity.begin_scenario(p_scenario text, p_users text[], p_tags text[]) returns void
language plpgsql as $$
declare n text;
begin
  delete from parity.ctx;
  delete from parity.results;
  insert into parity.ctx (scenario) values (p_scenario);
  foreach n in array p_users loop
    insert into auth.users (id, email, raw_user_meta_data)
    values (parity.uid(n), n || '@parity', jsonb_build_object('display_name', left(n, 32)))
    on conflict (id) do nothing;
    insert into parity.names values ('user', n, parity.uid(n)) on conflict (id) do nothing;
  end loop;
  foreach n in array p_tags loop
    insert into parity.names values ('tag', n, parity.tid(n)) on conflict (id) do nothing;
  end loop;
end $$;

create function parity.as_user(p_name text) returns void language sql as $$
  select set_config('request.jwt.claim.sub', parity.uid(p_name)::text, false);
$$;

-- Runs one RPC as the current role. Errors roll back the RPC (a subtransaction), exactly as a
-- failing PostgREST call would, and are recorded by their 'CODE' prefix.
create function parity.try(p_step int, p_sql text) returns void language plpgsql as $$
declare v jsonb;
begin
  begin
    execute p_sql into v;
    insert into parity.results (step, result) values (p_step, jsonb_build_object('ok', true, 'value', v));
  exception when others then
    insert into parity.results (step, result) values (p_step, jsonb_build_object(
      'ok', false,
      'error', case when sqlerrm ~ '^[A-Z_]+(:|$)' then split_part(sqlerrm, ':', 1) else sqlerrm end,
      'message', sqlerrm));
  end;
end $$;
grant execute on all functions in schema parity to authenticated, anon, service_role;

-- Superuser only: move every timestamp of the scenario game so that virtual time = p_at seconds.
-- Every stored instant is first snapped to a whole number of seconds after created_at. Scenario
-- times are whole seconds, so this removes only the few-ms jitter of real execution and leaves
-- SQL holding exactly the instants the engine holds (see the header).
create function parity._snap(t timestamptz, base timestamptz, d interval) returns timestamptz
language sql immutable as $$
  select base + make_interval(secs => round(extract(epoch from t - base))::double precision) - d
$$;

create function parity.at(p_at numeric) returns void language plpgsql as $$
declare
  g uuid := parity.gid();
  b timestamptz;
  d interval;
begin
  if g is null then return; end if;
  select created_at, make_interval(secs => (p_at - extract(epoch from clock_timestamp() - created_at))::double precision)
    into b, d from manhunt.games where id = g;
  set session_replication_role = replica; -- bypasses immutability triggers: test time travel only
  update manhunt.games set created_at = created_at - d,
         countdown_started_at = parity._snap(countdown_started_at, b, d), active_at = parity._snap(active_at, b, d),
         hunters_released_at = parity._snap(hunters_released_at, b, d), ends_at = parity._snap(ends_at, b, d),
         last_snapshot_at = parity._snap(last_snapshot_at, b, d), ended_at = parity._snap(ended_at, b, d)
   where id = g;
  update manhunt.game_players set joined_at = parity._snap(joined_at, b, d), eliminated_at = parity._snap(eliminated_at, b, d)
   where game_id = g;
  update manhunt.tag_requests set created_at = parity._snap(created_at, b, d), resolved_at = parity._snap(resolved_at, b, d)
   where game_id = g;
  update manhunt.player_locations set recorded_at = parity._snap(recorded_at, b, d), received_at = parity._snap(received_at, b, d)
   where game_id = g;
  update manhunt.location_snapshots set recorded_at = parity._snap(recorded_at, b, d), released_at = parity._snap(released_at, b, d)
   where game_id = g;
  update manhunt.game_events set created_at = parity._snap(created_at, b, d) where game_id = g;
  set session_replication_role = origin;
end $$;

-- Superuser only: after the create step, remember the new game's id.
create function parity.bind_game(p_step int) returns void language plpgsql as $$
begin
  update parity.ctx set game_id = (select (result -> 'value' ->> 'id')::uuid from parity.results where step = p_step);
end $$;

-- Superuser only: normalised observation of the game after a step (same shape the engine adapter builds).
create function parity.observe(p_step int) returns void language plpgsql as $$
declare
  g manhunt.games;
  o jsonb;
  v_last bigint;
begin
  select * into g from manhunt.games where id = parity.gid();
  if not found then
    update parity.results set obs = null where step = p_step;
    return;
  end if;
  select last_event into v_last from parity.ctx;
  o := jsonb_build_object(
    'status', g.status,
    'winner', g.winner,
    'endReason', g.end_reason,
    'host', parity.name_of(g.host_id),
    'huntersReleased', g.hunters_released,
    'times', jsonb_build_object(
      'activeAt', round(extract(epoch from g.active_at - g.created_at)),
      'huntersReleasedAt', round(extract(epoch from g.hunters_released_at - g.created_at)),
      'endsAt', round(extract(epoch from g.ends_at - g.created_at)),
      'endedAt', round(extract(epoch from g.ended_at - g.created_at))),
    'roleCounts', (select jsonb_build_object(
        'HUNTER', count(*) filter (where role = 'HUNTER'),
        'RUNNER', count(*) filter (where role = 'RUNNER'),
        'NONE', count(*) filter (where role is null))
      from manhunt.game_players where game_id = g.id),
    'players', coalesce((select jsonb_object_agg(parity.name_of(player_id), jsonb_build_object(
        'role', role, 'status', status,
        'eliminatedAt', round(extract(epoch from eliminated_at - g.created_at))))
      from manhunt.game_players where game_id = g.id), '{}'::jsonb),
    'tags', coalesce((select jsonb_object_agg(parity.name_of(id), jsonb_build_object(
        'hunter', parity.name_of(hunter_id), 'runner', parity.name_of(runner_id),
        'status', status, 'confirmation', confirmation,
        'createdAt', round(extract(epoch from created_at - g.created_at)),
        'resolvedAt', round(extract(epoch from resolved_at - g.created_at))))
      from manhunt.tag_requests where game_id = g.id), '{}'::jsonb),
    'snapshots', coalesce((select jsonb_agg(jsonb_build_object(
        'runner', parity.name_of(player_id),
        'recordedAt', round(extract(epoch from recorded_at - g.created_at)),
        'releasedAt', round(extract(epoch from released_at - g.created_at)))
        order by released_at, parity.name_of(player_id))
      from manhunt.location_snapshots where game_id = g.id), '[]'::jsonb),
    'events', coalesce((select jsonb_agg(
        type || coalesce(':' || parity.name_of(coalesce(payload ->> 'player_id', payload ->> 'tag_id')::uuid), '')
        order by id)
      from manhunt.game_events
      where game_id = g.id and id > v_last and type not in ('SNAPSHOT_RELEASED', 'EMERGENCY_STOP')), '[]'::jsonb)
  );
  update parity.ctx set last_event = coalesce((select max(id) from manhunt.game_events where game_id = g.id), 0);
  update parity.results set obs = o where step = p_step;
end $$;
