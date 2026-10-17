import { isValidGameCode, normalizeGameCode } from '@outrun/engine';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, ErrorText, Field, Muted, Screen } from '../../components/ui';
import { joinGame } from '../../lib/api';
import { friendlyError } from '../../lib/errors';

export default function JoinGame() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalized = normalizeGameCode(code);
  const valid = isValidGameCode(normalized);

  async function submit() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    try {
      const g = await joinGame(normalized);
      router.replace({ pathname: g.status === 'LOBBY' ? '/lobby/[id]' : '/map/[id]', params: { id: g.id } });
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Field
        label="6-character game code"
        value={code}
        onChangeText={(t) => setCode(normalizeGameCode(t).slice(0, 6))}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={7}
        placeholder="AB3X9K"
        onSubmitEditing={submit}
        style={{ fontSize: 28, letterSpacing: 6, textAlign: 'center' }}
      />
      {code.length === 6 && !valid && <Muted>Codes never contain 0, O, 1 or I.</Muted>}
      <ErrorText>{error}</ErrorText>
      <Button label="Join" onPress={submit} busy={busy} disabled={!valid} />
    </Screen>
  );
}
