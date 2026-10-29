// Push notifications the app asks for after an action it just took:
//   message  → the other participant of the conversation
//   request  → the driver of the ride that was just requested
// The function re-checks that the caller is a participant before sending.
import { withSupabase } from 'npm:@supabase/server@1';

import { guarded, HttpError, json } from '../_shared/http.ts';
import { pushToUsers } from '../_shared/push.ts';

type Body = { kind?: 'message' | 'request'; requestId?: string; preview?: string };

export default {
  fetch: withSupabase({ auth: 'user' }, (req, ctx) =>
    guarded(async () => {
      const userId = ctx.userClaims?.id;
      if (!userId) throw new HttpError(401, 'Sign in first');
      const { kind, requestId, preview } = (await req.json().catch(() => ({}))) as Body;
      if (!requestId) throw new HttpError(400, 'requestId is required');
      const admin = ctx.supabaseAdmin;

      const { data: request } = await admin
        .from('seat_requests')
        .select('id, rider_id, seats_requested, status, beep:beeps!seat_requests_beep_id_fkey(id, driver_id, destination)')
        .eq('id', requestId)
        .single();
      if (!request) throw new HttpError(404, 'Request not found');
      const beep = request.beep as unknown as { id: string; driver_id: string; destination: string };
      const isRider = request.rider_id === userId;
      const isDriver = beep.driver_id === userId;
      if (!isRider && !isDriver) throw new HttpError(403, 'Not your conversation');

      const { data: sender } = await admin.from('profiles').select('display_name').eq('id', userId).single();
      const name = sender?.display_name ?? 'Someone';

      if (kind === 'message') {
        if (request.status !== 'pending' && request.status !== 'accepted') throw new HttpError(409, 'Conversation closed');
        const sent = await pushToUsers(admin, [isRider ? beep.driver_id : request.rider_id], {
          title: name,
          body: (preview ?? 'New message').slice(0, 120),
          data: { url: `beepme://chat/${request.id}` },
        });
        return json({ sent });
      }
      if (kind === 'request') {
        if (!isRider) throw new HttpError(403, 'Only the rider can announce a request');
        const sent = await pushToUsers(admin, [beep.driver_id], {
          title: 'New seat request',
          body: `${name} wants ${request.seats_requested} seat${request.seats_requested === 1 ? '' : 's'} to ${beep.destination}`,
          data: { url: `beepme://booking/${request.id}` },
        });
        return json({ sent });
      }
      throw new HttpError(400, 'Unknown kind');
    }),
  ),
};
