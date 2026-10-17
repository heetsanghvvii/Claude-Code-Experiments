import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceGame, fetchGame, fetchPlayers, fetchSnapshots, subscribeToGame } from './api';
import { friendlyError } from './errors';
import type { GameRow, LobbyPlayer, SnapshotRow } from './types';

/**
 * Live view of one game: refetches on realtime changes, and while the game is live also asks the
 * server to advance its clock every `tickMs` (the server ignores ticks that change nothing).
 */
export function useGame(gameId: string | undefined, opts: { withSnapshots?: boolean; tickMs?: number } = {}) {
  const { withSnapshots = false, tickMs = 10_000 } = opts;
  const [game, setGame] = useState<GameRow | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (!gameId || inFlight.current) return;
    inFlight.current = true;
    try {
      const [g, p, s] = await Promise.all([
        fetchGame(gameId),
        fetchPlayers(gameId),
        withSnapshots ? fetchSnapshots(gameId) : Promise.resolve([] as SnapshotRow[]),
      ]);
      setGame(g);
      setPlayers(p);
      setSnapshots(s);
      setError(null);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      inFlight.current = false;
    }
  }, [gameId, withSnapshots]);

  useEffect(() => {
    if (!gameId) return;
    void refresh();
    return subscribeToGame(gameId, () => void refresh());
  }, [gameId, refresh]);

  const live = game && (game.status === 'LOBBY' || game.status === 'COUNTDOWN' || game.status === 'ACTIVE');
  useEffect(() => {
    if (!gameId || !live) return;
    const t = setInterval(() => {
      advanceGame(gameId)
        .then(() => refresh())
        .catch((e: unknown) => setError(friendlyError(e)));
    }, tickMs);
    return () => clearInterval(t);
  }, [gameId, live, tickMs, refresh]);

  return { game, players, snapshots, error, refresh, setError };
}
