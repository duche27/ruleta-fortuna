export function GameTitle({title, subtitle}) {
    return (
        <header className="mb-4 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-4xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600 drop-shadow-sm"
                data-testid="game-title">
                {title}
            </h1>
            {subtitle && <p className="text-slate-500 mt-2">{subtitle}</p>}
        </header>
    );
}
