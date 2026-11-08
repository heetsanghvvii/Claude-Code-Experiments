// nope brand tokens v1. Charcoal + saffron. Mirrors tokens.css. See BRAND.md for allowed contrast pairs.
export const palette = {
  charcoal900: '#1C1C1E',
  charcoal800: '#262628',
  charcoal700: '#323235',
  charcoal600: '#48484C',
  stone300: '#C9C7C3',
  stone500: '#9C9993',
  stone700: '#5C5A56',
  chalk100: '#F5F4F1',
  chalk200: '#E9E7E2',
  saffron500: '#FF8A1F',
  saffron600: '#F27A0C',
  ember700: '#A84A00',
  saffronTintDark: '#3A2817',
  saffronTintLight: '#FFE7D1',
} as const;

export const dark = {
  bg: palette.charcoal900,
  surface: palette.charcoal800,
  control: palette.charcoal700,
  line: '#3A3A3E',
  text: palette.chalk100,
  text2: palette.stone300,
  textMuted: palette.stone500,
  accent: palette.saffron500,
  accentPress: palette.saffron600,
  onAccent: palette.charcoal900,
  accentText: palette.saffron500,
} as const;

export const light = {
  bg: palette.chalk100,
  surface: palette.chalk200,
  control: '#DEDBD5',
  line: '#D6D3CD',
  text: palette.charcoal900,
  text2: '#3A3A3D',
  textMuted: palette.stone700,
  accent: palette.saffron500,
  accentPress: palette.saffron600,
  onAccent: palette.charcoal900,
  accentText: palette.ember700,
} as const;

/** WCAG 2.x contrast ratios, computed. Only these text pairs are allowed. */
export const allowedTextPairs = [
  { fg: 'chalk100', bg: 'charcoal900', ratio: 15.47 },
  { fg: 'chalk100', bg: 'charcoal800', ratio: 13.73 },
  { fg: 'chalk100', bg: 'charcoal700', ratio: 11.62 },
  { fg: 'stone300', bg: 'charcoal900', ratio: 10.08 },
  { fg: 'stone500', bg: 'charcoal900', ratio: 5.99 },
  { fg: 'stone500', bg: 'charcoal800', ratio: 5.32 },
  { fg: 'stone500', bg: 'charcoal700', ratio: 4.5 },
  { fg: 'saffron500', bg: 'charcoal900', ratio: 7.22 },
  { fg: 'saffron500', bg: 'charcoal800', ratio: 6.41 },
  { fg: 'saffron500', bg: 'charcoal700', ratio: 5.42 },
  { fg: 'charcoal900', bg: 'saffron500', ratio: 7.22 },
  { fg: 'charcoal900', bg: 'chalk100', ratio: 15.47 },
  { fg: 'charcoal900', bg: 'stone300', ratio: 10.08 },
  { fg: 'stone700', bg: 'chalk100', ratio: 6.26 },
  { fg: 'ember700', bg: 'chalk100', ratio: 5.24 },
  { fg: 'ember700', bg: 'chalk200', ratio: 4.66 },
] as const;

export const font = {
  family: 'Outfit',
  fallback: 'ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", Arial, sans-serif',
  weight: { body: '400', medium: '500', semibold: '600', display: '800' },
  size: { xs: 13, sm: 15, base: 17, lg: 20, xl: 26, xxl: 36 },
} as const;

export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;
export const radius = { input: 12, panel: 20, pill: 999 } as const;
export const motion = {
  easeOut: [0.22, 1, 0.36, 1],
  easeInOut: [0.65, 0, 0.35, 1],
  duration: { tap: 120, ui: 220, reveal: 420, lock: 700 },
} as const;
