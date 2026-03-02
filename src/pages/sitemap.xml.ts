import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ url }) => {
  const pages = ['/'];
  const now = new Date().toISOString();

  const urls = pages
    .map((path) => {
      const location = new URL(path, url.origin).toString();
      return `<url><loc>${location}</loc><lastmod>${now}</lastmod></url>`;
    })
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
