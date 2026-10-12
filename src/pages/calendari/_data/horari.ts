// Dades del calendari del 1r trimestre (curs 2026-2027).
// Font: horari docent de Carles Herrera (Ambient Taller · Escola Els Encants)
// i calendari escolar oficial de Catalunya (Ordre EDF/66/2026).
// Per canviar el calendari només cal editar aquest fitxer.

export type Categoria =
    | 'rutina'
    | 'grup'
    | 'ambients'
    | 'jardi'
    | 'aacc'
    | 'llengua'
    | 'reptes'
    | 'investigacio'
    | 'jocs'
    | 'tutoria'
    | 'reunio'
    | 'tancament'
    | 'sortida'
    | 'altre';

export interface Bloc {
    inici: string; // HH:MM
    fi: string; // HH:MM
    titol: string;
    categoria: Categoria;
    nota?: string;
}

export interface Esdeveniment {
    data: string; // AAAA-MM-DD
    titol: string;
    categoria: Categoria;
    // Si té hores i coincideixen amb un bloc de l'horari, el substitueix.
    inici?: string;
    fi?: string;
    nota?: string;
}

export const docent = {
    nom: 'Carles Herrera',
    ambient: 'Ambient Taller',
    escola: 'Escola Els Encants',
    curs: '2026-2027'
};

export const trimestre = {
    nom: '1r trimestre',
    inici: '2026-09-08',
    fi: '2026-12-21'
};

// Dies sense classe dins del trimestre.
export const festius: Record<string, string> = {
    '2026-09-11': 'Diada Nacional de Catalunya',
    '2026-09-24': 'La Mercè (festa local de Barcelona)',
    '2026-10-12': 'Festa Nacional d’Espanya',
    '2026-12-08': 'La Immaculada'
    // L'1 de novembre i el 6 de desembre de 2026 cauen en diumenge.
};

// Dies de lliure disposició de l'escola (afegiu-los quan el consell escolar els aprovi).
export const diesLliureDisposicio: Record<string, string> = {
    // '2026-12-07': 'Dia de lliure disposició',
};

export const pausaMigdia = { inici: '13:30', fi: '14:30', titol: 'Pausa de migdia' };

// Horari habitual. Índex 0 = dilluns ... 4 = divendres.
export const horariSetmanal: Bloc[][] = [
    // Dilluns
    [
        { inici: '09:00', fi: '09:30', titol: 'Entrada, conversa i planificació', categoria: 'rutina' },
        { inici: '09:30', fi: '10:00', titol: 'Temps de grup', categoria: 'grup' },
        { inici: '10:00', fi: '11:00', titol: 'Ambients d’aprenentatge', categoria: 'ambients' },
        { inici: '11:00', fi: '11:30', titol: 'Jardí', categoria: 'jardi' },
        { inici: '11:30', fi: '12:30', titol: 'Reptes lingüístics sistematitzats', categoria: 'reptes' },
        { inici: '12:30', fi: '13:30', titol: 'Comunitat', categoria: 'reunio' },
        { inici: '14:30', fi: '15:00', titol: 'Temps de grup', categoria: 'grup' },
        { inici: '15:00', fi: '15:50', titol: 'Tutories individualitzades', categoria: 'tutoria' },
        { inici: '15:50', fi: '16:00', titol: 'Lectura de tancament', categoria: 'tancament' }
    ],
    // Dimarts
    [
        { inici: '09:00', fi: '09:30', titol: 'Entrada i conversa', categoria: 'rutina' },
        { inici: '09:30', fi: '11:00', titol: 'Temps de grup', categoria: 'grup' },
        { inici: '11:00', fi: '11:30', titol: 'AACC', categoria: 'aacc' },
        { inici: '11:30', fi: '12:30', titol: 'Investigacions', categoria: 'investigacio' },
        { inici: '12:30', fi: '13:30', titol: 'Grup de treball / Claustre', categoria: 'reunio' },
        { inici: '14:30', fi: '15:00', titol: 'Temps de grup', categoria: 'grup' },
        { inici: '15:00', fi: '15:50', titol: 'Ambients d’aprenentatge', categoria: 'ambients' },
        { inici: '15:50', fi: '16:00', titol: 'Lectura de tancament', categoria: 'tancament' }
    ],
    // Dimecres
    [
        { inici: '09:00', fi: '10:00', titol: 'AACC', categoria: 'aacc' },
        { inici: '10:00', fi: '11:00', titol: 'Temps de grup', categoria: 'grup' },
        { inici: '11:00', fi: '11:30', titol: 'Jardí', categoria: 'jardi' },
        { inici: '11:30', fi: '12:30', titol: 'Llengua · ½ grup Taller', categoria: 'llengua' },
        {
            inici: '12:30',
            fi: '13:30',
            titol: 'Programació / Comunitat',
            categoria: 'reunio',
            nota: 'Es concreta cada setmana'
        },
        { inici: '14:30', fi: '15:50', titol: 'Ambients d’aprenentatge · Taller', categoria: 'ambients' },
        { inici: '15:50', fi: '16:00', titol: 'Lectura de tancament', categoria: 'tancament' }
    ],
    // Dijous
    [
        { inici: '09:00', fi: '09:30', titol: 'Entrada i conversa', categoria: 'rutina' },
        { inici: '09:30', fi: '10:00', titol: 'Temps de grup', categoria: 'grup' },
        { inici: '10:00', fi: '11:00', titol: 'Ambients d’aprenentatge', categoria: 'ambients' },
        { inici: '11:00', fi: '11:30', titol: 'AACC', categoria: 'aacc' },
        { inici: '11:30', fi: '12:30', titol: 'Reptes matemàtics sistematitzats', categoria: 'reptes' },
        { inici: '12:30', fi: '13:30', titol: 'Entrevistes amb famílies', categoria: 'reunio' },
        { inici: '14:30', fi: '15:00', titol: 'Temps de grup', categoria: 'grup' },
        { inici: '15:00', fi: '15:50', titol: 'Ambients d’aprenentatge', categoria: 'ambients' },
        { inici: '15:50', fi: '16:00', titol: 'Lectura de tancament', categoria: 'tancament' }
    ],
    // Divendres
    [
        { inici: '09:00', fi: '10:00', titol: 'Llengua · ½ grup Taller', categoria: 'llengua' },
        { inici: '10:00', fi: '11:00', titol: 'Caixes d’investigació', categoria: 'investigacio' },
        { inici: '11:00', fi: '11:30', titol: 'Jardí', categoria: 'jardi' },
        { inici: '11:30', fi: '12:30', titol: 'Caixes d’investigació', categoria: 'investigacio' },
        { inici: '12:30', fi: '13:30', titol: 'Formació / gestió comunitat', categoria: 'reunio' },
        { inici: '14:30', fi: '15:50', titol: 'Jocs de taula / Cohesió', categoria: 'jocs' },
        { inici: '15:50', fi: '16:00', titol: 'Lectura de tancament', categoria: 'tancament' }
    ]
];

// Reunions, sortides i altres canvis puntuals. Exemples:
// { data: '2026-10-21', inici: '12:30', fi: '13:30', titol: 'Claustre', categoria: 'reunio' },
// { data: '2026-11-13', titol: 'Sortida al Museu de la Ciència', categoria: 'sortida' },
export const esdeveniments: Esdeveniment[] = [];
