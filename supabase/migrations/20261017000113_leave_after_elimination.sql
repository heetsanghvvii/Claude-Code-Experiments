-- Fix: an ELIMINATED runner calling leave_game during a live game tried to set status LEFT while
-- eliminated_at stayed set, which violates game_players' check constraint and surfaced as a raw
-- 23514 error instead of a coded result. Leaving after elimination is now an idempotent no-op:
-- the player keeps status ELIMINATED (the result is never erased) and no event is logged.
-- The engine got the same fix (leaveGame). Found by parity scenario eliminated-runner-leaves.
-- Only change from 20261017000003: `p.status <> 'ACTIVE'` instead of `p.status = 'LEFT'`.

create or replace function manhunt.leave_game(p_game_id uuid) returns manhunt.games
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
  if p.status <> 'ACTIVE' then return g; end if; -- already LEFT or ELIMINATED

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
