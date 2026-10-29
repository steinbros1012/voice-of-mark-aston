import * as Sentry from '@sentry/react-native';

import { env } from '@/lib/env';

/**
 * Crash and error tracking. Called once, synchronously, at the top of the root
 * layout so it runs before any screen renders. With no DSN configured the SDK
 * is initialised disabled, which keeps local development quiet.
 */
export function initSentry(): void {
  Sentry.init({
    dsn: env.sentryDsn,
    enabled: Boolean(env.sentryDsn),
    debug: false,
    // Personal data stays out of events; we attach the user id explicitly on
    // sign-in instead.
    sendDefaultPii: false,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    enableAutoSessionTracking: true,
  });
}

export { Sentry };
