import { router } from 'expo-router';
import { Button, Muted, Screen, Title } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

export default function Home() {
  const { session } = useAuth();
  return (
    <Screen>
      <Title>Ready to run?</Title>
      <Muted>Signed in as {session?.user.email}</Muted>
      <Button label="Create game" onPress={() => router.push('/create')} />
      <Button label="Join with code" variant="secondary" onPress={() => router.push('/join')} />
      <Button label="Sign out" variant="secondary" onPress={() => void supabase.auth.signOut()} />
    </Screen>
  );
}
