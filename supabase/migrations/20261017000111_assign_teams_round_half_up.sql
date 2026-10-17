-- Fix: assign_teams computed the hunter count with round() on a float, which Postgres rounds
-- half-to-even (round(2.5::float8) = 2), so 10 players got 2 hunters and 18 got 4, while the
-- engine (Math.round, half-up) gives 3 and 5. Now round half up on an exact numeric.
-- Found by parity scenarios teams-count-10 and teams-count-18.
-- Only change from 20261017000003: the hunter-count expression.

create or replace function manhunt.assign_teams(p_game_id uuid) returns manhunt.games
language plpgsql security definer set search_path = manhunt, pg_temp as $$
declare
  g manhunt.games;
  n int;
  h int;
begin
  g := manhunt._require_host_lobby(p_game_id);
  select count(*) into n from manhunt.game_players where game_id = g.id;
  if n < g.min_players then perform manhunt._err('NOT_ENOUGH_PLAYERS'); end if;
  h := least(n - 1, greatest(1, floor(n * g.hunter_ratio::numeric + 0.5)::int));
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
