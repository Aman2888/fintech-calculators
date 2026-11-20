import express from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(join(dist, '404.html'))) {
  throw new Error('Run npm run build before starting the production server.');
}

const app = express();
app.disable('x-powered-by');
app.use('/assets', express.static(join(dist, 'assets'), {
  index: false,
  redirect: false,
  setHeaders(response, filename) {
    if (/-[\w-]{8}\.(?:css|js)$/.test(filename)) {
      response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

app.get(['/robots.txt', '/sitemap.xml'], (request, response, next) => {
  const file = join(dist, request.path.toLowerCase());
  if (existsSync(file)) response.sendFile(file);
  else next();
});

app.get('*', (request, response) => {
  const normalized = request.path.toLowerCase().replace(/\/index\.html$/, '').replace(/\/+$/, '') || '/';
  if (/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(normalized)) {
    const file = join(dist, normalized, 'index.html');
    if (existsSync(file)) {
      if (request.path !== normalized) {
        return response.redirect(301, normalized + request.url.slice(request.path.length));
      }
      return response.sendFile(file);
    }
  }
  return response.status(404).sendFile(join(dist, '404.html'));
});

app.listen(Number(process.env.PORT ?? '3000'), () => {
  console.log('CALCULATE production server is ready.');
});
