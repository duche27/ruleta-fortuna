const fs = require('fs');

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

module.exports = {
    IMAGES,
    AUDIO,
    patternForAssetDir,
    listAssetFiles,
    manifestContent
};
