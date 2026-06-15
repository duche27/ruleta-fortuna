import {Capacitor} from '@capacitor/core';

export function isNativeApp() {
    return Capacitor.isNativePlatform();
}

export function assetBaseUrl() {
    return import.meta.env.BASE_URL;
}

export function resolveAssetPath(path) {
    const normalized = path.replace(/^\//, '');
    return `${import.meta.env.BASE_URL}${normalized}`;
}
