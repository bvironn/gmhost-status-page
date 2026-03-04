import { defineMiddleware } from 'astro:middleware';
import { getSessionCookieName, isSessionTokenValid } from '@/lib/auth';

const PUBLIC_PATHS = new Set(['/login', '/api/auth/login', '/api/auth/logout', '/api/webhooks']);

const isProtectedPath = (pathname: string) => pathname === '/' || pathname === '/api/metrics.json';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (PUBLIC_PATHS.has(pathname) || !isProtectedPath(pathname)) {
    return next();
  }

  const sessionCookie = context.cookies.get(getSessionCookieName())?.value;
  const isAuthenticated = isSessionTokenValid(sessionCookie);

  if (isAuthenticated) {
    return next();
  }

  if (pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({ error: true, message: 'Unauthorized' }),
      {
        status: 401,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      },
    );
  }

  return context.redirect('/login');
});
