// ONE PLACE TO EDIT: apps users should not lock themselves out of.
// level 'never'  = can never be selected (disabled, "Always allowed for safety").
// level 'warn'   = tagged "Keep reachable", selectable after a confirm dialog.

export type EssentialLevel = 'never' | 'warn';
export type Essential = { id: string; label: string; level: EssentialLevel };

// Package name of the Nope app itself (matches app.json android.package).
export const SELF_PACKAGE = 'com.yourname.focusblock';

export const ESSENTIALS: Essential[] = [
  // Phone and emergency: never blockable.
  { id: 'com.google.android.dialer', label: 'Phone', level: 'never' },
  { id: 'com.android.dialer', label: 'Phone', level: 'never' },
  { id: 'com.samsung.android.dialer', label: 'Phone', level: 'never' },
  { id: 'com.android.phone', label: 'Phone (system)', level: 'never' },
  { id: 'com.android.emergency', label: 'Emergency info', level: 'never' },
  { id: SELF_PACKAGE, label: 'Nope', level: 'never' },
  // Messages
  { id: 'com.google.android.apps.messaging', label: 'Messages', level: 'warn' },
  { id: 'com.samsung.android.messaging', label: 'Messages', level: 'warn' },
  // WhatsApp
  { id: 'com.whatsapp', label: 'WhatsApp', level: 'warn' },
  { id: 'com.whatsapp.w4b', label: 'WhatsApp Business', level: 'warn' },
  // UPI and payments
  { id: 'com.google.android.apps.nbu.paisa.user', label: 'Google Pay', level: 'warn' },
  { id: 'com.phonepe.app', label: 'PhonePe', level: 'warn' },
  { id: 'net.one97.paytm', label: 'Paytm', level: 'warn' },
  { id: 'in.org.npci.upiapp', label: 'BHIM', level: 'warn' },
  { id: 'com.dreamplug.androidapp', label: 'CRED', level: 'warn' },
  // Maps
  { id: 'com.google.android.apps.maps', label: 'Maps', level: 'warn' },
];

const byId = new Map(ESSENTIALS.map((e) => [e.id, e]));
export const getEssential = (id: string) => byId.get(id);
export const isNeverBlockable = (id: string) => byId.get(id)?.level === 'never';

// Used when "Also block web browsers" is ON.
export const BROWSER_PACKAGES = [
  'com.android.chrome',
  'org.mozilla.firefox',
  'com.sec.android.app.sbrowser',
  'com.microsoft.emmx',
  'com.brave.browser',
  'com.opera.browser',
  'com.UCMobile.intl',
];

/** Final list for AppBlocker.setBlockedApps. Never includes never-blockable apps. */
export function buildBlockedList(ids: string[], blockBrowsers: boolean): string[] {
  const all = blockBrowsers ? [...ids, ...BROWSER_PACKAGES] : ids;
  return Array.from(new Set(all)).filter((id) => !isNeverBlockable(id));
}
