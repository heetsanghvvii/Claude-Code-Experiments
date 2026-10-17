import { useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useGame } from '../../lib/useGame';
import './play.css';
import ArenaMap, { type MapMarker } from './components/ArenaMap';
import { BackgroundBanner, GeoBanner } from './components/Banners';
import { EmergencyStopButton, LeaveButton, ResultPanel, SpectatorPanel } from './components/Panels';
import { CountdownOverlay, PhaseHud, ReleasedBanner } from './components/PhaseHud';
import { HunterTagPanel, RunnerTagPanel } from './components/TagPanel';
import { buzz } from './hooks/useHaptics';
import { useGeolocationSharing } from './hooks/useGeolocationSharing';
import { useServerClock, useTicker } from './hooks/useServerClock';
import { usePageVisible, useWakeLock } from './hooks/useWakeLock';
import { boundsState } from './lib/geo';
import { computePhase } from './lib/phase';
import { latestSnapshots, toGame, toPlayer, toSnapshot, toTag, type GameView } from './model';

export interface PlayScreenProps {
  gameId: string;
  /** Called once when the game reaches COMPLETED/CANCELLED. If omitted a minimal result panel is shown. */
  onFinished?: (game: GameView) => void;
  /** Called after the player has left the game (emergency stop). */
  onLeft?: () => void;
}

