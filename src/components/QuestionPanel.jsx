export function QuestionPanel({
    letter,
    questionCount,
    currentQuestionIndex,
    question,
    compact = false
}) {
    return (
        <>
            <div className={`flex items-center justify-between ${compact ? 'mb-1' : 'mb-2'}`}>
                <div className="flex items-baseline gap-2">
                    <span className={`font-black text-yellow-500 drop-shadow-sm ${compact ? 'text-3xl' : 'text-5xl'}`}>
                        {letter}
                    </span>
                    <span className={`font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full ${compact ? 'text-[10px]' : 'text-sm'}`}>
                        {question.type === 'empieza' ? 'Empieza por' : 'Contiene la'}
                    </span>
                </div>
                {questionCount > 1 && (
                    <div className={`font-bold text-orange-500 bg-orange-100 rounded-full ${compact ? 'text-[10px] px-2 py-0.5' : 'text-sm px-3 py-1'}`}>
                        {currentQuestionIndex + 1} / {questionCount}
                    </div>
                )}
            </div>
            <div className={`bg-slate-50 rounded-2xl border border-slate-200 shadow-inner w-full ${compact ? 'p-3 flex flex-col gap-2' : 'p-5 mt-4 min-h-[120px] flex flex-col justify-center gap-4'}`}>
                <p className={`font-medium leading-snug ${compact ? 'text-sm' : 'text-lg sm:text-xl leading-relaxed'}`}>
                    {question.question.replace(/\s*:\s*$/, '')}
                </p>
                <div className={`bg-indigo-50 rounded-xl border border-indigo-100 ${compact ? 'p-2' : 'p-3'}`}>
                    <span className={`font-bold text-indigo-400 uppercase tracking-wider block mb-0.5 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                        Respuesta esperada:
                    </span>
                    <span className={`font-bold text-indigo-700 ${compact ? 'text-sm' : 'text-lg'}`}>{question.answer}</span>
                </div>
            </div>
        </>
    );
}
