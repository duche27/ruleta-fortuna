import {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import confetti from 'canvas-confetti';
import {
    computeStats,
    getNextIndex,
    getRandomPhotoIndex,
    detectSwipeDirection,
    resolveSwipeAction,
    getLetterFillColor,
    getAnswerSummary,
    createInitialProgress
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
import {
    Play, Check, XIcon, SkipForward, RotateCcw, Volume2, VolumeX, Clock
} from './Icons.jsx';

export default function RoscoGame({profile, questions, friendImages, backgroundImage, wrongAnswerImage}) {
    const [gameState, setGameState] = useState('setup');
    const [progress, setProgress] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(profile.initialTime);
    const [isMuted, setIsMuted] = useState(false);
    const [showJumpScare, setShowJumpScare] = useState(false);
    const wakeLockRef = useRef(null);
    const touchStartRef = useRef(null);
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

    const startGame = () => {
        playSound('intro');
        setProgress(createInitialProgress(questions));
        setCurrentIndex(0);
        setCurrentPhotoIndex(getRandomPhotoIndex(friendImages.length));
        setTimeLeft(profile.initialTime);
        setGameState('playing');
        acquireMobileSession();
    };

    const resetGame = () => {
        setGameState('setup');
        setCurrentPhotoIndex(0);
        setTimeLeft(profile.initialTime);
        releaseMobileSession();
    };

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

    const getFriendImage = (index) => {
        if (!hasFriendImages) return null;
        return friendImages[index] || friendImages[0] || null;
    };

    const handleAnswer = (isCorrect) => {
        if (gameState !== 'playing') return;

        showNextRandomPhoto();
        triggerHaptic(isCorrect);

        if (!isCorrect) {
            setShowJumpScare(true);
            setTimeout(() => setShowJumpScare(false), 1500);
        }

        playSound(isCorrect ? 'correct' : 'incorrect');

        const newProgress = [...progress];
        const currentLetterProg = {...newProgress[currentIndex]};
        currentLetterProg.answers = [...currentLetterProg.answers, isCorrect];
        currentLetterProg.currentQ += 1;

        if (currentLetterProg.currentQ >= questions[currentIndex].questions.length) {
            currentLetterProg.status = 'completed';
            newProgress[currentIndex] = currentLetterProg;
            const nextIdx = getNextIndex(currentIndex, newProgress, questions.length);
            if (nextIdx === -1) {
                setGameState('finished');
                releaseMobileSession();
            } else {
                setCurrentIndex(nextIdx);
            }
        } else {
            newProgress[currentIndex] = currentLetterProg;
        }
        setProgress(newProgress);
    };

    const handlePass = () => {
        if (gameState !== 'playing') return;
        showNextRandomPhoto();
        triggerPassHaptic();
        playSound('pass');

        const newProgress = [...progress];
        newProgress[currentIndex].status = 'passed';
        const nextIdx = getNextIndex(currentIndex, newProgress, questions.length);
        if (nextIdx === -1) {
            setGameState('finished');
            releaseMobileSession();
        } else {
            setCurrentIndex(nextIdx);
            setProgress(newProgress);
        }
    };

    const handleAnswerRef = useRef(handleAnswer);
    const handlePassRef = useRef(handlePass);
    handleAnswerRef.current = handleAnswer;
    handlePassRef.current = handlePass;

    const handleLetterClick = (index) => {
        if (gameState === 'setup') return;
        const newProgress = [...progress];
        newProgress[index] = {status: 'unanswered', answers: [], currentQ: 0};
        setProgress(newProgress);
        if (gameState === 'finished') {
            setGameState('playing');
            setCurrentIndex(index);
        }
    };

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
            if (key === 'enter' || key === 'c') handleAnswer(true);
            else if (key === 'backspace' || key === 'i') handleAnswer(false);
            else if (key === ' ' || key === 'p') {
                e.preventDefault();
                handlePass();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    useEffect(() => {
        if (gameState !== 'playing') return;

        const onTouchStart = (e) => {
            const touch = e.touches[0] ?? e.changedTouches[0];
            if (!touch) return;
            touchStartRef.current = {x: touch.clientX, y: touch.clientY, id: touch.identifier};
        };
        const onTouchEnd = (e) => {
            const start = touchStartRef.current;
            if (!start) return;
            const touch = Array.from(e.changedTouches).find((t) => t.identifier === start.id)
                ?? e.changedTouches[0];
            if (!touch) return;

            const deltaX = touch.clientX - start.x;
            const deltaY = touch.clientY - start.y;
            touchStartRef.current = null;

            const action = resolveSwipeAction(detectSwipeDirection(deltaX, deltaY));
            if (action === 'correct') handleAnswerRef.current(true);
            else if (action === 'incorrect') handleAnswerRef.current(false);
            else if (action === 'pass') handlePassRef.current();
        };

        window.addEventListener('touchstart', onTouchStart, {passive: true});
        window.addEventListener('touchend', onTouchEnd, {passive: true});
        return () => {
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [gameState]);

    const renderCircle = (compact = false) => {
        const radius = 140;
        const center = 160;
        return (
            <div
                className={`relative rosco-circle mx-auto ${compact ? 'rosco-circle--compact my-0' : 'my-4 sm:my-8'}`}
                data-testid="rosco-circle"
            >
                <svg className="w-full h-full" viewBox="0 0 320 320">
                    {questions.map((q, index) => {
                        const angle = (index / questions.length) * 2 * Math.PI - Math.PI / 2;
                        const x = center + radius * Math.cos(angle);
                        const y = center + radius * Math.sin(angle);
                        const prog = progress[index] || {status: 'unanswered', answers: []};
                        const {fill: fillColor, stroke: strokeColor, strokeWidth} =
                            getLetterFillColor({index, currentIndex, gameState, prog});
                        const summary = getAnswerSummary(prog);
                        return (
                            <g key={q.letter} transform={`translate(${x}, ${y})`}
                               onClick={() => handleLetterClick(index)}
                               className={gameState !== 'setup' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}>
                                <circle r="14" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth}
                                        className="transition-colors duration-300"/>
                                <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold"
                                      className="pointer-events-none font-sans">{q.letter}</text>
                                {summary && (
                                    <text x="0" y="22" textAnchor="middle" fill="white" fontSize="8"
                                          fontWeight="bold" className="pointer-events-none font-sans">
                                        {summary.correct > 0 ? `✓${summary.correct}` : ''}
                                        {summary.incorrect > 0 ? ` ✗${summary.incorrect}` : ''}
                                    </text>
                                )}
                                {q.questions.length > 1 && (
                                    <g transform="translate(10, -10)">
                                        <circle r="7" fill="#f97316"/>
                                        <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9"
                                              fontWeight="bold" className="pointer-events-none">
                                            {q.questions.length}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="absolute rosco-center-bg w-48 h-48 rounded-full z-0 opacity-20"
                         style={{
                             backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
                             backgroundSize: 'cover',
                             backgroundPosition: 'center',
                             backgroundColor: '#e2e8f0'
                         }}/>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`font-black text-slate-800 drop-shadow-md ${compact ? 'text-3xl' : 'text-4xl'}`}>{stats.correct}</div>
                        <div className={`font-bold text-slate-600 bg-white/60 px-3 py-0.5 rounded-full backdrop-blur-sm ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
                            Aciertos
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const currentQ = questions[currentIndex]?.questions?.[progress[currentIndex]?.currentQ];
    const compactShell = isNativeApp() && gameState !== 'setup';
    const compactPlaying = compactShell && gameState === 'playing' && progress.length > 0 && currentQ;

    const renderPlayingButtons = () => (
        <div className={`flex-shrink-0 ${compactShell ? 'space-y-2' : 'mt-auto space-y-4'}`}>
            {!compactShell && (
                <p className="text-xs text-center text-slate-400 sm:hidden">
                    Desliza ← correcto · → incorrecto · ↑ pasapalabra
                </p>
            )}
            <div className={`grid grid-cols-2 ${compactShell ? 'gap-2' : 'gap-4'}`}>
                <button onClick={() => handleAnswer(true)} data-testid="correct-button"
                        className={`group flex flex-col items-center justify-center bg-green-50 hover:bg-green-500 border-2 border-green-500 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md ${compactShell ? 'p-2' : 'p-4'}`}>
                    <div className={`bg-green-500 group-hover:bg-white rounded-full mb-1 transition-colors ${compactShell ? 'p-1.5' : 'p-2 mb-2'}`}>
                        <Check size={compactShell ? 18 : 24} className="text-white group-hover:text-green-600 transition-colors"/>
                    </div>
                    <span className={`font-bold text-green-700 group-hover:text-white transition-colors ${compactShell ? 'text-xs' : ''}`}>Correcto</span>
                </button>
                <button onClick={() => handleAnswer(false)} data-testid="incorrect-button"
                        className={`group flex flex-col items-center justify-center bg-red-50 hover:bg-red-500 border-2 border-red-500 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md ${compactShell ? 'p-2' : 'p-4'}`}>
                    <div className={`bg-red-500 group-hover:bg-white rounded-full mb-1 transition-colors ${compactShell ? 'p-1.5' : 'p-2 mb-2'}`}>
                        <XIcon size={compactShell ? 18 : 24} className="text-white group-hover:text-red-600 transition-colors"/>
                    </div>
                    <span className={`font-bold text-red-700 group-hover:text-white transition-colors ${compactShell ? 'text-xs' : ''}`}>Incorrecto</span>
                </button>
            </div>
            <button onClick={handlePass} data-testid="pass-button"
                    className={`w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-blue-500 text-slate-700 hover:text-white border border-slate-300 hover:border-blue-500 rounded-2xl transition-all duration-200 font-bold ${compactShell ? 'p-2 text-sm' : 'p-4 text-lg'}`}>
                <SkipForward size={compactShell ? 16 : 20}/> Pasapalabra
            </button>
        </div>
    );

    const renderQuestionHeader = (compact = false) => (
        <div className={`flex items-center justify-between ${compact ? 'mb-1' : 'mb-2'}`}>
            <div className="flex items-baseline gap-2">
                <span className={`font-black text-yellow-500 drop-shadow-sm ${compact ? 'text-3xl' : 'text-5xl'}`}>
                    {questions[currentIndex].letter}
                </span>
                <span className={`font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ${compact ? 'text-[10px]' : 'text-sm'}`}>
                    {currentQ.type === 'empieza' ? 'Empieza por' : 'Contiene la'}
                </span>
            </div>
            {questions[currentIndex].questions.length > 1 && (
                <div className={`font-bold text-orange-500 bg-orange-100 rounded-full ${compact ? 'text-[10px] px-2 py-0.5' : 'text-sm px-3 py-1'}`}>
                    {progress[currentIndex].currentQ + 1} / {questions[currentIndex].questions.length}
                </div>
            )}
        </div>
    );

    const renderQuestionCard = (compact = false) => (
        <div className={`bg-slate-50 rounded-2xl border border-slate-200 shadow-inner w-full ${compact ? 'p-3 flex flex-col gap-2' : 'p-5 mt-4 min-h-[120px] flex flex-col justify-center gap-4'}`}>
            <p className={`font-medium leading-snug ${compact ? 'text-sm' : 'text-lg sm:text-xl leading-relaxed'}`}>
                {currentQ.question.replace(/\s*:\s*$/, '')}
            </p>
            <div className={`bg-indigo-50 rounded-xl border border-indigo-100 ${compact ? 'p-2' : 'p-3'}`}>
                <span className={`font-bold text-indigo-400 uppercase tracking-wider block mb-0.5 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                    Respuesta esperada:
                </span>
                <span className={`font-bold text-indigo-700 ${compact ? 'text-sm' : 'text-lg'}`}>{currentQ.answer}</span>
            </div>
        </div>
    );

    return (
        <div
            className={`font-sans flex flex-col items-center relative ${
                compactShell
                    ? 'h-dvh max-h-dvh overflow-hidden px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]'
                    : 'min-h-screen p-4 sm:p-8 overflow-hidden'
            }`}
        >
            <div className="absolute inset-0 z-0 pointer-events-none"
                 style={{
                     backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     opacity: 0.1
                 }}/>

            <div className={`relative z-10 w-full flex flex-col items-center ${compactShell ? 'flex-1 min-h-0' : ''}`}>
                {(gameState === 'setup' || !isNativeApp()) && (
                    <header className="mb-4 sm:mb-8 text-center">
                        <h1 className="text-2xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm"
                            data-testid="game-title">
                            {profile.title}
                        </h1>
                        {profile.subtitle && <p className="text-slate-500 mt-2">{profile.subtitle}</p>}
                    </header>
                )}

                <div className={`w-full max-w-3xl bg-white/95 rounded-3xl shadow-xl overflow-hidden border border-slate-200 ${compactShell ? 'flex flex-1 min-h-0 flex-col' : ''}`}>
                    <div className={`bg-slate-100 border-b border-slate-200 flex justify-between items-center ${compactShell ? 'p-2 px-3 flex-shrink-0' : 'p-4 px-6'}`}>
                        <div className={`flex items-center ${compactShell ? 'gap-2' : 'gap-6'}`}>
                            <div className={`flex ${compactShell ? 'gap-2 text-sm' : 'gap-4'}`}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"/>
                                    <span className="font-semibold" data-testid="correct-count">{stats.correct}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"/>
                                    <span className="font-semibold">{stats.incorrect}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"/>
                                    <span className="font-semibold">{stats.remaining}</span>
                                </div>
                            </div>
                            {gameState === 'playing' && (
                                <div className={`flex items-center gap-1 rounded-full font-mono font-bold ${compactShell ? 'px-2 py-0.5 text-sm' : 'px-3 py-1'} ${timeLeft < 30 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-700'}`}>
                                    <Clock size={compactShell ? 14 : 16}/>
                                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsMuted(!isMuted)} data-testid="mute-button"
                                    className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-200"
                                    title={isMuted ? 'Activar Sonido' : 'Silenciar'}>
                                {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                            </button>
                            {gameState !== 'setup' && (
                                <button onClick={resetGame}
                                        className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-200"
                                        title="Reiniciar Juego">
                                    <RotateCcw size={20}/>
                                </button>
                            )}
                        </div>
                    </div>

                    {compactPlaying ? (
                        <div className="native-play-shell flex-1 min-h-0 flex flex-col p-2 overflow-hidden" data-testid="playing-panel">
                            <div className="native-play-shell__rosco flex items-center justify-center flex-shrink-0">
                                {renderCircle(false)}
                            </div>
                            <div className="flex-1 min-h-0" aria-hidden="true"/>
                            <div className="flex-shrink-0 w-full">
                                {renderQuestionHeader(true)}
                                {renderQuestionCard(true)}
                            </div>
                            <div className="flex-shrink-0 pt-2">
                                {renderPlayingButtons()}
                            </div>
                        </div>
                    ) : (
                        <div className={`flex flex-col md:flex-row items-center justify-center ${compactShell ? 'flex-1 min-h-0 gap-3 p-2 overflow-hidden' : 'p-6 sm:p-8 gap-8'}`}>
                            <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
                                {renderCircle(compactShell)}
                            </div>

                            <div className={`w-full max-w-md flex flex-col ${compactShell ? 'flex-1 min-h-0' : 'flex-1 min-h-[300px] justify-center'}`}>
                            {gameState === 'setup' && (
                                <div className="text-center space-y-6 fade-in">
                                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                        <h2 className="text-2xl font-bold text-blue-800 mb-4">¿Listo para jugar?</h2>
                                        <p className="text-slate-600 mb-6">
                                            Se te leerá una definición para cada letra. Indica si tu respuesta es
                                            correcta, incorrecta o di &quot;Pasapalabra&quot; para dejarla para la siguiente ronda.
                                        </p>
                                        <button onClick={startGame} data-testid="start-button"
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
                                            <Play size={20}/> Comenzar Juego
                                        </button>
                                    </div>
                                </div>
                            )}

                            {gameState === 'playing' && progress.length > 0 && currentQ && (
                                <div className="flex flex-col h-full fade-in" data-testid="playing-panel">
                                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 min-w-0">
                                            {renderQuestionHeader(false)}
                                            {renderQuestionCard(false)}
                                        </div>
                                        <div className="w-full sm:w-32 h-40 sm:h-auto flex-shrink-0">
                                            <div className="h-full bg-white p-2 rounded-xl shadow-md border border-slate-200 transform rotate-2 hover:rotate-0 transition-transform duration-300 overflow-hidden">
                                                {getFriendImage(currentPhotoIndex) ? (
                                                    <img src={getFriendImage(currentPhotoIndex)} className="w-full h-full object-cover rounded shadow-inner" alt="Foto"/>
                                                ) : (
                                                    <div className="w-full h-full rounded bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-semibold text-center px-4">
                                                        Sin fotos
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {renderPlayingButtons()}
                                </div>
                            )}

                            {gameState === 'finished' && (
                                <div className={`text-center fade-in w-full mx-auto ${compactShell ? 'space-y-3 py-1' : 'space-y-6 max-w-xl'}`} data-testid="finished-panel">
                                    <div className={`bg-slate-50 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden ${compactShell ? 'p-4' : 'p-8'}`}>
                                        <h2 className={`font-black text-slate-800 mb-1 relative z-10 ${compactShell ? 'text-2xl' : 'text-4xl mb-2'}`}>¡Juego Terminado!</h2>
                                        <p className={`text-slate-500 relative z-10 ${compactShell ? 'text-sm mb-4' : 'mb-8'}`}>Aquí están tus resultados finales.</p>
                                        <div className={`grid grid-cols-2 ${compactShell ? 'gap-2 mb-4' : 'gap-4 mb-8'}`}>
                                            <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${compactShell ? 'p-3' : 'p-4'}`}>
                                                <span className={`font-black text-green-500 drop-shadow-sm ${compactShell ? 'text-3xl' : 'text-5xl'}`}>{stats.correct}</span>
                                                <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Aciertos</span>
                                            </div>
                                            <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${compactShell ? 'p-3' : 'p-4'}`}>
                                                <span className={`font-black text-red-500 drop-shadow-sm ${compactShell ? 'text-3xl' : 'text-5xl'}`}>{stats.incorrect}</span>
                                                <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Errores</span>
                                            </div>
                                        </div>
                                        <button onClick={resetGame}
                                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-all ${compactShell ? 'px-6 py-3 text-sm' : 'px-8 py-4'}`}>
                                            <RotateCcw size={compactShell ? 16 : 20}/> Volver a Jugar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    )}
                </div>
                {!compactShell && (
                    <footer className="mt-8 text-center text-sm text-slate-600 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full relative z-10">
                        Nota: En esta versión tú actúas como el presentador.
                    </footer>
                )}
            </div>

            {showJumpScare && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in"
                     data-testid="jump-scare">
                    <div className="relative animate-jump-scare">
                        {wrongAnswerImage ? (
                            <img src={wrongAnswerImage} className="max-h-[85vh] max-w-[90vw] rounded-3xl border-8 border-white shadow-[0_0_50px_rgba(239,68,68,0.5)]"
                                 alt="¡INCORRECTO!"/>
                        ) : (
                            <div className="max-h-[85vh] max-w-[90vw] rounded-3xl border-8 border-white bg-red-600 px-16 py-24 text-white text-6xl font-black shadow-[0_0_50px_rgba(239,68,68,0.5)]">
                                ¡INCORRECTO!
                            </div>
                        )}
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-2 rounded-full font-black text-2xl shadow-xl transform -rotate-2">
                            ¡INCORRECTO!
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
