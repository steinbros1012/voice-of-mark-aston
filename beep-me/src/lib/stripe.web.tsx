import type { PropsWithChildren } from 'react';

// Web stub: the Stripe React Native SDK is native-only. Cards are added from
// the iOS/Android app; the web build only shows payment state.
export const isStripeAvailable = false;

export function StripeProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
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

type StripeSheet = {
  initPaymentSheet: (params: PaymentSheetSetupParams) => Promise<{ error?: { message: string } }>;
  presentPaymentSheet: () => Promise<{ error?: { code: string; message: string } }>;
};

export function useStripeSheet(): StripeSheet | null {
  return null;
}
