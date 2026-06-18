import {RotateCcw} from './Icons.jsx';

export function FinishedPanel({compact = false, correctCount, incorrectCount, onReset}) {
    return (
        <div className={`text-center fade-in w-full mx-auto ${compact ? 'space-y-3 py-1' : 'space-y-6 max-w-xl'}`} data-testid="finished-panel">
            <div className={`bg-slate-50 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden ${compact ? 'p-4' : 'p-8'}`}>
                <h2 className={`font-black text-slate-800 mb-1 relative z-10 ${compact ? 'text-2xl' : 'text-4xl mb-2'}`}>¡Juego Terminado!</h2>
                <p className={`text-slate-500 relative z-10 ${compact ? 'text-sm mb-4' : 'mb-8'}`}>Aquí están tus resultados finales.</p>
                <div className={`grid grid-cols-2 ${compact ? 'gap-2 mb-4' : 'gap-4 mb-8'}`}>
                    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${compact ? 'p-3' : 'p-4'}`}>
                        <span className={`font-black text-green-500 drop-shadow-sm ${compact ? 'text-3xl' : 'text-5xl'}`}>{correctCount}</span>
                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Aciertos</span>
                    </div>
                    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${compact ? 'p-3' : 'p-4'}`}>
                        <span className={`font-black text-red-500 drop-shadow-sm ${compact ? 'text-3xl' : 'text-5xl'}`}>{incorrectCount}</span>
                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-500 mt-1 block">Errores</span>
                    </div>
                </div>
                <button onClick={onReset}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-md transition-all ${compact ? 'px-6 py-3 text-sm' : 'px-8 py-4'}`}>
                    <RotateCcw size={compact ? 16 : 20}/> Volver a Jugar
                </button>
            </div>
        </div>
    );
}
