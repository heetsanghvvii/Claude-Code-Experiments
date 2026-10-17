import { Link } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { Button, ErrorText, Field, Muted, Screen, Title } from '../../components/ui';
import { friendlyError } from '../../lib/errors';
import { supabase } from '../../lib/supabase';
import { colors } from '../../lib/theme';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const nameOk = name.trim().length >= 1 && name.trim().length <= 32;
  const passwordOk = password.length >= 8;

  async function submit() {
    setBusy(true);
    setError(null);
    const { data, error: e } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: name.trim() } }, // read by the handle_new_user trigger
    });
    setBusy(false);
    if (e) setError(friendlyError(e));
    else if (!data.session) setCheckEmail(true); // email confirmation is on
  }

  if (checkEmail) {
    return (
      <Screen>
        <Title>Check your email</Title>
        <Muted>Confirm your address, then sign in.</Muted>
        <Link href="/sign-in" style={{ color: colors.accent, padding: 12 }}>
          <Text>Back to sign in</Text>
        </Link>
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>Create account</Title>
      <Field label="Display name" value={name} onChangeText={setName} maxLength={32} autoComplete="nickname" />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" />
      <Field label="Password (8+ characters)" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
      <ErrorText>{error}</ErrorText>
      <Button label="Sign up" onPress={submit} busy={busy} disabled={!nameOk || !email || !passwordOk} />
      <Link href="/sign-in" style={{ color: colors.muted, textAlign: 'center', padding: 12 }}>
        <Text>Have an account? Sign in</Text>
      </Link>
    </Screen>
  );
}
