import { useEffect, useState } from 'react';
import { typeLabel } from '../../shared/catalog.js';
import { biblioParts } from '../lib/biblio.js';
import { parseBlocks, parseInline, splitTitle } from '../lib/text.js';

const DROPCAP_TYPES = new Set(['article', 'ficcio', 'viatge', 'homenot', 'paisatge', 'tv', 'restaurant', 'altre']);

const MUSINGS = [
    'L\'autor mira per la finestra',
    'L\'autor busca l\'adjectiu exacte',
    'L\'autor lia un cigarret',
    'L\'autor escolta la tramuntana',
    'L\'autor desconfia de la primera frase'
];

function Inline({ text }) {
    return parseInline(text).map((seg, i) =>
        seg.em ? <em key={i}>{seg.text}</em> : seg.strong ? <strong key={i}>{seg.text}</strong> : seg.text
    );
}

function Block({ block, caret }) {
    const end = caret && <span className="caret" aria-hidden="true" />;
    switch (block.type) {
        case 'heading':
            return (
                <h3>
                    <Inline text={block.text} />
                    {end}
                </h3>
            );
        case 'rule':
            return <hr />;
        case 'ul':
        case 'ol': {
            const List = block.type;
            return (
                <List start={block.start}>
                    {block.items.map((item, i) => (
                        <li key={i}>
                            <Inline text={item} />
                            {i === block.items.length - 1 && end}
                        </li>
                    ))}
                </List>
            );
        }
        default:
            return (
                <p>
                    <Inline text={block.text} />
                    {end}
                </p>
            );
    }
}

function Musing() {
    const [index, setIndex] = useState(() => Math.floor(Math.random() * MUSINGS.length));
    useEffect(() => {
        const timer = setInterval(() => setIndex((i) => (i + 1) % MUSINGS.length), 2600);
        return () => clearInterval(timer);
    }, []);
    return (
        <p className="py-16 text-center text-lg text-ink-soft italic" role="status">
            <span className="dots">{MUSINGS[index]}</span>
        </p>
    );
}

function Sheet({ lang, head, folio, children, footer }) {
    return (
        <article
            lang={lang}
            className="paper mx-auto flex min-h-[28rem] w-full max-w-[40rem] flex-col rounded-[3px] px-6 pt-8 pb-6 sm:min-h-[36rem] sm:px-14 sm:pt-12 sm:pb-10 md:px-20"
        >
            {head && <header className="smallcaps mb-8 text-center text-sm text-ink-soft sm:mb-10">{head}</header>}
            <div className="flex-1">{children}</div>
            {footer}
            {folio && <div className="mt-4 text-center text-sm text-ink-soft">{folio}</div>}
        </article>
    );
}

export function BookPage({ gen, status, error, onRetry }) {
    if (error) {
        return (
            <Sheet head="Fe d'errates">
                <div className="mx-auto max-w-md py-10 text-center" role="alert">
                    <p className="text-xl leading-relaxed">{error.message}</p>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-6 rounded-md border border-ink px-4 py-2 hover:bg-ink hover:text-paper"
                        >
                            Torna-ho a provar
                        </button>
                    )}
                </div>
            </Sheet>
        );
    }

    if (!gen) {
        return (
            <Sheet head="Obra apòcrifa">
                <div className="mx-auto max-w-sm py-12 text-center text-ink-soft">
                    <p className="text-6xl leading-none text-terracotta/70" aria-hidden="true">
                        ❦
                    </p>
                    <p className="mt-6 text-xl leading-relaxed italic">
                        Tria un gènere, un to i un tema, i prem «Escriu». O deixa-ho a l'atzar amb «Sorpresa».
                    </p>
                    <p className="mt-6 text-sm">
                        Els textos són apòcrifs: originals escrits per una IA a la manera de Josep Pla.
                    </p>
                </div>
            </Sheet>
        );
    }

    const { title, body } = splitTitle(gen.raw);
    const blocks = parseBlocks(body);
    const writing = status === 'writing';
    const biblio = biblioParts(gen.biblio, gen.params.lang);
    const bodyClass = [
        'book-body',
        DROPCAP_TYPES.has(gen.params.type) && 'has-dropcap',
        gen.params.type === 'poesia' && 'is-verse'
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <Sheet
            lang={gen.params.lang}
            head={`Obra apòcrifa · ${typeLabel(gen.params)}`}
            folio={gen.biblio.page}
            footer={
                <footer className="mt-10 border-t border-ink/20 pt-3 text-[0.85rem] leading-snug text-ink-soft">
                    <p>
                        <em>{biblio.work}</em>
                        {biblio.detail}
                    </p>
                </footer>
            }
        >
            {status === 'thinking' && !gen.raw ? (
                <Musing />
            ) : (
                <div aria-live="off" aria-busy={writing}>
                    {title && <h2 className="book-title mb-8 text-center text-[1.7rem] leading-tight sm:mb-10 sm:text-[2rem]">{title}</h2>}
                    <div className={bodyClass}>
                        {blocks.map((block, i) => (
                            <Block key={i} block={block} caret={writing && i === blocks.length - 1} />
                        ))}
                        {writing && blocks.length === 0 && <span className="caret" aria-hidden="true" />}
                    </div>
                    {status === 'stopped' && (
                        <p className="mt-6 text-center text-sm text-ink-soft italic">— Text interromput —</p>
                    )}
                    {gen.truncated && (
                        <p className="mt-6 text-center text-sm text-ink-soft italic">
                            — El text s'ha tallat perquè ha arribat al límit de longitud —
                        </p>
                    )}
                </div>
            )}
        </Sheet>
    );
}
