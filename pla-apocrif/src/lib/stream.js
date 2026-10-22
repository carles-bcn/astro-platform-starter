/** Error amb un missatge en català a punt per mostrar. */
export class ClientError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}

const SERVER_DOWN =
    'No s\'ha pogut connectar amb el servidor local. Comprova que «npm run dev» continua en marxa.';

/** Parser incremental de Server-Sent Events: crida onEvent(nom, dades) per a cada event complet. */
export function createSseParser(onEvent) {
    let buffer = '';
    return (chunk) => {
        buffer += chunk;
        let end;
        while ((end = buffer.indexOf('\n\n')) !== -1) {
            const block = buffer.slice(0, end);
            buffer = buffer.slice(end + 2);
            let event = 'message';
            const data = [];
            for (const line of block.split('\n')) {
                if (line.startsWith('event:')) event = line.slice(6).trim();
                else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
            }
            if (data.length) onEvent(event, JSON.parse(data.join('\n')));
        }
    };
}

/**
 * Demana un text al servidor i en va passant els fragments a onEvent.
 * Retorna les dades de l'event `done`; llança ClientError si alguna cosa falla.
 * Si l'usuari atura la generació (signal), deixa passar l'error original.
 */
export async function streamGenerate(params, { signal, onEvent }) {
    let res;
    try {
        res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
            signal
        });
    } catch (err) {
        if (signal?.aborted) throw err;
        throw new ClientError('SERVER_DOWN', SERVER_DOWN);
    }

    if (!res.ok) {
        const payload = await res.json().catch(() => null);
        if (payload?.error) throw new ClientError(payload.error.code, payload.error.message);
        throw new ClientError('SERVER_DOWN', SERVER_DOWN);
    }

    let result = null;
    let failure = null;
    const parse = createSseParser((event, data) => {
        if (event === 'done') result = data;
        else if (event === 'error') failure = new ClientError(data.code, data.message);
        else onEvent(event, data);
    });

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            parse(value);
        }
    } catch (err) {
        if (signal?.aborted) throw err;
        throw new ClientError('NETWORK', 'S\'ha perdut la connexió amb el servidor mentre s\'escrivia el text.');
    }

    if (failure) throw failure;
    if (!result) throw new ClientError('INCOMPLETE', 'La connexió s\'ha tallat abans que el text estigués acabat.');
    return result;
}

export async function fetchHealth() {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}
