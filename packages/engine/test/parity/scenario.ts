/**
 * Shared parity scenarios: one JSON format, run against the TS engine (engineRunner.ts) and the
 * SQL functions in a local Postgres (sqlRunner.ts). Scenario files live in
 * supabase/tests/parity/scenarios/*.json.
 */

export type Command =
  | { do: 'create'; as: string }
  | { do: 'join'; as: string }
  | { do: 'leave'; as: string }
  | { do: 'assignTeams'; as: string }
  | { do: 'setRole'; as: string; player: string; role: 'HUNTER' | 'RUNNER' }
  | { do: 'start'; as: string }
  | { do: 'cancel'; as: string }
  | { do: 'advance'; as: string }
  /** A location reading. Position is `northM` metres north (and `eastM` east) of the arena centre. */
  | { do: 'location'; as: string; northM?: number; eastM?: number; accuracyM?: number; ago?: number; mocked?: boolean }
  | { do: 'tag'; as: string; tag: string; runner: string }
  | { do: 'ack'; as: string; tag: string }
  | { do: 'withdraw'; as: string; tag: string };

/** Partial expectations; only the keys present are checked. */
export interface Expect {
  ok?: boolean;
  error?: string;
  status?: string;
  winner?: string | null;
  endReason?: string | null;
  host?: string;
  huntersReleased?: boolean;
  roleCounts?: Partial<Record<'HUNTER' | 'RUNNER' | 'NONE', number>>;
  /** name -> status, or a partial player object */
  players?: Record<string, string | Partial<ObservedPlayer>>;
  /** name -> status, or a partial tag object */
  tags?: Record<string, string | Partial<ObservedTag>>;
  /** number of snapshot rows released so far, or the exact list */
  snapshots?: number | ObservedSnapshot[];
  times?: Partial<Observation['times']>;
  /** the step's events, exactly and in order */
  events?: string[];
}

export type Step = Command & {
  /** seconds since the game was created (virtual clock) */
  at: number;
  expect?: Expect;
  /**
   * A documented, accepted difference between the engine and SQL for this step. The listed
   * observation fields are not compared; each side is checked against its own expectation.
   */
  divergence?: { reason: string; fields: (keyof Observation)[]; engine?: Expect; sql?: Expect };
};

export interface Scenario {
  name: string;
  description: string;
  /** SQL create_game parameters (the engine gets the same values in ms). */
  config: { durationS: number; headStartS: number; snapshotIntervalS: number };
  /** Every user the scenario uses. */
  users: string[];
  /** Roles are random after assignTeams; set false to compare only role counts. */
  compareRoles?: boolean;
  steps: Step[];
}

export interface ObservedPlayer {
  role: string | null;
  status: string;
  eliminatedAt: number | null;
}
export interface ObservedTag {
  hunter: string;
  runner: string;
  status: string;
  confirmation: string | null;
  createdAt: number;
  resolvedAt: number | null;
}
export interface ObservedSnapshot {
  runner: string;
  recordedAt: number;
  releasedAt: number;
}

export interface StepResult {
  ok: boolean;
  error?: string;
  /** location steps only: whether the reading was stored */
  accepted?: boolean;
}

/** The normalised view both runners produce after every step. Times are whole seconds since creation. */
export interface Observation {
  result: StepResult;
  status: string;
  winner: string | null;
  endReason: string | null;
  host: string;
  huntersReleased: boolean;
  times: { activeAt: number | null; huntersReleasedAt: number | null; endsAt: number | null; endedAt: number | null };
  roleCounts: { HUNTER: number; RUNNER: number; NONE: number };
  players: Record<string, ObservedPlayer>;
  tags: Record<string, ObservedTag>;
  snapshots: ObservedSnapshot[];
  /** "TYPE" or "TYPE:subject" (player for PLAYER_* / ROLE_SET, else tag), in emission order */
  events: string[];
}

export const ARENA_CENTER = { lat: 51.5074, lng: -0.1278 };
export const ARENA_RADIUS_M = 400;
const M_PER_DEG_LAT = 111_195;

