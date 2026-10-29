// Welcome email, sent once after onboarding completes. Called by the app;
// the once-only guard lives server-side so it cannot be replayed.
import { withSupabase } from 'npm:@supabase/server@1';

import { sendEmail, templates } from '../_shared/email.ts';
import { guarded, HttpError, json } from '../_shared/http.ts';

export default {
  fetch: withSupabase({ auth: 'user' }, (_req, ctx) =>
    guarded(async () => {
      const userId = ctx.userClaims?.id;
      const email = ctx.userClaims?.email;
      if (!userId || !email) throw new HttpError(401, 'Sign in first');
      const admin = ctx.supabaseAdmin;
      const { data: priv } = await admin.from('profile_private').select('welcome_sent_at').eq('id', userId).single();
      if (priv?.welcome_sent_at) return json({ sent: false, reason: 'already_sent' });
      const { data: profile } = await admin.from('profiles').select('display_name, university:universities(name)').eq('id', userId).single();
      const campus = (profile?.university as unknown as { name: string } | null)?.name ?? 'your campus';
      const sent = await sendEmail({ to: email, ...templates.welcome(profile?.display_name ?? '', campus) });
      if (sent) await admin.from('profile_private').update({ welcome_sent_at: new Date().toISOString() }).eq('id', userId);
      return json({ sent });
    }),
  ),
};
