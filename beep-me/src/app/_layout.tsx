import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { initSentry, Sentry } from '@/lib/sentry';

// Sentry starts before anything renders so startup crashes are captured too.
initSentry();

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
      {/*
        Phase 2 wraps these groups in <Stack.Protected guard={...}> so signed-out
        users only see (auth) and signed-in users only see the app.
      */}
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="beep/[id]" options={{ title: 'Beep' }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Booking' }} />
        <Stack.Screen name="user/[id]" options={{ title: 'Profile' }} />
        <Stack.Screen name="rate/[bookingId]" options={{ title: 'Rate your ride', presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ title: 'Beep Me Plus', presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);
