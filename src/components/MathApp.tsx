import { useState, useEffect, useCallback } from 'react';

type Topic = 'menu' | 'sumas' | 'restas' | 'multiplicacion' | 'division' | 'fracciones' | 'tablas';

interface Exercise {
    question: string;
    answer: number;
    options: number[];
    hint?: string;
}

interface Stats {
    correct: number;
    wrong: number;
    streak: number;
    bestStreak: number;
}

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

function generateOptions(answer: number, count = 4): number[] {
    const opts = new Set<number>([answer]);
    while (opts.size < count) {
        const delta = Math.floor(Math.random() * 20) - 10;
        const candidate = answer + delta;
        if (candidate >= 0 && candidate !== answer) opts.add(candidate);
    }
    return shuffle([...opts]);
}

function generateSuma(): Exercise {
    const a = Math.floor(Math.random() * 900) + 100;
    const b = Math.floor(Math.random() * 900) + 100;
    return { question: `${a} + ${b} = ?`, answer: a + b, options: generateOptions(a + b), hint: `Suma las unidades, luego las decenas, luego las centenas` };
}

function generateResta(): Exercise {
    const b = Math.floor(Math.random() * 500) + 50;
    const a = b + Math.floor(Math.random() * 500) + 50;
    return { question: `${a} − ${b} = ?`, answer: a - b, options: generateOptions(a - b), hint: `Resta las unidades, luego las decenas, luego las centenas` };
}

function generateMulti(): Exercise {
    const a = Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * 9) + 2;
    return { question: `${a} × ${b} = ?`, answer: a * b, options: generateOptions(a * b), hint: `Piensa en la tabla del ${a}` };
}

function generateDiv(): Exercise {
    const b = Math.floor(Math.random() * 9) + 2;
    const result = Math.floor(Math.random() * 9) + 2;
    const a = b * result;
    return { question: `${a} ÷ ${b} = ?`, answer: result, options: generateOptions(result), hint: `¿Qué número × ${b} = ${a}?` };
}

const FRACTIONS = [
    { display: '1/2', value: 0.5, name: 'un medio' },
    { display: '1/3', value: 1 / 3, name: 'un tercio' },
    { display: '1/4', value: 0.25, name: 'un cuarto' },
    { display: '2/3', value: 2 / 3, name: 'dos tercios' },
    { display: '3/4', value: 0.75, name: 'tres cuartos' },
    { display: '2/4', value: 0.5, name: 'dos cuartos' },
];

function FractionPizza({ numerator, denominator }: { numerator: number; denominator: number }) {
    const slices = Array.from({ length: denominator }, (_, i) => i);
    return (
        <svg viewBox="-1 -1 2 2" className="w-24 h-24 mx-auto" style={{ transform: 'rotate(-90deg)' }}>
            {slices.map((i) => {
                const startAngle = (i / denominator) * 2 * Math.PI;
                const endAngle = ((i + 1) / denominator) * 2 * Math.PI;
                const x1 = Math.cos(startAngle);
                const y1 = Math.sin(startAngle);
                const x2 = Math.cos(endAngle);
                const y2 = Math.sin(endAngle);
                const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
                const isFilled = i < numerator;
                return (
                    <path
                        key={i}
                        d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={isFilled ? '#f67280' : '#355c7d'}
                        stroke="white"
                        strokeWidth="0.04"
                    />
                );
            })}
        </svg>
    );
}

function generateFraccion(): { question: string; correct: number; fracs: { display: string; value: number; name: string }[] } {
    const f = FRACTIONS[Math.floor(Math.random() * FRACTIONS.length)];
    const others = shuffle(FRACTIONS.filter((x) => x.display !== f.display)).slice(0, 3);
    return { question: f.display, correct: FRACTIONS.indexOf(f), fracs: shuffle([f, ...others]) };
}

