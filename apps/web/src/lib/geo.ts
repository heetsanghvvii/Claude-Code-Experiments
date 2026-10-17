export interface Fix {
  lat: number;
  lng: number;
  accuracyM: number;
}

export function getFix(timeoutMs = 15_000): Promise<Fix> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('This device cannot share its location.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracyM: p.coords.accuracy }),
      (e) =>
        reject(
          new Error(
            e.code === e.PERMISSION_DENIED
              ? 'Location is blocked. Allow location for this site in your browser settings, then try again.'
              : e.code === e.TIMEOUT
                ? 'Could not get a GPS fix in time. Move somewhere with open sky and retry.'
                : 'Could not read your location.',
          ),
        ),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 5_000 },
    );
  });
}
