import {
    isSupportedImageFile,
    isSupportedAudioFile,
    buildAssetUrl,
    manifestFilesToUrls
} from '../domain/game-core.js';
import {resolveAssetPath} from './platform.js';

const IMAGE_REGEX = /\.(?:avif|gif|jpe?g|png|webp)/i;
const AUDIO_REGEX = /\.(?:m4a|mp3|mp4|mpeg|ogg|wav)/i;

async function loadFromManifest(basePath, supportedFn) {
    const url = resolveAssetPath(`${basePath}manifest.json`);
    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    return manifestFilesToUrls(data, resolveAssetPath(basePath), supportedFn);
}

async function loadFromDirectoryListing(basePath, regex) {
    const r = await fetch(resolveAssetPath(basePath));
    if (!r.ok) return [];
    const text = await r.text();
    const files = [...text.matchAll(new RegExp(`<a[^>]*href="([^"?#]+${regex.source})"`, 'gi'))]
        .map(m => decodeURIComponent(m[1]).split('/').pop())
        .filter(f => f && f !== '..' && f !== '.');
    return files.map(f => buildAssetUrl(resolveAssetPath(basePath), f));
}

async function loadFolderAssets(basePath, supportedFn, listingRegex) {
    try {
        const urls = await loadFromManifest(basePath, supportedFn);
        if (urls.length > 0) return urls;
    } catch { /* no manifest */ }

    if (import.meta.env.DEV) {
        try {
            const urls = await loadFromDirectoryListing(basePath, listingRegex);
            if (urls.length > 0) return urls;
        } catch { /* no listing */ }
    }

    return [];
}

export async function loadFolderImages(profileName, folder) {
    const basePath = `assets/images/${profileName}/${folder}/`;
    return loadFolderAssets(basePath, isSupportedImageFile, IMAGE_REGEX);
}

export async function loadFolderAudio(basePath) {
    return loadFolderAssets(basePath, isSupportedAudioFile, AUDIO_REGEX);
}

export async function loadRandomPhotos(profileName) {
    const urls = await loadFolderImages(profileName, 'random');
    if (urls.length === 0) {
        console.warn(`No se encontraron fotos en assets/images/${profileName}/random/.`);
    }
    return urls;
}

export async function loadSingleImage(profileName, folder) {
    const urls = await loadFolderImages(profileName, folder);
    return urls[0] || null;
}

export async function loadQuestions(profileName) {
    try {
        const r = await fetch(resolveAssetPath(`questions_and_answers/${profileName}.json`));
        if (r.ok) return await r.json();
    } catch { /* not found */ }
    console.warn(`No se encontraron preguntas en questions_and_answers/${profileName}.json`);
    return [];
}

async function loadSingleAudio(profileName, category, {fallbackToShared = false} = {}) {
    const profileBase = `assets/audio/${profileName}/${category}/`;
    const sharedBase = `assets/audio/shared/${category}/`;

    const urls = await loadFolderAudio(profileBase);
    if (urls.length > 0) return urls[0];

    if (fallbackToShared) {
        const sharedUrls = await loadFolderAudio(sharedBase);
        if (sharedUrls.length > 0) return sharedUrls[0];
    }

    return null;
}

async function loadSharedSingleAudio(category) {
    const urls = await loadFolderAudio(`assets/audio/shared/${category}/`);
    return urls[0] || null;
}

export async function resolveProfileAudio(profile) {
    const audioCfg = profile.audio || {};

    const [introSrc, correctSrc, incorrectSrc, passSrc] = await Promise.all([
        audioCfg.intro?.src ? Promise.resolve(resolveAssetPath(audioCfg.intro.src)) : loadSharedSingleAudio('intro'),
        audioCfg.correct?.src ? Promise.resolve(resolveAssetPath(audioCfg.correct.src)) : loadSingleAudio(profile.name, 'correct'),
        audioCfg.incorrect?.src ? Promise.resolve(resolveAssetPath(audioCfg.incorrect.src)) : loadSingleAudio(profile.name, 'incorrect', {fallbackToShared: false}),
        audioCfg.pass?.src ? Promise.resolve(resolveAssetPath(audioCfg.pass.src)) : loadSingleAudio(profile.name, 'pass')
    ]);

    return {
        ...profile,
        audio: {
            intro:     {...(audioCfg.intro || {}),     src: introSrc},
            correct:   {...(audioCfg.correct || {}),   src: correctSrc},
            incorrect: {...(audioCfg.incorrect || {}), src: incorrectSrc},
            pass:      {...(audioCfg.pass || {}),      src: passSrc}
        }
    };
}

export async function loadGameResources(profile) {
    const friendImages = Array.isArray(profile.images?.friends) ? profile.images.friends : [];
    const questions = Array.isArray(profile.questions) ? profile.questions : [];

    const [friends, loadedQuestions, background, wrongAnswer] = await Promise.all([
        friendImages.length === 0 ? loadRandomPhotos(profile.name) : Promise.resolve(friendImages),
        questions.length === 0 ? loadQuestions(profile.name) : Promise.resolve(questions),
        profile.images?.background ? Promise.resolve(resolveAssetPath(profile.images.background)) : loadSingleImage(profile.name, 'background'),
        profile.images?.wrongAnswer ? Promise.resolve(resolveAssetPath(profile.images.wrongAnswer)) : loadSingleImage(profile.name, 'wrong_answer')
    ]);

    const profileWithAudio = await resolveProfileAudio(profile);

    return {
        profile: profileWithAudio,
        friendImages: friends,
        questions: loadedQuestions,
        backgroundImage: background,
        wrongAnswerImage: wrongAnswer
    };
}
