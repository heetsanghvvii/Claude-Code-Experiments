import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { c } from '../theme';

/** Press and hold for `seconds`; releasing early resets. */
export function HoldButton({ seconds, label, onConfirm }: { seconds: number; label: string; onConfirm: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setElapsed(0);
  };
  useEffect(() => stop, []);

  const begin = () => {
    startedAt.current = Date.now();
    timer.current = setInterval(() => {
      const e = Date.now() - startedAt.current;
      if (e >= seconds * 1000) {
        stop();
        onConfirm();
      } else setElapsed(e);
    }, 100);
  };

  const pct = Math.min(1, elapsed / (seconds * 1000));
  const left = Math.ceil(seconds - elapsed / 1000);
  return (
    <Pressable onPressIn={begin} onPressOut={stop} style={s.btn}>
      <View style={[s.fill, { width: `${pct * 100}%` }]} />
      <Text style={s.text}>{elapsed > 0 ? `Keep holding... ${left}s` : label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { height: 60, borderRadius: 14, backgroundColor: c.btn, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: c.danger },
  text: { color: c.text, fontSize: 16, fontWeight: '700' },
});
