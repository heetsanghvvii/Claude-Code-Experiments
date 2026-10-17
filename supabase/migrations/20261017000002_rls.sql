-- Row Level Security. Default: deny. Clients get SELECT on rows they may see and nothing else;
-- every write goes through SECURITY DEFINER functions (20261017000003_functions.sql).

alter table manhunt.profiles           enable row level security;
alter table manhunt.games              enable row level security;
alter table manhunt.game_players       enable row level security;
alter table manhunt.player_locations   enable row level security;
alter table manhunt.location_snapshots enable row level security;
alter table manhunt.tag_requests       enable row level security;
alter table manhunt.game_events        enable row level security;

-- Remove the broad default grants Supabase gives anon/authenticated, then grant only reads.
revoke all on manhunt.profiles, manhunt.games, manhunt.game_players, manhunt.player_locations,
              manhunt.location_snapshots, manhunt.tag_requests, manhunt.game_events
  from anon, authenticated;

grant select on manhunt.profiles, manhunt.games, manhunt.game_players, manhunt.player_locations,
               manhunt.location_snapshots, manhunt.tag_requests, manhunt.game_events
  to authenticated;
grant update (display_name) on manhunt.profiles to authenticated;

-- ---------------------------------------------------------------- helpers
-- SECURITY DEFINER so policies on game_players do not recurse into themselves.
create function manhunt.is_game_member(p_game_id uuid) returns boolean
language sql stable security definer set search_path = manhunt, pg_temp as $$
  select exists (
    select 1 from manhunt.game_players
    where game_id = p_game_id and player_id = auth.uid()
  );
$$;

create function manhunt.is_game_hunter(p_game_id uuid) returns boolean
language sql stable security definer set search_path = manhunt, pg_temp as $$
  select exists (
    select 1 from manhunt.game_players
    where game_id = p_game_id and player_id = auth.uid() and role = 'HUNTER' and status = 'ACTIVE'
  );
$$;

create function manhunt.shares_game_with(p_other uuid) returns boolean
language sql stable security definer set search_path = manhunt, pg_temp as $$
  select exists (
    select 1 from manhunt.game_players a
    join manhunt.game_players b on a.game_id = b.game_id
    where a.player_id = auth.uid() and b.player_id = p_other
  );
$$;

revoke all on function manhunt.is_game_member(uuid), manhunt.is_game_hunter(uuid), manhunt.shares_game_with(uuid) from public;
grant execute on function manhunt.is_game_member(uuid), manhunt.is_game_hunter(uuid), manhunt.shares_game_with(uuid) to authenticated;

-- ---------------------------------------------------------------- policies

create policy profiles_select on manhunt.profiles for select to authenticated
  using (id = auth.uid() or manhunt.shares_game_with(id));
create policy profiles_update_own on manhunt.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy games_select_member on manhunt.games for select to authenticated
  using (manhunt.is_game_member(id));

create policy game_players_select_member on manhunt.game_players for select to authenticated
  using (manhunt.is_game_member(game_id));

-- Precise raw locations: only the owner. Hunters NEVER read this table.
create policy player_locations_select_own on manhunt.player_locations for select to authenticated
  using (player_id = auth.uid());

-- Snapshots: only released ones, only for members of that game who are hunters,
-- or the runner the snapshot is about.
create policy location_snapshots_select_released on manhunt.location_snapshots for select to authenticated
  using (
    released_at <= now()
    and (
      manhunt.is_game_hunter(game_id)
      or (player_id = auth.uid() and manhunt.is_game_member(game_id))
    )
  );

create policy tag_requests_select_member on manhunt.tag_requests for select to authenticated
  using (manhunt.is_game_member(game_id));

create policy game_events_select_member on manhunt.game_events for select to authenticated
  using (manhunt.is_game_member(game_id));

-- ---------------------------------------------------------------- realtime
-- Publish only what clients may subscribe to. player_locations is deliberately NOT published.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table
      manhunt.games, manhunt.game_players, manhunt.location_snapshots, manhunt.tag_requests, manhunt.game_events;
  end if;
end $$;
