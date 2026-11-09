import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { c, g } from '../theme';

type Props = {
  onAllow: () => void;
  onCancel: () => void;
};

const sections = [
  {
    heading: 'Why Android calls this accessibility',
    body: 'It is the way an app can notice another app opening, so Nope can send you home.',
  },
  {
    heading: 'What Nope never does',
    body: 'Read your messages, passwords, payments, or what is on your screen, or send anything off your phone.',
  },
  {
    heading: 'What Nope can notice',
    body: 'Only which app is open right now, by its name. If you turn on strict mode, also the title of Settings pages.',
  },
  {
    heading: 'If the switch is grey',
    body: 'Android 13 and later protect this switch for apps installed from a file. Open Settings, Apps, Nope, tap the three dots, then Allow restricted settings. Then try again.',
  },
];

export function PermissionExplainer({ onAllow, onCancel }: Props) {
  return (
    <SafeAreaView style={g.root}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={g.title}>One permission, explained</Text>

        {sections.map((sec) => (
          <View key={sec.heading} style={s.section}>
            <Text style={s.heading}>{sec.heading}</Text>
            <Text style={s.body}>{sec.body}</Text>
          </View>
        ))}

        <Text style={s.note}>You can turn it off any time in Settings and Nope stops (unless you chose strict mode, which is off by default).</Text>

        <Pressable style={[g.button, s.primary]} onPress={onAllow}>
          <Text style={[g.buttonText, s.primaryText]}>Open Settings</Text>
        </Pressable>
        <Pressable style={g.button} onPress={onCancel}>
          <Text style={g.buttonText}>Not now</Text>
        </Pressable>
        <Text style={s.foot}>Nope cannot block until this is on. You can finish any time from the home screen.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: 24 },
  section: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  heading: { color: c.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  body: { color: c.dim, fontSize: 16, lineHeight: 22 },
  note: { color: c.text, fontSize: 16, lineHeight: 22, marginTop: 8, marginBottom: 4 },
  primary: { backgroundColor: c.link },
  primaryText: { color: c.onAccent },
  foot: { color: c.dim, marginTop: 12, lineHeight: 20 },
});
