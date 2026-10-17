#!/usr/bin/env bash
# Concurrency tests: two real sessions calling the RPCs at the same time. Called by run.sh with
# PGHOST/PGPORT/PGUSER/PGDATABASE pointing at the throwaway database (migrations applied).
# Session A opens a transaction, makes its call and holds its locks for HOLD seconds; session B
# makes its call meanwhile, so B's early (pre-lock) checks run before A commits.
set -euo pipefail
HOLD=1.5
P=(psql -X -q -v ON_ERROR_STOP=1 -t -A)
pass=0
failed=0
ok() { echo "  ok - $1"; pass=$((pass + 1)); }
# Keep going after a failure so one run reports every broken assertion; exit non-zero at the end.
fail() { echo "  FAILED - $1" >&2; failed=$((failed + 1)); }

"${P[@]}" >/dev/null <<'SQL'
create schema race;
create table race.ctx (k text primary key, v text);
grant usage on schema race to authenticated;
grant select, insert on race.ctx to authenticated;
create function race.uid(n text) returns uuid language sql immutable as $$ select md5('race:' || n)::uuid $$;
create function race.v(k text) returns text language sql stable as $$ select v from race.ctx where ctx.k = $1 $$;
grant execute on all functions in schema race to authenticated;
create function race.as_user(n text) returns void language sql as $$
  select set_config('request.jwt.claim.sub', race.uid(n)::text, false) $$;
-- Moves a game's timestamps p_secs into the past (test-only time travel).
create function race.shift(p_game uuid, p_secs int) returns void language plpgsql as $$
declare d interval := make_interval(secs => p_secs);
begin
  set session_replication_role = replica;
  update manhunt.games set created_at = created_at - d, countdown_started_at = countdown_started_at - d,
         active_at = active_at - d, hunters_released_at = hunters_released_at - d, ends_at = ends_at - d,
         last_snapshot_at = last_snapshot_at - d where id = p_game;
  set session_replication_role = origin;
end $$;

insert into auth.users (id, email)
select race.uid(n), n || '@race' from unnest(array['h','r1','r2']) n
union all select race.uid('p' || i), 'p' || i || '@race' from generate_series(1, 21) i;

-- Game 1: ACTIVE, hunters released. h hunts r1 and r2.
select race.as_user('h'); set role authenticated;
insert into race.ctx select 'g1', id from manhunt.create_game(51.5, -0.12, 300, 600, 0, 30);
reset role;
SQL

# join_game needs the code; read it as superuser and join each player.
code=$("${P[@]}" -c "select code from manhunt.games where id = race.v('g1')::uuid")
for u in r1 r2; do
  "${P[@]}" >/dev/null -c "select race.as_user('$u'); set role authenticated; select manhunt.join_game('$code');"
done
"${P[@]}" >/dev/null <<'SQL'
select race.as_user('h'); set role authenticated;
select manhunt.set_player_role(race.v('g1')::uuid, race.uid('h'), 'HUNTER');
select manhunt.set_player_role(race.v('g1')::uuid, race.uid('r1'), 'RUNNER');
select manhunt.set_player_role(race.v('g1')::uuid, race.uid('r2'), 'RUNNER');
select manhunt.start_game(race.v('g1')::uuid);
reset role;
select race.shift(race.v('g1')::uuid, 11);
SQL

# ---------------------------------------------------------------- 1. concurrent replay of one tag id
T1=$("${P[@]}" -c "select gen_random_uuid()")
"${P[@]}" >/dev/null -c "begin; select race.as_user('h'); set local role authenticated;
  select manhunt.submit_tag('$T1', race.v('g1')::uuid, race.uid('r1')); select pg_sleep($HOLD); commit;" &
A=$!
sleep 0.4
"${P[@]}" >/dev/null -c "select race.as_user('h'); set role authenticated;
  select manhunt.submit_tag('$T1', race.v('g1')::uuid, race.uid('r1'));"
wait $A
n=$("${P[@]}" -c "select count(*) from manhunt.game_events where type = 'TAG_REQUESTED' and payload ->> 'tag_id' = '$T1'")
[ "$n" = 1 ] && ok "concurrent replay of a tag id logs TAG_REQUESTED once" || fail "concurrent replay logged TAG_REQUESTED $n times"

# ---------------------------------------------------------------- 2. concurrent reuse of a tag id for another runner
T2=$("${P[@]}" -c "select gen_random_uuid()")
"${P[@]}" >/dev/null -c "begin; select race.as_user('h'); set local role authenticated;
  select manhunt.submit_tag('$T2', race.v('g1')::uuid, race.uid('r1')); select pg_sleep($HOLD); commit;" &
A=$!
sleep 0.4
set +e
out=$("${P[@]}" -c "select race.as_user('h'); set role authenticated;
  select runner_id = race.uid('r2') from manhunt.submit_tag('$T2', race.v('g1')::uuid, race.uid('r2'));" 2>&1)
rc=$?
set -e
wait $A
case "$out" in
  *TAG_CONFLICT*) ok "concurrent reuse of a tag id for another runner is TAG_CONFLICT" ;;
  *) fail "concurrent reuse of a tag id for another runner returned (rc=$rc): $(echo "$out" | tr '\n' ' ')" ;;
