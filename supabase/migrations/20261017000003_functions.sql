-- Trusted game logic. Each RPC runs in one transaction, locks the game row (FOR UPDATE)
-- and first applies due time transitions (_advance), so the server clock is authoritative.
-- Mirrors packages/engine (reference implementation). Errors are raised as 'CODE: message'.

-- ================================================================ internal helpers

create function manhunt._err(p_code text, p_msg text default null) returns void
language plpgsql as $$
begin
  raise exception '%', p_code || coalesce(': ' || p_msg, '') using errcode = 'P0001';
end $$;

create function manhunt._log(p_game_id uuid, p_type text, p_payload jsonb default '{}'::jsonb) returns void
language sql security definer set search_path = manhunt, pg_temp as $$
  insert into manhunt.game_events (game_id, type, payload) values (p_game_id, p_type, p_payload);
$$;

create function manhunt._expire_pending_tags(p_game_id uuid, p_at timestamptz) returns void
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare r record;
begin
  for r in update manhunt.tag_requests set status = 'EXPIRED', resolved_at = p_at
           where game_id = p_game_id and status = 'PENDING' returning id loop
    perform manhunt._log(p_game_id, 'TAG_EXPIRED', jsonb_build_object('tag_id', r.id));
  end loop;
end $$;

create function manhunt._complete(p_game_id uuid, p_at timestamptz, p_winner manhunt.game_winner, p_reason text) returns void
language plpgsql security definer set search_path = manhunt, pg_temp as $$
begin
  perform manhunt._expire_pending_tags(p_game_id, p_at);
  update manhunt.games
     set status = 'COMPLETED', winner = p_winner, end_reason = p_reason, ended_at = p_at, version = version + 1
   where id = p_game_id;
  perform manhunt._log(p_game_id, 'GAME_COMPLETED', jsonb_build_object('winner', p_winner, 'reason', p_reason));
end $$;

create function manhunt._cancel(p_game_id uuid, p_at timestamptz, p_reason text) returns void
language plpgsql security definer set search_path = manhunt, pg_temp as $$
begin
  perform manhunt._expire_pending_tags(p_game_id, p_at);
  update manhunt.games
     set status = 'CANCELLED', end_reason = p_reason, ended_at = p_at, version = version + 1
   where id = p_game_id;
  perform manhunt._log(p_game_id, 'GAME_CANCELLED', jsonb_build_object('reason', p_reason));
end $$;

-- Ends the game if a team has become empty.
create function manhunt._check_teams(p_game_id uuid, p_at timestamptz) returns void
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  v_status manhunt.game_status;
  v_runners int;
  v_hunters int;
begin
  select status into v_status from manhunt.games where id = p_game_id;
  if v_status not in ('COUNTDOWN', 'ACTIVE') then return; end if;
  select count(*) filter (where role = 'RUNNER' and status = 'ACTIVE'),
         count(*) filter (where role = 'HUNTER' and status = 'ACTIVE')
    into v_runners, v_hunters
    from manhunt.game_players where game_id = p_game_id;
  if v_status = 'COUNTDOWN' then
    if v_runners = 0 or v_hunters = 0 then perform manhunt._cancel(p_game_id, p_at, 'PLAYERS_LEFT'); end if;
  elsif v_runners = 0 then
    perform manhunt._complete(p_game_id, p_at, 'HUNTERS', 'ALL_RUNNERS_ELIMINATED');
  elsif v_hunters = 0 then
    perform manhunt._complete(p_game_id, p_at, 'RUNNERS', 'HUNTERS_FORFEIT');
  end if;
end $$;

-- Releases one snapshot round: latest fresh reading per active runner.
create function manhunt._release_snapshot(p_game_id uuid) returns void
language plpgsql security definer set search_path = manhunt, extensions, pg_temp as $$
declare
  g manhunt.games;
  v_count int;
