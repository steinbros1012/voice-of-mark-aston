import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Expo app config. Values that differ per developer or per environment are
 * read from process.env here (loaded from .env by the Expo CLI) so that no
 * account-specific identifiers are committed.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Beep Me',
  slug: 'beep-me',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'beepme',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'app.beepme.mobile',
    associatedDomains: process.env.EXPO_PUBLIC_APP_URL
      ? [`applinks:${new URL(process.env.EXPO_PUBLIC_APP_URL).host}`]
      : [],
  },
  android: {
    package: 'app.beepme.mobile',
    adaptiveIcon: {
      backgroundColor: '#0B1220',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0B1220',
        image: './assets/images/splash-icon.png',
        imageWidth: 120,
      },
    ],
    [
      '@sentry/react-native/expo',
      {
        // Source-map upload at build time. Auth comes from SENTRY_AUTH_TOKEN.
        url: 'https://sentry.io/',
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
