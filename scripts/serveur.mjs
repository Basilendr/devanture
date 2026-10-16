// Petit serveur local du dossier dist/, avec les mêmes adresses propres et la même compression que Vercel.
// Usage : node scripts/serveur.mjs  (puis http://127.0.0.1:4390)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { gzipSync } from 'node:zlib';

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };

export function demarrer(port = 4390) {
  return createServer(async (req, res) => {
    let chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (chemin === '/') chemin = '/index.html';
    else if (!extname(chemin)) chemin += '.html';
    let statut = 200;
    let corps = await readFile(join('dist', chemin)).catch(() => null);
    if (!corps) {
      statut = 404;
      chemin = '/404.html';
      corps = await readFile('dist/404.html');
    }
    const type = TYPES[extname(chemin)] || 'application/octet-stream';
    const entetes = { 'Content-Type': type, 'Cache-Control': chemin.startsWith('/_astro/') ? 'public, max-age=31536000, immutable' : 'no-cache' };
    if (!type.startsWith('image/png') && /gzip/.test(req.headers['accept-encoding'] || '')) {
      corps = gzipSync(corps);
      entetes['Content-Encoding'] = 'gzip';
    }
    res.writeHead(statut, entetes);
    res.end(corps);
  })
    .on('error', (e) => {
      console.error(`Port ${port} indisponible : ${e.message}`);
      process.exit(1);
    })
    .listen(port, '127.0.0.1');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demarrer();
  console.log('http://127.0.0.1:4390');
}