begin
  select * into g from manhunt.games where id = p_game_id;
  insert into manhunt.location_snapshots (game_id, player_id, location, accuracy_m, recorded_at, released_at)
  select distinct on (l.player_id) l.game_id, l.player_id, l.location, l.accuracy_m, l.recorded_at, now()
    from manhunt.player_locations l
    join manhunt.game_players p on p.game_id = l.game_id and p.player_id = l.player_id
   where l.game_id = p_game_id
     and p.role = 'RUNNER' and p.status = 'ACTIVE'
     and l.recorded_at <= now()
     and l.recorded_at > now() - make_interval(secs => g.snapshot_interval_s)
   order by l.player_id, l.recorded_at desc, l.id desc;
  get diagnostics v_count = row_count;
  update manhunt.games set last_snapshot_at = now(), version = version + 1 where id = p_game_id;
  perform manhunt._log(p_game_id, 'SNAPSHOT_RELEASED', jsonb_build_object('runners', v_count));
end $$;

-- Applies every time-based transition due now. Locks and returns the game row.
create function manhunt._advance(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  g manhunt.games;
  r record;
begin
  select * into g from manhunt.games where id = p_game_id for update;
  if not found then perform manhunt._err('GAME_NOT_FOUND'); end if;
  if g.status in ('COMPLETED', 'CANCELLED') then return g; end if;

  if g.status = 'LOBBY' then
    if now() >= g.created_at + make_interval(secs => g.lobby_timeout_s) then
      perform manhunt._cancel(g.id, g.created_at + make_interval(secs => g.lobby_timeout_s), 'LOBBY_TIMEOUT');
    end if;
    select * into g from manhunt.games where id = p_game_id;
    return g;
  end if;

  if g.status = 'COUNTDOWN' and now() >= g.active_at then
    update manhunt.games set status = 'ACTIVE', version = version + 1 where id = g.id;
    perform manhunt._log(g.id, 'GAME_STARTED',
      jsonb_build_object('hunters_released_at', g.hunters_released_at, 'ends_at', g.ends_at));
    g.status := 'ACTIVE';
  end if;
  if g.status <> 'ACTIVE' then return g; end if;

  if not g.hunters_released and now() >= g.hunters_released_at then
    update manhunt.games set hunters_released = true, version = version + 1 where id = g.id;
    perform manhunt._log(g.id, 'HUNTERS_RELEASED');
  end if;

  -- Pending tags whose window closed before the deadline expire.
  for r in update manhunt.tag_requests t
              set status = 'EXPIRED', resolved_at = t.created_at + make_interval(secs => g.tag_confirm_window_s)
            where t.game_id = g.id and t.status = 'PENDING'
              and now() >= t.created_at + make_interval(secs => g.tag_confirm_window_s)
              and t.created_at + make_interval(secs => g.tag_confirm_window_s) < g.ends_at
           returning t.id loop
    perform manhunt._log(g.id, 'TAG_EXPIRED', jsonb_build_object('tag_id', r.id));
  end loop;

  if now() >= g.ends_at then
    -- At least one runner remains (otherwise the game would already be COMPLETED).
    perform manhunt._complete(g.id, g.ends_at, 'RUNNERS', 'TIME_EXPIRED');
  elsif now() >= g.hunters_released_at
        and (g.last_snapshot_at is null or now() - g.last_snapshot_at >= make_interval(secs => g.snapshot_interval_s)) then
    perform manhunt._release_snapshot(g.id);
  end if;

  select * into g from manhunt.games where id = p_game_id;
  return g;
end $$;

create function manhunt._confirm_tag(p_tag_id uuid, p_via manhunt.tag_confirmation) returns void
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  t manhunt.tag_requests;
  r record;
begin
  update manhunt.tag_requests set status = 'CONFIRMED', confirmation = p_via, resolved_at = now()
   where id = p_tag_id and status = 'PENDING'
   returning * into t;
  if not found then return; end if;
  perform manhunt._log(t.game_id, 'TAG_CONFIRMED', jsonb_build_object('tag_id', t.id, 'via', p_via));

  update manhunt.game_players set status = 'ELIMINATED', eliminated_at = now()
   where game_id = t.game_id and player_id = t.runner_id and status = 'ACTIVE';
  if found then
    perform manhunt._log(t.game_id, 'PLAYER_ELIMINATED', jsonb_build_object('player_id', t.runner_id, 'tag_id', t.id));
  end if;

  for r in update manhunt.tag_requests set status = 'REJECTED', resolved_at = now()
            where game_id = t.game_id and runner_id = t.runner_id and status = 'PENDING' and id <> t.id
           returning id loop
    perform manhunt._log(t.game_id, 'TAG_REJECTED', jsonb_build_object('tag_id', r.id));
  end loop;

  perform manhunt._check_teams(t.game_id, now());
end $$;

-- GPS corroboration: needs >= min_proximity_pairs distinct close reading pairs. One reading never suffices.
create function manhunt._try_proximity(p_tag_id uuid) returns boolean
language plpgsql security definer set search_path = manhunt, extensions, pg_temp as $$
declare
  t manhunt.tag_requests;
  g manhunt.games;
  lo timestamptz;
  hi timestamptz;
  used bigint[] := '{}';
  v_close int := 0;
  h record;
  best record;
begin
  select * into t from manhunt.tag_requests where id = p_tag_id;
  if not found or t.status <> 'PENDING' then return false; end if;
  select * into g from manhunt.games where id = t.game_id;
  lo := t.created_at - make_interval(secs => g.tag_confirm_window_s);
  hi := least(now(), t.created_at + make_interval(secs => g.tag_confirm_window_s));

  for h in
    select distinct on (recorded_at) id, location, recorded_at
      from manhunt.player_locations
     where game_id = t.game_id and player_id = t.hunter_id
       and accuracy_m <= g.max_accuracy_m and recorded_at between lo and hi
     order by recorded_at, id
  loop
    select rr.id, rr.location into best
      from (select distinct on (recorded_at) id, location, recorded_at
              from manhunt.player_locations
             where game_id = t.game_id and player_id = t.runner_id
               and accuracy_m <= g.max_accuracy_m and recorded_at between lo and hi
             order by recorded_at, id) rr
     where not (rr.id = any (used))
       and abs(extract(epoch from rr.recorded_at - h.recorded_at)) <= g.pair_max_skew_s
     order by abs(extract(epoch from rr.recorded_at - h.recorded_at)), rr.recorded_at
     limit 1;
    if found then
      used := used || best.id;
      if st_distance(h.location, best.location) <= g.tag_radius_m then v_close := v_close + 1; end if;
    end if;
  end loop;

  if v_close >= greatest(2, g.min_proximity_pairs) then
    perform manhunt._confirm_tag(t.id, 'PROXIMITY');
    return true;
  end if;
  return false;
end $$;

-- ================================================================ public RPCs

create function manhunt.create_game(
  p_lat double precision,
  p_lng double precision,
  p_radius_m real,
  p_duration_s integer default null,
  p_head_start_s integer default null,
  p_snapshot_interval_s integer default null
) returns manhunt.games
language plpgsql security definer set search_path = manhunt, extensions, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 chars, no 0/O/1/I
  v_code text;
  v_bytes bytea;
  g manhunt.games;
begin
  if v_uid is null then perform manhunt._err('NOT_AUTHENTICATED'); end if;
  if p_lat is null or p_lng is null or abs(p_lat) > 90 or abs(p_lng) > 180 then
    perform manhunt._err('INVALID_CONFIG', 'invalid arena centre');
  end if;
  for attempt in 1..10 loop
    v_bytes := gen_random_bytes(6);
    v_code := '';
    for i in 0..5 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 32) + 1, 1);
    end loop;
    begin
      insert into manhunt.games (code, host_id, arena_center, arena_radius_m, duration_s, head_start_s, snapshot_interval_s)
      values (v_code, v_uid, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, p_radius_m,
              coalesce(p_duration_s, 1200), coalesce(p_head_start_s, 120), coalesce(p_snapshot_interval_s, 120))
      returning * into g;
      exit;
    exception when unique_violation then
      g := null;
    end;
  end loop;
  if g.id is null then perform manhunt._err('CODE_EXHAUSTED', 'could not allocate a game code'); end if;

  insert into manhunt.game_players (game_id, player_id) values (g.id, v_uid);
  perform manhunt._log(g.id, 'PLAYER_JOINED', jsonb_build_object('player_id', v_uid));
  return g;
