import PostHog, { PostHogProvider } from 'posthog-react-native';
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

import { env } from '@/lib/env';

/** Every product event Beep Me tracks, with its properties. */
export type AnalyticsEvents = {
  sign_up: { university_id: string | null };
  verification_completed: { university_id: string | null };
  beep_posted: { beep_id: string; price_per_seat_cents: number; seats_total: number };
  beep_viewed: { beep_id: string };
  seat_requested: { beep_id: string; seat_request_id: string; seats_requested: number };
  seat_accepted: { beep_id: string; seat_request_id: string };
  booking_completed: { beep_id: string; paid_out_cents: number; riders: number };
  paywall_viewed: { source: string };
  subscription_started: { product_id: string };
  review_submitted: { beep_id: string; stars: number };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

type Analytics = {
  enabled: boolean;
  track: <E extends AnalyticsEventName>(event: E, properties: AnalyticsEvents[E]) => void;
  screen: (name: string, properties?: Record<string, string>) => void;
  identify: (userId: string, properties?: Record<string, string | boolean | null>) => void;
  reset: () => void;
};

const noop: Analytics = {
  enabled: false,
  track: () => undefined,
  screen: () => undefined,
  identify: () => undefined,
  reset: () => undefined,
};

const AnalyticsContext = createContext<Analytics>(noop);

/**
 * PostHog wrapper. Without a key the app runs with a no-op client, so local
 * development never sends events. Screen views are captured manually from
 * the root layout because autocapture does not understand Expo Router.
 */
export function AnalyticsProvider({ children }: PropsWithChildren) {
  const client = useMemo(() => {
    if (!env.posthogKey) return null;
    return new PostHog(env.posthogKey, {
      host: env.posthogHost,
      captureAppLifecycleEvents: true,
    });
  }, []);

  const value = useMemo<Analytics>(() => {
    if (!client) return noop;
    return {
      enabled: true,
      track: (event, properties) => client.capture(event, properties),
      screen: (name, properties) => client.screen(name, properties),
      identify: (userId, properties) => client.identify(userId, properties),
      reset: () => client.reset(),
    };
  }, [client]);

  const tree = <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
  if (!client) return tree;
  return (
    <PostHogProvider client={client} autocapture={{ captureScreens: false, captureTouches: false }}>
      {tree}
    </PostHogProvider>
  );
}

export function useAnalytics(): Analytics {
  return useContext(AnalyticsContext);
}
