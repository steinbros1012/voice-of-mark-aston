// Account deletion. Removes everything the Privacy Policy promises to remove
// (profile details, photo, messages, chats, blocks, pending requests) and
// keeps only what it says we keep: payment records tied to an anonymised id,
// and reports filed about or by the account for safety.
import { withSupabase } from 'npm:@supabase/server@1';

import { guarded, HttpError, json } from '../_shared/http.ts';
import { stripe } from '../_shared/stripe.ts';

type Body = { confirm?: string };

export default {
  fetch: withSupabase({ auth: 'user' }, (req, ctx) =>
    guarded(async () => {
      const userId = ctx.userClaims?.id;
      if (!userId) throw new HttpError(401, 'Sign in first');
      const { confirm } = (await req.json().catch(() => ({}))) as Body;
      if (confirm !== 'DELETE') throw new HttpError(400, 'Type DELETE to confirm');
      const admin = ctx.supabaseAdmin;

      // Live bookings must be settled first so nobody is stranded or unpaid.
      const { count: liveRides } = await admin.from('beeps').select('id', { count: 'exact', head: true }).eq('driver_id', userId).in('status', ['open', 'full']);
      if ((liveRides ?? 0) > 0) throw new HttpError(409, 'Cancel or complete your upcoming rides first');
      const { count: liveRequests } = await admin.from('seat_requests').select('id', { count: 'exact', head: true }).eq('rider_id', userId).eq('status', 'accepted');
      if ((liveRequests ?? 0) > 0) throw new HttpError(409, 'Cancel your upcoming trips first');

      // Pending requests just close.
      await admin.from('seat_requests').update({ status: 'cancelled' }).eq('rider_id', userId).eq('status', 'pending');

      // Messages and blocks are deleted outright.
      await admin.from('messages').delete().eq('sender_id', userId);
      await admin.from('blocks').delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

      // Photo: remove every object in the user's folder.
      const { data: objects } = await admin.storage.from('avatars').list(userId);
      if (objects?.length) await admin.storage.from('avatars').remove(objects.map((o) => `${userId}/${o.name}`));

      // Stripe: detach the customer; the connected account stays until Stripe's
      // own retention rules apply (it holds payout history the driver may need).
      const { data: priv } = await admin.from('profile_private').select('stripe_customer_id').eq('id', userId).single();
      if (priv?.stripe_customer_id && Deno.env.get('STRIPE_SECRET_KEY')) {
        await stripe().customers.del(priv.stripe_customer_id).catch(() => undefined);
      }

      // Anonymise the public profile and wipe the private one.
      await admin
        .from('profiles')
        .update({ display_name: 'Deleted student', bio: null, avatar_url: null, edu_verified: false, university_id: null, onboarding_completed_at: null, deleted_at: new Date().toISOString() })
        .eq('id', userId);
      await admin
        .from('profile_private')
        .update({ stripe_customer_id: null, has_payment_method: false, stripe_account_id: null, payouts_enabled: false, plus_expires_at: null, accepted_terms_version: null, accepted_terms_at: null })
        .eq('id', userId);

      // Soft-delete the auth user: the login stops working and the email is
      // scrubbed by Supabase, while the id survives for payment records.
      const { error } = await admin.auth.admin.deleteUser(userId, true);
      if (error) throw new HttpError(500, error.message);
      return json({ ok: true });
    }),
  ),
};
