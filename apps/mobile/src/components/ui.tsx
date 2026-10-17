import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isConfigured } from '../lib/env';
import { colors, space } from '../lib/theme';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen}>
      {!isConfigured && (
        <Text style={styles.warn}>Supabase is not configured. Copy .env.example to .env and restart.</Text>
      )}
      {children}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <Text accessibilityRole="alert" style={styles.error}>
      {children}
    </Text>
  );
}

export function Button({
  label,
  onPress,
  busy,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const off = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!busy }}
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        off && styles.buttonOff,
        pressed && !off && styles.buttonPressed,
      ]}
    >
      {busy ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonLabel}>{label}</Text>}
    </Pressable>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} accessibilityLabel={label} {...props} style={[styles.input, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: space(5), gap: space(4) },
  warn: { color: colors.bg, backgroundColor: '#FFC53D', padding: space(2), borderRadius: 6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  muted: { color: colors.muted, fontSize: 15 },
  error: { color: colors.danger, fontSize: 15 },
  button: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space(4),
  },
  buttonSecondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  buttonDanger: { backgroundColor: colors.danger },
  buttonOff: { opacity: 0.5 },
  buttonPressed: { transform: [{ scale: 0.98 }] },
  buttonLabel: { color: colors.text, fontSize: 17, fontWeight: '700' },
  field: { gap: space(1) },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: space(3),
    fontSize: 17,
  },
});
