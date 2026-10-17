import { Link } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { Button, ErrorText, Field, Muted, Screen, Title } from '../../components/ui';
import { friendlyError } from '../../lib/errors';
import { supabase } from '../../lib/supabase';
import { colors } from '../../lib/theme';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (e) setError(friendlyError(e));
    // On success the root layout's guard switches to the app stack.
  }

  return (
    <Screen>
      <Title>MANHUNT</Title>
      <Muted>Sign in to hunt or run.</Muted>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" onSubmitEditing={submit} />
      <ErrorText>{error}</ErrorText>
      <Button label="Sign in" onPress={submit} busy={busy} disabled={!email || !password} />
      <Link href="/sign-up" style={{ color: colors.muted, textAlign: 'center', padding: 12 }}>
        <Text>No account? Sign up</Text>
      </Link>
    </Screen>
  );
}