export function PlayScreen({ gameId, onFinished, onLeft }: PlayScreenProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = useGame(gameId, { withSnapshots: true, tickMs: 5000 }) as any;
  const { user } = useAuth();
  const game = useMemo(() => toGame(raw.game), [raw.game]);
  const players = useMemo(() => (raw.players ?? []).map(toPlayer), [raw.players]);
  const snapshots = useMemo(() => latestSnapshots((raw.snapshots ?? []).map(toSnapshot)), [raw.snapshots]);
  const tags = useMemo(() => (raw.tags ?? []).map(toTag), [raw.tags]);
  const me = (players.find((p: { id: string }) => p.id === user?.id) ?? null) as ReturnType<typeof toPlayer> | null;

  const clock = useServerClock();
  useTicker(250);
  const visible = usePageVisible();
  const [leaving, setLeaving] = useState(false);
  const serverNow = clock.now();

  const info = game ? computePhase(game, serverNow) : null;
  const ended = !!game && (game.status === 'COMPLETED' || game.status === 'CANCELLED');
  const myActive = !!me && me.status === 'ACTIVE' && !leaving;
  const eliminated = me?.status === 'ELIMINATED';
  const live = !!game && (game.status === 'COUNTDOWN' || game.status === 'ACTIVE') && myActive;
  const sending = !!game && game.status === 'ACTIVE' && myActive && info?.phase !== 'COUNTDOWN';

  useWakeLock(live);
  const geo = useGeolocationSharing({
    gameId, watch: live, send: sending, serverNow: clock.now, visible,
    maxAccuracyM: game?.maxAccuracyM ?? 25,
  });

  // useGame already polls advance_game; add an immediate nudge when a timer hits zero.
  const status = game?.status;
  const boundaryFired = useRef<string>('');
  useEffect(() => {
    if (!info || (status !== 'COUNTDOWN' && status !== 'ACTIVE')) return;
    const key = `${status}:${info.phase}:${info.phaseRemainingMs === 0}:${info.timeLeftMs === 0}`;
    if ((info.phaseRemainingMs === 0 || info.timeLeftMs === 0) && boundaryFired.current !== key) {
      boundaryFired.current = key;
      void Promise.resolve(api.advanceGame(gameId)).catch(() => undefined);
      const retry = setTimeout(() => { void Promise.resolve(api.advanceGame(gameId)).catch(() => undefined); }, 1500);
      return () => clearTimeout(retry);
    }
  }, [info?.phaseRemainingMs === 0, info?.timeLeftMs === 0, info?.phase, status, gameId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Haptics on key events.
  const prev = useRef<{ phase?: string; incoming: number; elim?: boolean; status?: string; out?: boolean }>({ incoming: 0 });
  const myRole = me?.role ?? null;
  const incoming = tags.filter((t: { runnerId: string; status: string }) => t.runnerId === me?.id && t.status === 'PENDING');
  const myPending = tags.filter((t: { hunterId: string; status: string }) => t.hunterId === me?.id && t.status === 'PENDING');
  const bounds = geo.fix && game ? boundsState(geo.fix, game.center, game.radiusM) : null;
  const outside = !!bounds && !bounds.inside && live;
  useEffect(() => {
    const p = prev.current;
    if (info && p.phase && p.phase !== info.phase) buzz(info.phase === 'HUNT' ? 'urgent' : 'alert');
    if (incoming.length > p.incoming) buzz('urgent');
    if (eliminated && p.elim === false) buzz('alert');
    if (ended && p.status && p.status !== game?.status) buzz('success');
    if (outside && !p.out) buzz('alert');
    prev.current = { phase: info?.phase, incoming: incoming.length, elim: eliminated, status: game?.status, out: outside };
  });

  // Finish handoff.
  const finished = useRef(false);
  useEffect(() => {
    if (ended && game && !finished.current) { finished.current = true; onFinished?.(game); }
  }, [ended, game, onFinished]);

  if (raw.loading && !game) return <div className="mh-root mh-center"><div className="mh-kicker">Loading game...</div></div>;
  if (raw.error && !game) return <div className="mh-root mh-center"><p className="mh-error" role="alert">{String(raw.error?.message ?? raw.error)}</p></div>;
  if (!game || !info) return <div className="mh-root mh-center"><p>Game not found.</p></div>;

  const doStop = async () => {
    setLeaving(true); // stop GPS immediately; the server ends the round for everyone
    try { await api.emergencyStop(gameId); } catch (e) { setLeaving(false); throw e; }
    buzz('urgent');
  };
  const doLeave = async () => {
    setLeaving(true); // stop watching and sending immediately, before the server answers
    await api.leaveGame(gameId);
    onLeft?.();
  };

  if (ended && !onFinished) return <div className="mh-root mh-center"><ResultPanel game={game} myRole={myRole} /></div>;

  const runners = players.filter((p: { role: string; status: string }) => p.role === 'RUNNER' && p.status === 'ACTIVE');
  const hunters = players.filter((p: { role: string }) => p.role === 'HUNTER');
  const markers: MapMarker[] = myRole === 'HUNTER' && info.huntersReleased
    ? snapshots.map((s) => ({ id: s.playerId, label: players.find((p: { id: string }) => p.id === s.playerId)?.name ?? 'Runner', lat: s.lat, lng: s.lng, accuracyM: s.accuracyM, recordedAtMs: s.recordedAtMs }))
    : [];
  const canTag = myRole === 'HUNTER' && myActive && info.phase === 'HUNT';
  const blockedReason = myRole !== 'HUNTER' ? null : info.phase === 'HEAD_START' ? 'Hunters are not released yet.' : !myActive ? 'You are not in play.' : info.phase !== 'HUNT' ? 'Tagging is not open.' : null;
  const lastSnap = markers.length ? Math.max(...snapshots.map((s) => s.releasedAtMs)) : null;

  return (
    <div className={`mh-root mh-role-${(myRole ?? 'none').toLowerCase()}`} data-testid="play-screen">
      {!visible && live && <BackgroundBanner />}
      {live && <GeoBanner permission={geo.permission} grade={geo.grade} accuracyM={geo.fix?.accuracyM} online={geo.online} queued={geo.queued} />}
      {outside && bounds && (
        <div className="mh-banner mh-banner-danger" role="alert" data-testid="out-of-bounds">
          Out of bounds! Head back {Math.round(bounds.outsideByM)} m toward the centre.
        </div>
      )}
      {info.phase === 'HUNT' && info.huntersReleased && myRole && <ReleasedBanner role={myRole} />}
      {!clock.synced && live && <div className="mh-tiny">Syncing clock...</div>}

      {info.phase === 'COUNTDOWN' && <CountdownOverlay info={info} role={myRole} />}
      {info.phase !== 'COUNTDOWN' && !ended && <PhaseHud info={info} role={myRole} />}

      <ArenaMap center={game.center} radiusM={game.radiusM} own={geo.fix} markers={markers} nowMs={serverNow} outside={outside} />

      {myRole === 'HUNTER' && info.huntersReleased && (
        <div className="mh-tiny" data-testid="snapshot-note">
          {markers.length
            ? `Runner dots are the last positions the server released${lastSnap ? ` (${Math.round((serverNow - lastSnap) / 1000)}s ago)` : ''}, not live.`
            : 'No runner positions released yet. They appear here at each server snapshot.'}
        </div>
      )}
      {myRole === 'RUNNER' && myActive && info.phase === 'HEAD_START' && <div className="mh-tiny">Head start! Hunters are frozen for {Math.ceil((info.phaseRemainingMs ?? 0) / 1000)}s. Run.</div>}

      {!ended && eliminated && <SpectatorPanel />}
      {!ended && myRole === 'RUNNER' && myActive && <RunnerTagPanel incoming={incoming} hunters={hunters} onConfirm={async (id) => { await api.acknowledgeTag(id); buzz('success'); }} />}
      {!ended && myRole === 'HUNTER' && myActive && info.phase !== 'COUNTDOWN' && (
        <HunterTagPanel
          runners={runners} myPending={myPending} canTag={canTag} blockedReason={blockedReason}
          confirmWindowS={game.tagConfirmWindowS} nowMs={serverNow}
          onSubmit={async (tagId, runnerId) => { await api.submitTag(tagId, gameId, runnerId); buzz('tick'); }}
          onWithdraw={async (id) => { await api.withdrawTag(id); }}
        />
      )}
      {ended && <ResultPanel game={game} myRole={myRole} />}

      {!ended && (
        <div className="mh-safety-bar">
          <LeaveButton onLeave={doLeave} />
          <EmergencyStopButton onStop={doStop} />
        </div>
      )}
    </div>
  );
}

export default PlayScreen;
