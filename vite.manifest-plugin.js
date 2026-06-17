import fs from 'node:fs';
import {resolve} from 'node:path';

const ROOT = resolve(import.meta.dirname);
const ASSETS_ROOT = resolve(ROOT, 'assets');
const IMAGES = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const AUDIO = /\.(?:m4a|mp3|mp4|mpeg|ogg|wav)$/i;

function patternForAssetDir(relativeDir) {
    if (relativeDir.startsWith('images/')) return IMAGES;
    if (relativeDir.startsWith('audio/')) return AUDIO;
    return null;
}

function listAssetFiles(dir, pattern) {
    if (!fs.existsSync(dir) || !pattern) return [];
    return fs.readdirSync(dir)
        .filter(f => pattern.test(f) && !f.startsWith('.'))
        .sort();
}

function manifestContent(dir, pattern) {
    return JSON.stringify({files: listAssetFiles(dir, pattern)}, null, 2) + '\n';
}

function sendManifest(res, relativeDir) {
    const pattern = patternForAssetDir(relativeDir);
    if (!pattern) {
        res.statusCode = 404;
        res.end();
        return;
    }

    const dir = resolve(ASSETS_ROOT, relativeDir);
    if (!dir.startsWith(ASSETS_ROOT)) {
        res.statusCode = 403;
        res.end();
        return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(manifestContent(dir, pattern));
}

export function dynamicAssetManifests() {
    const middleware = (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (!url.startsWith('/assets/') || !url.endsWith('/manifest.json')) {
            return next();
        }

        const relativeDir = url.slice('/assets/'.length, -'/manifest.json'.length);
        sendManifest(res, relativeDir);
    };

    return {
        name: 'dynamic-asset-manifests',
        configureServer(server) {
            server.middlewares.use(middleware);
        },
        configurePreviewServer(server) {
            server.middlewares.use(middleware);
        }
    };
}
