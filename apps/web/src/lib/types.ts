// Hand-written row types matching supabase/migrations (schema `manhunt`).
export type GameStatus = 'LOBBY' | 'COUNTDOWN' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type Role = 'HUNTER' | 'RUNNER';
export type PlayerStatus = 'ACTIVE' | 'ELIMINATED' | 'LEFT';
export type Winner = 'HUNTERS' | 'RUNNERS';
export type TagStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
export type TagConfirmation = 'RUNNER_ACK' | 'PROXIMITY';
export type EndReason =
  | 'ALL_RUNNERS_ELIMINATED'
  | 'TIME_EXPIRED'
  | 'HUNTERS_FORFEIT'
  | 'HOST_CANCELLED'
  | 'PLAYERS_LEFT'
  | 'LOBBY_TIMEOUT'
  | 'EMERGENCY_STOP';

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
  tag_radius_m: number;
  max_accuracy_m: number;
  tag_confirm_window_s: number;
  min_players: number;
  max_players: number;
  hunter_ratio: number;
  created_at: string;
  countdown_started_at: string | null;
  active_at: string | null;
  hunters_released_at: string | null;
  hunters_released: boolean;
  ends_at: string | null;
  last_snapshot_at: string | null;
  ended_at: string | null;
  winner: Winner | null;
  end_reason: EndReason | null;
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

export interface TagRow {
  id: string;
  game_id: string;
  hunter_id: string;
  runner_id: string;
  status: TagStatus;
  confirmation: TagConfirmation | null;
  created_at: string;
  resolved_at: string | null;
}

export interface GameEventRow {
  id: number;
  game_id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface LobbyPlayer extends GamePlayerRow {
  display_name: string;
}
