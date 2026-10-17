-- OUTRUN schema: types, tables, constraints, indexes, integrity triggers.
-- Clients never write these tables directly; see 20261017000003_functions.sql.

create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.game_status   as enum ('LOBBY', 'COUNTDOWN', 'ACTIVE', 'COMPLETED', 'CANCELLED');
create type public.player_role   as enum ('HUNTER', 'RUNNER');
create type public.player_status as enum ('ACTIVE', 'ELIMINATED', 'LEFT');
create type public.game_winner   as enum ('HUNTERS', 'RUNNERS');
create type public.tag_status    as enum ('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED');
create type public.tag_confirmation as enum ('RUNNER_ACK', 'PROXIMITY');

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 32),
  created_at   timestamptz not null default now()
);

-- Create a profile row for every new auth user.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), 'Player'), 32)
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- games
create table public.games (
  id                    uuid primary key default gen_random_uuid(),
  code                  text not null check (code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$'),
  host_id               uuid not null references public.profiles (id),
  status                public.game_status not null default 'LOBBY',

  arena_center          extensions.geography(Point, 4326) not null,
  arena_lat             double precision generated always as (extensions.st_y(arena_center::extensions.geometry)) stored,
  arena_lng             double precision generated always as (extensions.st_x(arena_center::extensions.geometry)) stored,
  arena_radius_m        real not null check (arena_radius_m > 0 and arena_radius_m <= 5000),

  -- Rules (copied at creation; never changed after LOBBY).
  countdown_s           integer not null default 10   check (countdown_s between 0 and 300),
  head_start_s          integer not null default 120  check (head_start_s >= 0),
  duration_s            integer not null default 1200 check (duration_s between 60 and 14400),
  snapshot_interval_s   integer not null default 120  check (snapshot_interval_s between 10 and 3600),
  tag_radius_m          real    not null default 10   check (tag_radius_m > 0 and tag_radius_m <= 100),
  max_accuracy_m        real    not null default 25   check (max_accuracy_m > 0 and max_accuracy_m <= 200),
  tag_confirm_window_s  integer not null default 60   check (tag_confirm_window_s between 5 and 600),
  min_proximity_pairs   integer not null default 2    check (min_proximity_pairs >= 2), -- one reading never eliminates
  pair_max_skew_s       integer not null default 5    check (pair_max_skew_s between 0 and 60),
  lobby_timeout_s       integer not null default 1800 check (lobby_timeout_s > 0),
  min_players           integer not null default 2    check (min_players >= 2),
  max_players           integer not null default 20   check (max_players between 2 and 100),
  hunter_ratio          real    not null default 0.25 check (hunter_ratio > 0 and hunter_ratio < 1),
  check (head_start_s < duration_s),
  check (max_players >= min_players),

  -- Server-owned clock.
  created_at            timestamptz not null default now(),
  countdown_started_at  timestamptz,
  active_at             timestamptz,
  hunters_released_at   timestamptz,
  hunters_released      boolean not null default false,
  ends_at               timestamptz,
  last_snapshot_at      timestamptz,
  ended_at              timestamptz,

  winner                public.game_winner,
  end_reason            text check (end_reason in
                          ('ALL_RUNNERS_ELIMINATED', 'TIME_EXPIRED', 'HUNTERS_FORFEIT',
                           'HOST_CANCELLED', 'PLAYERS_LEFT', 'LOBBY_TIMEOUT')),
  version               integer not null default 1,

  check (status <> 'LOBBY' or active_at is null),
  check (status not in ('COUNTDOWN', 'ACTIVE', 'COMPLETED') or active_at is not null),
  check ((status = 'COMPLETED') = (winner is not null)),
  check ((status in ('COMPLETED', 'CANCELLED')) = (ended_at is not null))
);

-- A code identifies one live game at a time; finished games release it.
create unique index games_live_code_key on public.games (code)
  where status in ('LOBBY', 'COUNTDOWN', 'ACTIVE');
create index games_host_idx on public.games (host_id);

-- ---------------------------------------------------------------- game_players
create table public.game_players (
  game_id       uuid not null references public.games (id) on delete cascade,
  player_id     uuid not null references public.profiles (id) on delete cascade,
  role          public.player_role,
  status        public.player_status not null default 'ACTIVE',
  joined_at     timestamptz not null default now(),
  eliminated_at timestamptz,
  primary key (game_id, player_id),
  check ((status = 'ELIMINATED') = (eliminated_at is not null)),
  check (status <> 'ELIMINATED' or role = 'RUNNER')
);
create index game_players_player_idx on public.game_players (player_id);

-- ---------------------------------------------------------------- player_locations
-- Raw, precise readings. Readable only by the player who sent them. Short retention.
create table public.player_locations (
  id          bigint generated always as identity primary key,
  game_id     uuid not null,
  player_id   uuid not null,
  location    extensions.geography(Point, 4326) not null,
  accuracy_m  real not null check (accuracy_m >= 0),
  recorded_at timestamptz not null,               -- device time
  received_at timestamptz not null default now(), -- server time
  is_mocked   boolean not null default false,
  foreign key (game_id, player_id) references public.game_players (game_id, player_id) on delete cascade
);
create index player_locations_lookup_idx on public.player_locations (game_id, player_id, recorded_at desc);
create index player_locations_received_idx on public.player_locations (received_at);

-- ---------------------------------------------------------------- location_snapshots
-- Runner positions the server has released to hunters. released_at is always set at insert.
create table public.location_snapshots (
  id          bigint generated always as identity primary key,
  game_id     uuid not null,
  player_id   uuid not null, -- the runner
  location    extensions.geography(Point, 4326) not null,
  lat         double precision generated always as (extensions.st_y(location::extensions.geometry)) stored,
  lng         double precision generated always as (extensions.st_x(location::extensions.geometry)) stored,
  accuracy_m  real not null check (accuracy_m >= 0),
  recorded_at timestamptz not null,
  released_at timestamptz not null,
  foreign key (game_id, player_id) references public.game_players (game_id, player_id) on delete cascade
);
create index location_snapshots_game_idx on public.location_snapshots (game_id, released_at desc);

-- ---------------------------------------------------------------- tag_requests
-- id is generated by the hunter's client and is the idempotency key.
create table public.tag_requests (
  id           uuid primary key,
  game_id      uuid not null references public.games (id) on delete cascade,
  hunter_id    uuid not null,
  runner_id    uuid not null,
  status       public.tag_status not null default 'PENDING',
  confirmation public.tag_confirmation,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  foreign key (game_id, hunter_id) references public.game_players (game_id, player_id) on delete cascade,
  foreign key (game_id, runner_id) references public.game_players (game_id, player_id) on delete cascade,
  check (hunter_id <> runner_id),
  check ((status = 'PENDING') = (resolved_at is null)),
  check ((status = 'CONFIRMED') = (confirmation is not null))
);
create index tag_requests_game_idx on public.tag_requests (game_id, status);
-- At most one confirmed tag per runner per game.
create unique index tag_requests_one_confirmed_per_runner
  on public.tag_requests (game_id, runner_id) where status = 'CONFIRMED';

-- ---------------------------------------------------------------- game_events
create table public.game_events (
  id         bigint generated always as identity primary key,
  game_id    uuid not null references public.games (id) on delete cascade,
  type       text not null,
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index game_events_game_idx on public.game_events (game_id, id);

-- ---------------------------------------------------------------- integrity triggers

-- A finished game (COMPLETED or CANCELLED) can never change.
create function public.forbid_finished_game_update() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if old.status in ('COMPLETED', 'CANCELLED') then
    raise exception 'GAME_FINISHED: game % is immutable', old.id using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger games_immutable_when_finished
  before update on public.games
  for each row execute function public.forbid_finished_game_update();

-- Players and tags of a finished game are frozen too.
create function public.forbid_child_change_when_finished() returns trigger
language plpgsql set search_path = public, pg_temp as $$
declare
  v_status public.game_status;
begin
  select status into v_status from public.games where id = coalesce(new.game_id, old.game_id);
  if v_status in ('COMPLETED', 'CANCELLED') then
    raise exception 'GAME_FINISHED: % of finished game is immutable', tg_table_name using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;

create trigger game_players_frozen
  before insert or update on public.game_players
  for each row execute function public.forbid_child_change_when_finished();
create trigger tag_requests_frozen
  before insert or update on public.tag_requests
  for each row execute function public.forbid_child_change_when_finished();

-- Location writes stop when the game is not ACTIVE (sharing ends at game end).
create function public.forbid_location_when_not_active() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  if not exists (select 1 from public.games where id = new.game_id and status = 'ACTIVE') then
    raise exception 'WRONG_STATUS: locations are accepted only while ACTIVE' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger player_locations_active_only
  before insert on public.player_locations
  for each row execute function public.forbid_location_when_not_active();

-- game_events is append-only (retention deletes whole games via cascade).
create function public.forbid_update() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin
  raise exception '% is append-only', tg_table_name using errcode = 'P0001';
end $$;

create trigger game_events_append_only
  before update on public.game_events
  for each row execute function public.forbid_update();
