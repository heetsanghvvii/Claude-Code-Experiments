import { useEffect, useRef, useState } from 'react';
import * as api from '../../../lib/api';
import { gradeAccuracy, HOPELESS_ACCURACY_M, pruneQueue, SEND_INTERVAL_MS, shouldEnqueue, type AccuracyGrade, type QueuedReading } from '../lib/queue';

export type GeoPermission = 'unknown' | 'granted' | 'denied' | 'unavailable' | 'error';

export interface Fix { lat: number; lng: number; accuracyM: number; atMs: number }

export interface SharingOptions {
  gameId: string;
  /** Watch the position (own dot, countdown phase included). */
  watch: boolean;
  /** Also upload readings (ACTIVE game and ACTIVE player only). */
  send: boolean;
  /** Server-corrected clock, epoch ms. */
  serverNow: () => number;
  /** Page foreground state; no uploading while backgrounded. */
  visible: boolean;
  maxAccuracyM: number;
  /** Injection point for tests. */
  sender?: (gameId: string, r: QueuedReading) => Promise<unknown>;
}

const defaultSender = (gameId: string, r: QueuedReading) =>
  api.recordLocation(gameId, {
    lat: r.lat, lng: r.lng, accuracyM: r.accuracyM,
    recordedAt: new Date(r.recordedAtMs).toISOString(),
    isMocked: r.isMocked,
  } as Parameters<typeof api.recordLocation>[1]);

export function useGeolocationSharing(o: SharingOptions) {
  const [fix, setFix] = useState<Fix | null>(null);
  const [permission, setPermission] = useState<GeoPermission>('unknown');
  const [grade, setGrade] = useState<AccuracyGrade | null>(null);
  const [queued, setQueued] = useState(0);
  const [lastSentMs, setLastSentMs] = useState<number | null>(null);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));

  const queue = useRef<QueuedReading[]>([]);
  const lastEnq = useRef<number | null>(null);
  const flushing = useRef(false);
  const live = useRef(o);
  live.current = o;

  useEffect(() => {
    const up = () => setOnline(true), down = () => setOnline(false);
    window.addEventListener('online', up); window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // Watch position.
  useEffect(() => {
    if (!o.watch) { queue.current = []; setQueued(0); lastEnq.current = null; return; }
    if (!('geolocation' in navigator)) { setPermission('unavailable'); return; }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setPermission('granted');
        const cur = live.current;
        const now = cur.serverNow();
        const offset = now - Date.now();
        const f: Fix = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracyM: pos.coords.accuracy, atMs: pos.timestamp + offset };
        setFix(f);
        const g = gradeAccuracy(f.accuracyM, cur.maxAccuracyM);
        setGrade(g);
        if (!cur.send || !cur.visible || f.accuracyM > HOPELESS_ACCURACY_M) return;
        if (!shouldEnqueue(lastEnq.current, now)) return;
        lastEnq.current = now;
        queue.current = pruneQueue([...queue.current, {
          lat: f.lat, lng: f.lng, accuracyM: f.accuracyM, recordedAtMs: f.atMs,
          isMocked: !!(pos as unknown as { mocked?: boolean }).mocked,
        }], now);
        setQueued(queue.current.length);
      },
      (err) => setPermission(err.code === 1 ? 'denied' : err.code === 2 ? 'unavailable' : 'error'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [o.watch]);

  // Flush loop.
  useEffect(() => {
    if (!o.send) { queue.current = []; setQueued(0); return; }
    const flush = async () => {
      const cur = live.current;
      if (flushing.current || !cur.send || !cur.visible) return;
      flushing.current = true;
      try {
        queue.current = pruneQueue(queue.current, cur.serverNow());
        while (queue.current.length && live.current.send) {
          const r = queue.current[0]!;
          if (cur.serverNow() - r.recordedAtMs > 25_000) { queue.current = pruneQueue(queue.current, cur.serverNow()); continue; }
          try {
            await (cur.sender ?? defaultSender)(cur.gameId, r);
          } catch {
            break; // offline / transient: keep for next tick (will be pruned if stale)
          }
          queue.current = queue.current.slice(1);
          setLastSentMs(Date.now());
        }
      } finally {
        flushing.current = false;
        setQueued(queue.current.length);
      }
    };
    const t = setInterval(() => void flush(), SEND_INTERVAL_MS / 2);
    window.addEventListener('online', flush);
    return () => { clearInterval(t); window.removeEventListener('online', flush); };
  }, [o.send]);

  return { fix: o.watch ? fix : null, permission, grade, queued, lastSentMs, online };
}
