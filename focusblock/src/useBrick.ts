import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import AppBlocker, { InstalledApp } from '../modules/app-blocker';
import { readTagToken, writeTagToken } from './nfc';
import * as store from './storage';

export function useBrick() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [iosCount, setIosCount] = useState(0);
  const [on, setOn] = useState(false);
  const [perm, setPerm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [stats, setStats] = useState<store.Stats>({ todayMs: 0, streak: 0 });
  const [emergencyLeft, setEmergencyLeft] = useState(store.MAX_EMERGENCY_PER_DAY);

  const refreshPerm = useCallback(async () => setPerm(await AppBlocker.hasPermission()), []);
  const refreshStats = useCallback(async () => setStats(store.computeStats(await store.getSessions())), []);
  const refreshEmergency = useCallback(async () => setEmergencyLeft(await store.getEmergencyRemaining()), []);

  useEffect(() => {
    (async () => {
      setTokenState(await store.getToken());
      const ids = await store.getBlockedApps();
      if (ids.length) {
        setBlocked(ids);
        AppBlocker.setBlockedApps(ids);
      }
      const blocking = AppBlocker.isBlocking();
      setOn(blocking);
      // Reconcile a session left open by a killed app.
      if (blocking) await store.startSession();
      else await store.endSession();
      setOnboarded(await store.isOnboarded());
      await Promise.all([refreshPerm(), refreshStats(), refreshEmergency()]);
      setReady(true);
    })();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') { refreshPerm(); refreshStats(); refreshEmergency(); }
    });
    return () => sub.remove();
  }, [refreshPerm, refreshStats, refreshEmergency]);

  // Tick the live stats while locked.
  useEffect(() => {
    if (!on) return;
    const id = setInterval(refreshStats, 30000);
    return () => clearInterval(id);
  }, [on, refreshStats]);

  const setBlocking = async (v: boolean) => {
    AppBlocker.setBlocking(v);
    setOn(v);
    if (v) await store.startSession();
    else await store.endSession();
    refreshStats();
  };

  const requestPermission = async () => { await AppBlocker.requestPermission(); refreshPerm(); };

  const pair = async () => {
    setBusy(true);
    try {
      const t = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await writeTagToken(t);
      await store.setToken(t);
      setTokenState(t);
      Alert.alert('Paired', 'This sticker is now your Brick.');
    } catch {
      Alert.alert('Pair failed', 'Hold the sticker to the back of your phone and try again.');
    } finally {
      setBusy(false);
    }
  };

  const tap = async () => {
    if (!token) return Alert.alert('Pair a sticker first');
    if (!perm) return Alert.alert('Allow blocking first');
    setBusy(true);
    try {
      const t = await readTagToken();
      if (t === token) await setBlocking(!on);
      else Alert.alert('Wrong sticker', 'This is not your Brick.');
    } catch {
      /* cancelled */
    } finally {
      setBusy(false);
    }
  };

  const chooseApps = async () => {
    if (Platform.OS === 'ios') {
      if (!perm) return Alert.alert('Allow blocking first');
      setIosCount(await AppBlocker.pickApps());
    } else {
      setApps(await AppBlocker.getInstalledApps());
      setPickerOpen(true);
    }
  };

  const toggleApp = async (id: string) => {
    const next = blocked.includes(id) ? blocked.filter((x) => x !== id) : [...blocked, id];
    setBlocked(next);
    AppBlocker.setBlockedApps(next);
    await store.setBlockedApps(next);
  };

  const emergencyUnlock = async () => {
    if (!(await store.useEmergencyUnlock())) {
      refreshEmergency();
      return Alert.alert('No emergency unlocks left today');
    }
    await setBlocking(false);
    refreshEmergency();
  };

  const finishOnboarding = async () => { await store.setOnboarded(); setOnboarded(true); };

  const devPair = async () => { await store.setToken('test'); setTokenState('test'); };

  return {
    ready, onboarded, token, on, perm, busy, stats, emergencyLeft,
    appCount: Platform.OS === 'ios' ? iosCount : blocked.length,
    pickerOpen, setPickerOpen, apps, blocked,
    requestPermission, pair, tap, chooseApps, toggleApp, setBlocking,
    emergencyUnlock, finishOnboarding, devPair,
  };
}

export type Brick = ReturnType<typeof useBrick>;
