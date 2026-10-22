import Anthropic from '@anthropic-ai/sdk';

/** Error amb un codi i un missatge en català, pensat per mostrar-lo tal qual a l'usuari. */
export class AppError extends Error {
    constructor(code, message, status = 500) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

export const missingKeyError = () =>
    new AppError(
        'NO_API_KEY',
        'Falta la clau de l\'API d\'Anthropic. Copia .env.example a .env, posa-hi la teva ANTHROPIC_API_KEY i reinicia el servidor.'
    );

function retryAfterSeconds(err) {
    const value = Number(err.headers?.get?.('retry-after'));
    return Number.isFinite(value) && value > 0 ? Math.ceil(value) : null;
}

/** Converteix qualsevol error del SDK (o de la xarxa) en un AppError amb missatge en català. */
export function toAppError(err, model) {
    if (err instanceof AppError) return err;

    // L'ordre importa: les subclasses més específiques primer.
    if (err instanceof Anthropic.APIUserAbortError) {
        return new AppError('ABORTED', 'S\'ha aturat la generació.', 499);
    }
    if (err instanceof Anthropic.APIConnectionTimeoutError) {
        return new AppError('TIMEOUT', 'L\'API d\'Anthropic ha trigat massa a respondre. Torna-ho a provar.', 504);
    }
    if (err instanceof Anthropic.APIConnectionError) {
        return new AppError(
            'NETWORK',
            'No s\'ha pogut connectar amb l\'API d\'Anthropic. Comprova la connexió a internet.',
            502
        );
    }
    if (err instanceof Anthropic.AuthenticationError) {
        return new AppError(
            'AUTH',
            'La clau de l\'API no és vàlida o ha estat revocada. Revisa ANTHROPIC_API_KEY al fitxer .env i reinicia el servidor.',
            401
        );
    }
    if (err instanceof Anthropic.PermissionDeniedError) {
        return new AppError(
            'FORBIDDEN',
            `La teva clau no té permís per fer servir el model «${model}». Revisa ANTHROPIC_MODEL o els permisos del compte.`,
            403
        );
    }
    if (err instanceof Anthropic.NotFoundError) {
        return new AppError(
            'MODEL_NOT_FOUND',
            `El model «${model}» no existeix o no hi tens accés. Revisa ANTHROPIC_MODEL al fitxer .env.`,
            404
        );
    }
    if (err instanceof Anthropic.RateLimitError) {
        const wait = retryAfterSeconds(err);
        return new AppError(
            'RATE_LIMIT',
            wait
                ? `Has arribat al límit d'ús de l'API. Espera uns ${wait} segons i torna-ho a provar.`
                : 'Has arribat al límit d\'ús de l\'API. Espera una mica i torna-ho a provar.',
            429
        );
    }
    if (err instanceof Anthropic.BadRequestError) {
        if (/credit balance/i.test(err.message)) {
            return new AppError(
                'NO_CREDIT',
                'El compte d\'Anthropic no té prou crèdit. Revisa la facturació a la consola d\'Anthropic.',
                402
            );
        }
        return new AppError('BAD_REQUEST', `L'API ha rebutjat la petició: ${apiMessage(err)}`, 400);
    }

    // Errors que arriben a mig stream (status indefinit) o 5xx.
    const apiType = err?.error?.error?.type;
    if (err?.status === 529 || apiType === 'overloaded_error') {
        return new AppError(
            'OVERLOADED',
            'Els servidors d\'Anthropic estan saturats ara mateix. Torna-ho a provar d\'aquí a una estona.',
            503
        );
    }
    if (err instanceof Anthropic.InternalServerError || apiType === 'api_error') {
        return new AppError(
            'API_ERROR',
            'L\'API d\'Anthropic ha tingut un error intern. Torna-ho a provar d\'aquí a una estona.',
            502
        );
    }
    if (err instanceof Anthropic.APIError) {
        return new AppError('API_ERROR', `Error de l'API d'Anthropic: ${apiMessage(err)}`, 502);
    }

    console.error(err);
    return new AppError('UNKNOWN', 'S\'ha produït un error inesperat al servidor. Mira la consola per a més detalls.');
}

function apiMessage(err) {
    return err?.error?.error?.message ?? err.message;
}
