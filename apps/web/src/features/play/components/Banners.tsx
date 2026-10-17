import type { GeoPermission } from '../hooks/useGeolocationSharing';
import type { AccuracyGrade } from '../lib/queue';

export function BackgroundBanner() {
  return (
    <div className="mh-banner mh-banner-danger" role="alert">
      <b>Location sharing paused.</b> The app is in the background. Come back to this screen to keep playing.
    </div>
  );
}

export function GeoBanner({ permission, grade, accuracyM, online, queued }: { permission: GeoPermission; grade: AccuracyGrade | null; accuracyM?: number; online: boolean; queued: number }) {
  if (permission === 'denied')
    return <div className="mh-banner mh-banner-danger" role="alert"><b>Location blocked.</b> Allow location for this site in your browser settings, then reload. You cannot play without it.</div>;
  if (permission === 'unavailable')
    return <div className="mh-banner mh-banner-warn" role="alert"><b>No GPS signal.</b> Move to open sky. Indoors it will not work.</div>;
  if (permission === 'error')
    return <div className="mh-banner mh-banner-warn" role="status">GPS timed out. Retrying...</div>;
  return (
    <>
      {grade === 'weak' && <div className="mh-banner mh-banner-warn" role="status">Weak GPS (about {Math.round(accuracyM ?? 0)} m). Tags may not be confirmed by GPS here.</div>}
      {grade === 'hopeless' && <div className="mh-banner mh-banner-warn" role="status">GPS is too inaccurate ({Math.round(accuracyM ?? 0)} m); readings are not being sent.</div>}
      {!online && <div className="mh-banner mh-banner-warn" role="status">Offline. {queued} reading{queued === 1 ? '' : 's'} waiting (stale ones are dropped after 25 s).</div>}
    </>
  );
}
