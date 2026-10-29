import * as StripeNative from '@stripe/stripe-react-native';
import type { PropsWithChildren } from 'react';

import { env } from '@/lib/env';

// iOS/Android implementation. See stripe.web.tsx for the stub; Metro picks
// the file by platform so the native SDK never enters the web bundle.
export const isStripeAvailable = Boolean(env.stripePublishableKey);

/** Wraps the app with StripeProvider when a publishable key exists. */
export function StripeProvider({ children }: PropsWithChildren) {
  if (!env.stripePublishableKey) return <>{children}</>;
  const Provider = StripeNative.StripeProvider;
  return (
    <Provider publishableKey={env.stripePublishableKey} merchantIdentifier={env.stripeMerchantId} urlScheme="beepme">
      <>{children}</>
    </Provider>
  );
}

type StripeSheet = {
  initPaymentSheet: (params: PaymentSheetSetupParams) => Promise<{ error?: { message: string } }>;
  presentPaymentSheet: () => Promise<{ error?: { code: string; message: string } }>;
};

/** PaymentSheet hooks, or null when Stripe is not configured. */
export function useStripeSheet(): StripeSheet | null {
  const sheet = StripeNative.useStripe();
  if (!env.stripePublishableKey) return null;
  return {
    initPaymentSheet: (params) => sheet.initPaymentSheet(params as never) as Promise<{ error?: { message: string } }>,
    presentPaymentSheet: () => sheet.presentPaymentSheet() as Promise<{ error?: { code: string; message: string } }>,
  };
}

export type PaymentSheetSetupParams = {
  merchantDisplayName: string;
  customerId: string;
  customerEphemeralKeySecret: string;
  setupIntentClientSecret: string;
  returnURL?: string;
  allowsDelayedPaymentMethods?: boolean;
  applePay?: { merchantCountryCode: string };
  googlePay?: { merchantCountryCode: string; testEnv?: boolean };
};
