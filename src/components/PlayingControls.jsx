import {Check, XIcon, SkipForward} from './Icons.jsx';

export function PlayingControls({compact = false, onCorrect, onIncorrect, onPass}) {
    return (
        <div className={`flex-shrink-0 ${compact ? 'space-y-2' : 'mt-auto space-y-4'}`}>
            {!compact && (
                <p className="text-xs text-center text-slate-400 sm:hidden">
                    Desliza ← correcto · → incorrecto · ↑ pasapalabra
                </p>
            )}
            <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-4'}`}>
                <button onClick={onCorrect} data-testid="correct-button"
                        className={`group flex flex-col items-center justify-center bg-green-50 hover:bg-green-500 border-2 border-green-500 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md ${compact ? 'p-2' : 'p-4'}`}>
                    <div className={`bg-green-500 group-hover:bg-white rounded-full mb-1 transition-colors ${compact ? 'p-1.5' : 'p-2 mb-2'}`}>
                        <Check size={compact ? 18 : 24} className="text-white group-hover:text-green-600 transition-colors"/>
                    </div>
                    <span className={`font-bold text-green-700 group-hover:text-white transition-colors ${compact ? 'text-xs' : ''}`}>Correcto</span>
                </button>
                <button onClick={onIncorrect} data-testid="incorrect-button"
                        className={`group flex flex-col items-center justify-center bg-red-50 hover:bg-red-500 border-2 border-red-500 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md ${compact ? 'p-2' : 'p-4'}`}>
                    <div className={`bg-red-500 group-hover:bg-white rounded-full mb-1 transition-colors ${compact ? 'p-1.5' : 'p-2 mb-2'}`}>
                        <XIcon size={compact ? 18 : 24} className="text-white group-hover:text-red-600 transition-colors"/>
                    </div>
                    <span className={`font-bold text-red-700 group-hover:text-white transition-colors ${compact ? 'text-xs' : ''}`}>Incorrecto</span>
                </button>
            </div>
            <button onClick={onPass} data-testid="pass-button"
                    className={`w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-blue-500 text-slate-700 hover:text-white border border-slate-300 hover:border-blue-500 rounded-2xl transition-all duration-200 font-bold ${compact ? 'p-2 text-sm' : 'p-4 text-lg'}`}>
                <SkipForward size={compact ? 16 : 20}/> Pasapalabra
            </button>
        </div>
    );
}
