// Stripe events: keep payment method, payout and payment state in step even
// when the app was not open to see the result.
import { withSupabase } from 'npm:@supabase/server@1';

import { json } from '../_shared/http.ts';
import { cryptoProvider, stripe, type Stripe } from '../_shared/stripe.ts';

export default {
  fetch: withSupabase({ auth: 'none' }, async (req, ctx) => {
    const signature = req.headers.get('stripe-signature');
    const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!signature || !secret) return json({ error: 'Missing signature' }, 400);
    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = await stripe().webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'Bad signature' }, 400);
    }

    const admin = ctx.supabaseAdmin;
    switch (event.type) {
      case 'setup_intent.succeeded': {
        const intent = event.data.object;
        const customerId = typeof intent.customer === 'string' ? intent.customer : intent.customer?.id;
        const paymentMethod = typeof intent.payment_method === 'string' ? intent.payment_method : intent.payment_method?.id;
        if (customerId && paymentMethod) {
          await stripe().customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethod } });
          await admin.from('profile_private').update({ has_payment_method: true }).eq('stripe_customer_id', customerId);
        }
        break;
      }
      case 'payment_method.detached': {
        const method = event.data.object;
        const customerId = typeof method.customer === 'string' ? method.customer : method.customer?.id;
        if (customerId) {
          const remaining = await stripe().paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
          if (remaining.data.length === 0) await admin.from('profile_private').update({ has_payment_method: false }).eq('stripe_customer_id', customerId);
        }
        break;
      }
      case 'account.updated': {
        const account = event.data.object;
        await admin.from('profile_private').update({ payouts_enabled: Boolean(account.payouts_enabled) }).eq('stripe_account_id', account.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await admin
          .from('payments')
          .update({ status: 'failed', failure_message: intent.last_payment_error?.message ?? 'Payment failed' })
          .eq('stripe_payment_intent_id', intent.id)
          .eq('status', 'pending');
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (intentId && charge.refunded) {
          await admin.from('payments').update({ status: 'refunded' }).eq('stripe_payment_intent_id', intentId).in('status', ['succeeded', 'pending']);
        }
        break;
      }
      default:
        break;
    }
    return json({ received: true });
  }),
};
