import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, usePathname, type ErrorBoundaryProps } from 'expo-router';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';
import { Button, EmptyState, Screen } from '@/components/ui';
import { AuthProvider, useAuth } from '@/features/auth';
import { subscribeToNotificationTaps } from '@/features/notifications';
import { AnalyticsProvider, useAnalytics } from '@/lib/analytics';
import { initSentry, Sentry } from '@/lib/sentry';
import { StripeProvider } from '@/lib/stripe';

// Sentry starts before anything renders so startup crashes are captured too.
initSentry();
// Keep the splash up until we know whether a session exists.
void SplashScreen.preventAutoHideAsync();

/** Last-resort screen for a render error anywhere in the app. Sentry already has the report. */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  Sentry.captureException(error);
  return (
    <Screen scroll={false}>
      <EmptyState title="Something went wrong" description="The app hit an error it could not recover from. Your data is safe." icon="warning-outline" />
      <Button title="Try again" onPress={retry} />
    </Screen>
  );
}

function RootNavigator() {
  const { status, isOnboarded, hasAcceptedTerms } = useAuth();
  const analytics = useAnalytics();
  const pathname = usePathname();
  const router = useRouter();

  // A tapped push notification carries a beepme:// link; route to it.
  useEffect(() => {
    return subscribeToNotificationTaps((url) => {
      const { path } = Linking.parse(url);
      if (path) router.push(`/${path}` as never);
    });
  }, [router]);
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? Colors.dark : Colors.light;

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
  }, [status]);

  useEffect(() => {
    analytics.screen(pathname);
  }, [analytics, pathname]);

  if (status === 'loading') return null;

  const signedIn = status === 'signedIn';
  const needsTerms = signedIn && isOnboarded && !hasAcceptedTerms;
  const canUseApp = signedIn && isOnboarded && hasAcceptedTerms;

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerTitleStyle: { fontSize: FontSize.heading, fontWeight: '600', color: palette.text },
        contentStyle: { backgroundColor: palette.background },
      }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={signedIn && !isOnboarded}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={needsTerms}>
        <Stack.Screen name="accept-terms" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Legal documents are readable at every stage, including onboarding. */}
      <Stack.Screen name="legal/[doc]" options={{ title: 'Legal' }} />

      <Stack.Protected guard={canUseApp}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="earnings" options={{ title: 'Payments and earnings' }} />
        <Stack.Screen name="search" options={{ title: 'Find a ride' }} />
        <Stack.Screen name="post" options={{ title: 'Post a ride' }} />
        <Stack.Screen name="beep/[id]/index" options={{ title: 'Ride details' }} />
        <Stack.Screen name="beep/[id]/requests" options={{ title: 'Requests' }} />
        <Stack.Screen name="request/[beepId]" options={{ title: 'Request a seat' }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Trip' }} />
        <Stack.Screen name="chat/[requestId]" options={{ title: 'Chat' }} />
        <Stack.Screen name="user/[id]" options={{ title: 'Profile' }} />
        <Stack.Screen name="report" options={{ title: 'Report', presentation: 'modal' }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Edit profile', presentation: 'modal' }} />
        <Stack.Screen name="help" options={{ title: 'Help & safety' }} />
        <Stack.Screen name="delete-account" options={{ title: 'Delete account' }} />
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
          primary: palette.text,
          background: palette.background,
          card: palette.background,
          text: palette.text,
          border: palette.border,
        },
      }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AnalyticsProvider>
        <StripeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </StripeProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
