import { TEST_MODE } from '../testMode';
import { useState } from 'react';
import { Alert, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Brick } from '../useBrick';
import { MAX_EMERGENCY_PER_DAY } from '../storage';
import { formatDuration } from '../format';
import { HoldButton } from '../components/HoldButton';
import { Row } from '../components/Row';
import { PermissionExplainer } from './PermissionExplainer';
import { SetupDoctor } from './SetupDoctor';
import { WeeklyCard } from './WeeklyCard';
import { openSupport } from '../support';
import { c, g } from '../theme';

const HOLD_SECONDS = 10;
// Status colours for the health line only. Kept local so src/theme.ts stays owned by brand work.
const GOOD = '#4CC38A';
const WARN = '#F2B33D';

export function Home({ b }: { b: Brick }) {
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);

  // Real blocking state, not just the saved flag. On iOS Screen Time does the work, so the
  // permission is the best signal we have.
  const healthy = Platform.OS === 'android' ? (b.diag ? b.diag.blockingHealthy : b.perm) : b.perm;
  const allowBlocking = () => (b.mode === 'usage' ? b.requestPermission() : setExplaining(true));

  const rePair = () => {
    if (!b.token) return b.pair();
    Alert.alert('Pair a new puck?', 'Pairing a new puck gives you a new backup code. Your old puck and old code will stop working.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Pair new puck', onPress: b.pair },
    ]);
  };

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
      <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={g.title}>Nope</Text>

      {!healthy && (b.on || b.token) ? (
        <Pressable style={s.warn} onPress={() => setDoctorOpen(true)} accessibilityRole="button">
          <Text style={s.warnTitle}>{b.on ? 'Blocking is not active' : 'Blocking is switched off'}</Text>
          <Text style={s.warnBody}>
            {b.on
              ? 'Your apps are NOT being blocked right now. Your phone may have switched Nope off. Tap to fix.'
              : 'Nope cannot block apps until this is fixed. Tap to fix.'}
          </Text>
        </Pressable>
      ) : null}

      <Pressable style={[s.big, b.on && (healthy ? s.bigOn : s.bigWarn)]} onPress={b.tap} disabled={b.busy}>
        <Text style={[g.bigText, b.on && healthy && { color: c.onAccent }]}>
          {b.busy ? 'Hold near your puck...' : b.on ? (healthy ? 'LOCKED' : 'LOCKED, NOT BLOCKING') : 'UNLOCKED'}
        </Text>
        <Text style={[g.sub, b.on && healthy && { color: c.onAccent }]}>
          {b.busy ? 'Keep the back of your phone on the puck' : b.on ? 'Tap your phone on the puck to unlock' : 'Tap your phone on the puck to lock'}
        </Text>
      </Pressable>
      {b.busy && (
        <Pressable style={s.lost} onPress={b.cancelScan}>
          <Text style={s.lostText}>Cancel</Text>
        </Pressable>
      )}
      {b.on && healthy && (
        <View style={s.healthRow}>
          <View style={[s.healthDot, { backgroundColor: GOOD }]} />
          <Text style={s.healthText}>Blocking is working</Text>
        </View>
      )}

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
        <Row label="Allow blocking" value={b.perm ? 'Done' : 'Allow'} onPress={allowBlocking} done={b.perm} />
        <Row label="Choose apps" value={b.appCount ? `${b.appCount} chosen` : 'Choose'} onPress={b.chooseApps} done={b.appCount > 0} />
        <Row label="Puck" value={b.token ? 'Re-pair' : 'Pair'} onPress={rePair} done={!!b.token} />
        <Row label="Setup doctor" value={healthy ? 'All good' : 'Check'} onPress={() => setDoctorOpen(true)} done={healthy} />
        <Row label="Your week" value="View" onPress={() => setWeekOpen(true)} done={false} />
        <Row label="Help" value="Message us" onPress={() => openSupport()} done={false} />
      </View>

      {b.showRescueHint && (
        <Pressable style={s.hint} onPress={() => b.setRescueOpen(true)}>
          <Text style={s.hintText}>Locked for a while and cannot find your puck? Tap here for help.</Text>
        </Pressable>
      )}

      <Pressable style={s.lost} onPress={() => b.setRescueOpen(true)}>
        <Text style={s.lostText}>Lost my puck?</Text>
      </Pressable>

      {b.on && (
        <Pressable style={s.emergency} onPress={() => (b.emergencyLeft > 0 ? setEmergencyOpen(true) : Alert.alert('No emergency unlocks left today'))}>
          <Text style={s.emergencyText}>Emergency unlock</Text>
          <Text style={s.emergencySub}>{b.emergencyLeft} of {MAX_EMERGENCY_PER_DAY} left today</Text>
        </Pressable>
      )}

      {TEST_MODE && (
        <View style={g.card}>
          <Row label="Test: pair without sticker" value={b.token === 'test' ? 'Paired' : 'Pair'} done={b.token === 'test'} onPress={b.devPair} />
          <Row label="Test: simulate tap" value={b.on ? 'Unlock' : 'Lock'} done={false} onPress={() => { if (!b.perm) return Alert.alert('Allow blocking first'); b.setBlocking(!b.on); }} />
        </View>
      )}

      </ScrollView>

      <SetupDoctor b={b} visible={doctorOpen} onClose={() => setDoctorOpen(false)} />
      <WeeklyCard visible={weekOpen} onClose={() => setWeekOpen(false)} />

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
  bigWarn: { backgroundColor: c.card, borderWidth: 2, borderColor: WARN },
  warn: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: WARN },
  warnTitle: { color: WARN, fontSize: 17, fontWeight: '800' },
  warnBody: { color: c.text, marginTop: 4, lineHeight: 20 },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -6, marginBottom: 16 },
  healthDot: { width: 10, height: 10, borderRadius: 5 },
  healthText: { color: c.dim },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  stat: { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 16 },
  statNum: { color: c.text, fontSize: 24, fontWeight: '700' },
  statLabel: { color: c.dim, marginTop: 4 },
  emergency: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center' },
  emergencyText: { color: c.danger, fontSize: 16, fontWeight: '700' },
  emergencySub: { color: c.dim, marginTop: 4 },
  hint: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: c.link },
  hintText: { color: c.text, lineHeight: 20 },
  lost: { alignItems: 'center', paddingVertical: 10, marginBottom: 8 },
  lostText: { color: c.link, fontSize: 15, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.card, padding: 20, paddingBottom: 36, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
});
