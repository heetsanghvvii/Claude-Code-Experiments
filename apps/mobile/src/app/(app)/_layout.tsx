import { Stack } from 'expo-router';
import { colors } from '../../lib/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'MANHUNT' }} />
      <Stack.Screen name="create" options={{ title: 'Create game' }} />
      <Stack.Screen name="join" options={{ title: 'Join game' }} />
      <Stack.Screen name="lobby/[id]" options={{ title: 'Lobby', headerBackVisible: false }} />
      <Stack.Screen name="map/[id]" options={{ title: 'Game', headerBackVisible: false }} />
    </Stack>
  );
}
