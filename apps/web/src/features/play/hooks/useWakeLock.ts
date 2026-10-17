import { useEffect, useRef, useState } from 'react';

type Sentinel = { release(): Promise<void>; addEventListener(t: 'release', cb: () => void): void };

/** Keeps the screen on while `enabled`. Re-acquires after the tab becomes visible again. */
export function useWakeLock(enabled: boolean): { held: boolean; supported: boolean } {
  const [held, setHeld] = useState(false);
  const sentinel = useRef<Sentinel | null>(null);
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  useEffect(() => {
    if (!enabled || !supported) return;
    let cancelled = false;
    const acquire = async () => {
      if (document.visibilityState !== 'visible' || sentinel.current) return;
      try {
        const s = (await (navigator as unknown as { wakeLock: { request(t: 'screen'): Promise<Sentinel> } }).wakeLock.request('screen'));
        if (cancelled) { void s.release(); return; }
        sentinel.current = s;
        setHeld(true);
        s.addEventListener('release', () => { sentinel.current = null; setHeld(false); });
      } catch {
        setHeld(false); // denied (battery saver etc.)
      }
    };
    const onVis = () => { if (document.visibilityState === 'visible') void acquire(); };
    void acquire();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVis);
      const s = sentinel.current;
      sentinel.current = null;
      if (s) void s.release().catch(() => undefined);
      setHeld(false);
    };
  }, [enabled, supported]);

  return { held, supported };
}

export function usePageVisible(): boolean {
  const [v, setV] = useState(() => typeof document === 'undefined' || document.visibilityState === 'visible');
  useEffect(() => {
    const f = () => setV(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', f);
    return () => document.removeEventListener('visibilitychange', f);
  }, []);
  return v;
}
