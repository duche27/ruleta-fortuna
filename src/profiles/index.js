import albino from './albino.json';
import arribas from './arribas.json';
import test from './test.json';

const PROFILES = {albino, arribas, test};

export const DEFAULT_PROFILE = 'albino';

export function listProfiles() {
    return Object.keys(PROFILES).filter(name => name !== 'test');
}

export function loadProfile(name) {
    const profile = PROFILES[name];
    if (!profile) {
        throw new Error(`Perfil no encontrado: ${name}`);
    }
    return {...profile};
}

export function resolveProfileName(searchParams) {
    return searchParams.get('profile') || DEFAULT_PROFILE;
}
