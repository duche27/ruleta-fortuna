export function FriendPhoto({src}) {
    return (
        <div className="w-full sm:w-32 h-40 sm:h-auto shrink-0">
            <div className="h-full bg-white p-2 rounded-xl shadow-md border border-slate-200 transform rotate-2 hover:rotate-0 transition-transform duration-300 overflow-hidden">
                {src ? (
                    <img src={src} className="w-full h-full object-cover rounded shadow-inner" alt="Foto"/>
                ) : (
                    <div className="w-full h-full rounded bg-slate-100 text-slate-400 flex items-center justify-center text-sm font-semibold text-center px-4">
                        Sin fotos
                    </div>
                )}
            </div>
        </div>
    );
}
