/**
 * Local view-model + adapters. Agent A's lib/types.ts shapes may be snake_case DB rows or
 * camelCase; we accept either so this feature does not depend on a specific casing.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type GameStatus = 'LOBBY' | 'COUNTDOWN' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type Role = 'HUNTER' | 'RUNNER';
export type PlayerStatus = 'ACTIVE' | 'ELIMINATED' | 'LEFT';

export interface GameView {
  id: string;
  status: GameStatus;
  center: { lat: number; lng: number };
  radiusM: number;
  activeAt: string | number | null;
  huntersReleasedAt: string | number | null;
  huntersReleased: boolean;
  endsAt: string | number | null;
  winner: 'HUNTERS' | 'RUNNERS' | null;
  endReason: string | null;
  maxAccuracyM: number;
  tagConfirmWindowS: number;
  tagRadiusM: number;
}
export interface PlayerView { id: string; name: string; role: Role | null; status: PlayerStatus }
export interface SnapshotView { playerId: string; lat: number; lng: number; accuracyM: number; recordedAtMs: number; releasedAtMs: number }
export interface TagView { id: string; hunterId: string; runnerId: string; status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED'; createdAtMs: number }

const pick = (o: any, ...keys: string[]) => { for (const k of keys) if (o?.[k] !== undefined && o[k] !== null) return o[k]; return null; };
const ms = (v: any) => { const t = typeof v === 'number' ? v : Date.parse(v); return Number.isFinite(t) ? t : 0; };

export function toGame(g: any): GameView | null {
  if (!g) return null;
  const lat = pick(g, 'arena_lat', 'arenaLat') ?? g.arena?.center?.lat ?? g.center?.lat ?? g.arenaCenter?.lat;
  const lng = pick(g, 'arena_lng', 'arenaLng') ?? g.arena?.center?.lng ?? g.center?.lng ?? g.arenaCenter?.lng;
  return {
    id: g.id,
    status: g.status,
    center: { lat: Number(lat), lng: Number(lng) },
    radiusM: Number(pick(g, 'arena_radius_m', 'arenaRadiusM', 'radiusM') ?? g.arena?.radiusM ?? 100),
    activeAt: pick(g, 'active_at', 'activeAt'),
    huntersReleasedAt: pick(g, 'hunters_released_at', 'huntersReleasedAt'),
    huntersReleased: !!pick(g, 'hunters_released', 'huntersReleased'),
    endsAt: pick(g, 'ends_at', 'endsAt'),
    winner: pick(g, 'winner'),
    endReason: pick(g, 'end_reason', 'endReason'),
    maxAccuracyM: Number(pick(g, 'max_accuracy_m', 'maxAccuracyM') ?? 25),
    tagConfirmWindowS: Number(pick(g, 'tag_confirm_window_s', 'tagConfirmWindowS') ?? 60),
    tagRadiusM: Number(pick(g, 'tag_radius_m', 'tagRadiusM') ?? 10),
  };
}

export function toPlayer(p: any): PlayerView {
  const id = String(pick(p, 'player_id', 'playerId') ?? p.id);
  const name = pick(p, 'display_name', 'displayName', 'name') ?? p.profile?.display_name ?? p.profiles?.display_name ?? `Player ${id.slice(0, 4)}`;
  return { id, name: String(name), role: pick(p, 'role'), status: pick(p, 'status') ?? 'ACTIVE' };
}

export function toSnapshot(s: any): SnapshotView {
  return {
    playerId: String(pick(s, 'player_id', 'playerId')),
    lat: Number(s.lat), lng: Number(s.lng),
    accuracyM: Number(pick(s, 'accuracy_m', 'accuracyM') ?? 0),
    recordedAtMs: ms(pick(s, 'recorded_at', 'recordedAt')),
    releasedAtMs: ms(pick(s, 'released_at', 'releasedAt')),
  };
}

export function toTag(t: any): TagView {
  return {
    id: t.id, status: t.status,
    hunterId: String(pick(t, 'hunter_id', 'hunterId')), runnerId: String(pick(t, 'runner_id', 'runnerId')),
    createdAtMs: ms(pick(t, 'created_at', 'createdAt')),
  };
}

/** Latest released snapshot per runner. */
export function latestSnapshots(list: SnapshotView[]): SnapshotView[] {
  const m = new Map<string, SnapshotView>();
  for (const s of list) {
    const cur = m.get(s.playerId);
    if (!cur || s.releasedAtMs > cur.releasedAtMs) m.set(s.playerId, s);
  }
  return [...m.values()];
}
