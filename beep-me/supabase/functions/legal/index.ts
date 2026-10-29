// Public web pages for the Terms of Service, Privacy Policy and Community
// Guidelines, generated from the same content the app shows
// (scripts/build-legal.mjs writes content.json).
import { withSupabase } from 'npm:@supabase/server@1';

import { escapeHtml, html } from '../_shared/http.ts';
import docs from './content.json' with { type: 'json' };

type Doc = { slug: string; title: string; updated: string; intro: string; sections: { heading: string; paragraphs: string[] }[] };

const page = (doc: Doc) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(doc.title)} · Beep Me</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#F7F8F4;color:#142522;margin:0;line-height:1.55}main{max-width:720px;margin:0 auto;padding:32px 20px 64px}h1{font-size:28px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 8px}p{margin:0 0 12px;color:#3f4b48}.meta{color:#5F6B68;font-size:14px;margin-bottom:20px}nav a{color:#142522;margin-right:16px;font-weight:600}</style>
</head>
<body><main>
<nav><a href="/functions/v1/legal/terms">Terms</a><a href="/functions/v1/legal/privacy">Privacy</a><a href="/functions/v1/legal/guidelines">Guidelines</a></nav>
<h1>${escapeHtml(doc.title)}</h1>
<p class="meta">Last updated ${escapeHtml(doc.updated)}</p>
<p>${escapeHtml(doc.intro)}</p>
${doc.sections.map((s) => `<h2>${escapeHtml(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}`).join('')}
</main></body></html>`;

export default {
  fetch: withSupabase({ auth: 'none' }, (req) => {
    const slug = new URL(req.url).pathname.split('/').filter(Boolean).pop() ?? '';
    const doc = (docs as Record<string, Doc>)[slug];
    if (!doc) return Promise.resolve(html('<!doctype html><title>Not found</title><p>Not found</p>', 404));
    return Promise.resolve(html(page(doc)));
  }),
};