exception when check_violation then
  perform manhunt._err('INVALID_CONFIG', sqlerrm);
  return null;
end $$;

-- Idempotent: joining a game you are already in returns it.
create function manhunt.join_game(p_code text) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  g manhunt.games;
  v_count int;
begin
  if v_uid is null then perform manhunt._err('NOT_AUTHENTICATED'); end if;
  select id into v_id from manhunt.games
   where code = upper(btrim(p_code)) and status in ('LOBBY', 'COUNTDOWN', 'ACTIVE');
  if v_id is null then perform manhunt._err('GAME_NOT_FOUND', 'no live game with that code'); end if;
  g := manhunt._advance(v_id);
  if exists (select 1 from manhunt.game_players where game_id = g.id and player_id = v_uid) then
    return g;
  end if;
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  if g.status <> 'LOBBY' then perform manhunt._err('WRONG_STATUS', 'game already started'); end if;
  select count(*) into v_count from manhunt.game_players where game_id = g.id;
  if v_count >= g.max_players then perform manhunt._err('GAME_FULL'); end if;
  insert into manhunt.game_players (game_id, player_id) values (g.id, v_uid);
  update manhunt.games set version = version + 1 where id = g.id returning * into g;
  perform manhunt._log(g.id, 'PLAYER_JOINED', jsonb_build_object('player_id', v_uid));
  return g;
