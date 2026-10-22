// Interpretació del text del model: títol a la primera línia ("# ...") i un
// markdown mínim (paràgrafs, subtítols, llistes, cursiva). Res d'HTML.

const stripMarks = (s) => s.replace(/\*\*?|__/g, '').trim();

/** Separa el títol del cos. Funciona també amb text a mig escriure. */
export function splitTitle(raw) {
    const text = raw.replace(/^\s+/, '');
    const newline = text.indexOf('\n');
    const firstLine = newline === -1 ? text : text.slice(0, newline);
    const rest = newline === -1 ? '' : text.slice(newline + 1);

    if (firstLine.startsWith('#')) {
        return { title: stripMarks(firstLine.replace(/^#+\s*/, '')), body: rest.replace(/^\s*\n/, '') };
    }
    // Si el model s'ha oblidat del "#", una primera línia curta seguida d'una línia en blanc també és un títol.
    if (/^\s*\n/.test(rest) && firstLine.length <= 100 && !/[.:;]$/.test(firstLine)) {
        return { title: stripMarks(firstLine), body: rest.replace(/^\s*\n/, '') };
    }
    return { title: '', body: text };
}

/** Converteix el cos en blocs: p, heading, ul, ol, rule. */
export function parseBlocks(body) {
    const blocks = [];
    let current = null;
    const flush = () => {
        if (current) blocks.push(current);
        current = null;
    };

    for (const rawLine of body.split('\n')) {
        const line = rawLine.trimEnd();
        if (!line.trim()) {
            flush();
            continue;
        }

        const heading = line.match(/^#{1,6}\s+(.*)$/);
        if (heading) {
            flush();
            blocks.push({ type: 'heading', text: stripMarks(heading[1]) });
            continue;
        }

        if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
            flush();
            blocks.push({ type: 'rule' });
            continue;
        }

        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
        if (bullet || numbered) {
            const kind = bullet ? 'ul' : 'ol';
            if (current?.type !== kind) {
                flush();
                current = { type: kind, items: [], start: numbered ? Number(numbered[1]) : undefined };
            }
            current.items.push(bullet ? bullet[1] : numbered[2]);
            continue;
        }

        if ((current?.type === 'ul' || current?.type === 'ol') && /^\s{2,}\S/.test(rawLine)) {
            current.items[current.items.length - 1] += ` ${line.trim()}`;
        } else if (current?.type === 'p') {
            current.text += `\n${line}`;
        } else {
            flush();
            current = { type: 'p', text: line };
        }
    }
    flush();
    return blocks;
}

/** Trosseja un text en segments amb cursiva o negreta: [{ text, em, strong }]. */
export function parseInline(text) {
    const segments = [];
    const pattern = /\*\*([^*]+)\*\*|\*([^*\n]+)\*/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
        if (match.index > last) segments.push({ text: text.slice(last, match.index) });
        if (match[1] !== undefined) segments.push({ text: match[1], strong: true });
        else segments.push({ text: match[2], em: true });
        last = match.index + match[0].length;
    }
    if (last < text.length) segments.push({ text: text.slice(last) });
    return segments;
}

/** Cos en text pla: sense marques de format, però amb les llistes i els subtítols. */
export function toPlainBody(body) {
    return parseBlocks(body)
        .map((block) => {
            switch (block.type) {
                case 'heading':
                    return block.text.toUpperCase();
                case 'ul':
                    return block.items.map((item) => `- ${stripMarks(item)}`).join('\n');
                case 'ol':
                    return block.items.map((item, i) => `${(block.start ?? 1) + i}. ${stripMarks(item)}`).join('\n');
                case 'rule':
                    return '* * *';
                default:
                    return block.text.replace(/\*\*?/g, '');
            }
        })
        .join('\n\n');
}

export function slugify(text) {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}
