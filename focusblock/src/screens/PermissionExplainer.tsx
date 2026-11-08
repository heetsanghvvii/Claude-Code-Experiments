import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { c, g } from '../theme';

type Props = {
  onAllow: () => void;
  onCancel: () => void;
};

const sections = [
  {
    heading: 'What Nope can see',
    body: 'Only which app is open right now, by its package name.',
  },
  {
    heading: 'What Nope never does',
    body: 'Read your messages, passwords, payments, or screen content, or send anything off your phone.',
  },
  {
    heading: 'Why Android calls it accessibility',
    body: 'That is the only way an app can notice another app opening so it can send you home.',
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

        <Text style={s.note}>You can turn it off any time in Settings and Nope stops.</Text>

        <Pressable style={[g.button, s.primary]} onPress={onAllow}>
          <Text style={[g.buttonText, s.primaryText]}>Allow in Settings</Text>
        </Pressable>
        <Pressable style={g.button} onPress={onCancel}>
          <Text style={g.buttonText}>Not now</Text>
        </Pressable>
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
  primaryText: { color: c.bg },
});
