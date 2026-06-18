import {Capacitor} from '@capacitor/core';

export function isNativeApp() {
    if (typeof __NATIVE_SHELL__ !== 'undefined' && __NATIVE_SHELL__) return true;
    if (typeof window === 'undefined') return false;
    return Capacitor.isNativePlatform();
}

export function resolveAssetPath(path) {
    const normalized = path.replace(/^\//, '');
    return `${import.meta.env.BASE_URL}${normalized}`;
}
