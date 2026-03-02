import type { APIRoute } from 'astro';

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ ok: true, message: 'Webhook scaffold ready' }),
    {
      status: 202,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    },
  );
};
