import { Pressable, StyleSheet, Text } from 'react-native';
import { c } from '../theme';

export function Row({ label, value, onPress, done }: { label: string; value: string; onPress: () => void; done: boolean }) {
  return (
    <Pressable style={s.row} onPress={onPress}>
      <Text style={s.label}>{label}</Text>
      <Text style={[s.value, done && s.done]}>{value}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  label: { color: c.text, fontSize: 16 },
  value: { color: c.link, fontSize: 16 },
  done: { color: c.ok },
});
