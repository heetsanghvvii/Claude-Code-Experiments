import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { joinGame } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { BackBar, ErrorBanner } from '../components/ui';

const ALPHABET = /[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g;

export function JoinScreen() {
  const nav = useNavigate();
  const { code: preset } = useParams();
  const [code, setCode] = useState((preset ?? '').toUpperCase().replace(ALPHABET, '').slice(0, 6));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const g = await joinGame(code);
      nav(g.status === 'LOBBY' ? `/game/${g.id}` : `/game/${g.id}/play`, { replace: true });
    } catch (e) {
      setError(friendlyError(e));
      setBusy(false);
    }
  }

  return (
    <main className="screen">
      <BackBar title="Join a game" to="/" />
      <p className="muted">Ask the host for the 6-character code.</p>
      <input
        className="input code-input"
        aria-label="Game code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().replace(ALPHABET, '').slice(0, 6))}
        maxLength={6}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        placeholder="ABC123"
        onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && void submit()}
      />
      <ErrorBanner message={error} />
      <div className="grow" />
      <button className="btn primary" disabled={code.length !== 6 || busy} onClick={() => void submit()}>
        {busy ? 'Joining...' : 'Join'}
      </button>
    </main>
  );
}
