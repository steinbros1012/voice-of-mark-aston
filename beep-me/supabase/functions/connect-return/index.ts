// Stripe Connect sends the driver back here after onboarding. The page jumps
// straight back into the app via its URL scheme; no account state is passed.
import { withSupabase } from 'npm:@supabase/server@1';

const page = (state: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="0;url=beepme://earnings?connect=${state}">
<title>Back to Beep Me</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#F7F8F4;color:#142522;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}main{text-align:center;padding:24px}a{display:inline-block;margin-top:16px;padding:14px 24px;border-radius:999px;background:#142522;color:#fff;text-decoration:none;font-weight:600}</style>
</head>
<body><main>
<h1>${state === 'done' ? 'Payout setup saved' : 'Let’s try that again'}</h1>
<p>Returning you to Beep Me…</p>
<a href="beepme://earnings?connect=${state}">Open Beep Me</a>
</main></body></html>`;

export default {
  fetch: withSupabase({ auth: 'none' }, (req) => {
    const state = new URL(req.url).searchParams.get('state') === 'done' ? 'done' : 'refresh';
    return Promise.resolve(new Response(page(state), { headers: { 'content-type': 'text/html; charset=utf-8' } }));
  }),
};
