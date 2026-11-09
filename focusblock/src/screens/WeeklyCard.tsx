import { useEffect, useState } from 'react';
import { Modal, Pressable, SafeAreaView, Share, StyleSheet, Text, View } from 'react-native';
import { computeWeekly, getSessions, Weekly } from '../storage';
import { formatDuration } from '../format';
import { c, g } from '../theme';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayLabel(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return DAY[new Date(y, m - 1, d).getDay()];
}

export function summaryText(w: Weekly): string {
  return [
    'My Nope week',
    `Locked in on ${w.lockDays} of the last 7 days`,
    `Total focus time: ${formatDuration(w.totalMs)}`,
    `Current streak: ${w.streak} ${w.streak === 1 ? 'day' : 'days'}`,
  ].join('\n');
}

/**
 * Opt-in weekly focus card. Reads only local stats. Nothing leaves the phone unless the user
 * taps Share and picks an app themselves.
 */
export function WeeklyCard({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [w, setW] = useState<Weekly | null>(null);

  useEffect(() => {
    if (!visible) return;
    getSessions().then((list) => setW(computeWeekly(list)));
  }, [visible]);

  const max = Math.max(1, ...(w?.days.map((d) => d.ms) ?? [1]));

  const share = () => {
    if (!w) return;
    Share.share({ message: summaryText(w) }).catch(() => {});
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={g.root}>
        <Text style={g.title}>Your week</Text>
        <View style={[g.card, s.pad]}>
          <View style={s.bars}>
            {(w?.days ?? []).map((d) => (
              <View key={d.key} style={s.barCol}>
                <View style={s.barTrack}>
                  <View style={[s.bar, { height: `${Math.round((d.ms / max) * 100)}%` }]} />
                </View>
                <Text style={s.barLabel}>{dayLabel(d.key)}</Text>
              </View>
            ))}
          </View>
          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={s.num}>{w ? w.lockDays : '-'}</Text>
              <Text style={s.label}>Lock days</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.num}>{w ? formatDuration(w.totalMs) : '-'}</Text>
              <Text style={s.label}>Focus time</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.num}>{w ? w.streak : '-'}</Text>
              <Text style={s.label}>Day streak</Text>
            </View>
          </View>
        </View>
        <Text style={s.note}>This stays on your phone. If you want, tap Share to send this summary to anyone, for example to the founder on WhatsApp. Only the text above is shared.</Text>
        <Pressable style={[g.button, { backgroundColor: c.link }]} onPress={share} disabled={!w}>
          <Text style={[g.buttonText, { color: c.onAccent }]}>Share my week</Text>
        </Pressable>
        <Pressable style={g.button} onPress={onClose}>
          <Text style={g.buttonText}>Close</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16 },
  bars: { flexDirection: 'row', height: 120, gap: 8, marginBottom: 16 },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: { flex: 1, width: '100%', backgroundColor: c.btn, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', backgroundColor: c.link, borderRadius: 6 },
  barLabel: { color: c.dim, fontSize: 12, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1 },
  num: { color: c.text, fontSize: 22, fontWeight: '700' },
  label: { color: c.dim, marginTop: 2 },
  note: { color: c.dim, lineHeight: 20, marginBottom: 8 },
});
