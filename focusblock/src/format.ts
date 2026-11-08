export function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  if (m < 1) return '0m';
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
}
