import { useEffect, useState } from 'react';
import { copyText, downloadMarkdown, toPlainText } from '../lib/export.js';

const buttonClass =
    'rounded-md border border-rule bg-white/60 px-3 py-1.5 text-base text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-50';

export function Toolbar({ gen, busy, onRegenerate }) {
    const [copied, setCopied] = useState(null);
    const ready = Boolean(gen?.raw) && !busy;

    useEffect(() => {
        if (copied === null) return;
        const timer = setTimeout(() => setCopied(null), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    return (
        <div className="mx-auto mb-4 flex w-full max-w-[40rem] flex-wrap items-center justify-end gap-2">
            <span className="mr-auto text-sm text-ink-soft italic" role="status">
                {copied === true && 'Copiat al porta-retalls.'}
                {copied === false && 'No s\'ha pogut copiar.'}
            </span>
            <button
                type="button"
                className={buttonClass}
                disabled={!ready}
                onClick={async () => setCopied(await copyText(toPlainText(gen)))}
            >
                Copia
            </button>
            <button type="button" className={buttonClass} disabled={!ready} onClick={() => downloadMarkdown(gen)}>
                Descarrega .md
            </button>
            <button type="button" className={buttonClass} disabled={!gen || busy} onClick={onRegenerate}>
                Regenera
            </button>
        </div>
    );
}
