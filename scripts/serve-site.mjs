import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('dist/site');
const port = Number(process.env.PORT ?? 4173);
const types = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.tgz': 'application/gzip',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', `http://${request.headers.host}`).pathname);
  const relative = normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  let file = join(root, relative);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  let status = 200;
  if (!existsSync(file) || !statSync(file).isFile()) {
    file = join(root, '404.html');
    status = 404;
  }
  response.statusCode = status;
  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (request.method === 'HEAD') return response.end();
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Patchcard preview at http://127.0.0.1:${port}`));
