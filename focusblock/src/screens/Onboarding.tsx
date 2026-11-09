import { TEST_MODE } from '../testMode';
import { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Brick } from '../useBrick';
import { c, g } from '../theme';
import { PermissionExplainer } from './PermissionExplainer';

export function Onboarding({ b }: { b: Brick }) {
  const [step, setStep] = useState(0);
  const [explaining, setExplaining] = useState(false);
  // First lock rehearsal: done once the user has locked AND unlocked with the puck.
  const [lockedOnce, setLockedOnce] = useState(false);
  useEffect(() => { if (b.on) setLockedOnce(true); }, [b.on]);
  const allow = () => (b.mode === 'usage' ? b.requestPermission() : setExplaining(true));
  const steps = [
    { title: 'Allow blocking', body: 'Next, Android opens a settings page. Find Nope in the list and switch it on. This is the only permission Nope needs. If the switch is grey, open Setup doctor from the home screen later for a 1 minute fix.', action: 'Allow', run: allow, done: b.perm },
    { title: 'Choose apps', body: 'Pick 2 or 3 apps that waste the most time. You can change this any time while unlocked.', action: 'Choose apps', run: b.chooseApps, done: b.appCount > 0 },
    { title: 'Pair your puck', body: 'Hold the back of your phone flat on the puck and keep still for 2 seconds. Nothing happening? Slide it slowly around the middle of the phone.', action: b.busy ? 'Hold near your puck...' : 'Pair puck', run: b.pair, done: !!b.token },
    { title: 'Try it once', body: lockedOnce && b.on
        ? 'Locked. Now open one of your blocked apps: Nope sends you home. Then come back and tap the puck again to unlock.'
        : 'Tap your phone on the puck to lock. Then open a blocked app to see what happens, and tap the puck again to unlock.',
      action: b.busy ? 'Hold near your puck...' : b.on ? 'Tap puck to unlock' : 'Tap puck to lock', run: b.tap, done: lockedOnce && !b.on },
  ];
  const cur = steps[step];
  const last = step === steps.length - 1;

  if (explaining) {
    return (
      <PermissionExplainer
        onAllow={() => { setExplaining(false); b.requestPermission(); }}
        onCancel={() => setExplaining(false)}
      />
    );
  }

  return (
    <SafeAreaView style={g.root}>
      <Text style={s.count}>Step {step + 1} of {steps.length}</Text>
      <View style={s.dots}>
        {steps.map((_, i) => <View key={i} style={[s.dot, i <= step && s.dotOn]} />)}
      </View>
      <Text style={g.title}>{cur.title}</Text>
      <Text style={s.body}>{cur.body}</Text>

      <Pressable style={g.button} onPress={cur.run} disabled={b.busy}>
        <Text style={[g.buttonText, cur.done && { color: c.ok }]}>{cur.done ? 'Done' : cur.action}</Text>
      </Pressable>
      {cur.done && !last && (
        <Pressable style={g.button} onPress={() => setStep(step + 1)}>
          <Text style={g.buttonText}>Next</Text>
        </Pressable>
      )}
      {cur.done && last && (
        <>
          <Text style={s.body}>It works. Tip: keep the puck in another room so unlocking takes a walk.</Text>
          <Pressable style={[g.button, { backgroundColor: c.link }]} onPress={b.finishOnboarding}>
            <Text style={[g.buttonText, { color: c.onAccent }]}>Finish</Text>
          </Pressable>
        </>
      )}
      {last && !cur.done && !b.on && (
        <Pressable style={s.skip} onPress={b.finishOnboarding}>
          <Text style={s.skipText}>Skip for now</Text>
        </Pressable>
      )}
      {step > 0 && !b.busy && !(last && b.on) && (
        <Pressable style={s.skip} onPress={() => setStep(step - 1)}>
          <Text style={s.skipText}>Back</Text>
        </Pressable>
      )}
      {TEST_MODE && (
        <Pressable style={s.skip} onPress={() => (last ? b.finishOnboarding() : setStep(step + 1))}>
          <Text style={s.skipText}>Dev: skip step</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  count: { color: c.dim, marginTop: 20, marginBottom: 12 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot: { height: 4, flex: 1, borderRadius: 2, backgroundColor: c.btn },
  dotOn: { backgroundColor: c.link },
  body: { color: c.dim, fontSize: 16, lineHeight: 22, marginBottom: 24 },
  skip: { marginTop: 24, alignItems: 'center' },
  skipText: { color: c.dim },
});
