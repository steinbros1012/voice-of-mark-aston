import Stripe from 'npm:stripe@23';

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    client = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  }
  return client;
}

export const cryptoProvider = Stripe.createSubtleCryptoProvider();
export type { Stripe };
