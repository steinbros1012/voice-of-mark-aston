// Files a safety report and alerts the support inbox so a person sees it.
import { withSupabase } from 'npm:@supabase/server@1';

import { sendEmail, supportEmail, templates } from '../_shared/email.ts';
import { guarded, HttpError, json } from '../_shared/http.ts';

const REASONS = new Set(['no_show', 'unsafe_driving', 'harassment', 'scam', 'inappropriate_content', 'other']);
type Body = { userId?: string | null; beepId?: string | null; reason?: string; details?: string };

export default {
  fetch: withSupabase({ auth: 'user' }, (req, ctx) =>
    guarded(async () => {
      const reporterId = ctx.userClaims?.id;
      if (!reporterId) throw new HttpError(401, 'Sign in first');
      const body = (await req.json().catch(() => ({}))) as Body;
      const reason = body.reason ?? '';
      if (!REASONS.has(reason)) throw new HttpError(400, 'Pick a reason');
      if (!body.userId && !body.beepId) throw new HttpError(400, 'Nothing to report');
      if (body.userId === reporterId) throw new HttpError(400, 'You cannot report yourself');
      const details = (body.details ?? '').slice(0, 2000);

      const { data, error } = await ctx.supabaseAdmin
        .from('reports')
        .insert({ reporter_id: reporterId, reported_user_id: body.userId ?? null, reported_beep_id: body.beepId ?? null, reason, details: details || null })
        .select('id')
        .single();
      if (error || !data) throw new HttpError(400, error?.message ?? 'Could not file the report');

      await sendEmail({ to: supportEmail(), ...templates.reportAlert(data.id, reason, details, reporterId, body.userId ?? null, body.beepId ?? null) });
      return json({ ok: true, id: data.id });
    }),
  ),
};
