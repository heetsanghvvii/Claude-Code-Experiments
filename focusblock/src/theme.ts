import { StyleSheet } from 'react-native';

// nope brand: charcoal base, one saffron accent. Source of truth: brand/tokens.ts and brand/BRAND.md.
// Contrast (WCAG 2.x): text 15.5:1 on bg, dim 6.0:1 on bg and 4.5:1 on btn, link (saffron) 7.2:1 on bg.
// Rule: saffron is a background or a text colour on charcoal only. Text ON saffron must be onAccent (charcoal, 7.2:1).
export const c = {
  bg: '#1C1C1E',      // charcoal
  card: '#262628',    // raised surface
  btn: '#323235',     // secondary button, unlocked block
  text: '#F5F4F1',    // chalk
  dim: '#9C9993',     // muted text
  line: '#3A3A3E',    // hairlines
  link: '#FF8A1F',    // saffron: primary actions, links
  ok: '#C9C7C3',      // done state, calm stone (saffron stays reserved for action and locked)
  danger: '#FF8A1F',  // locked state and emergency: saffron, never red
  onAccent: '#1C1C1E',// text and icons placed on saffron
  accentSoft: '#3A2817', // saffron tint on charcoal (badges, hint backgrounds)
};

export const g = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg, padding: 20 },
  title: { color: c.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 20 },
  bigText: { color: c.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  sub: { color: c.dim, marginTop: 6 },
  card: { backgroundColor: c.card, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  button: { backgroundColor: c.btn, padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: c.text, fontSize: 16, fontWeight: '700' },
});
