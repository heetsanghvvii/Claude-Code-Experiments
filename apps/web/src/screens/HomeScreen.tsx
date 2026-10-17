import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { fetchMyLiveGames } from '../lib/api';
import { friendlyError } from '../lib/errors';
import type { GameRow } from '../lib/types';
import { ErrorBanner, Logo } from '../components/ui';
import { rulesSummary } from '../content/safety';

export function HomeScreen() {
  const { displayName, signOut } = useAuth();
  const nav = useNavigate();
  const [live, setLive] = useState<GameRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let on = true;
    fetchMyLiveGames()
      .then((g) => on && setLive(g))
      .catch((e: unknown) => on && setError(friendlyError(e)));
    return () => {
      on = false;
    };
  }, []);

  return (
    <main className="screen">
      <div className="row between">
        <Logo />
        <button className="btn link" style={{ width: 'auto' }} onClick={() => void signOut()}>
          Sign out
        </button>
      </div>
      <div>
        <p className="eyebrow">Hey {displayName}</p>
        <h1 className="hero" style={{ marginTop: 6 }}>
          Ready to <em>run?</em>
        </h1>
      </div>

      <ErrorBanner message={error} />

      {live.map((g) => (
        <button
          key={g.id}
          className="card"
          style={{ textAlign: 'left', cursor: 'pointer', borderColor: 'var(--lime)' }}
          onClick={() => nav(g.status === 'LOBBY' ? `/game/${g.id}` : `/game/${g.id}/play`)}
        >
          <div className="row between">
            <div>
              <p className="eyebrow">Resume game</p>
              <p className="title" style={{ letterSpacing: '0.15em' }}>
                {g.code}
              </p>
            </div>
            <span className="pill runner">{g.status}</span>
          </div>
        </button>
      ))}

      <div className="stack" style={{ marginTop: 4 }}>
        <Link to="/create" className="btn primary" style={{ minHeight: 76, fontSize: 22 }}>
          Host a game
        </Link>
        <Link to="/join" className="btn" style={{ minHeight: 76, fontSize: 22 }}>
          Join with a code
        </Link>
      </div>

      <section className="card stack">
        <p className="eyebrow">How it works</p>
        <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rulesSummary.map((s) => (
            <li key={s.step}>
              <b>{s.title}.</b> <span className="muted">{s.body}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="row between">
        <Link to="/safety" className="btn link" style={{ width: 'auto' }}>
          Safety
        </Link>
        <Link to="/privacy" className="btn link" style={{ width: 'auto' }}>
          Privacy
        </Link>
      </div>
    </main>
  );
}
