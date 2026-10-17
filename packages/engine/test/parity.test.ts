/// <reference types="node" />
/**
 * Engine-vs-SQL parity. Every scenario in supabase/tests/parity/scenarios/*.json is
 *  1. run against the engine and checked against the scenario's expectations (always), and
 *  2. when PARITY_PGHOST is set (supabase/tests/run.sh sets it), run against the SQL functions
 *     in a throwaway local Postgres, checked against the same expectations, and compared with
 *     the engine observation after every step.
 * Run both with `npm run test:parity` (or `npm run db:test`).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runEngine } from './parity/engineRunner';
import { pgConnFromEnv, runSql } from './parity/sqlRunner';
import { checkExpect, diffObservations } from './parity/scenario';
import type { Expect, Observation, Scenario } from './parity/scenario';

const DIR = fileURLToPath(new URL('../../../supabase/tests/parity/scenarios/', import.meta.url));
const scenarios: Scenario[] = readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => {
    const doc = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Scenario | Scenario[];
    return Array.isArray(doc) ? doc : [doc];
  });

const conn = pgConnFromEnv();
const requireDb = process.env.PARITY_REQUIRE_DB === '1';

function expectationsFor(sc: Scenario, side: 'engine' | 'sql', obs: Observation[]): string[] {
  return obs.flatMap((o, i) => {
    const st = sc.steps[i]!;
    const e: Expect | undefined = st.divergence?.[side] ? { ...st.expect, ...st.divergence[side] } : st.expect;
    return checkExpect(o, e, `[${side}] step ${i} (${st.do} @${st.at}s as ${st.as})`);
  });
}

describe('parity scenarios', () => {
  it('loads scenarios', () => {
    expect(scenarios.length).toBeGreaterThan(10);
    expect(new Set(scenarios.map((s) => s.name)).size).toBe(scenarios.length);
    if (requireDb) expect(conn, 'PARITY_REQUIRE_DB=1 but PARITY_PGHOST is not set').not.toBeNull();
  });

  for (const sc of scenarios) {
    describe(sc.name, () => {
      it('engine meets the scenario expectations', () => {
        expect(expectationsFor(sc, 'engine', runEngine(sc))).toEqual([]);
      });

      it.skipIf(!conn)('SQL meets the scenario expectations and matches the engine step by step', () => {
        const eng = runEngine(sc);
        const sql = runSql(sc, conn!);
        expect(sql.length).toBe(eng.length);
        const problems = expectationsFor(sc, 'sql', sql);
        sql.forEach((o, i) => {
          const st = sc.steps[i]!;
          for (const d of diffObservations(eng[i]!, o, st.divergence?.fields ?? [], sc.compareRoles !== false))
            problems.push(`[parity] step ${i} (${st.do} @${st.at}s as ${st.as}) ${d}`);
        });
        expect(problems).toEqual([]);
      });
    });
  }
});
