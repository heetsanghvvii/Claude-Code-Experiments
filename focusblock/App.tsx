import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useBrick } from './src/useBrick';
import { Onboarding } from './src/screens/Onboarding';
import { Home } from './src/screens/Home';
import { AppPicker } from './src/screens/AppPicker';
import { BackupCode } from './src/screens/BackupCode';
import { Rescue } from './src/screens/Rescue';
import { g } from './src/theme';

export default function App() {
  const b = useBrick();

  return (
    <>
      <StatusBar style="light" />
      {!b.ready ? <SafeAreaView style={g.root} /> : b.onboarded ? <Home b={b} /> : <Onboarding b={b} />}
      <AppPicker b={b} />
      <BackupCode b={b} />
      <Rescue b={b} />
    </>
  );
}
