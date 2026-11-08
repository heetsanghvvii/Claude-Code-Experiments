import { useCallback, useEffect, useState } from 'react';
import {
  Alert, AppState, FlatList, Modal, Platform, Pressable, SafeAreaView,
  StyleSheet, Switch, Text, View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import AppBlocker, { InstalledApp } from './modules/app-blocker';

const TOKEN_KEY = 'brick.token';
const APPS_KEY = 'brick.apps';

NfcManager.start().catch(() => {});

async function readTagToken(): Promise<string | null> {
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

async function writeTagToken(token: string) {
  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);
    const bytes = Ndef.encodeMessage([Ndef.textRecord(token)]);
    if (!bytes) throw new Error('encode failed');
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [iosCount, setIosCount] = useState(0);
  const [on, setOn] = useState(false);
  const [perm, setPerm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [apps, setApps] = useState<InstalledApp[]>([]);

  const refreshPerm = useCallback(async () => setPerm(await AppBlocker.hasPermission()), []);

  useEffect(() => {
    (async () => {
      setToken(await AsyncStorage.getItem(TOKEN_KEY));
      const saved = await AsyncStorage.getItem(APPS_KEY);
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        setBlocked(ids);
        AppBlocker.setBlockedApps(ids);
      }
      setOn(AppBlocker.isBlocking());
      refreshPerm();
    })();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refreshPerm());
    return () => sub.remove();
  }, [refreshPerm]);

  const setBlocking = (v: boolean) => {
    AppBlocker.setBlocking(v);
    setOn(v);
  };

  const pair = async () => {
    setBusy(true);
    try {
      const t = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await writeTagToken(t);
      await AsyncStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      Alert.alert('Paired', 'This sticker is now your Brick.');
    } catch (e) {
      Alert.alert('Pair failed', 'Hold the sticker to the back of your phone and try again.');
    } finally {
      setBusy(false);
    }
  };

  const tap = async () => {
    if (!token) return Alert.alert('Pair a sticker first');
    if (!perm) return Alert.alert('Allow blocking first');
    setBusy(true);
    try {
      const t = await readTagToken();
      if (t === token) setBlocking(!on);
      else Alert.alert('Wrong sticker', 'This is not your Brick.');
    } catch {
      /* cancelled */
    } finally {
      setBusy(false);
    }
  };

  const chooseApps = async () => {
    if (Platform.OS === 'ios') {
      if (!perm) return Alert.alert('Allow blocking first');
      setIosCount(await AppBlocker.pickApps());
    } else {
      setApps(await AppBlocker.getInstalledApps());
      setPickerOpen(true);
    }
  };

  const toggleApp = async (id: string) => {
    const next = blocked.includes(id) ? blocked.filter((x) => x !== id) : [...blocked, id];
    setBlocked(next);
    AppBlocker.setBlockedApps(next);
    await AsyncStorage.setItem(APPS_KEY, JSON.stringify(next));
  };

  const appCount = Platform.OS === 'ios' ? iosCount : blocked.length;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="light" />
      <Text style={s.title}>FocusBlock</Text>

      <Pressable style={[s.big, on && s.bigOn]} onPress={tap} disabled={busy}>
        <Text style={s.bigText}>{busy ? 'Hold near sticker...' : on ? 'LOCKED' : 'UNLOCKED'}</Text>
        <Text style={s.sub}>Tap to scan your Brick</Text>
      </Pressable>

      <View style={s.card}>
        <Row label="1. Allow blocking" value={perm ? 'Done' : 'Allow'} onPress={async () => { await AppBlocker.requestPermission(); refreshPerm(); }} done={perm} />
        <Row label="2. Choose apps" value={appCount ? `${appCount} chosen` : 'Choose'} onPress={chooseApps} done={appCount > 0} />
        <Row label="3. Pair sticker" value={token ? 'Re-pair' : 'Pair'} onPress={pair} done={!!token} />
      </View>

      {__DEV__ && (
        <View style={s.card}>
          <Row label="Test: pair without sticker" value={token === 'test' ? 'Paired' : 'Pair'} done={token === 'test'} onPress={async () => { await AsyncStorage.setItem(TOKEN_KEY, 'test'); setToken('test'); }} />
          <Row label="Test: simulate tap" value={on ? 'Unlock' : 'Lock'} done={false} onPress={() => { if (!perm) return Alert.alert('Allow blocking first'); setBlocking(!on); }} />
        </View>
      )}

      <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <SafeAreaView style={s.root}>
          <Text style={s.title}>Apps to block</Text>
          <FlatList
            data={apps}
            keyExtractor={(a) => a.id}
            renderItem={({ item }) => (
              <View style={s.appRow}>
                <Text style={s.appName}>{item.name}</Text>
                <Switch value={blocked.includes(item.id)} onValueChange={() => toggleApp(item.id)} />
              </View>
            )}
          />
          <Pressable style={s.done} onPress={() => setPickerOpen(false)}>
            <Text style={s.bigText}>Done</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Row({ label, value, onPress, done }: { label: string; value: string; onPress: () => void; done: boolean }) {
  return (
    <Pressable style={s.row} onPress={onPress}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, done && s.rowDone]}>{value}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#111', padding: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 20 },
  big: { height: 220, borderRadius: 28, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  bigOn: { backgroundColor: '#b3261e' },
  bigText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  sub: { color: '#aaa', marginTop: 6 },
  card: { backgroundColor: '#1c1c1c', borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#333' },
  rowLabel: { color: '#fff', fontSize: 16 },
  rowValue: { color: '#6aa9ff', fontSize: 16 },
  rowDone: { color: '#5ac86f' },
  testRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  appRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  appName: { color: '#fff', fontSize: 16 },
  done: { backgroundColor: '#2a2a2a', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
});
