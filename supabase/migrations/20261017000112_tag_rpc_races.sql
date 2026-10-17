-- Fix: check-then-act races in the tag RPCs (supabase/tests/race_tests.sh, cases 1, 2, 5, 6).
--
-- submit_tag read the tag id BEFORE taking the game lock. Two concurrent calls with one tag id
-- both saw "no such tag", both continued, and the second's `on conflict do nothing` silently
-- skipped the insert. Result: a replay logged TAG_REQUESTED twice, and reusing a tag id for a
-- different runner returned the first runner's tag instead of TAG_CONFLICT. Now the game row is
-- locked first, and a lost insert (only possible across different games) is re-checked.
--
-- acknowledge_tag / withdraw_tag re-read the tag after waiting for the lock but treated an
-- already-CONFIRMED / already-REJECTED tag as an error (TAG_NOT_PENDING, or GAME_FINISHED when the
-- first ack ended the game). A client retry racing its own first call must get the same success
-- as a sequential retry does (and as the engine does), so the replay check is repeated after the lock.

create or replace function manhunt.submit_tag(p_tag_id uuid, p_game_id uuid, p_runner_id uuid) returns manhunt.tag_requests
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  v_uid uuid := auth.uid();
  g manhunt.games;
  t manhunt.tag_requests;
begin
  -- Serialise with every other RPC on this game before looking at the idempotency key.
  perform 1 from manhunt.games where id = p_game_id for update;
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
  if not found then
    -- The same id was committed meanwhile for another game (a different game lock).
    select * into t from manhunt.tag_requests where id = p_tag_id;
    if t.game_id = p_game_id and t.hunter_id = v_uid and t.runner_id = p_runner_id then return t; end if;
    perform manhunt._err('TAG_CONFLICT', 'tag id reused with different parameters');
  end if;
  perform manhunt._log(g.id, 'TAG_REQUESTED',
    jsonb_build_object('tag_id', p_tag_id, 'hunter_id', v_uid, 'runner_id', p_runner_id));
  perform manhunt._try_proximity(p_tag_id);
  select * into t from manhunt.tag_requests where id = p_tag_id;
  return t;
end $$;

create or replace function manhunt.acknowledge_tag(p_tag_id uuid) returns manhunt.tag_requests
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
  select * into t from manhunt.tag_requests where id = p_tag_id;
  if t.status = 'CONFIRMED' then return t; end if; -- confirmed while we waited for the lock
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  if t.status <> 'PENDING' then perform manhunt._err('TAG_NOT_PENDING'); end if;
  perform manhunt._confirm_tag(t.id, 'RUNNER_ACK');
  select * into t from manhunt.tag_requests where id = p_tag_id;
  return t;
end $$;

create or replace function manhunt.withdraw_tag(p_tag_id uuid) returns manhunt.tag_requests
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
  select * into t from manhunt.tag_requests where id = p_tag_id;
  if t.status = 'REJECTED' then return t; end if; -- rejected while we waited for the lock
  if g.status in ('COMPLETED', 'CANCELLED') then perform manhunt._err('GAME_FINISHED'); end if;
  update manhunt.tag_requests set status = 'REJECTED', resolved_at = now()
   where id = p_tag_id and status = 'PENDING' returning * into t;
  if not found then perform manhunt._err('TAG_NOT_PENDING'); end if;
  perform manhunt._log(t.game_id, 'TAG_REJECTED', jsonb_build_object('tag_id', t.id));
  return t;
end $$;
