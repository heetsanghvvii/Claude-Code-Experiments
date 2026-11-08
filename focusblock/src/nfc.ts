import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

NfcManager.start().catch(() => {});

export async function readTagToken(): Promise<string | null> {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
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
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const bytes = Ndef.encodeMessage([Ndef.textRecord(token)]);
    if (!bytes) throw new Error('encode failed');
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}
