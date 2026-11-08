import { StyleSheet } from 'react-native';

export const c = {
  bg: '#1E1B18', card: '#2A2622', btn: '#38322C', text: '#F8F1E7', dim: '#B5AB9D',
  line: '#3D362F', link: '#E08A6B', ok: '#9CAF88', danger: '#C65D3B',
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