esac

# ---------------------------------------------------------------- 3. concurrent joins at the player limit
"${P[@]}" >/dev/null <<'SQL'
select race.as_user('p1'); set role authenticated;
insert into race.ctx select 'g2', id from manhunt.create_game(51.5, -0.12, 300);
reset role;
SQL
code2=$("${P[@]}" -c "select code from manhunt.games where id = race.v('g2')::uuid")
for i in $(seq 2 19); do
  "${P[@]}" >/dev/null -c "select race.as_user('p$i'); set role authenticated; select manhunt.join_game('$code2');"
done
"${P[@]}" >/dev/null -c "begin; select race.as_user('p20'); set local role authenticated;
  select manhunt.join_game('$code2'); select pg_sleep($HOLD); commit;" &
A=$!
sleep 0.4
set +e
out=$("${P[@]}" -c "select race.as_user('p21'); set role authenticated; select manhunt.join_game('$code2');" 2>&1)
set -e
wait $A
n=$("${P[@]}" -c "select count(*) from manhunt.game_players where game_id = race.v('g2')::uuid")
case "$out" in
  *GAME_FULL*) [ "$n" = 20 ] && ok "concurrent joins never exceed max_players (20)" || fail "game has $n players" ;;
  *) fail "second concurrent join at the limit was not GAME_FULL: $out (players=$n)" ;;
esac

# ---------------------------------------------------------------- 4. concurrent acknowledgements of two tags on one runner
T3=$("${P[@]}" -c "select gen_random_uuid()")
T4=$("${P[@]}" -c "select gen_random_uuid()")
"${P[@]}" >/dev/null -c "select race.as_user('h'); set role authenticated;
  select manhunt.submit_tag('$T3', race.v('g1')::uuid, race.uid('r2'));
  select manhunt.submit_tag('$T4', race.v('g1')::uuid, race.uid('r2'));"
"${P[@]}" >/dev/null -c "begin; select race.as_user('r2'); set local role authenticated;
  select manhunt.acknowledge_tag('$T3'); select pg_sleep($HOLD); commit;" &
A=$!
sleep 0.4
set +e
out=$("${P[@]}" -c "select race.as_user('r2'); set role authenticated; select manhunt.acknowledge_tag('$T4');" 2>&1)
set -e
wait $A
n=$("${P[@]}" -c "select count(*) from manhunt.tag_requests where runner_id = race.uid('r2') and status = 'CONFIRMED'")
e=$("${P[@]}" -c "select count(*) from manhunt.game_events where type = 'PLAYER_ELIMINATED' and payload ->> 'player_id' = race.uid('r2')::text")
case "$out" in
  *TAG_NOT_PENDING*) [ "$n" = 1 ] && [ "$e" = 1 ] && ok "concurrent acks: one confirmation, one elimination, other tag not pending" || fail "confirmed=$n eliminated=$e" ;;
  *) fail "second concurrent ack: $out" ;;
esac

# ---------------------------------------------------------------- 5. concurrent duplicate withdraw (client retry) of one tag
T5=$("${P[@]}" -c "select gen_random_uuid()")
"${P[@]}" >/dev/null -c "select race.as_user('h'); set role authenticated;
  select manhunt.submit_tag('$T5', race.v('g1')::uuid, race.uid('r1'));"
"${P[@]}" >/dev/null -c "begin; select race.as_user('h'); set local role authenticated;
  select manhunt.withdraw_tag('$T5'); select pg_sleep($HOLD); commit;" &
A=$!
sleep 0.4
set +e
out=$("${P[@]}" -c "select race.as_user('h'); set role authenticated; select status from manhunt.withdraw_tag('$T5');" 2>&1)
set -e
wait $A
echo "$out" | grep -qx REJECTED && ok "concurrent duplicate withdraw is idempotent (both succeed)" \
  || fail "concurrent duplicate withdraw returned: $(echo "$out" | tr '\n' ' ')"

# ---------------------------------------------------------------- 6. concurrent duplicate acknowledgement (client retry) of one tag
# r1 is the last ACTIVE runner, so the first ack also completes the game; the retry must still succeed.
"${P[@]}" >/dev/null -c "begin; select race.as_user('r1'); set local role authenticated;
  select manhunt.acknowledge_tag('$T1'); select pg_sleep($HOLD); commit;" &
A=$!
sleep 0.4
set +e
out=$("${P[@]}" -c "select race.as_user('r1'); set role authenticated; select status from manhunt.acknowledge_tag('$T1');" 2>&1)
set -e
wait $A
s=$("${P[@]}" -c "select status from manhunt.games where id = race.v('g1')::uuid")
echo "$out" | grep -qx CONFIRMED && [ "$s" = COMPLETED ] && ok "concurrent duplicate ack is idempotent (both succeed), even when it ends the game" \
  || fail "concurrent duplicate ack returned: $(echo "$out" | tr '\n' ' ') (game $s)"

echo "  $pass race assertions passed, $failed failed"
[ "$failed" = 0 ]
