import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';

const root = join(process.cwd(), 'frontend', 'dist', 'spa-frontend');
const port = process.env.PORT ? Number(process.env.PORT) : 4300;

function getPath(urlPath) {
    if (urlPath === '/' || urlPath === '') return join(root, 'index.html');
    // Ensure leading slash removed
    const p = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
    const candidate = join(root, p);
    return candidate;
}

const server = createServer((req, res) => {
    try {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        let filePath = getPath(url.pathname);
        let stats;
        try {
            stats = statSync(filePath);
        } catch (e) {
            // fallback to index.html (SPA routes)
            filePath = join(root, 'index.html');
            stats = statSync(filePath);
        }
        res.writeHead(200, {
            'Content-Type': mime(filePath),
            'Content-Length': stats.size,
        });
        createReadStream(filePath).pipe(res);
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error: ' + String(err));
    }
});

function mime(path) {
    if (path.endsWith('.html')) return 'text/html; charset=utf-8';
    if (path.endsWith('.js')) return 'application/javascript; charset=utf-8';
    if (path.endsWith('.css')) return 'text/css; charset=utf-8';
    if (path.endsWith('.json')) return 'application/json; charset=utf-8';
    if (path.endsWith('.svg')) return 'image/svg+xml';
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
    return 'application/octet-stream';
}

server.listen(port, () => {
    console.log(`Static server serving ${root} on http://localhost:${port}`);
});
