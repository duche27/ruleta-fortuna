export function JumpScare({imageUrl}) {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in"
             data-testid="jump-scare">
            <div className="relative animate-jump-scare">
                {imageUrl ? (
                    <img src={imageUrl} className="max-h-[85vh] max-w-[90vw] rounded-3xl border-8 border-white shadow-[0_0_50px_rgba(239,68,68,0.5)]"
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
    );
}
