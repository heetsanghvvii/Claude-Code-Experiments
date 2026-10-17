import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceGame, fetchEvents, fetchGame, fetchPlayers, fetchSnapshots, fetchTags, subscribeToGame } from './api';
import { friendlyError } from './errors';
import type { GameEventRow, GameRow, LobbyPlayer, SnapshotRow, TagRow } from './types';

export interface UseGameOptions {
  /** Load released location snapshots (hunters / the runner's own). Default false. */
  withSnapshots?: boolean;
  /** How often to ask the server to advance the game clock while live. Default 8s. */
  tickMs?: number;
}

/**
 * Live view of one game. Loads game + players (+ profiles), tags and events (and snapshots on request),
 * refetches on realtime changes, polls `advance_game` while the game is live, and recovers after the
 * device goes offline or the tab/app returns to the foreground.
 */
export function useGame(gameId: string | undefined, opts: UseGameOptions = {}) {
  const { withSnapshots = false, tickMs = 8_000 } = opts;
  const [game, setGame] = useState<GameRow | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [tags, setTags] = useState<TagRow[]>([]);
  const [events, setEvents] = useState<GameEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [realtimeUp, setRealtimeUp] = useState(false);
  const busy = useRef(false);
  const again = useRef(false);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    if (!gameId) return;
    if (busy.current) {
      again.current = true; // coalesce: one more pass after the current one
      return;
    }
    busy.current = true;
    try {
      do {
        again.current = false;
        const [g, p, t, e, s] = await Promise.all([
          fetchGame(gameId),
          fetchPlayers(gameId),
          fetchTags(gameId),
          fetchEvents(gameId),
          withSnapshots ? fetchSnapshots(gameId) : Promise.resolve([] as SnapshotRow[]),
        ]);
        if (!alive.current) return;
        setGame(g);
        setPlayers(p);
        setTags(t);
        setEvents(e);
        setSnapshots(s);
        setError(null);
        setLoading(false);
      } while (again.current);
    } catch (err) {
      if (alive.current) {
        setError(friendlyError(err));
        setLoading(false);
      }
    } finally {
      busy.current = false;
    }
  }, [gameId, withSnapshots]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Initial load + realtime. Channel errors resubscribe with backoff; every (re)subscribe refetches.
  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    void refresh();
    let unsub: (() => void) | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;
    let stopped = false;
    const connect = () => {
      unsub?.();
      unsub = subscribeToGame(
        gameId,
        () => void refresh(),
        (s) => {
          if (stopped) return;
          if (s === 'SUBSCRIBED') {
            attempt = 0;
            setRealtimeUp(true);
            void refresh(); // catch anything missed while disconnected
          } else {
            setRealtimeUp(false);
            if (!retry) {
              retry = setTimeout(() => {
                retry = null;
                if (!stopped) connect();
              }, Math.min(15_000, 1_000 * 2 ** attempt++));
            }
          }
        },
      );
    };
    connect();
    return () => {
      stopped = true;
      if (retry) clearTimeout(retry);
      unsub?.();
    };
  }, [gameId, refresh]);

  // Reconnection handling: refetch when the network returns or the app comes back to the foreground.
  useEffect(() => {
    const up = () => {
      setOnline(true);
      void refresh();
    };
    const down = () => setOnline(false);
    const vis = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [refresh]);

  // Clock tick: any member may advance the server clock; it is idempotent.
  const live = !!game && (game.status === 'LOBBY' || game.status === 'COUNTDOWN' || game.status === 'ACTIVE');
  useEffect(() => {
    if (!gameId || !live) return;
    const tick = () => {
      if (!navigator.onLine) return;
      advanceGame(gameId)
        .then((g) => {
          if (!alive.current) return;
          // Only refetch when the server says something moved.
          setGame((prev) => (prev && prev.version === g.version && prev.status === g.status ? prev : g));
          void refresh();
        })
        .catch((e: unknown) => alive.current && setError(friendlyError(e)));
    };
    const t = setInterval(tick, tickMs);
    return () => clearInterval(t);
  }, [gameId, live, tickMs, refresh]);

  return { game, players, snapshots, tags, events, loading, error, online, realtimeUp, refresh, setError };
}
