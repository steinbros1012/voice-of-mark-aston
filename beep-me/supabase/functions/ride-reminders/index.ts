// Ride reminders, run on a schedule (see README: Cron → every 15 minutes).
// Emails and pushes everyone on rides leaving in roughly 24 hours, once.
import { withSupabase } from 'npm:@supabase/server@1';

import { sendEmail, templates } from '../_shared/email.ts';
import { guarded, json } from '../_shared/http.ts';
import { pushToUsers } from '../_shared/push.ts';

export default {
  fetch: withSupabase({ auth: 'secret' }, (_req, ctx) =>
    guarded(async () => {
      const admin = ctx.supabaseAdmin;
      const from = new Date(Date.now() + 23 * 3600 * 1000).toISOString();
      const to = new Date(Date.now() + 25 * 3600 * 1000).toISOString();
      const { data: beeps } = await admin
        .from('beeps')
        .select('id, origin, destination, departure_at, driver_id, driver:profiles!beeps_driver_id_fkey(display_name)')
        .in('status', ['open', 'full'])
        .is('reminder_sent_at', null)
        .gte('departure_at', from)
        .lte('departure_at', to)
        .limit(200);

      let emails = 0;
      for (const beep of beeps ?? []) {
        const driver = beep.driver as unknown as { display_name: string } | null;
        const { data: requests } = await admin
          .from('seat_requests')
          .select('id, rider_id, rider:profiles!seat_requests_rider_id_fkey(display_name)')
          .eq('beep_id', beep.id)
          .eq('status', 'accepted');
        const riders = (requests ?? []).map((r) => ({ id: r.rider_id, requestId: r.id, name: (r.rider as unknown as { display_name: string } | null)?.display_name ?? 'a rider' }));
        if (riders.length === 0) {
          await admin.from('beeps').update({ reminder_sent_at: new Date().toISOString() }).eq('id', beep.id);
          continue;
        }
        const route = `${beep.origin} → ${beep.destination}`;
        const when = new Date(beep.departure_at).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
        const participants = [beep.driver_id, ...riders.map((r) => r.id)];
        const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 });
        const emailOf = new Map((users?.users ?? []).filter((u) => participants.includes(u.id)).map((u) => [u.id, u.email ?? '']));

        const driverEmail = emailOf.get(beep.driver_id);
        if (driverEmail) {
          if (await sendEmail({ to: driverEmail, ...templates.rideReminder(driver?.display_name ?? '', 'driver', route, when, riders.map((r) => r.name).join(', '), `beepme://beep/${beep.id}`) })) emails += 1;
        }
        for (const rider of riders) {
          const email = emailOf.get(rider.id);
          if (email && (await sendEmail({ to: email, ...templates.rideReminder(rider.name, 'rider', route, when, driver?.display_name ?? 'your driver', `beepme://booking/${rider.requestId}`) }))) emails += 1;
        }
        await pushToUsers(admin, participants, { title: 'Ride tomorrow', body: `${route} leaves ${when}`, data: { url: `beepme://beep/${beep.id}` } });
        await admin.from('beeps').update({ reminder_sent_at: new Date().toISOString() }).eq('id', beep.id);
      }
      return json({ rides: beeps?.length ?? 0, emails });
    }),
  ),
};
