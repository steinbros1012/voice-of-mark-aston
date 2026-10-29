// RevenueCat events keep profiles.plus_active in step with the "plus"
// entitlement so the database (feed placement, booking fee) can rely on it.
import { withSupabase } from 'npm:@supabase/server@1';

import { json } from '../_shared/http.ts';

const ENTITLEMENT = 'plus';
const ACTIVATES = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE', 'PRODUCT_CHANGE', 'SUBSCRIPTION_EXTENDED', 'TEMPORARY_ENTITLEMENT_GRANT', 'TRANSFER']);
const DEACTIVATES = new Set(['EXPIRATION', 'BILLING_ISSUE', 'SUBSCRIPTION_PAUSED']);

type RevenueCatEvent = {
  type: string;
  app_user_id: string;
  original_app_user_id?: string;
  aliases?: string[];
  entitlement_ids?: string[] | null;
  expiration_at_ms?: number | null;
};

export default {
  fetch: withSupabase({ auth: 'none' }, async (req, ctx) => {
    const expected = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
    if (!expected || req.headers.get('authorization') !== expected) return json({ error: 'Unauthorized' }, 401);

    const payload = (await req.json().catch(() => null)) as { event?: RevenueCatEvent } | null;
    const event = payload?.event;
    if (!event) return json({ error: 'Bad payload' }, 400);
    if (event.type === 'TEST') return json({ received: true });
    if (event.entitlement_ids && !event.entitlement_ids.includes(ENTITLEMENT)) return json({ received: true });

    // App user ids are Supabase user ids (set with Purchases.logIn on sign-in).
    const candidates = [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])].filter(
      (id): id is string => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id),
    );
    if (candidates.length === 0) return json({ received: true });

    const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;
    let active: boolean | null = null;
    if (ACTIVATES.has(event.type)) active = true;
    else if (DEACTIVATES.has(event.type)) active = false;
    else if (event.type === 'CANCELLATION') active = expiresAt ? new Date(expiresAt).getTime() > Date.now() : false;
    if (active === null) return json({ received: true });

    await ctx.supabaseAdmin.from('profiles').update({ plus_active: active, plus_expires_at: expiresAt }).in('id', candidates);
    return json({ received: true });
  }),
};
