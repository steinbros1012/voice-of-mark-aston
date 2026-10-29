// Driver cancels a ride: every paid, accepted request is refunded, then the
// ride is cancelled (the database cascades the request statuses).
import { withSupabase } from 'npm:@supabase/server@1';

import { guarded, HttpError, json } from '../_shared/http.ts';
import { pushToUsers } from '../_shared/push.ts';
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

      const { data: beep } = await admin.from('beeps').select('id, driver_id, status, destination').eq('id', beepId).single();
      if (!beep) throw new HttpError(404, 'Ride not found');
      if (beep.driver_id !== userId) throw new HttpError(403, 'Only the driver can cancel this ride');
      if (beep.status === 'completed' || beep.status === 'cancelled') throw new HttpError(409, 'This ride is already closed');

      const { data: payments } = await admin
        .from('payments')
        .select('id, stripe_payment_intent_id, seat_request:seat_requests!payments_seat_request_id_fkey(beep_id, status)')
        .eq('status', 'succeeded')
        .eq('driver_id', userId);
      let refunded = 0;
      for (const payment of payments ?? []) {
        const request = payment.seat_request as unknown as { beep_id: string; status: string } | null;
        if (!request || request.beep_id !== beep.id || request.status !== 'accepted') continue;
        let refundId: string | null = null;
        if (payment.stripe_payment_intent_id) {
          const refund = await stripe().refunds.create({ payment_intent: payment.stripe_payment_intent_id }, { idempotencyKey: `refund_beep_${payment.id}` });
          refundId = refund.id;
        }
        await admin.from('payments').update({ status: 'refunded', stripe_refund_id: refundId }).eq('id', payment.id);
        refunded += 1;
      }

      const { data: affected } = await admin.from('seat_requests').select('rider_id').eq('beep_id', beep.id).in('status', ['pending', 'accepted']);
      const { error } = await admin.from('beeps').update({ status: 'cancelled' }).eq('id', beep.id);
      if (error) throw new HttpError(409, error.message);
      await pushToUsers(admin, (affected ?? []).map((r) => r.rider_id), { title: 'Ride cancelled', body: `The ride to ${beep.destination} was cancelled. Any payment is refunded in full.`, data: { url: 'beepme://trips' } });
      return json({ ok: true, refunded });
    }),
  ),
};
