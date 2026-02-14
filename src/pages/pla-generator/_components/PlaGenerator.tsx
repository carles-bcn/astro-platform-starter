import { useState, useCallback } from 'react';

const temes = ['paisatge', 'gastronomia', 'gent', 'mar', 'estacions'] as const;
type Tema = (typeof temes)[number];

const temaLabels: Record<Tema, string> = {
    paisatge: 'Paisatge',
    gastronomia: 'Gastronomia',
    gent: 'Gent del país',
    mar: 'El mar',
    estacions: 'Les estacions'
};

const inicis: Record<Tema, string[]> = {
    paisatge: [
        'L\'Empordà és una terra seca, ventosa, aspra, que no admet cap mena de retòrica.',
        'El paisatge de l\'Empordà té una claredat que no es troba enlloc més.',
        'He vist molts països, però cap no té la llum de la plana empordanesa.',
        'La tramuntana bufa amb una violència que ho neteja tot: el cel, la terra i el pensament.',
        'Des del cim de Sant Pere de Rodes, el món sembla explicable.',
        'El cap de Creus és un paisatge d\'una austeritat grandiosa.',
        'La plana del Baix Empordà, vista des de dalt, és com un mosaic de camps ordenats amb una lògica perfecta.',
        'Al Pirineu, la boira dorm als fondals com un gat enroscant-se.'
    ],
    gastronomia: [
        'La cuina empordanesa és la cuina de la claredat: productes nets, coccions justes, cap artifici.',
        'Un bon suquet de peix és una de les coses més serioses que es poden fer en aquest país.',
        'L\'arròs a la cassola, fet com cal, és un dels plats que justifiquen l\'existència.',
        'El pa amb tomàquet és, potser, la creació gastronòmica més important de la Mediterrània.',
        'Una escudella ben feta és una arquitectura líquida d\'una perfecció admirable.',
        'Les anxoves de l\'Escala són un prodigi de la sal i del temps.',
        'Un rostit de xai amb herbes del país és la quintaessència de la cuina de muntanya.',
        'La botifarra amb mongetes és un plat d\'una simplicitat enganyosa: cal fer-lo molt bé o no fer-lo.'
    ],
    gent: [
        'La gent d\'aquest país és desconfiada, irònica i profundament escèptica.',
        'El pagès empordanès és un home de poques paraules i moltes observacions.',
        'He conegut pescadors que tenien més filosofia que molts catedràtics.',
        'La gent del país parla poc, però quan parla, sol tenir raó.',
        'El senyor Hermós era un home menut, sec, amb uns ulls d\'una vivacitat extraordinària.',
        'A Palafrugell, la gent tenia l\'hàbit de seure davant de casa al capvespre i no dir res.',
        'Els mariners de Cadaqués tenen una manera de mirar el cel que val més que qualsevol baròmetre.',
        'La meva àvia deia que la millor qualitat d\'una persona és saber callar a temps.'
    ],
    mar: [
        'La Mediterrània és un mar vell, cansat, ple d\'història i de peixos.',
        'El mar de la Costa Brava té una transparència mineral que fascina.',
        'A Calella de Palafrugell, les barques descansen a la platja com animals cansats.',
        'El mar a l\'hivern és una cosa seriosa: gris, espès, malhumorat.',
        'Les cales de Begur tenen l\'aigua d\'un blau que no existeix a la paleta de cap pintor.',
        'Quan el mar està en calma, el silenci de la costa és absolut, perfecte.',
        'El port de Cadaqués, al matí, té una llum que ho transfigura tot.',
        'La mar grossa de llevant és un espectacle que posa les coses al seu lloc.'
    ],
    estacions: [
        'La primavera a l\'Empordà arriba d\'un dia per l\'altre, sense avisar, com una visita inesperada.',
        'L\'estiu a la costa és llarg, espès, pesat com una migdiada interminable.',
        'La tardor és l\'estació més bella de l\'Empordà: els colors, la llum, la temperatura.',
        'L\'hivern empordanès és curt però intens, dominat per la tramuntana.',
        'Al novembre, els camps tenen un color terrós que és d\'una bellesa austera.',
        'El juny a l\'Empordà és el mes perfecte: ni fa massa calor ni massa fred.',
        'Quan arriba el fred, les cases del poble es tanquen com closques.',
        'El setembre és el mes de la verema i de les postes de sol més llargues.'
    ]
};

