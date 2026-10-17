/// <reference types="node" />
/**
 * Runs a parity scenario against the trusted SQL functions in a local Postgres prepared by
 * supabase/tests/run.sh (migrations + supabase/tests/parity/parity_setup.sql).
 *
 * Each step is its own transaction, executed as role `authenticated` with the JWT `sub` of the
 * acting user, through the real RPCs. Virtual time is applied by parity.at() (moves the game's
 * stored timestamps; production code is untouched). One psql process per scenario.
 */
import { execFileSync } from 'node:child_process';
import { positionOf, tagNames } from './scenario';
import type { Observation, Scenario, Step } from './scenario';

export interface PgConn {
  host: string;
  port: string;
  database: string;
  user: string;
}

export function pgConnFromEnv(): PgConn | null {
  const host = process.env.PARITY_PGHOST;
  if (!host) return null;
  return {
    host,
    port: process.env.PARITY_PGPORT ?? '5432',
    database: process.env.PARITY_PGDATABASE ?? 'outrun_test',
    user: process.env.PARITY_PGUSER ?? 'postgres',
  };
}

const lit = (s: string) => `'${s.replace(/'/g, "''")}'`;
const num = (n: number) => {
  if (!Number.isFinite(n)) throw new Error(`non-finite number ${n}`);
  return String(n);
};

function rpc(step: Step, cfg: Scenario['config']): string {
  const G = 'parity.gid()';
  switch (step.do) {
    case 'create':
      return `select to_jsonb(r) from manhunt.create_game(${num(51.5074)}, ${num(-0.1278)}, 400, ${num(cfg.durationS)}, ${num(cfg.headStartS)}, ${num(cfg.snapshotIntervalS)}) r`;
    case 'join':
      return `select to_jsonb(r) from manhunt.join_game(parity.code()) r`;
    case 'leave':
      return `select to_jsonb(r) from manhunt.leave_game(${G}) r`;
    case 'assignTeams':
      return `select to_jsonb(r) from manhunt.assign_teams(${G}) r`;
    case 'setRole':
      return `select to_jsonb(r) from manhunt.set_player_role(${G}, parity.uid(${lit(step.player)}), ${lit(step.role)}) r`;
    case 'start':
      return `select to_jsonb(r) from manhunt.start_game(${G}) r`;
    case 'cancel':
      return `select to_jsonb(r) from manhunt.cancel_game(${G}) r`;
    case 'advance':
      return `select to_jsonb(r) from manhunt.advance_game(${G}) r`;
    case 'location': {
      const p = positionOf(step);
      return `select to_jsonb(manhunt.record_location(${G}, ${num(p.lat)}, ${num(p.lng)}, ${num(step.accuracyM ?? 5)}, now() - make_interval(secs => ${num(step.ago ?? 0)}), ${step.mocked ? 'true' : 'false'}))`;
    }
    case 'tag':
      return `select to_jsonb(r) from manhunt.submit_tag(parity.tid(${lit(step.tag)}), ${G}, parity.uid(${lit(step.runner)})) r`;
    case 'ack':
      return `select to_jsonb(r) from manhunt.acknowledge_tag(parity.tid(${lit(step.tag)})) r`;
    case 'withdraw':
      return `select to_jsonb(r) from manhunt.withdraw_tag(parity.tid(${lit(step.tag)})) r`;
  }
}

export function buildScript(sc: Scenario): string {
  const lines: string[] = ['\\set ON_ERROR_STOP 1', '\\o /dev/null'];
  const arr = (xs: string[]) => `array[${xs.map(lit).join(', ')}]::text[]`;
  lines.push(`select parity.begin_scenario(${lit(sc.name)}, ${arr(sc.users)}, ${arr(tagNames(sc))});`);
  sc.steps.forEach((step, i) => {
    lines.push(`select parity.at(${num(step.at)});`);
    lines.push(`select parity.as_user(${lit(step.as)});`);
    lines.push('set role authenticated;');
    lines.push(`select parity.try(${i}, ${lit(rpc(step, sc.config))});`);
    lines.push('reset role;');
    if (step.do === 'create') lines.push(`select parity.bind_game(${i});`);
    lines.push(`select parity.observe(${i});`);
  });
  lines.push('\\o');
  lines.push(`select coalesce(json_agg(json_build_object('step', step, 'result', result, 'obs', obs) order by step), '[]') from parity.results;`);
  return lines.join('\n') + '\n';
}

interface Row {
  step: number;
  result: { ok: boolean; error?: string; message?: string; value?: unknown };
  obs: Omit<Observation, 'result'> | null;
}

export function runSql(sc: Scenario, conn: PgConn): Observation[] {
  const out = execFileSync(
    'psql',
    ['-X', '-q', '-t', '-A', '-h', conn.host, '-p', conn.port, '-U', conn.user, '-d', conn.database],
    { input: buildScript(sc), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 },
  );
  const rows = JSON.parse(out.trim()) as Row[];
  return rows.map((row, i) => {
    const step = sc.steps[i]!;
    if (!row.obs) throw new Error(`${sc.name} step ${i}: no game observed (create failed? ${JSON.stringify(row.result)})`);
    const result: Observation['result'] = row.result.ok ? { ok: true } : { ok: false, error: row.result.error };
    if (step.do === 'location') result.accepted = row.result.ok && row.result.value === true;
    return { result, ...row.obs } as Observation;
  });
}
