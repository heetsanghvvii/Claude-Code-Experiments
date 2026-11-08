import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'brick.settings';

export type Settings = { blockBrowsers: boolean };
const DEFAULTS: Settings = { blockBrowsers: false };

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [settingsLoaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        /* use defaults */
      }
      setLoaded(true);
    })();
  }, []);

  const setBlockBrowsers = useCallback((v: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, blockBrowsers: v };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return { settings, settingsLoaded, setBlockBrowsers };
}
