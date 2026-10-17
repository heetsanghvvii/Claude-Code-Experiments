export interface LatLng { lat: number; lng: number }

const R = 6371008.8; // mean earth radius, metres
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in metres. */
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface BoundsState {
  distanceM: number;
  /** Metres beyond the edge (0 when inside). */
  outsideByM: number;
  inside: boolean;
}

/**
 * Whether a fix is inside the circular arena. The accuracy radius is NOT used to
 * excuse a player: we only call someone outside when the fix itself is outside.
 */
export function boundsState(pos: LatLng, center: LatLng, radiusM: number): BoundsState {
  const d = distanceM(pos, center);
  const out = Math.max(0, d - radiusM);
  return { distanceM: d, outsideByM: out, inside: out === 0 };
}

/** Closed ring of [lng, lat] points approximating a circle of `radiusM` around `center`. */
export function circleRing(center: LatLng, radiusM: number, steps = 96): [number, number][] {
  const ring: [number, number][] = [];
  const latR = rad(center.lat);
  const angular = radiusM / R;
  for (let i = 0; i <= steps; i++) {
    const brg = (2 * Math.PI * (i % steps)) / steps;
    const lat = Math.asin(Math.sin(latR) * Math.cos(angular) + Math.cos(latR) * Math.sin(angular) * Math.cos(brg));
    const lng =
      rad(center.lng) +
      Math.atan2(Math.sin(brg) * Math.sin(angular) * Math.cos(latR), Math.cos(angular) - Math.sin(latR) * Math.sin(lat));
    ring.push([((lng * 180) / Math.PI + 540) % 360 - 180, (lat * 180) / Math.PI]);
  }
  return ring;
}
