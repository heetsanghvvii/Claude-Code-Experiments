import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, ErrorText, Field, Muted, Screen } from '../../components/ui';
import { createGame } from '../../lib/api';
import { friendlyError } from '../../lib/errors';
import { space } from '../../lib/theme';

const toInt = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);

export default function CreateGame() {
  const [radius, setRadius] = useState('400');
  const [duration, setDuration] = useState('20');
  const [headStart, setHeadStart] = useState('2');
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const r = toInt(radius);
  const d = toInt(duration);
  const h = toInt(headStart);
  const valid = center && r >= 50 && r <= 5000 && d >= 1 && d <= 240 && h >= 0 && h < d;

  async function locate() {
    setLocating(true);
    setError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setError('Location permission is needed to centre the arena on you.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLocating(false);
    }
  }

  async function submit() {
    if (!valid || !center) return;
    setBusy(true);
    setError(null);
    try {
      const g = await createGame({ lat: center.lat, lng: center.lng, radiusM: r, durationS: d * 60, headStartS: h * 60 });
      router.replace({ pathname: '/lobby/[id]', params: { id: g.id } });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: space(4) }} keyboardShouldPersistTaps="handled">
        <Button
          label={center ? `Arena centre: ${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}` : 'Use my location as arena centre'}
          variant="secondary"
          onPress={locate}
          busy={locating}
        />
        <Field label="Arena radius (m, 50-5000)" value={radius} onChangeText={setRadius} keyboardType="number-pad" />
        <Field label="Game length (min)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
        <Field label="Runner head start (min)" value={headStart} onChangeText={setHeadStart} keyboardType="number-pad" />
        <Muted>The head start counts toward the game length. Hunters see runners only in timed snapshots.</Muted>
        <ErrorText>{error}</ErrorText>
        <Button label="Create lobby" onPress={submit} busy={busy} disabled={!valid} />
      </ScrollView>
    </Screen>
  );
}
