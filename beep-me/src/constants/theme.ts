/**
 * Design tokens. Keep every color, spacing and radius here so screens never
 * hardcode values. Light and dark palettes share the same keys.
 */
export const Colors = {
  light: {
    primary: '#0E9F8E',
    primaryText: '#FFFFFF',
    accent: '#FFC53D',
    text: '#0B1220',
    textSecondary: '#5B6475',
    background: '#FFFFFF',
    surface: '#F3F5F8',
    surfaceSelected: '#E3E7EE',
    border: '#D9DEE7',
    danger: '#DC2626',
    success: '#16A34A',
  },
  dark: {
    primary: '#2DD4BF',
    primaryText: '#06201C',
    accent: '#FFD166',
    text: '#F8FAFC',
    textSecondary: '#A5ADBB',
    background: '#0B1220',
    surface: '#161E2E',
    surfaceSelected: '#222C3F',
    border: '#2B3547',
    danger: '#F87171',
    success: '#4ADE80',
  },
} as const;

export type Theme = (typeof Colors)[keyof typeof Colors];
export type ThemeColor = keyof Theme;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const MaxContentWidth = 640;
