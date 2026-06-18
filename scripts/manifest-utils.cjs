const path = require('path');
const {IMAGES, AUDIO, manifestContent} = require('./manifest-core.cjs');
const fs = require('fs');

function writeManifests(root) {
    let updated = 0;

    const imagesRoot = path.join(root, 'assets', 'images');
    if (fs.existsSync(imagesRoot)) {
        for (const profile of fs.readdirSync(imagesRoot)) {
            const profileDir = path.join(imagesRoot, profile);
            if (!fs.statSync(profileDir).isDirectory()) continue;
            for (const folder of ['random', 'background', 'wrong_answer']) {
                updated += writeManifestIfChanged(
                    path.join(profileDir, folder),
                    IMAGES
                );
            }
        }
    }

    const audioRoot = path.join(root, 'assets', 'audio');
    if (fs.existsSync(audioRoot)) {
        for (const profile of fs.readdirSync(audioRoot)) {
            const profileDir = path.join(audioRoot, profile);
            if (!fs.statSync(profileDir).isDirectory()) continue;
            for (const folder of fs.readdirSync(profileDir)) {
                const sub = path.join(profileDir, folder);
                if (fs.statSync(sub).isDirectory()) {
                    updated += writeManifestIfChanged(sub, AUDIO);
                }
            }
        }
    }

    return updated;
}

function writeManifestIfChanged(dir, pattern) {
    if (!fs.existsSync(dir)) return 0;
    const filePath = path.join(dir, 'manifest.json');
    const content = manifestContent(dir, pattern);
    if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
        fs.writeFileSync(filePath, content);
        return 1;
    }
    return 0;
}

module.exports = {
    IMAGES,
    AUDIO,
    manifestContent,
    writeManifests
};
