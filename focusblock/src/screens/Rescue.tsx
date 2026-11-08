import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Brick } from '../useBrick';
import { checkBackupCode, getCooldown, MAX_ATTEMPTS } from '../rescue';
import { c, g } from '../theme';

const mins = (ms: number) => Math.max(1, Math.ceil(ms / 60000));

export function Rescue({ b }: { b: Brick }) {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [msLeft, setMsLeft] = useState(0);
  const [done, setDone] = useState(false);

  const refresh = async () => {
    const cd = await getCooldown();
    setMsLeft(cd.msLeft);
    return cd;
  };

  useEffect(() => {
    if (!b.rescueOpen) return;
    setCode(''); setMsg(''); setDone(false);
    refresh();
  }, [b.rescueOpen]);

  useEffect(() => {
    if (msLeft <= 0) return;
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [msLeft > 0]);

  const close = () => b.setRescueOpen(false);

  const submit = async () => {
    const res = await checkBackupCode(code);
    if (res === 'ok') {
      await b.rescueUnlock();
      setCode('');
      setDone(true);
      return;
    }
    const cd = await refresh();
    if (res === 'nobackup') setMsg('No backup code was set up on this phone.');
    else if (res === 'cooldown') setMsg(`Too many tries. Please wait ${mins(cd.msLeft)} minutes and try again.`);
    else setMsg(`That code does not match. ${cd.attemptsLeft} of ${MAX_ATTEMPTS} tries left.`);
  };

  const repair = async () => {
    close();
    await b.pair();
  };

  const blockedNow = msLeft > 0;

  return (
    <Modal visible={b.rescueOpen} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={g.root}>
        <Text style={g.title}>Lost my puck?</Text>
        {done ? (
          <>
            <Text style={s.body}>You are unlocked. If your sticker is gone for good, you can pair a new one now. You will get a fresh backup code.</Text>
            <Pressable style={[g.button, { backgroundColor: c.link }]} onPress={repair} disabled={b.busy}>
              <Text style={g.buttonText}>Pair a new sticker</Text>
            </Pressable>
            <Pressable style={g.button} onPress={close}>
              <Text style={g.buttonText}>Maybe later</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={s.body}>Enter the 10 character backup code you saved when you paired your sticker.</Text>
            <TextInput
              style={s.input}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="XXXXX-XXXXX"
              placeholderTextColor={c.dim}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              editable={!blockedNow}
            />
            {!!msg && <Text style={[s.msg, blockedNow && { color: c.danger }]}>{msg}</Text>}
            <Pressable style={[g.button, { backgroundColor: c.link }, blockedNow && s.off]} onPress={submit} disabled={blockedNow || code.length < 10}>
              <Text style={g.buttonText}>{b.on ? 'Unlock now' : 'Check code'}</Text>
            </Pressable>
            {b.emergencyLeft > 0 && b.on && (
              <Text style={s.foot}>Not lost, just stuck? You can also use an emergency unlock from the home screen.</Text>
            )}
            <Pressable style={g.button} onPress={close}>
              <Text style={g.buttonText}>Back</Text>
            </Pressable>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  body: { color: c.dim, fontSize: 16, lineHeight: 22, marginBottom: 20 },
  input: { backgroundColor: c.card, color: c.text, borderRadius: 14, padding: 16, fontSize: 22, letterSpacing: 2, fontWeight: '700', textAlign: 'center' },
  msg: { color: c.dim, marginTop: 12 },
  foot: { color: c.dim, marginTop: 16 },
  off: { opacity: 0.4 },
});
