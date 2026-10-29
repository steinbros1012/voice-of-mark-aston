// Rider payment method setup: creates the Stripe Customer on first use,
// returns PaymentSheet parameters for saving a card, and syncs whether a
// default payment method exists.
import { withSupabase } from 'npm:@supabase/server@1';

import { guarded, HttpError, json } from '../_shared/http.ts';
import { stripe } from '../_shared/stripe.ts';

type Body = { action?: 'setup' | 'sync' };

export default {
  fetch: withSupabase({ auth: 'user' }, (req, ctx) =>
    guarded(async () => {
      const userId = ctx.userClaims?.id;
      if (!userId) throw new HttpError(401, 'Sign in first');
      const { action = 'setup' } = (await req.json().catch(() => ({}))) as Body;
      const admin = ctx.supabaseAdmin;

      const { data: profile, error } = await admin
        .from('profiles')
        .select('id, display_name, stripe_customer_id, has_payment_method')
        .eq('id', userId)
        .single();
      if (error || !profile) throw new HttpError(404, 'Profile not found');

      let customerId: string = profile.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe().customers.create({
          name: profile.display_name || undefined,
          email: ctx.userClaims?.email ?? undefined,
          metadata: { beepme_user_id: userId },
        });
        customerId = customer.id;
        await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
      }

      if (action === 'sync') {
        const customer = await stripe().customers.retrieve(customerId);
        let hasMethod = false;
        if (!customer.deleted) {
          const existing = customer.invoice_settings?.default_payment_method;
          if (existing) hasMethod = true;
          else {
            const methods = await stripe().paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
            const first = methods.data[0];
            if (first) {
              await stripe().customers.update(customerId, { invoice_settings: { default_payment_method: first.id } });
              hasMethod = true;
            }
          }
        }
        await admin.from('profiles').update({ has_payment_method: hasMethod }).eq('id', userId);
        return json({ hasPaymentMethod: hasMethod });
      }

      const ephemeralKey = await stripe().ephemeralKeys.create({ customer: customerId }, { apiVersion: '2026-09-30.endive' });
      const setupIntent = await stripe().setupIntents.create({
        customer: customerId,
        usage: 'off_session',
        payment_method_types: ['card'],
        metadata: { beepme_user_id: userId },
      });
      return json({
        customerId,
        customerEphemeralKeySecret: ephemeralKey.secret,
        setupIntentClientSecret: setupIntent.client_secret,
      });
    }),
  ),
};
