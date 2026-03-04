import { defineMiddleware } from 'astro:middleware';
import { getSessionCookieName, isSessionTokenValid } from '@/lib/auth';

const PUBLIC_PATHS = new Set([
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/webhooks',
  '/favicon.svg',
  '/robots.txt',
  '/sitemap.xml',
]);

const isPublicPath = (pathname: string) => {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith('/_astro/')) return true;
  return /\.[a-z0-9]+$/i.test(pathname);
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (isPublicPath(pathname)) {
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
