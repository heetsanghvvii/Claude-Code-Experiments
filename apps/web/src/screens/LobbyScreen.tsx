import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useGame } from '../lib/useGame';
import { assignTeams, cancelGame, leaveGame, setPlayerRole, startGame } from '../lib/api';
import { friendlyError } from '../lib/errors';
import type { Role } from '../lib/types';
import { ErrorBanner, Spinner } from '../components/ui';

export function LobbyScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const { game, players, loading, error, online, setError, refresh } = useGame(id);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  if (!id) return <Navigate to="/" replace />;
  if (loading && !game) return <Spinner />;
  if (!game) {
    return (
      <main className="screen center">
        <ErrorBanner message={error ?? 'Game not found.'} />
        <button className="btn" onClick={() => nav('/')}>Home</button>
      </main>
    );
  }
  if (game.status === 'COUNTDOWN' || game.status === 'ACTIVE') return <Navigate to={`/game/${id}/play`} replace />;
  if (game.status === 'COMPLETED' || game.status === 'CANCELLED') return <Navigate to={`/game/${id}/results`} replace />;

  const isHost = user?.id === game.host_id;
  const active = players.filter((p) => p.status !== 'LEFT');
  const hunters = active.filter((p) => p.role === 'HUNTER').length;
  const runners = active.filter((p) => p.role === 'RUNNER').length;
  const unassigned = active.length - hunters - runners;
  const canStart = isHost && active.length >= game.min_players && hunters >= 1 && runners >= 1 && unassigned === 0;

  async function run(label: string, fn: () => Promise<unknown>, after?: () => void) {
    setBusy(label);
    setError(null);
    try {
      await fn();
      await refresh();
      after?.();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    const text = `Join my Manhunt game: ${game!.code}`;
    const url = `${location.origin}/join/${game!.code}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Manhunt', text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
      }
    } catch {
      /* share dismissed */
    }
  }

  const need = !isHost
    ? 'Waiting for the host to start...'
    : active.length < game.min_players
      ? `Need at least ${game.min_players} players`
      : unassigned > 0
        ? 'Give every player a team'
        : hunters < 1 || runners < 1
          ? 'Need at least one hunter and one runner'
          : null;

  return (
    <main className="screen">
      {!online && <div className="banner warn">You are offline.</div>}
      <section className="card code-card">
        <p className="eyebrow">Game code</p>
        <div className="code" data-testid="game-code">{game.code}</div>
        <button className="btn ghost small" style={{ margin: '12px auto 0' }} onClick={() => void share()}>
          {copied ? 'Copied' : 'Share code'}
        </button>
      </section>

      <div className="row between">
        <h2 className="title" style={{ fontSize: 22 }}>Players ({active.length})</h2>
        <span className="small muted">
          <b style={{ color: 'var(--red)' }}>{hunters}</b> hunters · <b style={{ color: 'var(--lime)' }}>{runners}</b> runners
        </span>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        {active.map((p) => {
          const cls = p.role === 'HUNTER' ? 'hunter' : p.role === 'RUNNER' ? 'runner' : '';
          return (
            <div key={p.player_id} className="player">
              <div className={`avatar ${cls}`}>{p.display_name.slice(0, 1).toUpperCase()}</div>
              <div className="name">
                {p.display_name}
                {p.player_id === game.host_id && <span className="muted small"> · host</span>}
                {p.player_id === user?.id && <span className="muted small"> · you</span>}
              </div>
              {isHost ? (
                <div className="seg" role="group" aria-label={`Team for ${p.display_name}`}>
                  <RoleBtn on={p.role === 'HUNTER'} cls="h" label="Hunter" short="H"
                    onClick={() => void run('role', () => setPlayerRole(game.id, p.player_id, 'HUNTER' as Role))} />
                  <RoleBtn on={p.role === 'RUNNER'} cls="r" label="Runner" short="R"
                    onClick={() => void run('role', () => setPlayerRole(game.id, p.player_id, 'RUNNER' as Role))} />
                </div>
              ) : (
                <span className={`pill ${cls || 'none'}`}>{p.role ?? 'No team'}</span>
              )}
            </div>
          );
        })}
      </div>

      <section className="card tight small muted">
        {Math.round(game.arena_radius_m)} m arena · {Math.round(game.duration_s / 60)} min game ·{' '}
        {Math.round(game.head_start_s / 60 * 10) / 10} min head start · snapshots every{' '}
        {game.snapshot_interval_s < 60 ? `${game.snapshot_interval_s} s` : `${Math.round(game.snapshot_interval_s / 60)} min`}
      </section>

      <ErrorBanner message={error} />
      <div className="grow" />

      {isHost ? (
        <div className="stack">
          <button className="btn" disabled={!!busy || active.length < game.min_players}
            onClick={() => void run('teams', () => assignTeams(game.id))}>
            {busy === 'teams' ? 'Shuffling...' : 'Shuffle teams'}
          </button>
          {need && <p className="small muted" style={{ textAlign: 'center' }}>{need}</p>}
          <button className="btn primary" disabled={!canStart || !!busy}
            onClick={() => void run('start', () => startGame(game.id), () => nav(`/game/${game.id}/play`))}>
            {busy === 'start' ? 'Starting...' : 'Start game'}
          </button>
          <button className="btn link" disabled={!!busy}
            onClick={() => window.confirm('Cancel this game for everyone?') && void run('cancel', () => cancelGame(game.id))}>
            Cancel game
          </button>
        </div>
      ) : (
        <div className="stack">
          <p className="muted" style={{ textAlign: 'center' }}>{need}</p>
          <button className="btn ghost" disabled={!!busy}
            onClick={() => void run('leave', () => leaveGame(game.id), () => nav('/', { replace: true }))}>
            Leave game
          </button>
        </div>
      )}
      {isHost && active.length > 1 && (
        <p className="small muted" style={{ textAlign: 'center' }}>
          Leaving as host hands the game to the next player.
        </p>
      )}
    </main>
  );
}

function RoleBtn(props: { on: boolean; cls: 'h' | 'r'; label: string; short: string; onClick: () => void }) {
  return (
    <button className={props.on ? `on ${props.cls}` : ''} aria-pressed={props.on} aria-label={props.label} onClick={props.onClick}>
      {props.short}
    </button>
  );
}
