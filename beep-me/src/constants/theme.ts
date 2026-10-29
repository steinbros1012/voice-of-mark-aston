/**
 * Design tokens. Light mode follows the Beep Me reference: warm off-white
 * background, white surfaces, deep ink text, restrained lime accent. Dark mode
 * keeps the same roles with inverted neutrals. Screens use these names only.
 */
export const Colors = {
  light: {
    background: '#F7F8F4',
    surface: '#FFFFFF',
    surfaceMuted: '#F0F2EC',
    border: '#E3E6DF',
    borderStrong: '#CBD1C8',
    text: '#142522',
    textSecondary: '#5F6B68',
    textMuted: '#8A938F',
    /** Primary buttons: deep ink with white text. */
    ink: '#142522',
    inkText: '#FFFFFF',
    /** Lime accent: calls to action, selected states, verified pill. */
    accent: '#C6EF68',
    accentText: '#142522',
    accentMuted: '#EAF7CF',
    success: '#2F7D4E',
    danger: '#C83E3E',
    dangerMuted: '#FBECEC',
    warning: '#9A6B16',
    warningMuted: '#FBF1DB',
    overlay: 'rgba(20, 37, 34, 0.45)',
  },
  dark: {
    background: '#0F1715',
    surface: '#172120',
    surfaceMuted: '#1E2A28',
    border: '#2A3634',
    borderStrong: '#3B4846',
    text: '#F3F5F1',
    textSecondary: '#A6B1AD',
    textMuted: '#7B8683',
    ink: '#F3F5F1',
    inkText: '#142522',
    accent: '#C6EF68',
    accentText: '#142522',
    accentMuted: '#2C3A1C',
    success: '#7BD38F',
    danger: '#F08A8A',
    dangerMuted: '#3A2222',
    warning: '#E2B45B',
    warningMuted: '#3A3120',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type Theme = { [K in keyof typeof Colors.light]: string };
export type ThemeColor = keyof Theme;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const FontSize = {
  tiny: 12,
  caption: 13,
  label: 14,
  body: 16,
  heading: 18,
  title: 22,
  display: 28,
} as const;

/** Minimum size for anything tappable. */
export const TouchTarget = 44;

export const MaxContentWidth = 640;
