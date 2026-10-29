// Generates the public legal pages (web/legal/*.html) and the Edge Function's
// content.json from the single source in src/features/legal/content.ts.
//   node --experimental-strip-types scripts/build-legal.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { LEGAL_DOCS } = await import(join(root, 'src/features/legal/content.ts'));

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const page = (doc) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${esc(doc.title)} · Beep Me</title>
<style>body{font-family:-apple-system,system-ui,sans-serif;background:#F7F8F4;color:#142522;margin:0;line-height:1.55}main{max-width:720px;margin:0 auto;padding:32px 20px 64px}h1{font-size:28px;margin:0 0 4px}h2{font-size:18px;margin:28px 0 8px}p{margin:0 0 12px;color:#3f4b48}.meta{color:#5F6B68;font-size:14px;margin-bottom:20px}nav a{color:#142522;margin-right:16px;font-weight:600}</style>
</head>
<body><main>
<nav><a href="terms.html">Terms</a><a href="privacy.html">Privacy</a><a href="guidelines.html">Guidelines</a></nav>
<h1>${esc(doc.title)}</h1>
<p class="meta">Last updated ${esc(doc.updated)}</p>
<p>${esc(doc.intro)}</p>
${doc.sections.map((s) => `<h2>${esc(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}`).join('\n')}
</main></body></html>
`;

mkdirSync(join(root, 'web/legal'), { recursive: true });
for (const doc of Object.values(LEGAL_DOCS)) writeFileSync(join(root, 'web/legal', `${doc.slug}.html`), page(doc));
writeFileSync(join(root, 'supabase/functions/legal/content.json'), JSON.stringify(LEGAL_DOCS, null, 2) + '\n');
console.log('wrote web/legal/*.html and supabase/functions/legal/content.json');
