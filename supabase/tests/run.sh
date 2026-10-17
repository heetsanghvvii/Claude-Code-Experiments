#!/usr/bin/env bash
# Spins up a throwaway local Postgres (needs postgresql-16 + postgis 3 binaries), stubs the parts of
# Supabase the migrations rely on, applies supabase/migrations in order, then runs:
#   sql     - the SQL test files supabase/tests/test_*.sql
#   race    - concurrency tests (two sessions at once), supabase/tests/race_tests.sh
#   parity  - engine-vs-SQL parity scenarios (supabase/tests/parity/scenarios/*.json) through vitest
# Usage: bash supabase/tests/run.sh [all|sql|race|parity]   (default: all)
set -euo pipefail
MODE="${1:-all}"
case "$MODE" in all|sql|race|parity) ;; *) echo "usage: $0 [all|sql|race|parity]" >&2; exit 2;; esac
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
WORK="$(mktemp -d)"
PORT="${PGPORT_TEST:-54329}"
cleanup() { "${RUNAS[@]}" "$PGBIN/pg_ctl" -D "$WORK/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$WORK"; }
RUNAS=()
trap cleanup EXIT

if [ "$(id -u)" = "0" ]; then RUNAS=(runuser -u postgres --); chown postgres "$WORK"; fi
"${RUNAS[@]}" "$PGBIN/initdb" -D "$WORK/data" -U postgres -A trust >/dev/null
"${RUNAS[@]}" "$PGBIN/pg_ctl" -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=''" -l "$WORK/log" start >/dev/null

PSQL=(psql -X -q -v ON_ERROR_STOP=1 -h "$WORK" -p "$PORT" -U postgres)
"${PSQL[@]}" -c "create database outrun_test"
"${PSQL[@]}" -d outrun_test -f "$HERE/supabase_stub.sql" 2>/dev/null
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "migrate: $(basename "$f")"
  "${PSQL[@]}" -d outrun_test -f "$f" >/dev/null
done

if [ "$MODE" = all ] || [ "$MODE" = sql ]; then
  for t in "$HERE"/test_*.sql; do
    echo "test: $(basename "$t")"
    "${PSQL[@]}" -d outrun_test -f "$t" >/dev/null 2>"$WORK/test.err" || { cat "$WORK/test.err"; exit 1; }
    grep -c "NOTICE:  ok - " "$WORK/test.err" | xargs -I{} echo "  {} assertions passed"
  done
fi

if [ "$MODE" = all ] || [ "$MODE" = race ]; then
  echo "test: race_tests.sh"
  PGHOST="$WORK" PGPORT="$PORT" PGUSER=postgres PGDATABASE=outrun_test bash "$HERE/race_tests.sh"
fi

if [ "$MODE" = all ] || [ "$MODE" = parity ]; then
  echo "test: parity (engine vs SQL)"
  "${PSQL[@]}" -d outrun_test -f "$HERE/parity/parity_setup.sql" >/dev/null
  (cd "$ROOT/packages/engine" && \
    PARITY_PGHOST="$WORK" PARITY_PGPORT="$PORT" PARITY_PGDATABASE=outrun_test PARITY_REQUIRE_DB=1 \
    npx vitest run test/parity.test.ts)
fi
echo "ALL DB TESTS PASSED ($MODE)"
