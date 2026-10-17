import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { GamePlayerRow, GameRow, LobbyPlayer, ProfileRow, Role, SnapshotRow } from './types';

// Every write goes through a server RPC; the client never writes tables directly.
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export interface CreateGameInput {
  lat: number;
  lng: number;
  radiusM: number;
  durationS?: number;
  headStartS?: number;
}

export const createGame = (i: CreateGameInput) =>
  rpc<GameRow>('create_game', {
    p_lat: i.lat,
    p_lng: i.lng,
    p_radius_m: i.radiusM,
    p_duration_s: i.durationS ?? null,
    p_head_start_s: i.headStartS ?? null,
  });
export const joinGame = (code: string) => rpc<GameRow>('join_game', { p_code: code });
export const leaveGame = (id: string) => rpc<GameRow>('leave_game', { p_game_id: id });
export const assignTeams = (id: string) => rpc<GameRow>('assign_teams', { p_game_id: id });
export const setPlayerRole = (id: string, playerId: string, role: Role) =>
  rpc<GameRow>('set_player_role', { p_game_id: id, p_player_id: playerId, p_role: role });
export const startGame = (id: string) => rpc<GameRow>('start_game', { p_game_id: id });
export const cancelGame = (id: string) => rpc<GameRow>('cancel_game', { p_game_id: id });
export const advanceGame = (id: string) => rpc<GameRow>('advance_game', { p_game_id: id });

export async function fetchGame(id: string): Promise<GameRow> {
  const { data, error } = await supabase.from('games').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data as GameRow;
}

export async function fetchPlayers(gameId: string): Promise<LobbyPlayer[]> {
  const { data: players, error } = await supabase
    .from('game_players')
    .select('*')
    .eq('game_id', gameId)
    .order('joined_at');
  if (error) throw new Error(error.message);
  const rows = (players ?? []) as GamePlayerRow[];
  const ids = rows.map((p) => p.player_id);
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, display_name').in('id', ids);
  if (pErr) throw new Error(pErr.message);
  const names = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p.display_name]));
  return rows.map((p) => ({ ...p, display_name: names.get(p.player_id) ?? 'Player' }));
}

/** Released snapshots only; RLS hides everything else (and everything, for runners other than themselves). */
export async function fetchSnapshots(gameId: string): Promise<SnapshotRow[]> {
  const { data, error } = await supabase
    .from('location_snapshots')
    .select('id, game_id, player_id, lat, lng, accuracy_m, recorded_at, released_at')
    .eq('game_id', gameId)
    .order('released_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as SnapshotRow[];
}

/** Calls `onChange` whenever the game, its players or its snapshots change. RLS filters the stream. */
export function subscribeToGame(gameId: string, onChange: () => void): () => void {
  const filter = `game_id=eq.${gameId}`;
  const channel: RealtimeChannel = supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'location_snapshots', filter }, onChange)
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
