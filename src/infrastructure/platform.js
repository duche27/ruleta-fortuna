import {Capacitor} from '@capacitor/core';

/* global __NATIVE_SHELL__ */

export function isNativeApp() {
    if (typeof __NATIVE_SHELL__ !== 'undefined' && __NATIVE_SHELL__) return true;
    if (typeof window === 'undefined') return false;
    return Capacitor.isNativePlatform();
}

export function assetBaseUrl() {
    return import.meta.env.BASE_URL;
}

export function resolveAssetPath(path) {
    const normalized = path.replace(/^\//, '');
    return `${import.meta.env.BASE_URL}${normalized}`;
}
