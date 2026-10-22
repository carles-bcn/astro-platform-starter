import { findLanguage, findLength, findTone, typeLabel } from '../../shared/catalog.js';
import { biblioText } from './biblio.js';
import { slugify, splitTitle, toPlainBody } from './text.js';

export function describeParams(params) {
    const tone = findTone(params.tone);
    return [
        `Tipus: ${typeLabel(params)}`,
        `To: ${tone.value} · ${tone.label}`,
        `Tema: ${params.theme || '(triat per l\'autor)'}`,
        `Extensió: ${findLength(params.length).label}`,
        `Llengua: ${findLanguage(params.lang).label}`
    ].join(' · ');
}

/** Text pla per copiar. El peu apòcrif hi va sempre. */
export function toPlainText(gen) {
    const { title, body } = splitTitle(gen.raw);
    return [title, toPlainBody(body), `— ${biblioText(gen.biblio, gen.params.lang)}`].filter(Boolean).join('\n\n') + '\n';
}

/** Markdown per descarregar, amb el peu apòcrif i els paràmetres usats. */
export function toMarkdown(gen) {
    const { title, body } = splitTitle(gen.raw);
    const date = new Date(gen.createdAt).toLocaleString('ca');
    return [
        title && `# ${title}`,
        body.trim(),
        '---',
        `*${biblioText(gen.biblio, gen.params.lang)}*`,
        `> ${describeParams(gen.params)} · Model: ${gen.model ?? 'desconegut'} · ${date}`
    ]
        .filter(Boolean)
        .join('\n\n') + '\n';
}

export function downloadMarkdown(gen) {
    const { title } = splitTitle(gen.raw);
    const blob = new Blob([toMarkdown(gen)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(title) || 'pla-apocrif'}.md`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Alternativa per a navegadors sense l'API del porta-retalls.
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.append(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
    }
}
