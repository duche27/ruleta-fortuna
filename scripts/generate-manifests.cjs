const {writeManifests} = require('./manifest-utils.cjs');

const ROOT = require('path').join(__dirname, '..');
const updated = writeManifests(ROOT);

if (updated === 0) {
    console.log('Manifests already up to date.');
} else {
    console.log(`${updated} manifest(s) updated.`);
}
