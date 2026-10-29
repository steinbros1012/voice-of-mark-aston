// Driver accepts a request: charge the rider's saved card off-session, record
// the payment, then mark the request accepted. Nothing is accepted if the
// charge fails.
import { withSupabase } from 'npm:@supabase/server@1';

import { quoteBooking } from '../_shared/fees.ts';
import { guarded, HttpError, json } from '../_shared/http.ts';
import { stripe } from '../_shared/stripe.ts';

type Body = { requestId?: string };

export default {
  fetch: withSupabase({ auth: 'user' }, (req, ctx) =>
    guarded(async () => {
      const driverId = ctx.userClaims?.id;
      if (!driverId) throw new HttpError(401, 'Sign in first');
      const { requestId } = (await req.json().catch(() => ({}))) as Body;
      if (!requestId) throw new HttpError(400, 'requestId is required');
      const admin = ctx.supabaseAdmin;

      const { data: request } = await admin
        .from('seat_requests')
        .select('id, status, seats_requested, rider_id, beep:beeps!seat_requests_beep_id_fkey(id, driver_id, status, price_per_seat_cents, origin, destination)')
        .eq('id', requestId)
        .single();
      if (!request) throw new HttpError(404, 'Request not found');
      const beep = request.beep as unknown as { id: string; driver_id: string; status: string; price_per_seat_cents: number; origin: string; destination: string };
      if (beep.driver_id !== driverId) throw new HttpError(403, 'Only the driver can accept this request');
      if (request.status !== 'pending') throw new HttpError(409, 'This request is no longer pending');
      if (beep.status !== 'open') throw new HttpError(409, 'This ride is no longer open');

      const { data: driver } = await admin.from('profile_private').select('payouts_enabled').eq('id', driverId).single();
      const { data: riderPublic } = await admin.from('profiles').select('id, plus_active').eq('id', request.rider_id).single();
      const { data: riderPrivate } = await admin.from('profile_private').select('stripe_customer_id, has_payment_method').eq('id', request.rider_id).single();
      if (!riderPublic || !riderPrivate) throw new HttpError(404, 'Rider not found');
      const rider = { ...riderPublic, ...riderPrivate };

      const quote = quoteBooking(request.seats_requested, beep.price_per_seat_cents, Boolean(rider.plus_active));

      if (quote.amountCents > 0) {
        if (!driver?.payouts_enabled) throw new HttpError(412, 'Set up payouts before accepting paid requests');
        if (!rider.stripe_customer_id || !rider.has_payment_method) {
          throw new HttpError(412, 'The rider has not added a payment method yet');
        }
      }

      let paymentIntentId: string | null = null;
      let chargeId: string | null = null;
      if (quote.amountCents > 0) {
        const customer = await stripe().customers.retrieve(rider.stripe_customer_id);
        if (customer.deleted) throw new HttpError(412, 'The rider has no payment method on file');
        const paymentMethod = customer.invoice_settings?.default_payment_method;
        if (!paymentMethod) throw new HttpError(412, 'The rider has no payment method on file');
        try {
          const intent = await stripe().paymentIntents.create(
            {
              amount: quote.amountCents,
              currency: 'usd',
              customer: rider.stripe_customer_id,
              payment_method: typeof paymentMethod === 'string' ? paymentMethod : paymentMethod.id,
              off_session: true,
              confirm: true,
              transfer_group: `request_${request.id}`,
              description: `Beep Me: ${beep.origin} → ${beep.destination}`,
              metadata: { seat_request_id: request.id, beep_id: beep.id, rider_id: rider.id, driver_id: driverId },
            },
            { idempotencyKey: `accept_${request.id}` },
          );
          if (intent.status !== 'succeeded') throw new HttpError(402, 'The rider’s card could not be charged');
          paymentIntentId = intent.id;
          chargeId = typeof intent.latest_charge === 'string' ? intent.latest_charge : (intent.latest_charge?.id ?? null);
        } catch (error) {
          if (error instanceof HttpError) throw error;
          const message = error instanceof Error ? error.message : 'Card declined';
          await admin.from('payments').upsert(
            {
              seat_request_id: request.id,
              rider_id: rider.id,
              driver_id: driverId,
              seat_subtotal_cents: quote.seatSubtotalCents,
              booking_fee_cents: quote.bookingFeeCents,
              amount_cents: quote.amountCents,
              platform_fee_cents: quote.platformFeeCents,
              driver_payout_cents: quote.driverPayoutCents,
              status: 'failed',
              failure_message: message,
            },
            { onConflict: 'seat_request_id' },
          );
          throw new HttpError(402, `The rider’s card was declined (${message}). Ask them to update their payment method.`);
        }
      }

      const { error: paymentError } = await admin.from('payments').upsert(
        {
          seat_request_id: request.id,
          rider_id: rider.id,
          driver_id: driverId,
          seat_subtotal_cents: quote.seatSubtotalCents,
          booking_fee_cents: quote.bookingFeeCents,
          amount_cents: quote.amountCents,
          platform_fee_cents: quote.platformFeeCents,
          driver_payout_cents: quote.driverPayoutCents,
          stripe_payment_intent_id: paymentIntentId,
          stripe_charge_id: chargeId,
          status: 'succeeded',
          failure_message: null,
        },
        { onConflict: 'seat_request_id' },
      );
      if (paymentError) throw new HttpError(500, paymentError.message);

      const { error: statusError } = await admin.from('seat_requests').update({ status: 'accepted' }).eq('id', request.id);
      if (statusError) {
        // Capacity changed between the check and the write: give the money back.
        if (paymentIntentId) await stripe().refunds.create({ payment_intent: paymentIntentId });
        await admin.from('payments').update({ status: 'refunded' }).eq('seat_request_id', request.id);
        throw new HttpError(409, statusError.message);
      }
      return json({ ok: true, amountCents: quote.amountCents });
    }),
  ),
};
