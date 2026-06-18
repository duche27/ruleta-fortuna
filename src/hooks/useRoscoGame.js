import {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import confetti from 'canvas-confetti';
import {
    computeStats,
    getRandomPhotoIndex,
    createInitialProgress,
    applyAnswer,
    applyPass
} from '../domain/game-core.js';
import {createAudioPlayer} from '../infrastructure/audio-player.js';
import {isNativeApp} from '../infrastructure/platform.js';
import {
    triggerHaptic,
    triggerPassHaptic,
    requestWakeLock,
    releaseWakeLock,
    lockPortraitOrientation,
    unlockOrientation
} from '../infrastructure/mobile-session.js';

export function useRoscoGame({profile, questions, friendImages}) {
    const [gameState, setGameState] = useState('setup');
    const [progress, setProgress] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(profile.initialTime);
    const [isMuted, setIsMuted] = useState(false);
    const [showJumpScare, setShowJumpScare] = useState(false);
    const wakeLockRef = useRef(null);
    const profileRef = useRef(profile);
    profileRef.current = profile;

    const audioPlayer = useMemo(
        () => createAudioPlayer(() => profileRef.current.audio),
        []
    );
    const hasFriendImages = friendImages.length > 0;

    const playSound = useCallback((key) => {
        audioPlayer.play(key, isMuted);
    }, [audioPlayer, isMuted]);

    const showNextRandomPhoto = useCallback(() => {
        if (!hasFriendImages) return;
        setCurrentPhotoIndex(prev => getRandomPhotoIndex(friendImages.length, prev));
    }, [hasFriendImages, friendImages.length]);

    const acquireMobileSession = useCallback(async () => {
        wakeLockRef.current = await requestWakeLock();
        await lockPortraitOrientation();
    }, []);

    const releaseMobileSession = useCallback(async () => {
        await releaseWakeLock();
        wakeLockRef.current = null;
        await unlockOrientation();
    }, []);

    const startGame = useCallback(() => {
        playSound('intro');
        setProgress(createInitialProgress(questions));
        setCurrentIndex(0);
        setCurrentPhotoIndex(getRandomPhotoIndex(friendImages.length));
        setTimeLeft(profile.initialTime);
        setGameState('playing');
        acquireMobileSession();
    }, [playSound, questions, friendImages.length, profile.initialTime, acquireMobileSession]);

    const resetGame = useCallback(() => {
        setGameState('setup');
        setCurrentPhotoIndex(0);
        setTimeLeft(profile.initialTime);
        releaseMobileSession();
    }, [profile.initialTime, releaseMobileSession]);

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && gameState === 'playing') {
            setGameState('finished');
            releaseMobileSession();
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft, releaseMobileSession]);

    const friendPhotoSrc = useMemo(() => {
        if (!hasFriendImages) return null;
        return friendImages[currentPhotoIndex] || friendImages[0] || null;
    }, [hasFriendImages, friendImages, currentPhotoIndex]);

    const handleAnswer = useCallback((isCorrect) => {
        if (gameState !== 'playing') return;

        showNextRandomPhoto();
        triggerHaptic(isCorrect);

        if (!isCorrect) {
            setShowJumpScare(true);
            setTimeout(() => setShowJumpScare(false), 1500);
        }

        playSound(isCorrect ? 'correct' : 'incorrect');

        const result = applyAnswer(progress, questions, currentIndex, isCorrect);
        setProgress(result.progress);
        setCurrentIndex(result.currentIndex);
        if (result.gameState === 'finished') {
            setGameState('finished');
            releaseMobileSession();
        }
    }, [gameState, showNextRandomPhoto, playSound, progress, questions, currentIndex, releaseMobileSession]);

    const handlePass = useCallback(() => {
        if (gameState !== 'playing') return;
        showNextRandomPhoto();
        triggerPassHaptic();
        playSound('pass');

        const result = applyPass(progress, questions, currentIndex);
        setProgress(result.progress);
        setCurrentIndex(result.currentIndex);
        if (result.gameState === 'finished') {
            setGameState('finished');
            releaseMobileSession();
        }
    }, [gameState, showNextRandomPhoto, playSound, progress, questions, currentIndex, releaseMobileSession]);

    const handleAnswerRef = useRef(handleAnswer);
    const handlePassRef = useRef(handlePass);
    handleAnswerRef.current = handleAnswer;
    handlePassRef.current = handlePass;

    const handleSwipeAction = useCallback((action) => {
        if (action === 'correct') handleAnswerRef.current(true);
        else if (action === 'incorrect') handleAnswerRef.current(false);
        else if (action === 'pass') handlePassRef.current();
    }, []);

    const handleLetterClick = useCallback((index) => {
        if (gameState === 'setup') return;
        const newProgress = [...progress];
        newProgress[index] = {status: 'unanswered', answers: [], currentQ: 0};
        setProgress(newProgress);
        if (gameState === 'finished') {
            setGameState('playing');
            setCurrentIndex(index);
        }
    }, [gameState, progress]);

    const stats = useMemo(() => computeStats(progress, questions), [progress, questions]);

    useEffect(() => () => { releaseMobileSession(); }, [releaseMobileSession]);

    useEffect(() => {
        if (gameState !== 'playing') return;
        const onVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && !wakeLockRef.current) {
                wakeLockRef.current = await requestWakeLock();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'finished' || stats.correct <= 0) return;
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = {startVelocity: 30, spread: 360, ticks: 60, zIndex: 0};
        const randomInRange = (min, max) => Math.random() * (max - min) + min;
        const interval = setInterval(() => {
            const remaining = animationEnd - Date.now();
            if (remaining <= 0) return clearInterval(interval);
            const particleCount = 50 * (remaining / duration);
            confetti({...defaults, particleCount, origin: {x: randomInRange(0.1, 0.3), y: Math.random() - 0.2}});
            confetti({...defaults, particleCount, origin: {x: randomInRange(0.7, 0.9), y: Math.random() - 0.2}});
        }, 250);
        return () => clearInterval(interval);
    }, [gameState, stats.correct]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'playing') return;
            const key = e.key.toLowerCase();
            if (key === 'enter' || key === 'c') handleAnswerRef.current(true);
            else if (key === 'backspace' || key === 'i') handleAnswerRef.current(false);
            else if (key === ' ' || key === 'p') {
                e.preventDefault();
                handlePassRef.current();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    const currentQ = questions[currentIndex]?.questions?.[progress[currentIndex]?.currentQ];
    const currentLetter = questions[currentIndex];
    const compactShell = isNativeApp() && gameState !== 'setup';
    const compactPlaying = compactShell && gameState === 'playing' && progress.length > 0 && currentQ;

    const circleProps = {
        questions,
        progress,
        currentIndex,
        gameState,
        correctCount: stats.correct,
        onLetterClick: handleLetterClick
    };

    const questionPanelProps = currentQ && currentLetter ? {
        letter: currentLetter.letter,
        questionCount: currentLetter.questions.length,
        currentQuestionIndex: progress[currentIndex].currentQ,
        question: currentQ
    } : null;

    const playingControlsProps = {
        compact: compactShell,
        onCorrect: () => handleAnswer(true),
        onIncorrect: () => handleAnswer(false),
        onPass: handlePass
    };

    return {
        gameState,
        progress,
        timeLeft,
        isMuted,
        setIsMuted,
        showJumpScare,
        stats,
        compactShell,
        compactPlaying,
        currentQ,
        friendPhotoSrc,
        circleProps,
        questionPanelProps,
        playingControlsProps,
        startGame,
        resetGame,
        handleSwipeAction
    };
}
