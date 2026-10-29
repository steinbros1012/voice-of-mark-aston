import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { env } from '@/lib/env';
import { LargeSecureStore } from '@/lib/session-storage';
import type { Database } from '@/types/database';

/**
 * Single Supabase client for the app. Sessions persist encrypted on device
 * (see session-storage.ts). The anon key is safe to ship: every table is
 * protected by Row Level Security, and the service role key never leaves
 * the Edge Functions.
 *
 * When the URL or key is missing the client is still created against a
 * placeholder so the app can render; any request then fails with a clear
 * MissingEnvError raised by `assertSupabaseConfigured()` at the call site.
 */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

export const supabase = createClient<Database>(
  env.supabaseUrl ?? 'https://not-configured.supabase.co',
  env.supabaseAnonKey ?? 'not-configured',
  {
    auth: {
      storage: Platform.OS === 'web' ? undefined : new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      // Deep links are handled by Expo Router, not by the auth client.
      detectSessionInUrl: false,
    },
  },
);

// Refresh tokens only while the app is in the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
