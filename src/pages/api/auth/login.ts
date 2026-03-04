import type { APIRoute } from 'astro';
import {
  createSessionToken,
  getSessionCookieName,
  isAuthConfigured,
  isPasswordValid,
} from '@/lib/auth';

const FORBIDDEN = 403;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAuthConfigured()) {
    return new Response('Auth not configured', { status: FORBIDDEN });
  }

  const formData = await request.formData();
  const password = String(formData.get('password') ?? '');

  if (!isPasswordValid(password)) {
    return redirect('/login?error=1');
  }

  const token = createSessionToken();
  if (!token) {
    return new Response('Auth session could not be created', { status: 500 });
  }

  cookies.set(getSessionCookieName(), token, {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
  });

  return redirect('/');
};
