// BrainWave mobile theme — clean, modern education-app design language.
// Adapted from the existing BrainWave web branding (orange accent, clean neutrals).

export const colors = {
  primary: '#F97316',
  primaryDark: '#EA580C',
  primarySoft: '#FFF4EC',

  background: '#F8FAFC',
  surface: '#FFFFFF',

  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#EEF2F6',

  success: '#16A34A',
  successSoft: '#F0FDF4',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  warning: '#F59E0B',
  infoSoft: '#EFF6FF',

  white: '#FFFFFF',
  black: '#000000',

  overlay: 'rgba(15, 23, 42, 0.55)',
  skeleton: '#E8EDF3',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: '800', color: colors.text },
  h2: { fontSize: 20, fontWeight: '700', color: colors.text },
  h3: { fontSize: 17, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, fontWeight: '400', color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  button: { fontSize: 16, fontWeight: '700' },
};

export const layout = {
  screenPadding: 16,
  cardGap: 12,
  maxContentWidth: 480,
};