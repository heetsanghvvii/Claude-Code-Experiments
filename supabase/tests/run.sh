#!/usr/bin/env bash
# Spins up a throwaway local Postgres (needs postgresql-16 + postgis 3 binaries), stubs the parts of
# Supabase the migrations rely on, applies supabase/migrations in order, then runs the SQL tests.
# Usage: bash supabase/tests/run.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
PGBIN="${PGBIN:-/usr/lib/postgresql/16/bin}"
WORK="$(mktemp -d)"
PORT="${PGPORT_TEST:-54329}"
cleanup() { "$PGBIN/pg_ctl" -D "$WORK/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

if [ "$(id -u)" = "0" ]; then RUNAS=(runuser -u postgres --); chown postgres "$WORK"; else RUNAS=(); fi
"${RUNAS[@]}" "$PGBIN/initdb" -D "$WORK/data" -U postgres -A trust >/dev/null
"${RUNAS[@]}" "$PGBIN/pg_ctl" -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=''" -l "$WORK/log" start >/dev/null

PSQL=(psql -X -q -v ON_ERROR_STOP=1 -h "$WORK" -p "$PORT" -U postgres)
"${PSQL[@]}" -c "create database outrun_test"
"${PSQL[@]}" -d outrun_test -f "$HERE/supabase_stub.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "migrate: $(basename "$f")"
  "${PSQL[@]}" -d outrun_test -f "$f" >/dev/null
done
for t in "$HERE"/test_*.sql; do
  echo "test: $(basename "$t")"
  "${PSQL[@]}" -d outrun_test -f "$t" >/dev/null 2>"$WORK/test.err" || { cat "$WORK/test.err"; exit 1; }
  grep -c "NOTICE:  ok - " "$WORK/test.err" | xargs -I{} echo "  {} assertions passed"
done
echo "ALL DB TESTS PASSED"
