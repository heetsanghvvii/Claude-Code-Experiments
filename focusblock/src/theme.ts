import { StyleSheet } from 'react-native';

export const c = {
  bg: '#111', card: '#1c1c1c', btn: '#2a2a2a', text: '#fff', dim: '#aaa',
  line: '#333', link: '#6aa9ff', ok: '#5ac86f', danger: '#b3261e',
};

export const g = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg, padding: 20 },
  title: { color: c.text, fontSize: 28, fontWeight: '700', marginBottom: 20 },
  bigText: { color: c.text, fontSize: 26, fontWeight: '800' },
  sub: { color: c.dim, marginTop: 6 },
  card: { backgroundColor: c.card, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  button: { backgroundColor: c.btn, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: c.text, fontSize: 16, fontWeight: '700' },
});
