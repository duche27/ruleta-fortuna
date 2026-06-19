import {RotateCcw, Volume2, VolumeX, Clock} from './Icons.jsx';

export function GameHeader({
    compact,
    stats,
    gameState,
    timeLeft,
    isMuted,
    onToggleMute,
    onReset
}) {
    return (
        <div className={`bg-slate-100 border-b border-slate-200 flex justify-between items-center ${compact ? 'p-2 px-3 shrink-0' : 'p-4 px-6'}`}>
            <div className={`flex items-center ${compact ? 'gap-2' : 'gap-6'}`}>
                <div className={`flex ${compact ? 'gap-2 text-sm' : 'gap-4'}`}>
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
                    <div className={`flex items-center gap-1 rounded-full font-mono font-bold ${compact ? 'px-2 py-0.5 text-sm' : 'px-3 py-1'} ${timeLeft < 30 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-700'}`}>
                        <Clock size={compact ? 14 : 16}/>
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </div>
                )}
            </div>
            <div className="flex gap-2">
                <button onClick={onToggleMute} data-testid="mute-button"
                        className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-200"
                        title={isMuted ? 'Activar Sonido' : 'Silenciar'}>
                    {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                </button>
                {gameState !== 'setup' && (
                    <button onClick={onReset}
                            className="text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-200"
                            title="Reiniciar Juego">
                        <RotateCcw size={20}/>
                    </button>
                )}
            </div>
        </div>
    );
}