end $$;

create function manhunt.leave_game(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  g manhunt.games;
  p manhunt.game_players;
  v_next uuid;
begin
  g := manhunt._advance(p_game_id);
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  select * into p from manhunt.game_players where game_id = g.id and player_id = v_uid;
  if not found then perform manhunt._err('NOT_A_PLAYER'); end if;
  if p.status = 'LEFT' then return g; end if;

  if g.status = 'LOBBY' then
    delete from manhunt.game_players where game_id = g.id and player_id = v_uid;
    perform manhunt._log(g.id, 'PLAYER_LEFT', jsonb_build_object('player_id', v_uid));
    select player_id into v_next from manhunt.game_players where game_id = g.id
     order by joined_at, player_id limit 1;
    if v_next is null then
      perform manhunt._cancel(g.id, now(), 'HOST_CANCELLED');
    elsif g.host_id = v_uid then
      update manhunt.games set host_id = v_next, version = version + 1 where id = g.id;
    else
      update manhunt.games set version = version + 1 where id = g.id;
    end if;
  else
    update manhunt.game_players set status = 'LEFT' where game_id = g.id and player_id = v_uid;
    perform manhunt._log(g.id, 'PLAYER_LEFT', jsonb_build_object('player_id', v_uid));
    perform manhunt._check_teams(g.id, now());
  end if;
  select * into g from manhunt.games where id = p_game_id;
  return g;
end $$;

create function manhunt._require_host_lobby(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare g manhunt.games;
begin
  g := manhunt._advance(p_game_id);
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  if g.host_id is distinct from auth.uid() then perform manhunt._err('NOT_HOST'); end if;
  if g.status <> 'LOBBY' then perform manhunt._err('WRONG_STATUS', 'only in LOBBY'); end if;
  return g;
end $$;

create function manhunt.assign_teams(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  g manhunt.games;
  n int;
  h int;
begin
  g := manhunt._require_host_lobby(p_game_id);
  select count(*) into n from manhunt.game_players where game_id = g.id;
  if n < g.min_players then perform manhunt._err('NOT_ENOUGH_PLAYERS'); end if;
  h := least(n - 1, greatest(1, round(n * g.hunter_ratio)::int));
  update manhunt.game_players gp
     set role = case when s.rn <= h then 'HUNTER'::manhunt.player_role else 'RUNNER'::manhunt.player_role end
    from (select player_id, row_number() over (order by gen_random_uuid()) as rn
            from manhunt.game_players where game_id = g.id) s
   where gp.game_id = g.id and gp.player_id = s.player_id;
  update manhunt.games set version = version + 1 where id = g.id returning * into g;
  perform manhunt._log(g.id, 'TEAMS_ASSIGNED', jsonb_build_object(
    'hunters', (select jsonb_agg(player_id order by player_id) from manhunt.game_players where game_id = g.id and role = 'HUNTER'),
    'runners', (select jsonb_agg(player_id order by player_id) from manhunt.game_players where game_id = g.id and role = 'RUNNER')));
  return g;
end $$;

create function manhunt.set_player_role(p_game_id uuid, p_player_id uuid, p_role manhunt.player_role) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare g manhunt.games;
begin
  g := manhunt._require_host_lobby(p_game_id);
  if p_role is null then perform manhunt._err('INVALID_ROLE'); end if;
  update manhunt.game_players set role = p_role
   where game_id = g.id and player_id = p_player_id and role is distinct from p_role;
  if found then
    update manhunt.games set version = version + 1 where id = g.id returning * into g;
    perform manhunt._log(g.id, 'ROLE_SET', jsonb_build_object('player_id', p_player_id, 'role', p_role));
  elsif not exists (select 1 from manhunt.game_players where game_id = g.id and player_id = p_player_id) then
    perform manhunt._err('NOT_A_PLAYER');
  end if;
  return g;
end $$;

create function manhunt.start_game(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  g manhunt.games;
  n int; hunters int; runners int; unassigned int;
begin
  g := manhunt._require_host_lobby(p_game_id);
  select count(*), count(*) filter (where role = 'HUNTER'), count(*) filter (where role = 'RUNNER'),
         count(*) filter (where role is null)
    into n, hunters, runners, unassigned
    from manhunt.game_players where game_id = g.id;
  if n < g.min_players then perform manhunt._err('NOT_ENOUGH_PLAYERS'); end if;
  if unassigned > 0 or hunters = 0 or runners = 0 then
    perform manhunt._err('TEAMS_NOT_ASSIGNED', 'every player needs a role, with at least one of each');
  end if;
  update manhunt.games
     set status = 'COUNTDOWN',
         countdown_started_at = now(),
         active_at = now() + make_interval(secs => countdown_s),
         hunters_released_at = now() + make_interval(secs => countdown_s + head_start_s),
         ends_at = now() + make_interval(secs => countdown_s + duration_s),
         version = version + 1
   where id = g.id returning * into g;
  perform manhunt._log(g.id, 'COUNTDOWN_STARTED', jsonb_build_object('active_at', g.active_at));
  return manhunt._advance(g.id); -- countdown_s may be 0
end $$;

create function manhunt.cancel_game(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare g manhunt.games;
begin
  g := manhunt._advance(p_game_id);
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  if g.host_id is distinct from auth.uid() then perform manhunt._err('NOT_HOST'); end if;
  if g.status = 'ACTIVE' then perform manhunt._err('WRONG_STATUS', 'an ACTIVE game ends by its rules'); end if;
  perform manhunt._cancel(g.id, now(), 'HOST_CANCELLED');
  select * into g from manhunt.games where id = p_game_id;
  return g;
end $$;

-- Any member may tick the clock (clients poll; production also runs advance_all_games via pg_cron).
create function manhunt.advance_game(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
begin
  if not manhunt.is_game_member(p_game_id) then perform manhunt._err('NOT_A_PLAYER'); end if;
  return manhunt._advance(p_game_id);
end $$;

create function manhunt.advance_all_games() returns integer
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare r record; n int := 0;
begin
  for r in select id from manhunt.games where status in ('LOBBY', 'COUNTDOWN', 'ACTIVE') loop
    perform manhunt._advance(r.id);
    n := n + 1;
  end loop;
  return n;
end $$;

-- Returns true if the reading was stored. Readings are only accepted while ACTIVE from ACTIVE players.
create function manhunt.record_location(
  p_game_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_accuracy_m real,
  p_recorded_at timestamptz,
  p_is_mocked boolean default false
) returns boolean
language plpgsql security definer set search_path = manhunt, extensions, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  g manhunt.games;
  r record;
begin
  g := manhunt._advance(p_game_id);
  if g.status <> 'ACTIVE' then perform manhunt._err('WRONG_STATUS', 'location sharing is off'); end if;
  if not exists (select 1 from manhunt.game_players
                  where game_id = g.id and player_id = v_uid and status = 'ACTIVE') then
    perform manhunt._err('NOT_A_PLAYER', 'not an active player in this game');
  end if;
  if p_lat is null or p_lng is null or abs(p_lat) > 90 or abs(p_lng) > 180
     or p_accuracy_m is null or p_accuracy_m < 0 or p_accuracy_m = 'NaN'::real or p_accuracy_m = 'Infinity'::real then
    perform manhunt._err('INVALID_READING');
  end if;
  if p_recorded_at is null or p_recorded_at < now() - interval '30 seconds' or p_recorded_at > now() + interval '5 seconds' then
    return false; -- stale or future: dropped, not an error (offline queues may replay)
  end if;
  if exists (select 1 from manhunt.player_locations
              where game_id = g.id and player_id = v_uid and recorded_at = p_recorded_at) then
    return false; -- duplicate
  end if;
  insert into manhunt.player_locations (game_id, player_id, location, accuracy_m, recorded_at, is_mocked)
  values (g.id, v_uid, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, p_accuracy_m, p_recorded_at, coalesce(p_is_mocked, false));

  -- New evidence may confirm a pending tag involving this player.
  for r in select id from manhunt.tag_requests
            where game_id = g.id and status = 'PENDING' and (hunter_id = v_uid or runner_id = v_uid)
            order by created_at loop
    perform manhunt._try_proximity(r.id);
  end loop;
  return true;
end $$;

-- Idempotent on p_tag_id (client-generated UUID).
create function manhunt.submit_tag(p_tag_id uuid, p_game_id uuid, p_runner_id uuid) returns manhunt.tag_requests
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  g manhunt.games;
  t manhunt.tag_requests;
begin
  select * into t from manhunt.tag_requests where id = p_tag_id;
  if found then
    if t.game_id = p_game_id and t.hunter_id = v_uid and t.runner_id = p_runner_id then return t; end if;
    perform manhunt._err('TAG_CONFLICT', 'tag id reused with different parameters');
  end if;
  g := manhunt._advance(p_game_id);
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  if g.status <> 'ACTIVE' then perform manhunt._err('WRONG_STATUS'); end if;
  if now() < g.hunters_released_at then perform manhunt._err('HEAD_START'); end if;
  if not exists (select 1 from manhunt.game_players
                  where game_id = g.id and player_id = v_uid and role = 'HUNTER' and status = 'ACTIVE') then
    perform manhunt._err('NOT_HUNTER');
  end if;
  if not exists (select 1 from manhunt.game_players where game_id = g.id and player_id = p_runner_id and role = 'RUNNER') then
    perform manhunt._err('NOT_RUNNER');
  end if;
  if not exists (select 1 from manhunt.game_players
                  where game_id = g.id and player_id = p_runner_id and status = 'ACTIVE') then
    perform manhunt._err('TARGET_NOT_ACTIVE');
  end if;
  insert into manhunt.tag_requests (id, game_id, hunter_id, runner_id)
  values (p_tag_id, g.id, v_uid, p_runner_id)
  on conflict (id) do nothing;
  perform manhunt._log(g.id, 'TAG_REQUESTED',
    jsonb_build_object('tag_id', p_tag_id, 'hunter_id', v_uid, 'runner_id', p_runner_id));
  perform manhunt._try_proximity(p_tag_id);
  select * into t from manhunt.tag_requests where id = p_tag_id;
  return t;
end $$;

-- The tagged runner confirms. Idempotent.
create function manhunt.acknowledge_tag(p_tag_id uuid) returns manhunt.tag_requests
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  t manhunt.tag_requests;
  g manhunt.games;
begin
  select * into t from manhunt.tag_requests where id = p_tag_id;
  if not found then perform manhunt._err('TAG_NOT_FOUND'); end if;
  if t.runner_id is distinct from auth.uid() then perform manhunt._err('NOT_RUNNER'); end if;
  if t.status = 'CONFIRMED' then return t; end if;
  g := manhunt._advance(t.game_id);
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  select * into t from manhunt.tag_requests where id = p_tag_id;
  if t.status <> 'PENDING' then perform manhunt._err('TAG_NOT_PENDING'); end if;
  perform manhunt._confirm_tag(t.id, 'RUNNER_ACK');
  select * into t from manhunt.tag_requests where id = p_tag_id;
  return t;
end $$;

create function manhunt.withdraw_tag(p_tag_id uuid) returns manhunt.tag_requests
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  t manhunt.tag_requests;
  g manhunt.games;
begin
  select * into t from manhunt.tag_requests where id = p_tag_id;
  if not found then perform manhunt._err('TAG_NOT_FOUND'); end if;
  if t.hunter_id is distinct from auth.uid() then perform manhunt._err('NOT_HUNTER'); end if;
  if t.status = 'REJECTED' then return t; end if;
  g := manhunt._advance(t.game_id);
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  update manhunt.tag_requests set status = 'REJECTED', resolved_at = now()
   where id = p_tag_id and status = 'PENDING' returning * into t;
  if not found then perform manhunt._err('TAG_NOT_PENDING'); end if;
  perform manhunt._log(t.game_id, 'TAG_REJECTED', jsonb_build_object('tag_id', t.id));
  return t;
end $$;

-- Retention: raw precise locations live at most 24 h, and 1 h after their game ends.
-- Snapshots live 24 h after the game ends. Schedule with pg_cron (service role only).
create function manhunt.purge_expired_locations() returns integer
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare n1 int; n2 int;
begin
  delete from manhunt.player_locations l
   where l.received_at < now() - interval '24 hours'
      or exists (select 1 from manhunt.games g where g.id = l.game_id and g.ended_at < now() - interval '1 hour');
  get diagnostics n1 = row_count;
  delete from manhunt.location_snapshots s
   where exists (select 1 from manhunt.games g where g.id = s.game_id and g.ended_at < now() - interval '24 hours')
      or s.released_at < now() - interval '7 days';
  get diagnostics n2 = row_count;
  return n1 + n2;
end $$;

-- ================================================================ privileges
-- Supabase grants EXECUTE on new functions to anon/authenticated by default; lock everything down,
-- then expose only the RPCs.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'manhunt'
       and p.proname in ('_err', '_log', '_expire_pending_tags', '_complete', '_cancel', '_check_teams',
                         '_release_snapshot', '_advance', '_confirm_tag', '_try_proximity', '_require_host_lobby',
                         'create_game', 'join_game', 'leave_game', 'assign_teams', 'set_player_role', 'start_game',
                         'cancel_game', 'advance_game', 'advance_all_games', 'record_location', 'submit_tag',
                         'acknowledge_tag', 'withdraw_tag', 'purge_expired_locations',
                         'handle_new_user', 'forbid_finished_game_update', 'forbid_child_change_when_finished',
                         'forbid_location_when_not_active', 'forbid_update')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;

grant execute on function
  manhunt.create_game(double precision, double precision, real, integer, integer, integer),
  manhunt.join_game(text),
  manhunt.leave_game(uuid),
  manhunt.assign_teams(uuid),
  manhunt.set_player_role(uuid, uuid, manhunt.player_role),
  manhunt.start_game(uuid),
  manhunt.cancel_game(uuid),
  manhunt.advance_game(uuid),
  manhunt.record_location(uuid, double precision, double precision, real, timestamptz, boolean),
  manhunt.submit_tag(uuid, uuid, uuid),
  manhunt.acknowledge_tag(uuid),
  manhunt.withdraw_tag(uuid)
to authenticated;

grant execute on function manhunt.advance_all_games(), manhunt.purge_expired_locations() to service_role;

-- Production scheduling (requires pg_cron; run once in the SQL editor):
--   select cron.schedule('outrun-advance', '* * * * *', 'select manhunt.advance_all_games()');
--   select cron.schedule('outrun-purge', '*/15 * * * *', 'select manhunt.purge_expired_locations()');
