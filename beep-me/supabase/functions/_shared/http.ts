export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
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
