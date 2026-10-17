export type GameStatus = 'LOBBY' | 'COUNTDOWN' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type Role = 'HUNTER' | 'RUNNER';
export type PlayerStatus = 'ACTIVE' | 'ELIMINATED' | 'LEFT';
export type Winner = 'HUNTERS' | 'RUNNERS';
export type EndReason =
  | 'ALL_RUNNERS_ELIMINATED'
  | 'TIME_EXPIRED'
  | 'HUNTERS_FORFEIT'
  | 'HOST_CANCELLED'
  | 'PLAYERS_LEFT'
  | 'LOBBY_TIMEOUT';
export type TagStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
export type TagConfirmation = 'RUNNER_ACK' | 'PROXIMITY';

/** Epoch milliseconds. The engine never reads a clock; callers pass `now`. */
export type Millis = number;

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Arena {
  center: LatLng;
  radiusM: number;
}

export interface GameConfig {
  countdownMs: Millis;
  /** Runners move, hunters cannot tag and no snapshots are released until this passes. */
  headStartMs: Millis;
  /** Length of ACTIVE phase, measured from the moment ACTIVE begins (includes head start). */
  durationMs: Millis;
  snapshotIntervalMs: Millis;
  tagRadiusM: number;
  /** Readings with worse (larger) accuracy than this are ignored as evidence. */
  maxAccuracyM: number;
  /** Pending tags not confirmed in this window expire. */
  tagConfirmWindowMs: Millis;
  /** Distinct proximity reading pairs required for a GPS-confirmed tag. Must be >= 2. */
  minProximityPairs: number;
  /** Max time between a hunter reading and a runner reading for them to be paired. */
  pairMaxSkewMs: Millis;
  lobbyTimeoutMs: Millis;
  minPlayers: number;
  maxPlayers: number;
  /** Fraction of players that become hunters (rounded, clamped to [1, n-1]). */
  hunterRatio: number;
}

export interface Player {
  id: string;
  role: Role | null;
  status: PlayerStatus;
  joinedAt: Millis;
  eliminatedAt: Millis | null;
}

export interface LocationReading {
  playerId: string;
  lat: number;
  lng: number;
  accuracyM: number;
  recordedAt: Millis;
}

export interface TagRequest {
  id: string; // client-generated idempotency key
  hunterId: string;
  runnerId: string;
  createdAt: Millis;
  status: TagStatus;
  resolvedAt: Millis | null;
  confirmation: TagConfirmation | null;
}

export interface GameState {
  id: string;
  hostId: string;
  status: GameStatus;
  config: GameConfig;
  arena: Arena;
  players: Record<string, Player>;
  tags: Record<string, TagRequest>;
  createdAt: Millis;
  countdownStartedAt: Millis | null;
  activeAt: Millis | null;
  huntersReleasedAt: Millis | null;
  endsAt: Millis | null;
  huntersReleased: boolean;
  endedAt: Millis | null;
  winner: Winner | null;
  endReason: EndReason | null;
  /** Incremented on every state change; useful for optimistic concurrency. */
  version: number;
}

export type GameEvent =
  | { type: 'PLAYER_JOINED'; at: Millis; playerId: string }
  | { type: 'PLAYER_LEFT'; at: Millis; playerId: string }
  | { type: 'TEAMS_ASSIGNED'; at: Millis; hunters: string[]; runners: string[] }
  | { type: 'ROLE_SET'; at: Millis; playerId: string; role: Role }
  | { type: 'COUNTDOWN_STARTED'; at: Millis; activeAt: Millis }
  | { type: 'GAME_STARTED'; at: Millis; huntersReleasedAt: Millis; endsAt: Millis }
  | { type: 'HUNTERS_RELEASED'; at: Millis }
  | { type: 'TAG_REQUESTED'; at: Millis; tagId: string; hunterId: string; runnerId: string }
  | { type: 'TAG_CONFIRMED'; at: Millis; tagId: string; via: TagConfirmation }
  | { type: 'TAG_REJECTED'; at: Millis; tagId: string }
  | { type: 'TAG_EXPIRED'; at: Millis; tagId: string }
  | { type: 'PLAYER_ELIMINATED'; at: Millis; playerId: string; tagId: string }
  | { type: 'GAME_COMPLETED'; at: Millis; winner: Winner; reason: EndReason }
  | { type: 'GAME_CANCELLED'; at: Millis; reason: EndReason };

export type ErrorCode =
  | 'GAME_FINISHED'
  | 'WRONG_STATUS'
  | 'NOT_HOST'
  | 'NOT_A_PLAYER'
  | 'ALREADY_JOINED'
  | 'GAME_FULL'
  | 'NOT_ENOUGH_PLAYERS'
  | 'TEAMS_NOT_ASSIGNED'
  | 'INVALID_ROLE'
  | 'NOT_HUNTER'
  | 'NOT_RUNNER'
  | 'TARGET_NOT_ACTIVE'
  | 'HEAD_START'
  | 'TAG_NOT_FOUND'
  | 'TAG_NOT_PENDING'
  | 'TAG_CONFLICT'
  | 'INSUFFICIENT_EVIDENCE'
  | 'INVALID_CONFIG';

export type Result =
  | { ok: true; state: GameState; events: GameEvent[] }
  | { ok: false; error: ErrorCode; message: string };
