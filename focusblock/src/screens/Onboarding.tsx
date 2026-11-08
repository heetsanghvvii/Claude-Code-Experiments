import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Brick } from '../useBrick';
import { c, g } from '../theme';
import { PermissionExplainer } from './PermissionExplainer';

export function Onboarding({ b }: { b: Brick }) {
  const [step, setStep] = useState(0);
  const [explaining, setExplaining] = useState(false);
  const steps = [
    { title: 'Allow blocking', body: 'Nope needs permission to block distracting apps while you are locked in.', action: 'Allow', run: () => setExplaining(true), done: b.perm },
    { title: 'Choose apps', body: 'Pick the apps you want blocked during a focus session.', action: 'Choose apps', run: b.chooseApps, done: b.appCount > 0 },
    { title: 'Pair your sticker', body: 'Hold an NFC sticker to the back of your phone. It becomes your key to lock and unlock.', action: b.busy ? 'Hold near sticker...' : 'Pair sticker', run: b.pair, done: !!b.token },
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
      {cur.done && step !== 2 && (
        <Pressable style={g.button} onPress={() => setStep(step + 1)}>
          <Text style={g.buttonText}>Next</Text>
        </Pressable>
      )}
      {cur.done && last && (
        <Pressable style={[g.button, { backgroundColor: c.link }]} onPress={b.finishOnboarding}>
          <Text style={g.buttonText}>Finish</Text>
        </Pressable>
      )}
      {__DEV__ && (
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
