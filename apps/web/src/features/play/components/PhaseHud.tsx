import { fmtDuration } from '../lib/clock';
import type { PhaseInfo } from '../lib/phase';

export function CountdownOverlay({ info, role }: { info: PhaseInfo; role: string | null }) {
  const s = Math.ceil((info.phaseRemainingMs ?? 0) / 1000);
  return (
    <div className="mh-countdown" role="timer" aria-live="off">
      <div className="mh-kicker">{role === 'HUNTER' ? 'You are a HUNTER' : role === 'RUNNER' ? 'You are a RUNNER' : 'Get ready'}</div>
      <div className="mh-bignum" data-testid="countdown">{s}</div>
      <div className="mh-kicker">Game starts when this hits zero</div>
    </div>
  );
}

export function PhaseHud({ info, role }: { info: PhaseInfo; role: string | null }) {
  return (
    <div className="mh-hud">
      <div className="mh-hud-cell">
        <span className="mh-hud-label">Time left</span>
        <span className="mh-hud-value" data-testid="time-left">{info.timeLeftMs == null ? '--:--' : fmtDuration(info.timeLeftMs)}</span>
      </div>
      <div className="mh-hud-cell">
        <span className="mh-hud-label">{info.phase === 'HEAD_START' ? (role === 'HUNTER' ? 'Hunters released in' : 'Head start') : 'Phase'}</span>
        <span className="mh-hud-value mh-hud-phase" data-testid="phase">
          {info.phase === 'HEAD_START' ? fmtDuration(info.phaseRemainingMs ?? 0) : info.phase === 'HUNT' ? 'HUNT' : info.phase}
        </span>
      </div>
    </div>
  );
}

export function ReleasedBanner({ role }: { role: string | null }) {
  return (
    <div className="mh-banner mh-banner-hot" role="status" data-testid="released">
      {role === 'HUNTER' ? 'Hunters released. Go get them.' : 'Hunters released! Keep moving.'}
    </div>
  );
}
