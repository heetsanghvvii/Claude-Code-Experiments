import { BackBar } from '../components/ui';
import { privacyDraftNotice, privacySections } from '../content/privacy';

export function PrivacyScreen() {
  return (
    <main className="screen">
      <BackBar title="Privacy" to="/" />
      <div className="banner warn">{privacyDraftNotice}</div>
      {privacySections.map((s) => (
        <section key={s.id} className="card stack">
          <h2 className="title" style={{ fontSize: 20 }}>
            {s.heading}
          </h2>
          {s.paragraphs.map((p) => (
            <p key={p} className="muted">
              {p}
            </p>
          ))}
          {s.bullets && (
            <ul className="consent-list">
              {s.bullets.map((b) => (
                <li key={b} className="muted">
                  {b}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
