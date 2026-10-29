import { Platform } from 'react-native';

/**
 * React Native Web draws the browser focus ring inside text inputs; our
 * fields show focus with their own border colour instead.
 */
export const webInputReset = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as Record<string, string>) : null;