const desenvolupaments: Record<Tema, string[]> = {
    paisatge: [
        'Tot és mineral, definit, tallat amb una precisió geomètrica. No hi ha lloc per a la vaguitat.',
        'La llum del matí revela cada detall amb una nitidesa quasi cruel.',
        'Els olivers, retorçats pel vent, tenen una dignitat que els arbres de jardí no tindran mai.',
        'Les vinyes a la tardor semblen un incendi lent, controlat, d\'una bellesa calculada.',
        'Hi ha una hora, al capvespre, en què la llum ho daura tot i el paisatge sembla irreal.',
        'Els camps de blat madur, amb la tramuntana, fan unes onades que recorden el mar.',
        'Les muntanyes del fons delimiten el paisatge com els marges d\'una pàgina ben escrita.',
        'Cada poble de l\'Empordà té una personalitat pròpia, inconfusible, com les persones.'
    ],
    gastronomia: [
        'La gràcia de la cuina catalana rau en la qualitat del producte i en la saviesa de no espatllar-lo.',
        'Cuinar bé és, en el fons, una forma d\'intel·ligència aplicada.',
        'La diferència entre un plat bo i un plat excel·lent és una qüestió de paciència.',
        'Tots els grans plats del país tenen una base de sofregit, que és la pedra angular de la nostra cuina.',
        'L\'oli d\'oliva és el líquid fonamental d\'aquesta civilització.',
        'Un vi honest del país val més que un vi presumptuós de fora.',
        'La millor cuina és la que es fa amb quatre coses i molta atenció.',
        'El secret de la cuina de l\'Empordà és que no té secrets: tot és a la vista.'
    ],
    gent: [
        'Aquí la gent no s\'entusiasma fàcilment, cosa que és un senyal d\'intel·ligència.',
        'La ironia empordanesa és una forma de protecció contra la grandiloqüència.',
        'La gent d\'aquí valora el silenci tant com la conversa, potser més.',
        'He observat que les persones més sensates solen ser les que menys parlen.',
        'La desconfiança del pagès no és un defecte: és una forma de prudència ancestral.',
        'La cortesia del país és seca, breu, però profundament sincera.',
        'La gent gran tenia un sentit comú que s\'ha anat perdent amb les generacions.',
        'El sentit de l\'humor de l\'Empordà és sec com la tramuntana i igual de tallant.'
    ],
    mar: [
        'El mar és l\'únic paisatge que canvia cada dia sense deixar de ser el mateix.',
        'Els pescadors surten a la matinada amb una naturalitat que amaga un coratge enorme.',
        'La Mediterrània ha estat el bressol de totes les civilitzacions que han valgut la pena.',
        'L\'olor de mar barrejada amb l\'olor de pi és el perfum de la Costa Brava.',
        'Des de la barca, el poble es veu petit, insignificant, humil, i això li escau.',
        'El mar ensenya una cosa: la paciència. Qui no la té, no pot ser mariner.',
        'A la tarda, el mar agafa un color de plom fos que és inquietant i bell alhora.',
        'Les roques de la costa tenen formes que semblen esculpides per un artista borratxo.'
    ],
    estacions: [
        'Cada estació té el seu menjar, la seva llum, la seva manera de fer les coses.',
        'El canvi d\'estació és sempre una sorpresa, encara que passi cada any.',
        'A l\'hivern, el foc de la llar és el centre de la vida domèstica.',
        'La calor de l\'estiu empordanès només es pot combatre amb una ombra, una cadira i una mica de paciència.',
        'La llum de la tardor té una qualitat melancòlica que predisposa a la reflexió.',
        'La primavera fa florir els ametllers d\'un dia per l\'altre, amb una urgència vegetal admirable.',
        'L\'equinocci de setembre és el moment en què l\'any gira i tot comença a plegar.',
        'El fred de gener neteja l\'aire i fa que les estrelles brillin amb una intensitat extraordinària.'
    ]
};

