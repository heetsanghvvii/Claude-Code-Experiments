import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { giveConsent } from '../lib/consent';
import { BackBar } from '../components/ui';
import { emergencyCopy, locationConsentCopy, safetyWarnings } from '../content/safety';

/** Safety rules and location consent. Shown before the first create/join, and any time from the Safety link. */
export function ConsentScreen({ readOnly = false }: { readOnly?: boolean }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const [safety, setSafety] = useState(false);
  const [loc, setLoc] = useState(false);
  const c = locationConsentCopy;

  return (
    <main className="screen">
      <BackBar title="Play safe" to="/" />
      <section className="card stack">
        <p className="eyebrow">Before you play</p>
        <ul className="consent-list">
          {safetyWarnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="card stack">
        <p className="eyebrow">{c.title}</p>
        <p>{c.intro}</p>
        <Group title="What we collect" items={c.collected} />
        <Group title="Who sees it" items={c.whoSees} />
        <Group title="When sharing stops" items={c.whenSharingStops} />
        <Group title="How long we keep it" items={c.retention} />
      </section>

      <section className="card stack">
        <p className="eyebrow">{emergencyCopy.title}</p>
        <p>{emergencyCopy.body}</p>
        <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {emergencyCopy.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      {!readOnly && (
        <>
          <label className="check">
            <input type="checkbox" checked={safety} onChange={(e) => setSafety(e.target.checked)} />
            <span>I have read the safety rules and will play safely.</span>
          </label>
          <label className="check">
            <input type="checkbox" checked={loc} onChange={(e) => setLoc(e.target.checked)} />
            <span>{c.consentPrompt}</span>
          </label>
          <button
            className="btn primary"
            disabled={!safety || !loc || !user}
            onClick={() => {
              if (user) giveConsent(user.id);
              nav(safeNext, { replace: true });
            }}
          >
            I agree, let's go
          </button>
        </>
      )}
    </main>
  );
}

function Group({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="stack" style={{ gap: 6 }}>
      <b>{title}</b>
      <ul className="consent-list">
        {items.map((i) => (
          <li key={i} className="muted">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
