import { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useGame } from '../lib/useGame';
import { formatDuration } from '../lib/phase';
import type { EndReason } from '../lib/types';
import { ErrorBanner, Spinner } from '../components/ui';

const REASONS: Record<EndReason, string> = {
  ALL_RUNNERS_ELIMINATED: 'Every runner was tagged.',
  TIME_EXPIRED: 'Time ran out with runners still free.',
  HUNTERS_FORFEIT: 'All hunters left the game.',
  HOST_CANCELLED: 'The host cancelled the game.',
  PLAYERS_LEFT: 'Too many players left.',
  LOBBY_TIMEOUT: 'The lobby timed out before the game started.',
};

export function ResultsScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const { game, players, tags, loading, error } = useGame(id);

  const stats = useMemo(() => {
    const confirmed = tags.filter((t) => t.status === 'CONFIRMED');
    const nameOf = new Map(players.map((p) => [p.player_id, p.display_name]));
    const perHunter = new Map<string, number>();
    for (const t of confirmed) perHunter.set(t.hunter_id, (perHunter.get(t.hunter_id) ?? 0) + 1);
    const top = [...perHunter.entries()].sort((a, b) => b[1] - a[1])[0];
    const runners = players.filter((p) => p.role === 'RUNNER');
    return {
      hunters: players.filter((p) => p.role === 'HUNTER').length,
      runners: runners.length,
      survivors: runners.filter((p) => p.status === 'ACTIVE'),
      caught: runners.filter((p) => p.status === 'ELIMINATED').length,
      tagsConfirmed: confirmed.length,
      tagsTotal: tags.length,
      topHunter: top ? { name: nameOf.get(top[0]) ?? 'Hunter', n: top[1] } : null,
    };
  }, [players, tags]);

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
  if (game.status === 'LOBBY') return <Navigate to={`/game/${id}`} replace />;
  if (game.status === 'COUNTDOWN' || game.status === 'ACTIVE') return <Navigate to={`/game/${id}/play`} replace />;

  const me = players.find((p) => p.player_id === user?.id);
  const cancelled = game.status === 'CANCELLED';
  const iWon = !!me?.role && game.winner === (me.role === 'HUNTER' ? 'HUNTERS' : 'RUNNERS');
  const lengthS =
    game.active_at && game.ended_at ? (Date.parse(game.ended_at) - Date.parse(game.active_at)) / 1000 : 0;

  return (
    <main className="screen">
      {cancelled ? (
        <section className="card winner">
          <p className="eyebrow">Game over</p>
          <h1>Cancelled</h1>
        </section>
      ) : (
        <section className={`winner ${game.winner === 'HUNTERS' ? 'hunters' : 'runners'}`}>
          <p className="eyebrow">{me?.role ? (iWon ? 'You won' : 'You lost') : 'Final result'}</p>
          <h1 data-testid="winner">{game.winner === 'HUNTERS' ? 'Hunters win' : 'Runners win'}</h1>
        </section>
      )}
      {game.end_reason && <p className="muted" style={{ textAlign: 'center' }}>{REASONS[game.end_reason]}</p>}

      {!cancelled && (
        <>
          <div className="stat-grid">
            <div className="stat"><span className="eyebrow">Game length</span><b>{formatDuration(lengthS)}</b></div>
            <div className="stat"><span className="eyebrow">Runners caught</span><b>{stats.caught}/{stats.runners}</b></div>
            <div className="stat"><span className="eyebrow">Tags confirmed</span><b>{stats.tagsConfirmed}</b></div>
            <div className="stat"><span className="eyebrow">Hunters</span><b>{stats.hunters}</b></div>
          </div>
          {stats.topHunter && (
            <div className="card tight row between">
              <span className="eyebrow">Top hunter</span>
              <b>{stats.topHunter.name} · {stats.topHunter.n} {stats.topHunter.n === 1 ? 'tag' : 'tags'}</b>
            </div>
          )}
          <section className="card stack">
            <p className="eyebrow">Escaped</p>
            {stats.survivors.length === 0 ? (
              <p className="muted">Nobody got away.</p>
            ) : (
              stats.survivors.map((p) => <b key={p.player_id}>{p.display_name}</b>)
            )}
          </section>
          <section className="card stack" style={{ gap: 8 }}>
            <p className="eyebrow">Everyone</p>
            {players.map((p) => (
              <div key={p.player_id} className="row between">
                <span>{p.display_name}{p.player_id === user?.id && <span className="muted small"> · you</span>}</span>
                <span className={`pill ${p.role === 'HUNTER' ? 'hunter' : p.role === 'RUNNER' ? 'runner' : 'none'}`}>
                  {p.role ?? '-'}{p.status === 'ELIMINATED' ? ' · tagged' : p.status === 'LEFT' ? ' · left' : ''}
                </span>
              </div>
            ))}
          </section>
        </>
      )}

      <div className="grow" />
      <button className="btn primary" onClick={() => nav('/')}>Back home</button>
      <p className="small muted" style={{ textAlign: 'center' }}>
        Location sharing has stopped. Raw positions are deleted soon after the game.
      </p>
    </main>
  );
}
