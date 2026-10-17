-- Fix: readings the device flags as mocked (player_locations.is_mocked) were accepted as GPS
-- evidence for an elimination. They are stored (for audit) but must never count, matching
-- packages/engine evaluateProximity. Found by parity scenario proximity-mocked-readings-ignored.
-- Only change from 20261017000003: `and not is_mocked` in both reading queries.

create or replace function manhunt._try_proximity(p_tag_id uuid) returns boolean
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
     where game_id = t.game_id and player_id = t.hunter_id and not is_mocked
       and accuracy_m <= g.max_accuracy_m and recorded_at between lo and hi
     order by recorded_at, id
  loop
    select rr.id, rr.location into best
      from (select distinct on (recorded_at) id, location, recorded_at
              from manhunt.player_locations
             where game_id = t.game_id and player_id = t.runner_id and not is_mocked
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
