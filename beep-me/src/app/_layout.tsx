import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/features/auth';
import { AnalyticsProvider, useAnalytics } from '@/lib/analytics';
import { initSentry, Sentry } from '@/lib/sentry';

// Sentry starts before anything renders so startup crashes are captured too.
initSentry();
// Keep the splash up until we know whether a session exists.
void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { status, isOnboarded } = useAuth();
  const analytics = useAnalytics();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
  }, [status]);

  useEffect(() => {
    analytics.screen(pathname);
  }, [analytics, pathname]);

  if (status === 'loading') return null;

  const signedIn = status === 'signedIn';
  const canUseApp = signedIn && isOnboarded;

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && !isOnboarded}>
        <Stack.Screen name="onboarding" options={{ title: 'Set up your profile', headerBackVisible: false }} />
      </Stack.Protected>

      <Stack.Protected guard={canUseApp}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Edit profile', presentation: 'modal' }} />
        <Stack.Screen name="beep/[id]" options={{ title: 'Beep' }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Booking' }} />
        <Stack.Screen name="user/[id]" options={{ title: 'Profile' }} />
        <Stack.Screen name="rate/[bookingId]" options={{ title: 'Rate your ride', presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ title: 'Beep Me Plus', presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          primary: palette.primary,
          background: palette.background,
          card: palette.background,
          text: palette.text,
          border: palette.border,
        },
      }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AnalyticsProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
