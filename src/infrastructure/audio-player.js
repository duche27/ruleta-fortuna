let currentAudio = null;

export function createAudioPlayer(getAudioConfig) {
    const stop = () => {
        if (!currentAudio) return;
        try {
            if (currentAudio.__cutoffHandler) {
                currentAudio.removeEventListener('timeupdate', currentAudio.__cutoffHandler);
                currentAudio.__cutoffHandler = null;
            }
            currentAudio.pause();
            currentAudio.currentTime = 0;
        } catch { /* noop */ }
        currentAudio = null;
    };

    const play = (key, isMuted) => {
        if (isMuted) {
            stop();
            return null;
        }

        const cfg = getAudioConfig()?.[key];
        if (!cfg?.src) return null;

        stop();

        try {
            const audio = new Audio(cfg.src);
            audio.volume = cfg.volume ?? 0.7;

            if (cfg.cutoffAt) {
                const cutoffHandler = function () {
                    if (this.currentTime >= cfg.cutoffAt) {
                        try {
                            this.pause();
                            this.currentTime = 0;
                        } catch { /* noop */ }
                        this.removeEventListener('timeupdate', cutoffHandler);
                        this.__cutoffHandler = null;
                        if (currentAudio === this) currentAudio = null;
                    }
                };
                audio.__cutoffHandler = cutoffHandler;
                audio.addEventListener('timeupdate', cutoffHandler);
            }

            currentAudio = audio;
            audio.play().catch(e => console.log('Audio bloqueado', e));
            return audio;
        } catch {
            currentAudio = null;
            return null;
        }
    };

    return {play, stop};
}
