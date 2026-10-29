// Cancel a seat request. Accepted (paid) requests are refunded in full when
// cancelled before departure. Drivers decline pending requests here too.
import { withSupabase } from 'npm:@supabase/server@1';

import { guarded, HttpError, json } from '../_shared/http.ts';
import { pushToUsers } from '../_shared/push.ts';
import { stripe } from '../_shared/stripe.ts';

type Body = { requestId?: string; action?: 'cancel' | 'decline' };

export default {
  fetch: withSupabase({ auth: 'user' }, (req, ctx) =>
    guarded(async () => {
      const userId = ctx.userClaims?.id;
      if (!userId) throw new HttpError(401, 'Sign in first');
      const { requestId, action = 'cancel' } = (await req.json().catch(() => ({}))) as Body;
      if (!requestId) throw new HttpError(400, 'requestId is required');
      const admin = ctx.supabaseAdmin;

      const { data: request } = await admin
        .from('seat_requests')
        .select('id, status, rider_id, beep:beeps!seat_requests_beep_id_fkey(id, driver_id, departure_at, destination)')
        .eq('id', requestId)
        .single();
      if (!request) throw new HttpError(404, 'Request not found');
      const beep = request.beep as unknown as { id: string; driver_id: string; departure_at: string; destination: string };
      const isRider = request.rider_id === userId;
      const isDriver = beep.driver_id === userId;
      if (!isRider && !isDriver) throw new HttpError(403, 'Not your request');

      if (action === 'decline') {
        if (!isDriver) throw new HttpError(403, 'Only the driver can decline');
        if (request.status !== 'pending') throw new HttpError(409, 'Only pending requests can be declined');
        await admin.from('seat_requests').update({ status: 'declined' }).eq('id', request.id);
        await pushToUsers(admin, [request.rider_id], { title: 'Request declined', body: `Your request for the ride to ${beep.destination} was declined.`, data: { url: `beepme://booking/${request.id}` } });
        return json({ ok: true });
      }

      if (!isRider) throw new HttpError(403, 'Only the rider can cancel a request');
      if (request.status !== 'pending' && request.status !== 'accepted') throw new HttpError(409, 'This request is already closed');
      if (new Date(beep.departure_at).getTime() <= Date.now()) throw new HttpError(409, 'This ride has already left');

      const { data: payment } = await admin.from('payments').select('id, status, stripe_payment_intent_id').eq('seat_request_id', request.id).maybeSingle();
      if (payment?.status === 'succeeded' && payment.stripe_payment_intent_id) {
        const refund = await stripe().refunds.create({ payment_intent: payment.stripe_payment_intent_id }, { idempotencyKey: `refund_${request.id}` });
        await admin.from('payments').update({ status: 'refunded', stripe_refund_id: refund.id }).eq('id', payment.id);
      } else if (payment?.status === 'succeeded') {
        await admin.from('payments').update({ status: 'refunded' }).eq('id', payment.id);
      }

      const { error } = await admin.from('seat_requests').update({ status: 'cancelled' }).eq('id', request.id);
      if (error) throw new HttpError(409, error.message);
      if (request.status === 'accepted') {
        await pushToUsers(admin, [beep.driver_id], { title: 'Rider cancelled', body: `A rider cancelled their seat to ${beep.destination}. The seat is open again.`, data: { url: `beepme://beep/${beep.id}` } });
      }
      return json({ ok: true, refunded: payment?.status === 'succeeded' });
    }),
  ),
};
