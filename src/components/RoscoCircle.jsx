import {getLetterFillColor, getAnswerSummary} from '../domain/game-core.js';

const RADIUS = 140;
const CENTER = 160;

export function RoscoCircle({
    questions,
    progress,
    currentIndex,
    gameState,
    backgroundImage,
    correctCount,
    compact = false,
    onLetterClick
}) {
    return (
        <div
            className={`relative rosco-circle mx-auto ${compact ? 'rosco-circle--compact my-0' : 'my-4 sm:my-8'}`}
            data-testid="rosco-circle"
        >
            <svg className="w-full h-full" viewBox="0 0 320 320">
                {questions.map((q, index) => {
                    const angle = (index / questions.length) * 2 * Math.PI - Math.PI / 2;
                    const x = CENTER + RADIUS * Math.cos(angle);
                    const y = CENTER + RADIUS * Math.sin(angle);
                    const prog = progress[index] || {status: 'unanswered', answers: []};
                    const {fill: fillColor, stroke: strokeColor, strokeWidth} =
                        getLetterFillColor({index, currentIndex, gameState, prog});
                    const summary = getAnswerSummary(prog);
                    return (
                        <g key={q.letter} transform={`translate(${x}, ${y})`}
                           onClick={() => onLetterClick(index)}
                           className={gameState !== 'setup' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}>
                            <circle r="14" fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth}
                                    className="transition-colors duration-300"/>
                            <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold"
                                  className="pointer-events-none font-sans">{q.letter}</text>
                            {summary && (
                                <text x="0" y="22" textAnchor="middle" fill="white" fontSize="8"
                                      fontWeight="bold" className="pointer-events-none font-sans">
                                    {summary.correct > 0 ? `✓${summary.correct}` : ''}
                                    {summary.incorrect > 0 ? ` ✗${summary.incorrect}` : ''}
                                </text>
                            )}
                            {q.questions.length > 1 && (
                                <g transform="translate(10, -10)">
                                    <circle r="7" fill="#f97316"/>
                                    <text x="0" y="3" textAnchor="middle" fill="white" fontSize="9"
                                          fontWeight="bold" className="pointer-events-none">
                                        {q.questions.length}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="absolute rosco-center-bg w-48 h-48 rounded-full z-0 opacity-20"
                     style={{
                         backgroundImage: backgroundImage ? `url('${backgroundImage}')` : undefined,
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                         backgroundColor: '#e2e8f0'
                     }}/>
                <div className="relative z-10 flex flex-col items-center">
                    <div className={`font-black text-slate-800 drop-shadow-md ${compact ? 'text-3xl' : 'text-4xl'}`}>
                        {correctCount}
                    </div>
                    <div className={`font-bold text-slate-600 bg-white/60 px-3 py-0.5 rounded-full backdrop-blur-sm ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
                        Aciertos
                    </div>
                </div>
            </div>
        </div>
    );
}
