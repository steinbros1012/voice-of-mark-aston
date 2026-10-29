import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ title: 'Log in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Create account' }} />
      <Stack.Screen name="verify-email" options={{ title: 'Verify your .edu email' }} />
      <Stack.Screen name="onboarding" options={{ title: 'Set up your profile', headerBackVisible: false }} />
    </Stack>
  );
}
