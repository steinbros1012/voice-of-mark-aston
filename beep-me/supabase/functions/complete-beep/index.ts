// Driver marks a ride complete after departure: each successful payment is
// transferred to the driver's connected account (less the 15% fee), then the
// ride is completed and ride counters update in the database.
import { withSupabase } from 'npm:@supabase/server@1';

import { guarded, HttpError, json } from '../_shared/http.ts';
import { stripe } from '../_shared/stripe.ts';

type Body = { beepId?: string };

export default {
  fetch: withSupabase({ auth: 'user' }, (req, ctx) =>
    guarded(async () => {
      const userId = ctx.userClaims?.id;
      if (!userId) throw new HttpError(401, 'Sign in first');
      const { beepId } = (await req.json().catch(() => ({}))) as Body;
      if (!beepId) throw new HttpError(400, 'beepId is required');
      const admin = ctx.supabaseAdmin;

      const { data: beep } = await admin.from('beeps').select('id, driver_id, status, departure_at').eq('id', beepId).single();
      if (!beep) throw new HttpError(404, 'Ride not found');
      if (beep.driver_id !== userId) throw new HttpError(403, 'Only the driver can complete this ride');
      if (beep.status !== 'open' && beep.status !== 'full') throw new HttpError(409, 'This ride is already closed');
      if (new Date(beep.departure_at).getTime() > Date.now()) throw new HttpError(409, 'A ride can be completed after its departure time');

      const { data: driver } = await admin.from('profile_private').select('stripe_account_id, payouts_enabled').eq('id', userId).single();

      const { data: payments } = await admin
        .from('payments')
        .select('id, driver_payout_cents, stripe_charge_id, seat_request:seat_requests!payments_seat_request_id_fkey(beep_id, status)')
        .eq('status', 'succeeded')
        .eq('driver_id', userId);

      let paidOutCents = 0;
      for (const payment of payments ?? []) {
        const request = payment.seat_request as unknown as { beep_id: string; status: string } | null;
        if (!request || request.beep_id !== beep.id || request.status !== 'accepted') continue;
        if (payment.driver_payout_cents <= 0) {
          await admin.from('payments').update({ status: 'paid_out' }).eq('id', payment.id);
          continue;
        }
        if (!driver?.stripe_account_id || !driver.payouts_enabled) {
          throw new HttpError(412, 'Set up payouts before completing a paid ride');
        }
        const transfer = await stripe().transfers.create(
          {
            amount: payment.driver_payout_cents,
            currency: 'usd',
            destination: driver.stripe_account_id,
            source_transaction: payment.stripe_charge_id ?? undefined,
            metadata: { payment_id: payment.id, beep_id: beep.id },
          },
          { idempotencyKey: `payout_${payment.id}` },
        );
        await admin.from('payments').update({ status: 'paid_out', stripe_transfer_id: transfer.id }).eq('id', payment.id);
        paidOutCents += payment.driver_payout_cents;
      }

      const { error } = await admin.from('beeps').update({ status: 'completed' }).eq('id', beep.id);
      if (error) throw new HttpError(409, error.message);
      return json({ ok: true, paidOutCents });
    }),
  ),
};
