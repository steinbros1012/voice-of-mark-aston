// Transactional email through Resend's REST API. The API key never leaves
// the function environment. Every template escapes user-provided text.
import { escapeHtml } from './http.ts';

const BRAND = { bg: '#F7F8F4', ink: '#142522', accent: '#C6EF68', muted: '#5F6B68' };

export function supportEmail(): string {
  return Deno.env.get('SUPPORT_EMAIL') ?? 'support@beepme.app';
}

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html lang="en"><body style="margin:0;background:${BRAND.bg};font-family:-apple-system,system-ui,sans-serif;color:${BRAND.ink}">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="font-weight:800;font-size:22px;letter-spacing:-0.5px;margin-bottom:24px">beep me <span style="color:${BRAND.accent}">✦</span></div>
<div style="background:#fff;border:1px solid #E3E6DF;border-radius:16px;padding:24px">
<h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>
${bodyHtml}
</div>
<p style="color:${BRAND.muted};font-size:12px;line-height:18px;margin-top:20px">Student email verification confirms a campus address only; it is not a background check. Questions: ${escapeHtml(supportEmail())}</p>
</div></body></html>`;
}

const p = (text: string) => `<p style="margin:0 0 12px;line-height:22px;color:#3f4b48">${escapeHtml(text)}</p>`;
const button = (label: string, href: string) =>
  `<p style="margin:20px 0 4px"><a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND.ink};color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:999px">${escapeHtml(label)}</a></p>`;

export type EmailMessage = { to: string; subject: string; html: string; text: string };

export const templates = {
  welcome(name: string, campus: string): Omit<EmailMessage, 'to'> {
    const first = name.split(' ')[0] || 'there';
    return {
      subject: 'Welcome to Beep Me',
      html: layout(`Welcome, ${first}!`, p(`You are verified at ${campus}. Post a ride when you are driving somewhere, or grab a seat on one leaving campus.`) + p('A few things that keep everyone safe: agree on a public pickup spot in chat, keep plans in the app, and report anything that feels off.') + button('Open Beep Me', 'beepme://')),
      text: `Welcome, ${first}! You are verified at ${campus}. Post a ride when you are driving somewhere, or grab a seat on one leaving campus. Agree on a public pickup spot in chat, keep plans in the app, and report anything that feels off.`,
    };
  },
  bookingAccepted(riderName: string, driverName: string, route: string, when: string, seats: number, amount: string, requestId: string): Omit<EmailMessage, 'to'> {
    const first = riderName.split(' ')[0] || 'there';
    return {
      subject: `You're on: ${route}`,
      html: layout(`${driverName} accepted your request`, p(`${first}, your ${seats} seat${seats === 1 ? '' : 's'} on ${route} (${when}) are confirmed. ${amount} was charged to your card.`) + p('Open the chat to agree on where to meet. You can cancel for a full refund any time before departure.') + button('View trip', `beepme://booking/${requestId}`)),
      text: `${first}, ${driverName} accepted your request. Your ${seats} seat(s) on ${route} (${when}) are confirmed and ${amount} was charged to your card. Open the chat to agree on where to meet. You can cancel for a full refund any time before departure.`,
    };
  },
  rideReminder(name: string, role: 'driver' | 'rider', route: string, when: string, counterpart: string, link: string): Omit<EmailMessage, 'to'> {
    const first = name.split(' ')[0] || 'there';
    return {
      subject: `Tomorrow: ${route}`,
      html: layout('Your ride is tomorrow', p(`${first}, ${route} leaves ${when}. ${role === 'driver' ? `Riders: ${counterpart}.` : `Your driver is ${counterpart}.`}`) + p('Confirm the pickup spot in chat and be on time. If plans changed, cancel in the app now so nobody is left waiting.') + button(role === 'driver' ? 'View ride' : 'View trip', link)),
      text: `${first}, ${route} leaves ${when}. ${role === 'driver' ? `Riders: ${counterpart}.` : `Your driver is ${counterpart}.`} Confirm the pickup spot in chat and be on time. If plans changed, cancel in the app now.`,
    };
  },
  reportAlert(reportId: string, reason: string, details: string, reporterId: string, targetUser: string | null, targetBeep: string | null): Omit<EmailMessage, 'to'> {
    return {
      subject: `[Beep Me] New report: ${reason}`,
      html: layout('New safety report', p(`Reason: ${reason}`) + p(`Details: ${details || '(none)'}`) + p(`Report id: ${reportId}`) + p(`Reporter: ${reporterId}`) + p(`Reported user: ${targetUser ?? '-'}`) + p(`Reported ride: ${targetBeep ?? '-'}`) + p('Review it in the Supabase dashboard (reports table) and set the status when handled.')),
      text: `New safety report ${reportId}. Reason: ${reason}. Details: ${details || '(none)'}. Reporter ${reporterId}, user ${targetUser ?? '-'}, ride ${targetBeep ?? '-'}.`,
    };
  },
};

/** Send one email. Returns false (and logs) when Resend is not configured or rejects it. */
export async function sendEmail(message: EmailMessage): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');
  if (!apiKey || !from) {
    console.warn('Resend not configured; skipping email', message.subject);
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
  });
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text().catch(() => ''));
    return false;
  }
  return true;
}
