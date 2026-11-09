import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';
import AppBlocker, { BlockMode, Diagnostics, InstalledApp } from '../modules/app-blocker';
import { cancelScan, getNfcStatus, openNfcSettings, readTagToken, isScanTimeout, writeTagToken } from './nfc';
import * as store from './storage';
import * as rescue from './rescue';
import { useSettings } from './useSettings';
import { buildBlockedList } from './essentials';

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
  const { settings, settingsLoaded, setBlockBrowsers } = useSettings();
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [rescueOpen, setRescueOpen] = useState(false);
  const [lockSince, setLockSince] = useState<number | null>(null);
  const [hintTick, setHintTick] = useState(0);
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [stats, setStats] = useState<store.Stats>({ todayMs: 0, streak: 0 });
  const [emergencyLeft, setEmergencyLeft] = useState(store.MAX_EMERGENCY_PER_DAY);
  const [diag, setDiag] = useState<Diagnostics | null>(null);
  const [mode, setModeState] = useState<BlockMode>(() => {
    try { return AppBlocker.getMode(); } catch { return 'accessibility'; }
  });

  /** Real blocking state from the native side (permission, service running, heartbeat). */
  const refreshHealth = useCallback(async () => {
    try {
      const d = await AppBlocker.getDiagnostics();
      setDiag(d);
      setModeState(d.mode);
    } catch {
      setDiag(null);
    }
  }, []);
  const refreshPerm = useCallback(async () => {
    try { setPerm(await AppBlocker.hasPermission()); } catch { setPerm(false); }
    refreshHealth();
  }, [refreshHealth]);
  const refreshStats = useCallback(async () => setStats(store.computeStats(await store.getSessions())), []);
  const refreshEmergency = useCallback(async () => setEmergencyLeft(await store.getEmergencyRemaining()), []);

  useEffect(() => {
    (async () => {
      setTokenState(await store.getToken());
      const ids = await store.getBlockedApps();
      if (ids.length) {
        setBlocked(ids);
      }
      const blocking = AppBlocker.isBlocking();
      setOn(blocking);
      let since = await store.getLockSince();
      if (blocking && since === null) { since = Date.now(); await store.setLockSince(since); }
      if (!blocking && since !== null) { since = null; await store.setLockSince(null); }
      setLockSince(since);
      // Reconcile a session left open by a killed app.
      if (blocking) await store.startSession();
      else await store.endSession();
      setOnboarded(await store.isOnboarded());
      await Promise.all([refreshPerm(), refreshStats(), refreshEmergency()]);
      setReady(true);
    })();
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') { refreshPerm(); refreshStats(); refreshEmergency(); setHintTick((x) => x + 1); }
    });
    return () => sub.remove();
  }, [refreshPerm, refreshStats, refreshEmergency]);

  // Single place blocked apps reach the native blocker (merges browsers when enabled).
  useEffect(() => {
    if (!ready || !settingsLoaded) return;
    AppBlocker.setBlockedApps(buildBlockedList(blocked, settings.blockBrowsers));
  }, [ready, settingsLoaded, blocked, settings.blockBrowsers]);

  // Tick the live stats while locked.
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => { refreshStats(); refreshHealth(); }, 30000);
    return () => clearInterval(id);
  }, [on, refreshStats, refreshHealth]);

  const setBlocking = async (v: boolean) => {
    AppBlocker.setBlocking(v);
    setOn(v);
    const since = v ? Date.now() : null;
    setLockSince(since);
    await store.setLockSince(since);
    if (v) await store.startSession();
    else await store.endSession();
    refreshStats();
    // Give the usage mode service a moment to start before reading its state.
    setTimeout(refreshHealth, 1500);
  };

  const setMode = (m: BlockMode) => {
    AppBlocker.setMode(m);
    setModeState(m);
    refreshPerm();
  };

  /** Returns true if NFC is ready, else explains why not. */
  const checkNfc = async (): Promise<boolean> => {
    const st = await getNfcStatus();
    if (st === 'ok') return true;
    if (st === 'off') {
      Alert.alert('NFC is off', 'Nope needs NFC to read your puck. Turn on NFC in Settings, then try again.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open settings', onPress: openNfcSettings },
      ]);
    } else {
      Alert.alert('This phone has no NFC', 'Nope needs NFC to read the puck, and this phone does not seem to have it. Open Setup doctor on the home screen for details.');
    }
    return false;
  };

  const requestPermission = async () => { await AppBlocker.requestPermission(); refreshPerm(); };

  const pair = async () => {
    if (!(await checkNfc())) return;
    setBusy(true);
    try {
      const t = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await writeTagToken(t);
      await store.setToken(t);
      setTokenState(t);
      setPendingCode(await rescue.createBackupCode());
    } catch (e) {
      if (isScanTimeout(e)) Alert.alert('No puck found', 'Hold the back of your phone flat on the puck and keep still for 2 seconds. Try moving it slowly around the middle of the phone.');
      else Alert.alert('Could not pair', 'Hold the back of your phone against the puck and try again.');
    } finally {
      setBusy(false);
    }
  };

  const tap = async () => {
    if (!token) return Alert.alert('Pair your puck first');
    if (!perm) return Alert.alert('Allow blocking first');
    if (!(await checkNfc())) return;
    setBusy(true);
    try {
      const t = await readTagToken();
      if (t === token) await setBlocking(!on);
      else if (t === null) Alert.alert('Could not read', 'That did not look like a Nope puck. Try again.');
      else Alert.alert('That is not your puck', 'This puck is paired with a different phone.');
    } catch (e) {
      if (isScanTimeout(e)) Alert.alert('No puck found', 'Hold the back of your phone flat on the puck and keep still for 2 seconds.');
      /* otherwise cancelled */
    } finally {
      setBusy(false);
    }
  };

  const chooseApps = async () => {
    if (on) return Alert.alert('Unlock first', 'Unlock with your puck to change which apps are blocked.');
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

  const devPair = async () => {
    await store.setToken('test');
    setTokenState('test');
    setPendingCode(await rescue.createBackupCode());
  };

  const confirmCodeSaved = async () => {
    await rescue.confirmBackupSaved();
    setPendingCode(null);
    Alert.alert('Paired', 'This puck is now your Nope key.');
  };

  /** Called by the rescue screen after a correct backup code. */
  const rescueUnlock = async () => {
    await setBlocking(false);
    refreshEmergency();
  };

  // Re-check the 24 hour hint every minute and when the app wakes.
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setHintTick((x) => x + 1), 60000);
    return () => clearInterval(id);
  }, [on]);
  const showRescueHint = useMemo(
    () => rescue.shouldShowHint(on, lockSince),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [on, lockSince, hintTick],
  );

  return {
    ready, onboarded, token, on, perm, busy, stats, emergencyLeft,
    appCount: Platform.OS === 'ios' ? iosCount : blocked.length,
    pickerOpen, setPickerOpen, apps, blocked, settings, setBlockBrowsers,
    diag, mode, setMode, refreshHealth, refreshPerm, cancelScan,
    requestPermission, pair, tap, chooseApps, toggleApp, setBlocking,
    emergencyUnlock, finishOnboarding, devPair,
    pendingCode, confirmCodeSaved, rescueOpen, setRescueOpen, rescueUnlock, showRescueHint,
  };
}

export type Brick = ReturnType<typeof useBrick>;
