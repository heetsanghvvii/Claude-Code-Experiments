import { requireNativeModule } from 'expo';

export type InstalledApp = { id: string; name: string };

/** 'accessibility' (default, recommended) or 'usage' (Usage access fallback). Android only. */
export type BlockMode = 'accessibility' | 'usage';

export type Diagnostics = {
  accessibilityEnabled: boolean;
  usageAccessGranted: boolean;
  overlayGranted: boolean;
  batteryOptimizationIgnored: boolean;
  manufacturer: string;
  brand: string;
  model: string;
  /** Android API level (iOS: major OS version). */
  sdk: number;
  mode: BlockMode;
  strictMode: boolean;
  /** The blocking service for the current mode is running right now. */
  serviceAlive: boolean;
  /** Epoch ms of the last sign of life from the blocking service, 0 if never. */
  lastHeartbeat: number;
  /** Permissions for the current mode are on AND its service is running (when it should be). */
  blockingHealthy: boolean;
  /** false when strict mode is compiled out (Play builds). */
  strictModeAvailable: boolean;
};

type AppBlockerNative = {
  /** Mode aware: accessibility service on, or usage access plus overlay in usage mode. */
  hasPermission(): Promise<boolean>;
  /** Opens the next settings screen the current mode needs. */
  requestPermission(): Promise<boolean>;
  // Android: returns launchable apps. iOS: returns [] (use pickApps).
  getInstalledApps(): Promise<InstalledApp[]>;
  // Android: set package names to block. iOS: no-op.
  setBlockedApps(ids: string[]): void;
  // iOS: shows the system app picker, returns count selected. Android: returns -1.
  pickApps(): Promise<number>;
  setBlocking(on: boolean): void;
  isBlocking(): boolean;

  setMode(mode: BlockMode): void;
  getMode(): BlockMode;
  /** Direct APK builds only. Play policy forbids it (see FocusAccessibilityService.kt). */
  setStrictMode(on: boolean): void;
  getStrictMode(): boolean;

  getDiagnostics(): Promise<Diagnostics>;
  requestAccessibility(): Promise<boolean>;
  requestUsageAccess(): Promise<boolean>;
  requestOverlay(): Promise<boolean>;
  requestIgnoreBatteryOptimization(): Promise<boolean>;
  /** Opens Nope's App info page (for "Allow restricted settings"). */
  openAppDetails(): Promise<boolean>;
};

export default requireNativeModule<AppBlockerNative>('AppBlocker');
