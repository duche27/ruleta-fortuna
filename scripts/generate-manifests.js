// Genera manifest.json en cada subcarpeta de assets/images y assets/audio.
// Ejecutado por server.js (local) y por el workflow de GitHub Actions (producción).
// Los manifiestos son leídos por index.html sin necesitar la API de GitHub.

const fs   = require('fs');
const path = require('path');

const ROOT   = path.join(__dirname, '..');
const IMAGES = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const AUDIO  = /\.(?:m4a|mp3|mp4|mpeg|ogg|wav)$/i;

function writeIfChanged(filePath, content) {
    if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
        fs.writeFileSync(filePath, content);
        console.log('  updated:', path.relative(ROOT, filePath));
        return true;
    }
    return false;
}

function manifestFor(dir, pattern) {
    if (!fs.existsSync(dir)) return 0;
    const files = fs.readdirSync(dir)
        .filter(f => pattern.test(f) && !f.startsWith('.'))
        .sort();
    const content = JSON.stringify({ files }, null, 2) + '\n';
    return writeIfChanged(path.join(dir, 'manifest.json'), content) ? 1 : 0;
}

function run() {
    let updated = 0;

    // assets/images/<profile>/{random,background,wrong_answer}/
    const imagesRoot = path.join(ROOT, 'assets', 'images');
    if (fs.existsSync(imagesRoot)) {
        for (const profile of fs.readdirSync(imagesRoot)) {
            const profileDir = path.join(imagesRoot, profile);
            if (!fs.statSync(profileDir).isDirectory()) continue;
            for (const folder of ['random', 'background', 'wrong_answer']) {
                updated += manifestFor(path.join(profileDir, folder), IMAGES);
            }
        }
    }

    // assets/audio/<profile>/{correct,incorrect,pass}/
    const audioRoot = path.join(ROOT, 'assets', 'audio');
    if (fs.existsSync(audioRoot)) {
        for (const profile of fs.readdirSync(audioRoot)) {
            const profileDir = path.join(audioRoot, profile);
            if (!fs.statSync(profileDir).isDirectory()) continue;
            for (const folder of fs.readdirSync(profileDir)) {
                const sub = path.join(profileDir, folder);
                if (fs.statSync(sub).isDirectory()) {
                    updated += manifestFor(sub, AUDIO);
                }
            }
        }
    }

    if (updated === 0) {
        console.log('Manifests already up to date.');
    } else {
        console.log(`${updated} manifest(s) updated.`);
    }
}

run();
