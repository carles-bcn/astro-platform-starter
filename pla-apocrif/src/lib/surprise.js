import { TEXT_TYPES, TONES } from '../../shared/catalog.js';

// Temes inesperats per al botó «Sorpresa».
export const SURPRISE_THEMES = [
    'el WiFi del tren de Portbou',
    'un influencer a Palafrugell',
    'un robot aspirador que té por de la tramuntana',
    'una reunió de veïns per videoconferència',
    'el preu de les gambes de Palamós',
    'la cua d\'una pastisseria un diumenge al matí',
    'un congrés d\'astròlegs a Figueres',
    'la contrasenya del banc',
    'un gos que llegeix el diari al cafè',
    'la intel·ligència artificial explicada a un pagès',
    'un selfie dalt del Montgrí',
    'la primera calçotada vegana de l\'Empordà',
    'un ascensor que filosofa',
    'els patinets elèctrics de Girona',
    'una vaca que ha descobert l\'existencialisme',
    'el caixer automàtic del poble, avariat des de Sant Joan',
    'un concurs de paelles a la Lluna',
    'un GPS que s\'entesta a portar-te a Llofriu',
    'la màquina de cafè d\'una oficina',
    'la tramuntana dins d\'un centre comercial',
    'una sardina que vol ser famosa',
    'el pòdcast d\'un pescador de Cadaqués',
    'el primer dia de rebaixes',
    'un dron que vigila un hort de tomàquets',
    'l\'home del temps de la televisió',
    'un coach de vida a Begur',
    'unes ulleres de realitat virtual al casino del poble',
    'un sopar de Nadal per videotrucada',
    'el gat del notari',
    'un turista que busca la cala secreta d\'Instagram',
    'una vaga de gavines al port',
    'un menú degustació de vint-i-tres plats',
    'un microones que només escalfa records',
    'la xarxa social dels pagesos',
    'una partida de botifarra contra una màquina',
    'les obres eternes de la carretera de Begur',
    'una tempesta d\'estiu vista des d\'un balcó',
    'la boira de la plana de Vic',
    'el primer dia de la tardor',
    'un rellotge intel·ligent que compta les migdiades',
    'la segona residència d\'un barceloní a l\'Empordà',
    'la carta de vins d\'un xiringuito'
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** Tria a l'atzar tipus, to i tema; conserva l'extensió i la llengua. */
export function surpriseParams(current) {
    const types = TEXT_TYPES.filter((t) => t.id !== 'altre');
    const themes = SURPRISE_THEMES.filter((t) => t !== current.theme);
    return {
        ...current,
        type: pick(types).id,
        customType: '',
        tone: pick(TONES).value,
        theme: pick(themes)
    };
}
