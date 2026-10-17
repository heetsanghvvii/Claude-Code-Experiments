import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { getFix, type Fix } from '../lib/geo';
import { BackBar, ErrorBanner, Slider } from '../components/ui';

const fmtDist = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);
const fmtMin = (s: number) => `${Math.round(s / 60)} min`;
const fmtSnap = (s: number) => (s < 60 ? `${s} s` : `${s / 60} min`);

export function CreateScreen() {
  const nav = useNavigate();
  const [fix, setFix] = useState<Fix | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [radius, setRadius] = useState(300);
  const [durationS, setDurationS] = useState(1200);
  const [headStartS, setHeadStartS] = useState(120);
  const [snapS, setSnapS] = useState(120);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(() => {
    setLocating(true);
    setLocError(null);
    getFix()
      .then(setFix)
      .catch((e: unknown) => setLocError(friendlyError(e)))
      .finally(() => setLocating(false));
  }, []);
  useEffect(locate, [locate]);

  const headOk = headStartS < durationS;

  async function submit() {
    if (!fix) return;
    setBusy(true);
    setError(null);
    try {
      const g = await createGame({
        lat: fix.lat,
        lng: fix.lng,
        radiusM: radius,
        durationS,
        headStartS,
        snapshotIntervalS: snapS,
      });
      nav(`/game/${g.id}`, { replace: true });
    } catch (e) {
      setError(friendlyError(e));
      setBusy(false);
    }
  }

  return (
    <main className="screen">
      <BackBar title="Host a game" to="/" />

      <div className="card tight row between">
        <div>
          <p className="eyebrow">Arena centre</p>
          {fix ? (
            <p style={{ fontWeight: 700 }}>
              Here, within {Math.round(fix.accuracyM)} m
              {fix.accuracyM > 50 && <span className="muted small"> (weak GPS)</span>}
            </p>
          ) : locating ? (
            <p className="muted">Finding you...</p>
          ) : (
            <p className="muted">No location yet</p>
          )}
        </div>
        <button className="btn ghost small" onClick={locate} disabled={locating}>
          {fix ? 'Refresh' : 'Retry'}
        </button>
      </div>
      <ErrorBanner message={locError} />

      <div className="card stack" style={{ gap: 22 }}>
        <Slider label="Arena radius" value={radius} min={100} max={2000} step={50} format={fmtDist} onChange={setRadius}
          hint="Runners must stay inside this circle around you." />
        <Slider label="Game length" value={durationS} min={300} max={7200} step={300} format={fmtMin} onChange={setDurationS} />
        <Slider label="Head start" value={headStartS} min={0} max={900} step={30} format={fmtMin} onChange={setHeadStartS}
          hint="How long runners hide before hunters are released." />
        <Slider label="Snapshot every" value={snapS} min={30} max={600} step={30} format={fmtSnap} onChange={setSnapS}
          hint="How often hunters get a fresh (delayed) look at runners." />
      </div>

      {!headOk && <div className="banner warn">Head start must be shorter than the game.</div>}
      <ErrorBanner message={error} />
      <div className="grow" />
      <button className="btn primary" disabled={!fix || busy || !headOk} onClick={() => void submit()}>
        {busy ? 'Creating...' : 'Create game'}
      </button>
    </main>
  );
}