export function positionOf(c: { northM?: number; eastM?: number }) {
  const lat = ARENA_CENTER.lat + (c.northM ?? 0) / M_PER_DEG_LAT;
  const lng = ARENA_CENTER.lng + (c.eastM ?? 0) / (M_PER_DEG_LAT * Math.cos((ARENA_CENTER.lat * Math.PI) / 180));
  return { lat, lng };
}

export function tagNames(s: Scenario): string[] {
  return [...new Set(s.steps.flatMap((st) => ('tag' in st ? [st.tag] : [])))];
}

/** Returns a list of mismatches between an observation and an expectation. */
export function checkExpect(o: Observation, ex: Expect | undefined, where: string): string[] {
  const e: Expect = ex ?? {};
  const out: string[] = [];
  const cmp = (path: string, actual: unknown, expected: unknown) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      out.push(`${where}: ${path} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  };
  if (e.ok !== undefined) cmp('result.ok', o.result.ok, e.ok);
  if (e.error !== undefined) cmp('result.error', o.result.error, e.error);
  if (e.error === undefined && e.ok === undefined && !o.result.ok)
    out.push(`${where}: unexpected error ${o.result.error}`);
  for (const k of ['status', 'winner', 'endReason', 'host', 'huntersReleased'] as const)
    if (e[k] !== undefined) cmp(k, o[k], e[k]);
  if (e.roleCounts) for (const [k, v] of Object.entries(e.roleCounts)) cmp(`roleCounts.${k}`, o.roleCounts[k as 'HUNTER'], v);
  if (e.times) for (const [k, v] of Object.entries(e.times)) cmp(`times.${k}`, o.times[k as 'endsAt'], v);
  for (const [group, obs] of [
    ['players', o.players],
    ['tags', o.tags],
  ] as const) {
    const exp = e[group];
    if (!exp) continue;
    for (const [name, v] of Object.entries(exp)) {
      const actual = (obs as unknown as Record<string, Record<string, unknown>>)[name];
      if (typeof v === 'string') cmp(`${group}.${name}.status`, actual?.status, v);
      else for (const [k, vv] of Object.entries(v)) cmp(`${group}.${name}.${k}`, actual?.[k], vv);
    }
  }
  if (typeof e.snapshots === 'number') cmp('snapshots.length', o.snapshots.length, e.snapshots);
  else if (e.snapshots) cmp('snapshots', o.snapshots, e.snapshots);
  if (e.events) cmp('events', o.events, e.events);
  return out;
}

/** Observation equality, skipping fields named in `skip`. Roles are skipped when compareRoles is false. */
export function diffObservations(a: Observation, b: Observation, skip: string[], compareRoles: boolean): string[] {
  const out: string[] = [];
  const keys = Object.keys(a) as (keyof Observation)[];
  for (const k of keys) {
    if (skip.includes(k)) continue;
    let av: unknown = a[k];
    let bv: unknown = b[k];
    if (k === 'players' && !compareRoles) {
      const strip = (p: Record<string, ObservedPlayer>) =>
        Object.fromEntries(Object.entries(p).map(([n, v]) => [n, { ...v, role: '*' }]));
      av = strip(a.players);
      bv = strip(b.players);
    }
    if (k === 'events' && !compareRoles) {
      // TEAMS_ASSIGNED is common; ROLE_SET depends on the random assignment.
      const strip = (e: string[]) => e.filter((x) => !x.startsWith('ROLE_SET'));
      av = strip(a.events);
      bv = strip(b.events);
    }
    if (JSON.stringify(sortKeys(av)) !== JSON.stringify(sortKeys(bv)))
      out.push(`${k}: engine=${JSON.stringify(sortKeys(av))} sql=${JSON.stringify(sortKeys(bv))}`);
  }
  return out;
}

function sortKeys(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object')
    return Object.fromEntries(
      Object.keys(v as object)
        .sort()
        .map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]),
    );
  return v;
}
