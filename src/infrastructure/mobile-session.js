import {Haptics, ImpactStyle} from '@capacitor/haptics';
import {ScreenOrientation} from '@capacitor/screen-orientation';
import {isNativeApp} from './platform.js';

let wakeLock = null;

export async function triggerHaptic(isCorrect) {
    if (isNativeApp()) {
        try {
            await Haptics.impact({
                style: isCorrect === true ? ImpactStyle.Light : ImpactStyle.Heavy
            });
        } catch { /* noop */ }
        return;
    }
    if (navigator.vibrate) {
        navigator.vibrate(isCorrect === true ? 30 : [80, 40, 80]);
    }
}

export async function triggerPassHaptic() {
    if (isNativeApp()) {
        try {
            await Haptics.impact({style: ImpactStyle.Medium});
        } catch { /* noop */ }
        return;
    }
    if (navigator.vibrate) navigator.vibrate(20);
}

export async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return null;
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        return wakeLock;
    } catch {
        return null;
    }
}

export async function releaseWakeLock() {
    if (!wakeLock) return;
    try {
        await wakeLock.release();
    } catch { /* noop */ }
    wakeLock = null;
}

export async function lockPortraitOrientation() {
    if (isNativeApp()) {
        try {
            await ScreenOrientation.lock({orientation: 'portrait'});
        } catch { /* noop */ }
        return;
    }
    try {
        if (screen.orientation?.lock) {
            await screen.orientation.lock('portrait');
        }
    } catch { /* noop */ }
}

export async function unlockOrientation() {
    if (isNativeApp()) {
        try {
            await ScreenOrientation.unlock();
        } catch { /* noop */ }
        return;
    }
    try {
        screen.orientation?.unlock?.();
    } catch { /* noop */ }
}
