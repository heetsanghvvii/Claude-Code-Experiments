// Safety/location consent is remembered per account on this device. The version bump re-asks on copy changes.
const VERSION = 'v1';
const key = (uid: string) => `manhunt.consent.${VERSION}.${uid}`;

export function hasConsented(uid: string): boolean {
  try {
    return localStorage.getItem(key(uid)) === 'yes';
  } catch {
    return false;
  }
}
export function giveConsent(uid: string): void {
  try {
    localStorage.setItem(key(uid), 'yes');
  } catch {
    /* storage blocked: consent is asked again next time */
  }
}
