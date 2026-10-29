export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Headers every function response carries; API JSON is never cached or sniffed. */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: SECURITY_HEADERS });
}

/** HTML responses (Connect return page, legal pages) with a strict CSP. */
export function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'Cache-Control': 'public, max-age=300',
      'content-type': 'text/html; charset=utf-8',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    },
  });
}

/** Escape text for safe interpolation into HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/** Runs a handler and turns thrown HttpErrors into JSON error responses. */
export async function guarded(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return json({ error: message }, 500);
  }
}

export function appUrl(): string {
  return (Deno.env.get('APP_URL') ?? 'https://beepme.app').replace(/\/$/, '');
}

/** Where Stripe-hosted flows send the student back; the page bounces into the app. */
export function functionsBaseUrl(): string {
  return `${Deno.env.get('SUPABASE_URL')}/functions/v1`;
}
