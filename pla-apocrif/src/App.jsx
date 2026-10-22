import { useEffect, useRef, useState } from 'react';
import { DEFAULT_PARAMS, validateParams } from '../shared/catalog.js';
import { BookPage } from './components/BookPage.jsx';
import { Controls } from './components/Controls.jsx';
import { History } from './components/History.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import { newBiblio } from './lib/biblio.js';
import { addToHistory, loadHistory, saveHistory } from './lib/history.js';
import { fetchHealth, streamGenerate } from './lib/stream.js';
import { surpriseParams } from './lib/surprise.js';

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export default function App() {
    const [params, setParams] = useState(DEFAULT_PARAMS);
    const [gen, setGen] = useState(null);
    // idle · thinking · writing · done · stopped
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const [history, setHistory] = useState(loadHistory);
    const [health, setHealth] = useState(null);
    const abortRef = useRef(null);
    const pageRef = useRef(null);

    const busy = status === 'thinking' || status === 'writing';

    useEffect(() => {
        saveHistory(history);
    }, [history]);

    // En `npm run dev` el servidor pot trigar un moment més que Vite a arrencar.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            for (let attempt = 0; attempt < 4 && !cancelled; attempt++) {
                try {
                    const data = await fetchHealth();
                    if (!cancelled) setHealth(data);
                    return;
                } catch {
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }
            if (!cancelled) setHealth({ ok: false });
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => () => abortRef.current?.abort(), []);

    const scrollToPage = () => {
        if (window.matchMedia('(max-width: 1023px)').matches) {
            pageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    async function run(runParams) {
        const check = validateParams(runParams);
        if (!check.ok) {
            setError({ message: check.message });
            setGen(null);
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const draft = {
            id: newId(),
            params: check.params,
            raw: '',
            biblio: newBiblio(),
            createdAt: new Date().toISOString(),
            model: health?.model
        };
        let raw = '';
        // Si una generació nova substitueix aquesta, deixa de tocar l'estat.
        const superseded = () => abortRef.current !== controller;
        setGen(draft);
        setError(null);
        setStatus('thinking');
        scrollToPage();

        try {
            const result = await streamGenerate(check.params, {
                signal: controller.signal,
                onEvent: (event, data) => {
                    if (event === 'delta' && !superseded()) {
                        raw += data.text;
                        setGen((g) => ({ ...g, raw }));
                        setStatus('writing');
                    }
                }
            });
            if (superseded()) return;
            const finished = { ...draft, raw, model: result.model, truncated: result.stopReason === 'max_tokens' };
            setGen(finished);
            setStatus('done');
            setHistory((h) => addToHistory(h, finished));
        } catch (err) {
            if (superseded()) return;
            if (controller.signal.aborted) {
                // Aturat per l'usuari: es queda el que hi hagi, però no va a l'historial.
                if (!raw) setGen(null);
                setStatus(raw ? 'stopped' : 'idle');
                return;
            }
            // Un text a mitges per un error (o declinat pel model) no es mostra com si fos complet.
            setGen(null);
            setError({ message: err.message, retry: check.params });
            setStatus('idle');
        } finally {
            if (!superseded()) abortRef.current = null;
        }
    }

    const surprise = () => {
        const next = surpriseParams(params);
        setParams(next);
        run(next);
    };

    const selectEntry = (entry) => {
        setGen(entry);
        setParams(entry.params);
        setError(null);
        setStatus('done');
        scrollToPage();
    };

    return (
        <div className="min-h-screen">
            <header className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6 sm:pt-10">
                <h1 className="smallcaps text-4xl leading-none text-ink sm:text-5xl">Pla Apòcrif</h1>
                <p className="mt-2 text-lg text-ink-soft italic">
                    Textos originals a la manera de Josep Pla, escrits per una IA. Cap no és de Pla.
                </p>
            </header>

            {health && !health.hasKey && (
                <div className="mx-auto mb-6 max-w-6xl px-4 sm:px-6">
                    <p className="rounded-md border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-base" role="alert">
                        {health.ok === false
                            ? 'No es pot connectar amb el servidor local. Arrenca\'l amb «npm run dev».'
                            : 'Falta la clau de l\'API d\'Anthropic. Copia .env.example a .env, posa-hi la teva ANTHROPIC_API_KEY i reinicia el servidor.'}
                    </p>
                </div>
            )}

            <main className="mx-auto grid max-w-6xl items-start gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10">
                <section className="rounded-lg border border-rule bg-panel/80 p-5 shadow-sm sm:p-6 lg:col-start-1 lg:row-start-1">
                    <Controls
                        params={params}
                        onChange={setParams}
                        busy={busy}
                        onWrite={() => run(params)}
                        onSurprise={surprise}
                        onStop={() => abortRef.current?.abort()}
                    />
                </section>

                <section ref={pageRef} className="scroll-mt-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                    <Toolbar gen={gen} busy={busy} onRegenerate={() => gen && run(gen.params)} />
                    <BookPage
                        gen={gen}
                        status={status}
                        error={error}
                        onRetry={error?.retry ? () => run(error.retry) : null}
                    />
                </section>

                <History
                    className="lg:col-start-1 lg:row-start-2"
                    items={history}
                    activeId={gen?.id}
                    disabled={busy}
                    onSelect={selectEntry}
                    onDelete={(id) => setHistory((h) => h.filter((e) => e.id !== id))}
                    onClear={() => setHistory([])}
                />
            </main>

            <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-sm text-ink-soft sm:px-6">
                Pla Apòcrif · textos generats per IA amb l'API d'Anthropic
                {health?.model && ` (${health.model})`}. Cap d'aquests textos no és de Josep Pla.
            </footer>
        </div>
    );
}
