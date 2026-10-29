import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

// Foreground notifications show as banners.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export type PushStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export async function getPushStatus(): Promise<PushStatus> {
  if (!Device.isDevice) return 'unsupported';
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
}

/** Ask for permission (if needed) and store this device's Expo push token for the user. */
export async function registerForPush(userId: string): Promise<PushStatus> {
  if (!Device.isDevice) return 'unsupported';
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'Ride updates', importance: AndroidImportance.DEFAULT });
  }
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== 'granted') return 'denied';
  const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  await supabase.from('push_tokens').upsert({ token, user_id: userId, platform: Platform.OS === 'ios' ? 'ios' : 'android', updated_at: new Date().toISOString() });
  return 'granted';
}

/** Forget this device's token (log out, or the student turns notifications off). */
export async function unregisterPush(): Promise<void> {
  if (!Device.isDevice) return;
  try {
    const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    await supabase.from('push_tokens').delete().eq('token', token);
  } catch {
    // No token to remove.
  }
}

/** Deep link carried by a tapped notification, if any. */
export function subscribeToNotificationTaps(onUrl: (url: string) => void): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const url = (response.notification.request.content.data as { url?: string } | undefined)?.url;
    if (url) onUrl(url);
  });
  return () => sub.remove();
}
