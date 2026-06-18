import {isNativeApp} from '../infrastructure/platform.js';
import {useRoscoGame} from '../hooks/useRoscoGame.js';
import {RoscoCircle} from './RoscoCircle.jsx';
import {QuestionPanel} from './QuestionPanel.jsx';
import {PlayingControls} from './PlayingControls.jsx';
import {FinishedPanel} from './FinishedPanel.jsx';
import {SwipePlaySurface} from './SwipePlaySurface.jsx';
import {GameTitle} from './GameTitle.jsx';
import {SetupPanel} from './SetupPanel.jsx';
import {GameHeader} from './GameHeader.jsx';
import {FriendPhoto} from './FriendPhoto.jsx';
import {JumpScare} from './JumpScare.jsx';

export default function RoscoGame({profile, questions, friendImages, backgroundImage, wrongAnswerImage}) {
    const {
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
    } = useRoscoGame({profile, questions, friendImages});

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
                    <GameTitle title={profile.title} subtitle={profile.subtitle}/>
                )}

                <div className={`w-full max-w-3xl bg-white/95 rounded-3xl shadow-xl overflow-hidden border border-slate-200 ${compactShell ? 'flex flex-1 min-h-0 flex-col' : ''}`}>
                    <GameHeader
                        compact={compactShell}
                        stats={stats}
                        gameState={gameState}
                        timeLeft={timeLeft}
                        isMuted={isMuted}
                        onToggleMute={() => setIsMuted(!isMuted)}
                        onReset={resetGame}
                    />

                    {compactPlaying ? (
                        <SwipePlaySurface
                            enabled
                            onSwipe={handleSwipeAction}
                            className="native-play-shell flex-1 min-h-0 flex flex-col p-2 overflow-hidden"
                        >
                            <div className="native-play-shell__rosco flex items-center justify-center flex-shrink-0">
                                <RoscoCircle {...circleProps} backgroundImage={backgroundImage} compact={false}/>
                            </div>
                            <div className="flex-1 min-h-0" aria-hidden="true"/>
                            <div className="flex-shrink-0 w-full">
                                <QuestionPanel {...questionPanelProps} compact/>
                            </div>
                            <div className="flex-shrink-0 pt-2">
                                <PlayingControls {...playingControlsProps}/>
                            </div>
                        </SwipePlaySurface>
                    ) : (
                        <div className={`flex flex-col md:flex-row items-center justify-center ${compactShell ? 'flex-1 min-h-0 gap-3 p-2 overflow-hidden' : 'p-6 sm:p-8 gap-8'}`}>
                            <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
                                <RoscoCircle {...circleProps} backgroundImage={backgroundImage} compact={compactShell}/>
                            </div>

                            <div className={`w-full max-w-md flex flex-col ${compactShell ? 'flex-1 min-h-0' : 'flex-1 min-h-[300px] justify-center'}`}>
                                {gameState === 'setup' && <SetupPanel onStart={startGame}/>}

                                {gameState === 'playing' && progress.length > 0 && currentQ && (
                                    <SwipePlaySurface enabled onSwipe={handleSwipeAction} className="flex flex-col h-full fade-in">
                                        <div className="flex flex-col h-full">
                                            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <QuestionPanel {...questionPanelProps}/>
                                                </div>
                                                <FriendPhoto src={friendPhotoSrc}/>
                                            </div>
                                            <PlayingControls {...playingControlsProps}/>
                                        </div>
                                    </SwipePlaySurface>
                                )}

                                {gameState === 'finished' && (
                                    <FinishedPanel
                                        compact={compactShell}
                                        correctCount={stats.correct}
                                        incorrectCount={stats.incorrect}
                                        onReset={resetGame}
                                    />
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

            {showJumpScare && <JumpScare imageUrl={wrongAnswerImage}/>}
        </div>
    );
}
