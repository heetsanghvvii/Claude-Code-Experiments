import { useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Brick } from '../useBrick';
import { MAX_EMERGENCY_PER_DAY } from '../storage';
import { formatDuration } from '../format';
import { HoldButton } from '../components/HoldButton';
import { Row } from '../components/Row';
import { PermissionExplainer } from './PermissionExplainer';
import { c, g } from '../theme';

const HOLD_SECONDS = 10;

export function Home({ b }: { b: Brick }) {
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [explaining, setExplaining] = useState(false);

  if (explaining) {
    return (
      <PermissionExplainer
        onAllow={() => { setExplaining(false); b.requestPermission(); }}
        onCancel={() => setExplaining(false)}
      />
    );
  }

  return (
    <SafeAreaView style={g.root}>
      <Text style={g.title}>Nope</Text>

      <Pressable style={[s.big, b.on && s.bigOn]} onPress={b.tap} disabled={b.busy}>
        <Text style={g.bigText}>{b.busy ? 'Hold near sticker...' : b.on ? 'LOCKED' : 'UNLOCKED'}</Text>
        <Text style={g.sub}>Tap to scan your Nope</Text>
      </Pressable>

      <View style={s.stats}>
        <View style={s.stat}>
          <Text style={s.statNum}>{formatDuration(b.stats.todayMs)}</Text>
          <Text style={s.statLabel}>Focused today</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statNum}>{b.stats.streak}</Text>
          <Text style={s.statLabel}>Day streak</Text>
        </View>
      </View>

      <View style={g.card}>
        <Row label="Allow blocking" value={b.perm ? 'Done' : 'Allow'} onPress={() => setExplaining(true)} done={b.perm} />
        <Row label="Choose apps" value={b.appCount ? `${b.appCount} chosen` : 'Choose'} onPress={b.chooseApps} done={b.appCount > 0} />
        <Row label="Sticker" value={b.token ? 'Re-pair' : 'Pair'} onPress={b.pair} done={!!b.token} />
      </View>

      {b.on && (
        <Pressable style={s.emergency} onPress={() => (b.emergencyLeft > 0 ? setEmergencyOpen(true) : Alert.alert('No emergency unlocks left today'))}>
          <Text style={s.emergencyText}>Emergency unlock</Text>
          <Text style={s.emergencySub}>{b.emergencyLeft} of {MAX_EMERGENCY_PER_DAY} left today</Text>
        </Pressable>
      )}

      {__DEV__ && (
        <View style={g.card}>
          <Row label="Test: pair without sticker" value={b.token === 'test' ? 'Paired' : 'Pair'} done={b.token === 'test'} onPress={b.devPair} />
          <Row label="Test: simulate tap" value={b.on ? 'Unlock' : 'Lock'} done={false} onPress={() => { if (!b.perm) return Alert.alert('Allow blocking first'); b.setBlocking(!b.on); }} />
        </View>
      )}

      <Modal visible={emergencyOpen} transparent animationType="fade" onRequestClose={() => setEmergencyOpen(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={g.bigText}>Emergency unlock</Text>
            <Text style={[g.sub, { marginBottom: 12 }]}>
              Press and hold for {HOLD_SECONDS} seconds to unlock. {b.emergencyLeft} left today.
            </Text>
            <HoldButton
              seconds={HOLD_SECONDS}
              label={`Hold to unlock (${HOLD_SECONDS}s)`}
              onConfirm={async () => { setEmergencyOpen(false); await b.emergencyUnlock(); }}
            />
            <Pressable style={g.button} onPress={() => setEmergencyOpen(false)}>
              <Text style={g.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  big: { height: 220, borderRadius: 28, backgroundColor: c.btn, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  bigOn: { backgroundColor: c.danger },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 16 },
  statNum: { color: c.text, fontSize: 24, fontWeight: '700' },
  statLabel: { color: c.dim, marginTop: 4 },
  emergency: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center' },
  emergencyText: { color: c.danger, fontSize: 16, fontWeight: '700' },
  emergencySub: { color: c.dim, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.card, padding: 20, paddingBottom: 36, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
});
