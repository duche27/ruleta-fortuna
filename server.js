// Servidor local para ruleta-fortuna.
// Sirve ficheros estáticos Y genera listados de directorio que el juego puede parsear.
//
// Uso:  node server.js
// Luego abre http://localhost:8080 en el navegador.
//
// Por qué existe esto: los navegadores no pueden listar el contenido de una carpeta
// por sí solos; necesitan que el servidor devuelva un HTML con los enlaces.
// Con este servidor basta con soltar imágenes en assets/images/<perfil>/random/ y
// el juego las detecta automáticamente sin necesitar ningún manifest.json.

const http = require('http');
const fs   = require('fs');
const path = require('path');
const PORT = 8080;
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.webp': 'image/webp',
    '.mp3':  'audio/mpeg',
    '.mp4':  'audio/mp4',
    '.m4a':  'audio/mp4',
    '.mpeg': 'audio/mpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
};

function serveDirectory(dirPath, urlPath, res) {
    const entries = fs.readdirSync(dirPath);
    const links = entries
        .map(f => `<a href="${encodeURIComponent(f)}">${f}</a>`)
        .join('\n');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html><body>\n${links}\n</body></html>`);
}

http.createServer((req, res) => {
    const urlPath  = decodeURIComponent(req.url.split('?')[0]);
    const filePath = path.join(ROOT, urlPath);

    // Security: block path traversal outside ROOT
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
        res.writeHead(403); res.end('Forbidden'); return;
    }

    let stat;
    try { stat = fs.statSync(filePath); } catch {
        res.writeHead(404); res.end('Not found'); return;
    }

    if (stat.isDirectory()) {
        // Try index.html first
        const index = path.join(filePath, 'index.html');
        if (fs.existsSync(index)) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            fs.createReadStream(index).pipe(res);
        } else {
            serveDirectory(filePath, urlPath, res);
        }
        return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);

}).listen(PORT, '127.0.0.1', () => {
    console.log(`\nServidor arriba → http://localhost:${PORT}\n`);
    console.log('Suelta imágenes en assets/images/<perfil>/random/ y recarga el navegador.');
    console.log('Ctrl+C para parar.\n');
});
