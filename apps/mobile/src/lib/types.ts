// Hand-written row types matching supabase/migrations. Replace with `supabase gen types` output later.
export type GameStatus = 'LOBBY' | 'COUNTDOWN' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type Role = 'HUNTER' | 'RUNNER';
export type PlayerStatus = 'ACTIVE' | 'ELIMINATED' | 'LEFT';

export interface GameRow {
  id: string;
  code: string;
  host_id: string;
  status: GameStatus;
  arena_lat: number;
  arena_lng: number;
  arena_radius_m: number;
  countdown_s: number;
  head_start_s: number;
  duration_s: number;
  snapshot_interval_s: number;
  created_at: string;
  active_at: string | null;
  hunters_released_at: string | null;
  ends_at: string | null;
  ended_at: string | null;
  winner: 'HUNTERS' | 'RUNNERS' | null;
  end_reason: string | null;
  version: number;
}

export interface GamePlayerRow {
  game_id: string;
  player_id: string;
  role: Role | null;
  status: PlayerStatus;
  joined_at: string;
  eliminated_at: string | null;
}

export interface ProfileRow {
  id: string;
  display_name: string;
}

export interface SnapshotRow {
  id: number;
  game_id: string;
  player_id: string;
  lat: number;
  lng: number;
  accuracy_m: number;
  recorded_at: string;
  released_at: string;
}

export interface LobbyPlayer extends GamePlayerRow {
  display_name: string;
}
