import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { validateParams } from '../shared/catalog.js';
import { generate, getConfig } from './generate.js';
import { AppError, missingKeyError, toAppError } from './errors.js';
import { ROOT, loadEnv } from './env.js';

loadEnv();

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '127.0.0.1';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_req, res) => {
    const { model, hasKey } = getConfig();
    res.json({ ok: true, model, hasKey });
});

app.post('/api/generate', async (req, res) => {
    const validation = validateParams(req.body);
    if (!validation.ok) return sendJsonError(res, new AppError('BAD_REQUEST', validation.message, 400));
    if (!getConfig().hasKey) return sendJsonError(res, missingKeyError());

    // A partir d'aquí la resposta és un stream SSE: els errors viatgen com a events.
    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
    });
    res.flushHeaders();

    const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000);

    // Si el navegador talla la connexió (botó «Atura»), avortem la crida a l'API.
    const controller = new AbortController();
    res.on('close', () => {
        if (!res.writableEnded) controller.abort();
    });

    const { model } = getConfig();
    try {
        send('meta', { model });
        const result = await generate(validation.params, {
            signal: controller.signal,
            onThinking: () => send('status', { phase: 'thinking' }),
            onText: (text) => send('delta', { text })
        });
        send('done', { stopReason: result.stopReason, model: result.model });
    } catch (err) {
        const appError = toAppError(err, model);
        if (appError.code !== 'ABORTED') {
            console.error(`[generate] ${appError.code}: ${err.message}`);
            send('error', { code: appError.code, message: appError.message });
        }
    } finally {
        clearInterval(heartbeat);
        res.end();
    }
});

app.use('/api', (_req, res) => sendJsonError(res, new AppError('NOT_FOUND', 'Aquesta ruta no existeix.', 404)));

// En producció (`npm run build && npm start`) el mateix servidor serveix el frontend.
const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Errors d'Express (per exemple, un JSON mal format).
app.use((err, _req, res, _next) => {
    const status = err.status ?? 500;
    const message = status === 400 ? 'La petició no és un JSON vàlid.' : 'Error intern del servidor.';
    sendJsonError(res, new AppError(status === 400 ? 'BAD_REQUEST' : 'UNKNOWN', message, status));
});

function sendJsonError(res, appError) {
    res.status(appError.status).json({ error: { code: appError.code, message: appError.message } });
}

app.listen(PORT, HOST, (err) => {
    // Express 5 passa els errors d'arrencada (per exemple, el port ocupat) a aquesta funció.
    if (err) {
        console.error(
            err.code === 'EADDRINUSE'
                ? `El port ${PORT} ja està en ús. Tanca l'altra instància o canvia PORT al fitxer .env.`
                : `No s'ha pogut arrencar el servidor: ${err.message}`
        );
        process.exit(1);
    }
    const { model, hasKey } = getConfig();
    console.log(`Pla Apòcrif · API a http://${HOST}:${PORT} · model ${model}`);
    if (!hasKey) console.warn('Atenció: falta ANTHROPIC_API_KEY al fitxer .env.');
});
