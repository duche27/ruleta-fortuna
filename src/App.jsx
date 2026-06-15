import {useState, useEffect} from 'react';
import RoscoGame from './components/RoscoGame.jsx';
import {loadProfile, resolveProfileName} from './profiles/index.js';
import {loadGameResources} from './infrastructure/asset-loader.js';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState('Cargando ruleta...');

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const profileName = resolveProfileName(new URLSearchParams(window.location.search));
                setLoadingMessage(`Cargando ${profileName}...`);
                const profile = loadProfile(profileName);
                setLoadingMessage('Cargando recursos...');
                const resources = await loadGameResources(profile);
                if (!cancelled) setGameData(resources);
            } catch (e) {
                if (!cancelled) setError(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div id="loading-screen" aria-live="polite">
                <div className="loading-spinner" aria-hidden="true"/>
                <p>{loadingMessage}</p>
            </div>
        );
    }

    if (error || !gameData) {
        return (
            <div className="p-8 font-sans text-red-700">
                <h1 className="text-2xl font-bold mb-4">No se pudo cargar el juego</h1>
                <p>{error?.message || 'Error desconocido'}</p>
                <p className="mt-4 text-slate-600">
                    Usa <code>?profile=nombre</code> con un perfil válido (albino, arribas).
                </p>
            </div>
        );
    }

    return (
        <RoscoGame
            profile={gameData.profile}
            questions={gameData.questions}
            friendImages={gameData.friendImages}
            backgroundImage={gameData.backgroundImage}
            wrongAnswerImage={gameData.wrongAnswerImage}
        />
    );
}
