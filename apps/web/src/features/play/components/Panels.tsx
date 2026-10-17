import { useState } from 'react';
import type { GameView } from '../model';

export function SpectatorPanel() {
  return (
    <section className="mh-panel mh-spectator" data-testid="spectator">
      <h2>You are out</h2>
      <p>You were tagged. Your location is no longer shared. Stay put and watch the rest of the game unfold from here.</p>
    </section>
  );
}

export function ResultPanel({ game, myRole }: { game: GameView; myRole: string | null }) {
  const cancelled = game.status === 'CANCELLED';
  if (game.endReason === 'EMERGENCY_STOP')
    return (
      <section className="mh-result" data-testid="stopped">
        <div className="mh-kicker">Round stopped</div>
        <h1>Emergency stop</h1>
        <p>A player stopped the round for safety. Location sharing has ended and there is no winner. Check that everyone is OK.</p>
        <a className="mh-btn mh-link" href={`/game/${game.id}/results`}>Continue</a>
      </section>
    );
  const won = !cancelled && game.winner && myRole && game.winner === `${myRole}S`;
  return (
    <section className="mh-result" data-testid="result">
      <div className="mh-kicker">{cancelled ? 'Game cancelled' : 'Game over'}</div>
      <h1>{cancelled ? 'No winner' : `${game.winner === 'HUNTERS' ? 'Hunters' : 'Runners'} win`}</h1>
      {!cancelled && myRole && <p className="mh-bignum-sm">{won ? 'That is you. Nicely done.' : 'Not this time.'}</p>}
      {game.endReason && <p className="mh-muted">{game.endReason.replace(/_/g, ' ').toLowerCase()}</p>}
      <a className="mh-btn mh-link" href={`/game/${game.id}/results`}>See results</a>
    </section>
  );
}

interface ConfirmProps { label: string; ariaLabel: string; question: string; yes: string; className: string; onConfirm: () => Promise<void>; testId: string }

/** Always visible. Two taps so nobody triggers it by accident, but never more than two. */
function ConfirmButton({ label, ariaLabel, question, yes, className, onConfirm, testId }: ConfirmProps) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!armed)
    return <button type="button" className={className} data-testid={testId} onClick={() => setArmed(true)} aria-label={ariaLabel}>{label}</button>;
  return (
    <div className="mh-leave-confirm" role="alertdialog" aria-label={question}>
      <span>{question}</span>
      <button type="button" className="mh-btn mh-btn-hot" disabled={busy} data-testid={`${testId}-yes`} onClick={async () => {
        setBusy(true); setErr(null);
        try { await onConfirm(); } catch (e) { setErr(e instanceof Error ? e.message : 'Failed, try again'); setBusy(false); }
      }}>{yes}</button>
      <button type="button" className="mh-btn mh-btn-ghost" onClick={() => setArmed(false)}>Keep playing</button>
      {err && <span className="mh-error" role="alert">{err}</span>}
    </div>
  );
}

export const LeaveButton = ({ onLeave }: { onLeave: () => Promise<void> }) => (
  <ConfirmButton testId="leave" className="mh-leave" label="Leave" ariaLabel="Leave the game" question="Leave the game and stop sharing your location?" yes="Yes, leave" onConfirm={onLeave} />
);

export const EmergencyStopButton = ({ onStop }: { onStop: () => Promise<void> }) => (
  <ConfirmButton testId="estop" className="mh-estop" label="Emergency stop" ariaLabel="Emergency stop: end the round for everyone" question="Emergency stop ends the round for EVERYONE. Use it only for a real safety problem." yes="Stop the round" onConfirm={onStop} />
);
