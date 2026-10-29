// Type entry for '@/lib/stripe'. Metro resolves stripe.native.tsx on iOS and
// Android and stripe.web.tsx on web; both implement this API.
import type { PropsWithChildren } from 'react';

export const isStripeAvailable: boolean;
export function StripeProvider(props: PropsWithChildren): React.JSX.Element;

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

export type StripeSheet = {
  initPaymentSheet: (params: PaymentSheetSetupParams) => Promise<{ error?: { message: string } }>;
  presentPaymentSheet: () => Promise<{ error?: { code: string; message: string } }>;
};

export function useStripeSheet(): StripeSheet | null;
