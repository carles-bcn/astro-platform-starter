import { findTone, typeLabel } from '../../shared/catalog.js';
import { MAX_HISTORY } from '../lib/history.js';
import { splitTitle } from '../lib/text.js';

const dateFormat = new Intl.DateTimeFormat('ca', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
});

export function History({ items, activeId, disabled, onSelect, onDelete, onClear, className = '' }) {
    return (
        <section className={className} aria-labelledby="history-title">
            <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 id="history-title" className="smallcaps text-lg text-ink-soft">
                    Historial <span className="text-sm">({items.length}/{MAX_HISTORY})</span>
                </h2>
                {items.length > 0 && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => window.confirm('Vols esborrar tot l\'historial?') && onClear()}
                        className="text-sm text-ink-soft underline decoration-rule underline-offset-2 hover:text-terracotta disabled:opacity-50"
                    >
                        Esborra-ho tot
                    </button>
                )}
            </div>
            {items.length === 0 ? (
                <p className="text-[0.95rem] text-ink-soft italic">
                    Encara no hi ha res. Els darrers {MAX_HISTORY} textos es guarden aquí, només en aquest navegador.
                </p>
            ) : (
                <ul className="divide-y divide-rule border-y border-rule">
                    {items.map((entry) => {
                        const title = splitTitle(entry.raw).title || 'Sense títol';
                        const active = entry.id === activeId;
                        return (
                            <li key={entry.id} className="flex items-stretch">
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onSelect(entry)}
                                    aria-current={active || undefined}
                                    className={`min-w-0 flex-1 px-2 py-2 text-left hover:bg-white/50 disabled:opacity-60 ${active ? 'bg-white/60' : ''}`}
                                >
                                    <span className="block truncate text-[1.05rem]">{title}</span>
                                    <span className="block truncate text-sm text-ink-soft">
                                        {typeLabel(entry.params)} · {entry.params.tone} {findTone(entry.params.tone).label} ·{' '}
                                        {dateFormat.format(new Date(entry.createdAt))}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onDelete(entry.id)}
                                    aria-label={`Esborra «${title}»`}
                                    title="Esborra"
                                    className="px-3 text-xl text-ink-soft hover:text-terracotta disabled:opacity-60"
                                >
                                    ×
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
