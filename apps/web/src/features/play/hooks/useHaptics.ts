export type Buzz = 'tick' | 'alert' | 'success' | 'urgent';
const PATTERNS: Record<Buzz, number | number[]> = {
  tick: 30,
  alert: [120, 60, 120],
  success: [60, 40, 200],
  urgent: [300, 100, 300, 100, 300],
};
export function buzz(kind: Buzz): void {
  try { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(PATTERNS[kind]); } catch { /* unsupported */ }
}
