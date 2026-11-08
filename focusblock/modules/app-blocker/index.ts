import { requireNativeModule } from 'expo';

export type InstalledApp = { id: string; name: string };

type AppBlockerNative = {
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  // Android: returns launchable apps. iOS: returns [] (use pickApps).
  getInstalledApps(): Promise<InstalledApp[]>;
  // Android: set package names to block. iOS: no-op.
  setBlockedApps(ids: string[]): void;
  // iOS: shows the system app picker, returns count selected. Android: returns -1.
  pickApps(): Promise<number>;
  setBlocking(on: boolean): void;
  isBlocking(): boolean;
};

export default requireNativeModule<AppBlockerNative>('AppBlocker');
