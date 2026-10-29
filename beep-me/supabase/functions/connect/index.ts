// Driver payouts: creates an Express connected account, returns an onboarding
// link, and refreshes the payouts_enabled flag.
import { withSupabase } from 'npm:@supabase/server@1';

import { functionsBaseUrl, guarded, HttpError, json } from '../_shared/http.ts';
import { stripe } from '../_shared/stripe.ts';

type Body = { action?: 'onboard' | 'status' };

export default {
  fetch: withSupabase({ auth: 'user' }, (req, ctx) =>
    guarded(async () => {
      const userId = ctx.userClaims?.id;
      if (!userId) throw new HttpError(401, 'Sign in first');
      const { action = 'status' } = (await req.json().catch(() => ({}))) as Body;
      const admin = ctx.supabaseAdmin;

      const { data: profile, error } = await admin
        .from('profiles')
        .select('id, display_name, stripe_account_id, payouts_enabled')
        .eq('id', userId)
        .single();
      if (error || !profile) throw new HttpError(404, 'Profile not found');

      let accountId: string = profile.stripe_account_id;
      if (!accountId && action === 'onboard') {
        const account = await stripe().accounts.create({
          type: 'express',
          country: 'US',
          email: ctx.userClaims?.email ?? undefined,
          capabilities: { transfers: { requested: true } },
          business_type: 'individual',
          business_profile: { product_description: 'Sharing rides with students on Beep Me' },
          metadata: { beepme_user_id: userId },
        });
        accountId = account.id;
        await admin.from('profiles').update({ stripe_account_id: accountId }).eq('id', userId);
      }

      if (!accountId) return json({ payoutsEnabled: false, detailsSubmitted: false });

      if (action === 'onboard') {
        const link = await stripe().accountLinks.create({
          account: accountId,
          type: 'account_onboarding',
          return_url: `${functionsBaseUrl()}/connect-return?state=done`,
          refresh_url: `${functionsBaseUrl()}/connect-return?state=refresh`,
        });
        return json({ url: link.url });
      }

      const account = await stripe().accounts.retrieve(accountId);
      const payoutsEnabled = Boolean(account.payouts_enabled);
      await admin.from('profiles').update({ payouts_enabled: payoutsEnabled }).eq('id', userId);
      return json({ payoutsEnabled, detailsSubmitted: Boolean(account.details_submitted) });
    }),
  ),
};
