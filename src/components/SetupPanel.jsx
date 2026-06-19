import {Play} from './Icons.jsx';

export function SetupPanel({onStart}) {
    return (
        <div className="text-center space-y-6 fade-in">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h2 className="text-2xl font-bold text-blue-800 mb-4">¿Listo para jugar?</h2>
                <p className="text-slate-600 mb-6">
                    Se te leerá una definición para cada letra. Indica si tu respuesta es
                    correcta, incorrecta o di &quot;Pasapalabra&quot; para dejarla para la siguiente ronda.
                </p>
                <button onClick={onStart} data-testid="start-button"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
                    <Play size={20}/> Comenzar Juego
                </button>
            </div>
        </div>
    );
}
