import {createRequire} from 'node:module';
import {resolve} from 'node:path';

const require = createRequire(import.meta.url);
const {patternForAssetDir, manifestContent} = require('./scripts/manifest-core.cjs');

const ASSETS_ROOT = resolve(import.meta.dirname, 'assets');

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
