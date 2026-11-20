import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createServer, loadEnv } from 'vite';

const env = loadEnv('production', process.cwd(), ['SITE_URL']);
const configuredUrl = process.env.SITE_URL ?? env.SITE_URL;
let origin;
if (configuredUrl) {
  const url = new URL(configuredUrl);
  if (url.protocol !== 'https:' || url.href !== `${url.origin}/` || url.hostname === 'localhost') {
    throw new Error('SITE_URL must be the public HTTPS origin, without a path or credentials.');
  }
  origin = url.origin;
}

const vite = await createServer({ mode: 'production', server: { middlewareMode: true, watch: null, ws: false } });
try {
  const { renderPage, seoPaths } = await vite.ssrLoadModule('/src/prerender.tsx');
  const template = await readFile('dist/index.html', 'utf8');
  for (const pathname of [...seoPaths, '/404']) {
    const { head, body } = renderPage(pathname, origin);
    const destination = pathname === '/404' ? 'dist/404.html' : join('dist', pathname, 'index.html');
    const siteOrigin = origin ? `<meta name="site-origin" content="${origin}">` : '';
    const html = template
      .replace('<!-- page-seo -->', () => siteOrigin + head)
      .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }

  const sitemap = origin ? `Sitemap: ${origin}/sitemap.xml\n` : '';
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n${sitemap}`);
  if (origin) {
    const entries = seoPaths.map((pathname) => `  <url><loc>${new URL(pathname, origin).href}</loc></url>`);
    await writeFile('dist/sitemap.xml', [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...entries,
      '</urlset>',
      '',
    ].join('\n'));
  }
  console.log(`Prerendered ${seoPaths.length} pages and a 404 page.`);
  if (!origin) console.log('Set SITE_URL for indexable production pages and sitemap generation.');
} finally {
  await vite.close();
}
