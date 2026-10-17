import { useEffect, useRef, useState } from 'react';
import type { PlayerView, TagView } from '../model';
import { fmtDuration } from '../lib/clock';

export function newTagId(): string {
  const c: Crypto = crypto;
  if (typeof c.randomUUID === 'function') return c.randomUUID();
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40; b[8] = (b[8]! & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

interface HunterProps {
  runners: PlayerView[];
  myPending: TagView[];
  canTag: boolean;
  blockedReason: string | null;
  confirmWindowS: number;
  nowMs: number;
  onSubmit: (tagId: string, runnerId: string) => Promise<void>;
  onWithdraw: (tagId: string) => Promise<void>;
}

/** Hunter side: choose a runner, send the tag, watch it pend, withdraw if needed. */
export function HunterTagPanel(p: HunterProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Same key is reused for retries of the same attempt so a double-tap or network retry is idempotent.
  const attempt = useRef<{ runnerId: string; id: string } | null>(null);

  const submit = async () => {
    if (!picked || busy) return;
    if (!attempt.current || attempt.current.runnerId !== picked) attempt.current = { runnerId: picked, id: newTagId() };
    setBusy(true); setErr(null);
    try { await p.onSubmit(attempt.current.id, picked); attempt.current = null; setPicked(null); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not send the tag'); }
    finally { setBusy(false); }
  };

  const pending = p.myPending[0];
  if (pending) {
    const runner = p.runners.find((r) => r.id === pending.runnerId);
    const left = pending.createdAtMs + p.confirmWindowS * 1000 - p.nowMs;
    return (
      <section className="mh-panel" data-testid="tag-pending">
        <h2>Tag sent to {runner?.name ?? 'runner'}</h2>
        <p>Waiting for them to confirm, or for 2 close GPS readings. Expires in {fmtDuration(left)}.</p>
        <button type="button" className="mh-btn mh-btn-ghost" onClick={() => { void p.onWithdraw(pending.id).catch((e) => setErr(String(e?.message ?? e))); }}>Withdraw tag</button>
        {err && <p className="mh-error">{err}</p>}
      </section>
    );
  }
  return (
    <section className="mh-panel" data-testid="tag-picker">
      <h2>Tag a runner</h2>
      {!p.canTag && <p className="mh-muted">{p.blockedReason}</p>}
      <ul className="mh-list">
        {p.runners.map((r) => (
          <li key={r.id}>
            <button type="button" disabled={!p.canTag} className={`mh-chip ${picked === r.id ? 'mh-chip-on' : ''}`} aria-pressed={picked === r.id} onClick={() => setPicked(r.id)}>{r.name}</button>
          </li>
        ))}
        {!p.runners.length && <li className="mh-muted">No runners left.</li>}
      </ul>
      <button type="button" className="mh-btn mh-btn-hot" disabled={!p.canTag || !picked || busy} onClick={() => void submit()}>{busy ? 'Sending...' : 'Send tag'}</button>
      {err && <p className="mh-error" role="alert">{err}</p>}
    </section>
  );
}

interface RunnerProps {
  incoming: TagView[];
  hunters: PlayerView[];
  onConfirm: (tagId: string) => Promise<void>;
}

/** Runner side: a big, hard-to-miss confirm button. */
export function RunnerTagPanel({ incoming, hunters, onConfirm }: RunnerProps) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (!incoming.length) setErr(null); }, [incoming.length]);
  const t = incoming[0];
  if (!t) return null;
  const who = hunters.find((h) => h.id === t.hunterId)?.name ?? 'A hunter';
  return (
    <section className="mh-incoming" role="alertdialog" aria-label="Incoming tag" data-testid="tag-incoming">
      <h2>{who} says they tagged you</h2>
      <p>Did they really get you? If so, you are out.</p>
      <button type="button" className="mh-btn mh-btn-huge" disabled={busy} onClick={async () => {
        setBusy(true); setErr(null);
        try { await onConfirm(t.id); } catch (e) { setErr(e instanceof Error ? e.message : 'Failed, try again'); } finally { setBusy(false); }
      }}>I was tagged</button>
      <p className="mh-muted">Not tagged? Just ignore it; it expires on its own.</p>
      {err && <p className="mh-error" role="alert">{err}</p>}
    </section>
  );
}
