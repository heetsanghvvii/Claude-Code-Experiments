import { Modal, Pressable, SafeAreaView, Share, StyleSheet, Text, View } from 'react-native';
import { Brick } from '../useBrick';
import { formatCode } from '../rescue';
import { c, g } from '../theme';

/** Shows the backup code exactly once, right after a sticker is paired. */
export function BackupCode({ b }: { b: Brick }) {
  const code = b.pendingCode;
  const share = () => {
    if (!code) return;
    Share.share({ message: `My Nope backup code: ${formatCode(code)}` }).catch(() => {});
  };

  return (
    <Modal visible={!!code} animationType="slide">
      <SafeAreaView style={g.root}>
        <Text style={g.title}>Your backup code</Text>
        <Text style={s.body}>
          If you ever lose or damage your sticker, this code unlocks your apps. We only show it once, so keep it somewhere safe.
        </Text>
        <View style={s.codeBox}>
          <Text style={s.code} selectable>{code ? formatCode(code) : ''}</Text>
        </View>
        <Text style={s.hint}>Write it down, or save it in a password manager. You can also send it to yourself below.</Text>
        <Pressable style={g.button} onPress={share}>
          <Text style={g.buttonText}>Send it to myself</Text>
        </Pressable>
        <Pressable style={[g.button, { backgroundColor: c.link }]} onPress={b.confirmCodeSaved}>
          <Text style={g.buttonText}>I saved it</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  body: { color: c.dim, fontSize: 16, lineHeight: 22, marginBottom: 24 },
  codeBox: { backgroundColor: c.card, borderRadius: 16, paddingVertical: 28, alignItems: 'center', marginBottom: 16 },
  code: { color: c.text, fontSize: 32, fontWeight: '800', letterSpacing: 3 },
  hint: { color: c.dim, marginBottom: 12 },
});
