-- Safety: any member can stop a live round for everyone (injury, hazard, emergency).
-- Ends the game as CANCELLED (no winner), which also ends all location sharing.

alter table manhunt.games drop constraint if exists games_end_reason_check;
alter table manhunt.games add constraint games_end_reason_check check (end_reason in
  ('ALL_RUNNERS_ELIMINATED', 'TIME_EXPIRED', 'HUNTERS_FORFEIT',
   'HOST_CANCELLED', 'PLAYERS_LEFT', 'LOBBY_TIMEOUT', 'EMERGENCY_STOP'));

create function manhunt.emergency_stop(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare g manhunt.games;
begin
  if not manhunt.is_game_member(p_game_id) then perform manhunt._err('NOT_A_PLAYER'); end if;
  g := manhunt._advance(p_game_id);
  if g.status in ('COMPLETED', 'CANCELLED') then return g; end if;
  perform manhunt._cancel(g.id, now(), 'EMERGENCY_STOP');
  perform manhunt._log(g.id, 'EMERGENCY_STOP', jsonb_build_object('by', auth.uid()));
  select * into g from manhunt.games where id = p_game_id;
  return g;
end $$;

revoke all on function manhunt.emergency_stop(uuid) from public, anon, authenticated;
grant execute on function manhunt.emergency_stop(uuid) to authenticated;
