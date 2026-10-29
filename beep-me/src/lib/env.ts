/**
 * Typed access to client environment variables.
 *
 * Expo inlines `process.env.EXPO_PUBLIC_*` at build time, but only when each
 * variable is referenced literally (no dynamic keys), which is why every
 * variable is spelled out below. Missing values are `undefined` rather than
 * thrown at import time so the app can boot before every service is
 * configured; call `requireEnv` at the point a service is actually used.
 */
function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const env = {
  supabaseUrl: optional(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: optional(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  stripePublishableKey: optional(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  stripeMerchantId: optional(process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID),
  revenueCatIosKey: optional(process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY),
  revenueCatAndroidKey: optional(process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY),
  posthogKey: optional(process.env.EXPO_PUBLIC_POSTHOG_KEY),
  posthogHost: optional(process.env.EXPO_PUBLIC_POSTHOG_HOST) ?? 'https://us.i.posthog.com',
  sentryDsn: optional(process.env.EXPO_PUBLIC_SENTRY_DSN),
  appUrl: optional(process.env.EXPO_PUBLIC_APP_URL),
} as const;

export type EnvKey = keyof typeof env;

export class MissingEnvError extends Error {
  constructor(key: EnvKey) {
    super(
      `Missing environment variable for "${key}". Copy .env.example to .env and fill it in, then fully reload the app.`,
    );
    this.name = 'MissingEnvError';
  }
}

export function requireEnv(key: EnvKey): string {
  const value = env[key];
  if (!value) throw new MissingEnvError(key);
  return value;
}