const conclusions: Record<Tema, string[]> = {
    paisatge: [
        'Al capdavall, un paisatge és una forma de pensament.',
        'No cal anar gaire lluny per trobar la bellesa. Normalment, és a tocar.',
        'L\'Empordà no és un país fàcil, però és un país honest, i això val molt.',
        'Escriure sobre el paisatge és una manera d\'intentar retenir-lo, encara que sigui inútil.',
        'La terra acaba imposant-se sempre. Les persones passen; el paisatge queda.',
        'Qui no estima el seu paisatge no estima res.'
    ],
    gastronomia: [
        'Menjar bé és una de les poques coses sensates que es poden fer en aquesta vida.',
        'La cuina és la primera forma de cultura d\'un poble.',
        'Un país que menja malament no pot aspirar a res de bo.',
        'La gastronomia és l\'art de transformar la necessitat en plaer.',
        'Sense una bona cuina, la civilització és impensable.',
        'Al final del dia, un bon àpat és el millor consol que existeix.'
    ],
    gent: [
        'La gent és el que és. No cal demanar-li que sigui altra cosa.',
        'He après més de la gent del país que de tots els llibres que he llegit.',
        'Les persones senzilles solen ser les més complexes per dins.',
        'El coneixement de la gent és la base de tota literatura que valgui la pena.',
        'En el fons, tots som iguals: una mica ridículs i una mica admirables.',
        'La humanitat és un espectacle que no s\'acaba mai, i això és el que la fa interessant.'
    ],
    mar: [
        'El mar és el gran mestre: ensenya humilitat, paciència i respecte.',
        'Davant del mar, les pretensions humanes es tornen ridícules, i això és saludable.',
        'La Mediterrània és un estat d\'ànim, no només un mar.',
        'Qui ha viscut vora el mar no pot viure lluny de l\'aigua sense sentir una mancança profunda.',
        'El mar és l\'únic espectacle que no cansa mai.',
        'Al final, tot torna al mar, que és on tot va començar.'
    ],
    estacions: [
        'Les estacions són el rellotge natural de la vida. Convé escoltar-les.',
        'El pas del temps és l\'únic tema realment important de la literatura.',
        'Cada estació porta el seu consol i la seva melancolia.',
        'La repetició de les estacions no és monòtona: és reconfortant.',
        'El temps passa, les estacions tornen, i nosaltres ens fem vells mirant-les passar.',
        'La vida, com les estacions, és una successió de renaixements i decadències.'
    ]
};

const transicions = [
    '\n\n',
    ' ',
    ' Ara bé, ',
    ' D\'altra banda, ',
    ' Cal dir que ',
    ' En efecte, ',
    ' Naturalment, ',
    ' Val a dir que '
];

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generarText(tema: Tema, numParagrafs: number): string {
    const paragraphs: string[] = [];

    for (let i = 0; i < numParagrafs; i++) {
        const parts: string[] = [];

        if (i === 0) {
            parts.push(randomItem(inicis[tema]));
            parts.push(randomItem(transicions));
            parts.push(randomItem(desenvolupaments[tema]));
        } else if (i === numParagrafs - 1) {
            parts.push(randomItem(desenvolupaments[tema]));
            parts.push(randomItem(transicions));
            parts.push(randomItem(conclusions[tema]));
        } else {
            parts.push(randomItem(inicis[tema]));
            parts.push(randomItem(transicions));
            parts.push(randomItem(desenvolupaments[tema]));
            parts.push(randomItem(transicions));
            parts.push(randomItem(conclusions[tema]));
        }

        paragraphs.push(parts.join(''));
    }

    return paragraphs.join('\n\n');
}

export default function PlaGenerator() {
    const [tema, setTema] = useState<Tema>('paisatge');
    const [numParagrafs, setNumParagrafs] = useState(3);
    const [text, setText] = useState('');
    const [copiat, setCopiat] = useState(false);

    const generar = useCallback(() => {
        setText(generarText(tema, numParagrafs));
        setCopiat(false);
    }, [tema, numParagrafs]);

    const copiarText = useCallback(async () => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiat(true);
            setTimeout(() => setCopiat(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopiat(true);
            setTimeout(() => setCopiat(false), 2000);
        }
    }, [text]);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 p-6 rounded-lg bg-gray-900/50">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                        Tema
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {temes.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTema(t)}
                                className={`px-4 py-2 rounded text-sm font-semibold transition-colors cursor-pointer no-underline ${
                                    tema === t
                                        ? 'bg-primary text-primary-content'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {temaLabels[t]}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                        Paràgrafs: {numParagrafs}
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={5}
                        value={numParagrafs}
                        onChange={(e) => setNumParagrafs(Number(e.target.value))}
                        className="w-full max-w-xs accent-primary"
                    />
                </div>

                <div>
                    <button onClick={generar} className="btn btn-lg">
                        Generar text
                    </button>
                </div>
            </div>

            {text && (
                <div className="relative">
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={copiarText}
                            className="px-3 py-1.5 rounded text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer no-underline"
                        >
                            {copiat ? 'Copiat!' : 'Copiar'}
                        </button>
                    </div>
                    <div className="p-6 pr-24 rounded-lg bg-gray-900/50 font-serif leading-relaxed text-lg whitespace-pre-wrap text-gray-100">
                        {text}
                    </div>
                </div>
            )}
        </div>
    );
}