const TOPICS = [
    { id: 'sumas', emoji: '➕', label: 'Sumas', color: 'from-pink-500 to-rose-600', desc: 'Sumas hasta 1000' },
    { id: 'restas', emoji: '➖', label: 'Restas', color: 'from-orange-500 to-amber-600', desc: 'Restas hasta 1000' },
    { id: 'multiplicacion', emoji: '✖️', label: 'Multiplicaciones', color: 'from-violet-500 to-purple-600', desc: 'Tablas del 2 al 10' },
    { id: 'division', emoji: '➗', label: 'Divisiones', color: 'from-teal-500 to-cyan-600', desc: 'Divisiones exactas' },
    { id: 'fracciones', emoji: '🍕', label: 'Fracciones', color: 'from-green-500 to-emerald-600', desc: 'Mitades, tercios, cuartos' },
    { id: 'tablas', emoji: '📋', label: 'Tablas del multiplicar', color: 'from-blue-500 to-indigo-600', desc: 'Practica las tablas' },
];

function TopicMenu({ onSelect }: { onSelect: (t: Topic) => void }) {
    return (
        <div>
            <div className="text-center mb-8">
                <div className="text-5xl mb-3">🧮</div>
                <h1 className="text-3xl font-bold text-white mb-2">¡Matemáticas 3º Primaria!</h1>
                <p className="text-blue-200 text-lg">¿Qué quieres practicar hoy?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TOPICS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onSelect(t.id as Topic)}
                        className={`bg-gradient-to-br ${t.color} rounded-2xl p-5 text-white text-left hover:scale-105 transition-transform duration-200 shadow-lg cursor-pointer border-0`}
                    >
                        <div className="text-4xl mb-2">{t.emoji}</div>
                        <div className="font-bold text-lg leading-tight">{t.label}</div>
                        <div className="text-white/80 text-sm mt-1">{t.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function MultiplicationTable({ onBack }: { onBack: () => void }) {
    const [selectedTable, setSelectedTable] = useState(2);

    return (
        <div>
            <button onClick={onBack} className="mb-6 text-blue-300 hover:text-white flex items-center gap-2 transition-colors bg-transparent border-0 cursor-pointer">
                ← Volver al menú
            </button>
            <h2 className="text-2xl font-bold text-white mb-4 text-center">📋 Tablas del multiplicar</h2>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                        key={n}
                        onClick={() => setSelectedTable(n)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all cursor-pointer border-0 ${selectedTable === n ? 'bg-pink-500 text-white scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    >
                        {n}
                    </button>
                ))}
            </div>
            <div className="bg-white/10 rounded-2xl p-6 max-w-sm mx-auto">
                <h3 className="text-center text-white font-bold text-xl mb-4">Tabla del {selectedTable}</h3>
                <div className="space-y-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
                        <div key={i} className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2">
                            <span className="text-white/80 text-sm">{selectedTable} × {i}</span>
                            <span className="text-2xl">=</span>
                            <span className="text-pink-300 font-bold text-lg">{selectedTable * i}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FractionGame({ onBack }: { onBack: () => void }) {
    const [exercise, setExercise] = useState(generateFraccion);
    const [selected, setSelected] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [stats, setStats] = useState<Stats>({ correct: 0, wrong: 0, streak: 0, bestStreak: 0 });

    const correctFrac = FRACTIONS.find((f) => f.display === exercise.question)!;
    const [num, den] = exercise.question.split('/').map(Number);

    const handleSelect = (display: string) => {
        if (feedback) return;
        setSelected(display);
        if (display === exercise.question) {
            setFeedback('correct');
            setStats((s) => {
                const streak = s.streak + 1;
                return { correct: s.correct + 1, wrong: s.wrong, streak, bestStreak: Math.max(s.bestStreak, streak) };
            });
        } else {
            setFeedback('wrong');
            setStats((s) => ({ ...s, wrong: s.wrong + 1, streak: 0 }));
        }
    };

    const next = () => {
        setExercise(generateFraccion());
        setSelected(null);
        setFeedback(null);
    };

    return (
        <div>
            <button onClick={onBack} className="mb-4 text-blue-300 hover:text-white flex items-center gap-2 transition-colors bg-transparent border-0 cursor-pointer">
                ← Volver al menú
            </button>
            <div className="flex justify-between mb-4 text-sm">
                <span className="text-green-400">✅ {stats.correct}</span>
                <span className="text-yellow-300">🔥 Racha: {stats.streak}</span>
                <span className="text-red-400">❌ {stats.wrong}</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 text-center mb-4">
                <p className="text-white/70 text-sm mb-2">¿Qué fracción representa esta pizza?</p>
                <FractionPizza numerator={num} denominator={den} />
                <div className="text-white text-4xl font-bold mt-3">{exercise.question}</div>
                <div className="text-white/60 text-sm mt-1">({correctFrac.name})</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {exercise.fracs.map((f) => {
                    const isCorrect = f.display === exercise.question;
                    const isSelected = f.display === selected;
                    let cls = 'bg-white/20 hover:bg-white/30 text-white';
                    if (feedback && isSelected && isCorrect) cls = 'bg-green-500 text-white';
                    else if (feedback && isSelected && !isCorrect) cls = 'bg-red-500 text-white';
                    else if (feedback && isCorrect) cls = 'bg-green-500/50 text-white';
                    return (
                        <button
                            key={f.display}
                            onClick={() => handleSelect(f.display)}
                            className={`${cls} rounded-xl p-4 font-bold text-xl transition-all cursor-pointer border-0 ${!feedback ? 'hover:scale-105' : ''}`}
                        >
                            <FractionPizza numerator={f.display.split('/').map(Number)[0]} denominator={f.display.split('/').map(Number)[1]} />
                            <div className="mt-1">{f.display}</div>
                        </button>
                    );
                })}
            </div>
            {feedback && (
                <div className={`mt-4 p-3 rounded-xl text-center font-bold ${feedback === 'correct' ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'}`}>
                    {feedback === 'correct' ? '🎉 ¡Correcto! ¡Muy bien!' : `❌ Era ${exercise.question} (${correctFrac.name})`}
                    <button onClick={next} className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg cursor-pointer border-0 text-white font-normal text-sm">
                        Siguiente →
                    </button>
                </div>
            )}
        </div>
    );
}

function MathGame({ topic, onBack }: { topic: Exclude<Topic, 'menu' | 'tablas' | 'fracciones'>; onBack: () => void }) {
    const [exercise, setExercise] = useState<Exercise>(() => {
        if (topic === 'sumas') return generateSuma();
        if (topic === 'restas') return generateResta();
        if (topic === 'multiplicacion') return generateMulti();
        return generateDiv();
    });
    const [selected, setSelected] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [stats, setStats] = useState<Stats>({ correct: 0, wrong: 0, streak: 0, bestStreak: 0 });

    const topicInfo = TOPICS.find((t) => t.id === topic)!;

    const nextExercise = useCallback(() => {
        let ex: Exercise;
        if (topic === 'sumas') ex = generateSuma();
        else if (topic === 'restas') ex = generateResta();
        else if (topic === 'multiplicacion') ex = generateMulti();
        else ex = generateDiv();
        setExercise(ex);
        setSelected(null);
        setFeedback(null);
        setShowHint(false);
    }, [topic]);

    const handleSelect = (opt: number) => {
        if (feedback) return;
        setSelected(opt);
        if (opt === exercise.answer) {
            setFeedback('correct');
            setStats((s) => {
                const streak = s.streak + 1;
                return { correct: s.correct + 1, wrong: s.wrong, streak, bestStreak: Math.max(s.bestStreak, streak) };
            });
        } else {
            setFeedback('wrong');
            setStats((s) => ({ ...s, wrong: s.wrong + 1, streak: 0 }));
        }
    };

    const medals = ['🥉', '🥈', '🥇', '🏆'];
    const medalIndex = Math.min(Math.floor(stats.correct / 5), 3);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="text-blue-300 hover:text-white flex items-center gap-2 transition-colors bg-transparent border-0 cursor-pointer">
                    ← Volver
                </button>
                <div className="text-2xl">{medals[medalIndex]}</div>
            </div>

            {/* Stats */}
            <div className="flex justify-between mb-4 text-sm">
                <span className="text-green-400 font-semibold">✅ {stats.correct} bien</span>
                <span className="text-yellow-300 font-semibold">🔥 Racha: {stats.streak}</span>
                <span className="text-red-400 font-semibold">❌ {stats.wrong} mal</span>
            </div>

            {/* Question card */}
            <div className={`bg-gradient-to-br ${topicInfo.color} rounded-2xl p-8 text-center mb-5 shadow-lg`}>
                <div className="text-5xl font-bold text-white mb-2 tracking-wide">{exercise.question}</div>
                {exercise.hint && (
                    <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-white/70 text-xs hover:text-white mt-2 border-0 bg-transparent cursor-pointer underline"
                    >
                        {showHint ? '🙈 Ocultar pista' : '💡 Ver pista'}
                    </button>
                )}
                {showHint && (
                    <div className="mt-2 text-white/90 text-sm bg-black/20 rounded-lg px-3 py-2 inline-block">
                        💡 {exercise.hint}
                    </div>
                )}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
                {exercise.options.map((opt) => {
                    const isCorrect = opt === exercise.answer;
                    const isSelected = opt === selected;
                    let cls = 'bg-white/20 hover:bg-white/30 text-white';
                    if (feedback && isSelected && isCorrect) cls = 'bg-green-500 text-white scale-105';
                    else if (feedback && isSelected && !isCorrect) cls = 'bg-red-500 text-white';
                    else if (feedback && isCorrect) cls = 'bg-green-500/60 text-white';
                    return (
                        <button
                            key={opt}
                            onClick={() => handleSelect(opt)}
                            className={`${cls} rounded-xl p-5 font-bold text-2xl transition-all cursor-pointer border-0 ${!feedback ? 'hover:scale-105 active:scale-95' : ''}`}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>

            {/* Feedback */}
            {feedback && (
                <div className={`mt-5 p-4 rounded-xl text-center font-bold flex items-center justify-between ${feedback === 'correct' ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'}`}>
                    <span>
                        {feedback === 'correct'
                            ? ['🎉 ¡Genial!', '⭐ ¡Correcto!', '🚀 ¡Bravo!', '🌟 ¡Perfecto!'][Math.floor(Math.random() * 4)]
                            : `La respuesta es ${exercise.answer}`}
                    </span>
                    <button
                        onClick={nextExercise}
                        className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-lg cursor-pointer border-0 font-semibold text-sm"
                    >
                        Siguiente →
                    </button>
                </div>
            )}

            {/* Progress bar */}
            {stats.correct > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Progreso hacia el próximo trofeo</span>
                        <span>{stats.correct % 5}/5</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((stats.correct % 5) / 5) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MathApp() {
    const [topic, setTopic] = useState<Topic>('menu');

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900 p-4 md:p-8">
            <div className="max-w-xl mx-auto">
                {topic === 'menu' && <TopicMenu onSelect={setTopic} />}
                {topic === 'tablas' && <MultiplicationTable onBack={() => setTopic('menu')} />}
                {topic === 'fracciones' && <FractionGame onBack={() => setTopic('menu')} />}
                {(topic === 'sumas' || topic === 'restas' || topic === 'multiplicacion' || topic === 'division') && (
                    <MathGame topic={topic} onBack={() => setTopic('menu')} />
                )}
            </div>
        </div>
    );
}
