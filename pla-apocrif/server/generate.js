import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, buildUserMessage } from './prompt.js';
import { AppError, missingKeyError } from './errors.js';

export const DEFAULT_MODEL = 'claude-sonnet-5-5';

// Models que accepten el fallback del servidor (`fallbacks: "default"`): si un
// filtre de seguretat declina la petició, l'API la reintenta amb un altre model.
const FALLBACK_MODELS = new Set([
    'claude-sonnet-5-5',
    'claude-opus-5-5',
    'claude-opus-5',
    'claude-fable-5-1',
    'claude-fable-5'
]);

export function getConfig() {
    const effort = process.env.ANTHROPIC_EFFORT ?? 'medium';
    return {
        model: process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL,
        // Buit desactiva el paràmetre, per a models que no admeten `effort`.
        effort: effort.trim() || null,
        hasKey: Boolean(process.env.ANTHROPIC_API_KEY?.trim())
    };
}

let client;
function getClient() {
    client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return client;
}

/**
 * Genera un text en streaming.
 * Crida onThinking() quan el model comença a pensar i onText(text) per a cada fragment.
 * Retorna { stopReason, model }.
 */
export async function generate(params, { onText, onThinking, signal } = {}) {
    const config = getConfig();
    if (!config.hasKey) throw missingKeyError();

    const body = {
        model: config.model,
        // Prou marge per a la versió llarga (~900 paraules) i el raonament previ.
        max_tokens: 16000,
        system: buildSystemPrompt(params),
        messages: [{ role: 'user', content: buildUserMessage(params) }],
        ...(config.effort && { output_config: { effort: config.effort } })
    };

    const stream = FALLBACK_MODELS.has(config.model)
        ? getClient().beta.messages.stream(
              { ...body, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' },
              { signal }
          )
        : getClient().messages.stream(body, { signal });

    for await (const event of stream) {
        if (event.type === 'content_block_start') {
            if (event.content_block.type === 'thinking') onThinking?.();
            if (event.content_block.type === 'fallback') {
                console.info(
                    `[fallback] ${event.content_block.from.model} → ${event.content_block.to.model}`
                );
            }
        } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            onText?.(event.delta.text);
        }
    }

    const message = await stream.finalMessage();
    if (message.stop_reason === 'refusal') {
        throw new AppError(
            'REFUSAL',
            'El model ha declinat escriure aquest text. Prova amb un altre tema o amb un altre to.',
            422
        );
    }
    return { stopReason: message.stop_reason, model: message.model };
}
