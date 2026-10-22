// Catàleg compartit entre el client i el servidor: l'únic lloc on es defineixen
// els tipus de text, els tons, les extensions i les llengües.

export const TEXT_TYPES = [
    { id: 'dietari', label: 'Dietari' },
    { id: 'article', label: 'Article de premsa' },
    { id: 'ficcio', label: 'Ficció / conte' },
    { id: 'viatge', label: 'Prosa de viatge' },
    { id: 'homenot', label: 'Retrat d\'un «homenot»' },
    { id: 'paisatge', label: 'Paisatge' },
    { id: 'carta', label: 'Carta' },
    { id: 'poesia', label: 'Poesia' },
    { id: 'recepta', label: 'Recepta de cuina' },
    { id: 'tv', label: 'Crítica televisiva' },
    { id: 'restaurant', label: 'Crítica de restaurant' },
    { id: 'electrodomestic', label: 'Instruccions d\'un electrodomèstic' },
    { id: 'app', label: 'Ressenya d\'una app' },
    { id: 'altre', label: 'Altre…' }
];

export const TONES = [
    { value: 1, label: 'Obra Completa', hint: 'Seriós i sobri, com extret d\'un volum de les seves obres completes.' },
    { value: 2, label: 'Observador irònic', hint: 'La ironia pagesa habitual, continguda.' },
    { value: 3, label: 'Sorneguer', hint: 'Més humor, més digressió, escepticisme explícit.' },
    { value: 4, label: 'Esbojarrat', hint: 'Situacions absurdes tractades amb total serietat planiana.' },
    {
        value: 5,
        label: 'Deliri total',
        hint: 'Bogeria completa, però sense perdre la veu, l\'adjectiu exacte ni la mirada escèptica.'
    }
];

export const LENGTHS = [
    { id: 'breu', label: 'Breu', words: 150 },
    { id: 'mitjana', label: 'Mitjana', words: 400 },
    { id: 'llarga', label: 'Llarga', words: 900 }
];

export const LANGUAGES = [
    { id: 'ca', label: 'Català' },
    { id: 'es', label: 'Castellano' }
];

export const MAX_THEME_LENGTH = 300;
export const MAX_CUSTOM_TYPE_LENGTH = 120;

export const DEFAULT_PARAMS = {
    type: 'dietari',
    customType: '',
    tone: 2,
    theme: '',
    length: 'mitjana',
    lang: 'ca'
};

export const findType = (id) => TEXT_TYPES.find((t) => t.id === id);
export const findTone = (value) => TONES.find((t) => t.value === value);
export const findLength = (id) => LENGTHS.find((l) => l.id === id);
export const findLanguage = (id) => LANGUAGES.find((l) => l.id === id);

/** Etiqueta llegible del tipus de text, tenint en compte el format lliure. */
export function typeLabel(params) {
    if (params.type === 'altre') return params.customType?.trim() || 'Altre';
    return findType(params.type)?.label ?? params.type;
}

/** Normalitza i valida els paràmetres d'una petició. Retorna { ok, params } o { ok: false, message }. */
export function validateParams(input) {
    if (!input || typeof input !== 'object') return { ok: false, message: 'La petició no té el format esperat.' };

    const type = String(input.type ?? '');
    if (!findType(type)) return { ok: false, message: 'El tipus de text no és vàlid.' };

    const customType = typeof input.customType === 'string' ? input.customType.trim() : '';
    if (type === 'altre' && !customType) {
        return { ok: false, message: 'Has triat «Altre…»: escriu quin format vols.' };
    }
    if (customType.length > MAX_CUSTOM_TYPE_LENGTH) {
        return { ok: false, message: `El format lliure no pot passar de ${MAX_CUSTOM_TYPE_LENGTH} caràcters.` };
    }

    const tone = Number(input.tone);
    if (!findTone(tone)) return { ok: false, message: 'El to ha de ser un número de l\'1 al 5.' };

    const theme = typeof input.theme === 'string' ? input.theme.trim() : '';
    if (theme.length > MAX_THEME_LENGTH) {
        return { ok: false, message: `El tema no pot passar de ${MAX_THEME_LENGTH} caràcters.` };
    }

    const length = String(input.length ?? '');
    if (!findLength(length)) return { ok: false, message: 'L\'extensió no és vàlida.' };

    const lang = String(input.lang ?? '');
    if (!findLanguage(lang)) return { ok: false, message: 'La llengua no és vàlida.' };

    return {
        ok: true,
        params: { type, customType: type === 'altre' ? customType : '', tone, theme, length, lang }
    };
}
