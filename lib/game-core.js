/**
 * Pure game logic shared by index.html and unit tests.
 */
(function (root) {
    const IMAGE_EXT = /\.(?:avif|gif|jpe?g|png|webp)$/i;
    const AUDIO_EXT = /\.(?:m4a|mp3|mp4|mpeg|ogg|wav)$/i;

    function isSupportedImageFile(fileName) {
        return IMAGE_EXT.test(fileName);
    }

    function isSupportedAudioFile(fileName) {
        return AUDIO_EXT.test(fileName);
    }

    function buildAssetUrl(basePath, fileName) {
        return `${basePath}${encodeURIComponent(fileName)}`;
    }

    function manifestFilesToUrls(data, basePath, supportedFn) {
        const files = Array.isArray(data) ? data : (data && data.files) || [];
        return files.filter(supportedFn).map(f => buildAssetUrl(basePath, f));
    }

    function computeStats(progress, questions) {
        let correct = 0;
        let incorrect = 0;
        progress.forEach(p => {
            (p.answers || []).forEach(ans => {
                if (ans) correct++;
                else incorrect++;
            });
        });
        const totalQuestions = questions.reduce((sum, q) => sum + q.questions.length, 0);
        return {correct, incorrect, remaining: totalQuestions - correct - incorrect};
    }

    function getNextIndex(startIndex, currentProgress, questionsLength) {
        if (questionsLength === 0) return -1;
        let nextIdx = (startIndex + 1) % questionsLength;
        let loopCount = 0;
        while (currentProgress[nextIdx].status === 'completed') {
            nextIdx = (nextIdx + 1) % questionsLength;
            loopCount++;
            if (loopCount > questionsLength) return -1;
        }
        return nextIdx;
    }

    function getRandomPhotoIndex(imageCount, excludeIndex = -1) {
        if (imageCount <= 0) return -1;
        if (imageCount === 1) return 0;
        let nextIndex = excludeIndex;
        while (nextIndex === excludeIndex) {
            nextIndex = Math.floor(Math.random() * imageCount);
        }
        return nextIndex;
    }

    function detectSwipeDirection(deltaX, deltaY, threshold = 50) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX < threshold && absY < threshold) return null;
        if (absX > absY) {
            return deltaX > 0 ? 'right' : 'left';
        }
        return deltaY < 0 ? 'up' : 'down';
    }

    function getLetterFillColor({index, currentIndex, gameState, prog}) {
        if (gameState === 'playing' && index === currentIndex) {
            return {fill: '#eab308', stroke: '#ca8a04', strokeWidth: '3'};
        }
        if (prog.status === 'completed') {
            const allCorrect = prog.answers.every(a => a === true);
            return {
                fill: allCorrect ? '#22c55e' : '#ef4444',
                stroke: 'none',
                strokeWidth: '0'
            };
        }
        return {fill: '#3b82f6', stroke: 'none', strokeWidth: '0'};
    }

    function getAnswerSummary(prog) {
        if (!prog || prog.status !== 'completed' || !prog.answers.length) return null;
        const correct = prog.answers.filter(Boolean).length;
        const incorrect = prog.answers.length - correct;
        return {correct, incorrect};
    }

    function createInitialProgress(questions) {
        return questions.map(() => ({
            status: 'unanswered',
            answers: [],
            currentQ: 0
        }));
    }

    function applyAnswer(progress, questions, currentIndex, isCorrect) {
        const newProgress = progress.map(p => ({...p, answers: [...p.answers]}));
        const currentLetterProg = newProgress[currentIndex];
        currentLetterProg.answers.push(isCorrect);
        currentLetterProg.currentQ += 1;

        let nextIndex = currentIndex;
        let gameState = 'playing';

        if (currentLetterProg.currentQ >= questions[currentIndex].questions.length) {
            currentLetterProg.status = 'completed';
            const nextIdx = getNextIndex(currentIndex, newProgress, questions.length);
            if (nextIdx === -1) {
                gameState = 'finished';
            } else {
                nextIndex = nextIdx;
            }
        }

        return {progress: newProgress, currentIndex: nextIndex, gameState};
    }

    function applyPass(progress, questions, currentIndex) {
        const newProgress = progress.map(p => ({...p, answers: [...p.answers]}));
        newProgress[currentIndex].status = 'passed';

        const nextIdx = getNextIndex(currentIndex, newProgress, questions.length);
        if (nextIdx === -1) {
            return {progress: newProgress, currentIndex, gameState: 'finished'};
        }
        return {progress: newProgress, currentIndex: nextIdx, gameState: 'playing'};
    }

    const GameCore = {
        isSupportedImageFile,
        isSupportedAudioFile,
        buildAssetUrl,
        manifestFilesToUrls,
        computeStats,
        getNextIndex,
        getRandomPhotoIndex,
        detectSwipeDirection,
        getLetterFillColor,
        getAnswerSummary,
        createInitialProgress,
        applyAnswer,
        applyPass
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = GameCore;
    } else {
        root.GameCore = GameCore;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
