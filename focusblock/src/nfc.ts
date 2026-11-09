import { Platform } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

NfcManager.start().catch(() => {});

/** How long we wait for the puck before giving up (seconds). */
export const SCAN_TIMEOUT_S = 20;

export type NfcStatus = 'ok' | 'off' | 'unsupported';

/** Plain NFC check. Nope needs NFC to read the puck. */
export async function getNfcStatus(): Promise<NfcStatus> {
  try {
    if (!(await NfcManager.isSupported())) return 'unsupported';
    // iOS has no NFC on/off switch; isEnabled is Android only in practice.
    if (Platform.OS === 'android' && !(await NfcManager.isEnabled())) return 'off';
    return 'ok';
  } catch {
    return 'unsupported';
  }
}

export function openNfcSettings() {
  if (Platform.OS === 'android') NfcManager.goToNfcSetting().catch(() => {});
}

const TIMEOUT_MSG = 'nope-scan-timeout';
/** True if a scan failed because no puck was found in time. */
export const isScanTimeout = (e: unknown) => e instanceof Error && e.message === TIMEOUT_MSG;

/** Stops waiting for a tag (Cancel button). */
export function cancelScan() {
  NfcManager.cancelTechnologyRequest().catch(() => {});
}

async function withTimeout<T>(p: Promise<T>): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined;
  const t = new Promise<never>((_, reject) => {
    id = setTimeout(() => {
      cancelScan();
      reject(new Error(TIMEOUT_MSG));
    }, SCAN_TIMEOUT_S * 1000);
  });
  try {
    return await Promise.race([p, t]);
  } finally {
    if (id) clearTimeout(id);
  }
}

export async function readTagToken(): Promise<string | null> {
  try {
    await withTimeout(NfcManager.requestTechnology(NfcTech.Ndef));
    const tag = await NfcManager.getTag();
    const rec = tag?.ndefMessage?.[0];
    if (!rec) return null;
    return Ndef.text.decodePayload(Uint8Array.from(rec.payload));
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export async function writeTagToken(token: string) {
  try {
    await withTimeout(NfcManager.requestTechnology(NfcTech.Ndef));
    const bytes = Ndef.encodeMessage([Ndef.textRecord(token)]);
    if (!bytes) throw new Error('encode failed');
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}
