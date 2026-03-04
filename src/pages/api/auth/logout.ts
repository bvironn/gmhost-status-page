import type { APIRoute } from 'astro';
import { getSessionCookieName } from '@/lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(getSessionCookieName(), { path: '/' });
  return redirect('/login');
};
