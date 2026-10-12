import { useEffect, useMemo, useState } from 'react';
import {
    docent,
    trimestre,
    festius,
    diesLliureDisposicio,
    pausaMigdia,
    horariSetmanal,
    esdeveniments,
    type Bloc,
    type Categoria,
    type Esdeveniment
} from '../_data/horari';

const colors: Record<Categoria, { fons: string; vora: string; nom: string }> = {
    rutina: { fons: '#f4efec', vora: '#8a7b74', nom: 'Rutines' },
    grup: { fons: '#e4eefb', vora: '#3b6fb6', nom: 'Temps de grup' },
    ambients: { fons: '#e6f2e8', vora: '#3f8a50', nom: 'Ambients' },
    jardi: { fons: '#fdf5cf', vora: '#a8902a', nom: 'Jardí' },
    aacc: { fons: '#dff3f0', vora: '#3d8f88', nom: 'AACC' },
    llengua: { fons: '#e4eefb', vora: '#2f5f9e', nom: 'Llengua' },
    reptes: { fons: '#efe6f6', vora: '#8257a8', nom: 'Reptes' },
    investigacio: { fons: '#fdefdc', vora: '#b5772c', nom: 'Investigació' },
    jocs: { fons: '#e6f2e8', vora: '#3f8a50', nom: 'Jocs / Cohesió' },
    tutoria: { fons: '#fce6df', vora: '#c9744f', nom: 'Tutories' },
    reunio: { fons: '#f7e4e6', vora: '#b04a58', nom: 'Reunions' },
    tancament: { fons: '#eeeeee', vora: '#777777', nom: 'Tancament' },
    sortida: { fons: '#fff0c2', vora: '#d18a00', nom: 'Sortides' },
    altre: { fons: '#f0f0f0', vora: '#555555', nom: 'Altres' }
};

const llegenda: Categoria[] = ['grup', 'ambients', 'llengua', 'reptes', 'investigacio', 'aacc', 'jardi', 'tutoria', 'reunio', 'sortida'];

const nomsDies = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres'];
const nomsDiesCurts = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const nomsMesos = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];

// --- Dates (sempre en hora local, amb claus AAAA-MM-DD) ---

const pad = (n: number) => String(n).padStart(2, '0');
const clau = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const llegir = (s: string) => {
    const [a, m, d] = s.split('-').map(Number);
    return new Date(a, m - 1, d);
};
const sumarDies = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dilluns = (d: Date) => sumarDies(d, -((d.getDay() + 6) % 7));
const deMes = (m: number) => (/^[aeiou]/.test(nomsMesos[m]) ? `d’${nomsMesos[m]}` : `de ${nomsMesos[m]}`);
const dataLlarga = (d: Date) => `${d.getDate()} ${deMes(d.getMonth())}`;
const minuts = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
};

const iniciTrimestre = llegir(trimestre.inici);
const fiTrimestre = llegir(trimestre.fi);

type EstatDia = { tipus: 'lectiu' } | { tipus: 'nolectiu'; motiu: string };

function estatDia(d: Date): EstatDia {
    const k = clau(d);
    if (festius[k]) return { tipus: 'nolectiu', motiu: festius[k] };
    if (diesLliureDisposicio[k]) return { tipus: 'nolectiu', motiu: diesLliureDisposicio[k] };
    if (d < iniciTrimestre) return { tipus: 'nolectiu', motiu: 'Abans de l’inici de curs' };
    if (d > fiTrimestre) return { tipus: 'nolectiu', motiu: 'Vacances de Nadal' };
    return { tipus: 'lectiu' };
}

interface DiaCalculat {
    blocs: Bloc[];
    altres: Esdeveniment[];
}

// Aplica els esdeveniments puntuals sobre l'horari habitual d'un dia feiner.
function calcularDia(d: Date): DiaCalculat {
    const k = clau(d);
    const delDia = esdeveniments.filter((e) => e.data === k);
    const blocs = horariSetmanal[(d.getDay() + 6) % 7].map((b) => {
        const e = delDia.find((e) => e.inici === b.inici && e.fi === b.fi);
        return e ? { inici: b.inici, fi: b.fi, titol: e.titol, categoria: e.categoria, nota: e.nota } : b;
    });
    const altres = delDia.filter((e) => !blocs.some((b) => b.inici === e.inici && b.fi === e.fi && b.titol === e.titol));
    return { blocs, altres };
}

// Setmanes del trimestre (de dilluns a dilluns).
const setmanes: Date[] = [];
for (let d = dilluns(iniciTrimestre); d <= fiTrimestre; d = sumarDies(d, 7)) setmanes.push(d);

const mesos: { any: number; mes: number }[] = [];
for (let d = new Date(iniciTrimestre.getFullYear(), iniciTrimestre.getMonth(), 1); d <= fiTrimestre; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
    mesos.push({ any: d.getFullYear(), mes: d.getMonth() });
}

// Files de la graella: totes les vores horàries de l'horari.
const vores = Array.from(
    new Set([...horariSetmanal.flat().flatMap((b) => [b.inici, b.fi]), pausaMigdia.inici, pausaMigdia.fi])
).sort((a, b) => minuts(a) - minuts(b));
const fila = (h: string) => vores.indexOf(h) + 2; // +1 capçalera, +1 base 1

function Targeta({ bloc, compacta = false }: { bloc: Bloc | Esdeveniment; compacta?: boolean }) {
    const c = colors[bloc.categoria];
    return (
        <div
            className={`h-full rounded-sm ${compacta ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-1 text-xs'} leading-tight`}
            style={{ background: c.fons, borderLeft: `3px solid ${c.vora}` }}
        >
            <div className="font-medium">{bloc.titol}</div>
            {bloc.nota && !compacta && <div className="mt-0.5 text-[10px] opacity-70">{bloc.nota}</div>}
        </div>
    );
}

function VistaSetmana({ inici }: { inici: Date }) {
    const dies = [0, 1, 2, 3, 4].map((i) => sumarDies(inici, i));
    const avui = clau(new Date());
    const fi = dies[4];
    const titol =
        inici.getMonth() === fi.getMonth()
            ? `Del ${inici.getDate()} al ${dataLlarga(fi)} de ${fi.getFullYear()}`
            : `Del ${dataLlarga(inici)} al ${dataLlarga(fi)} de ${fi.getFullYear()}`;
    const numSetmana = setmanes.findIndex((s) => clau(s) === clau(inici)) + 1;

    return (
        <section className="pagina">
            <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="!text-xl font-semibold">{titol}</h2>
                <span className="text-sm text-gray-500">
                    Setmana {numSetmana} de {setmanes.length}
                </span>
            </header>
            <div
                className="grid gap-1 text-gray-900"
                style={{
                    gridTemplateColumns: '4.5rem repeat(5, minmax(0, 1fr))',
                    gridTemplateRows: `auto repeat(${vores.length - 1}, minmax(2.1rem, auto))`
                }}
            >
                <div className="rounded-sm bg-gray-900 px-2 py-1.5 text-center text-xs font-semibold text-white">Hora</div>
                {dies.map((d, i) => (
                    <div
                        key={i}
                        className={`rounded-sm px-2 py-1.5 text-center text-xs font-semibold text-white ${clau(d) === avui ? 'bg-[#b04a58]' : 'bg-gray-900'}`}
                    >
                        {nomsDies[i]} {d.getDate()}/{d.getMonth() + 1}
                    </div>
                ))}

                {vores.slice(0, -1).map((h, i) => (
                    <div key={h} className="flex items-center justify-center bg-[#f4efec] text-[11px] text-gray-600" style={{ gridColumn: 1, gridRow: i + 2 }}>
                        {h}–{vores[i + 1]}
                    </div>
                ))}

                <div
                    className="flex items-center justify-center bg-gray-50 text-[11px] text-gray-500"
                    style={{ gridColumn: '2 / span 5', gridRow: `${fila(pausaMigdia.inici)} / ${fila(pausaMigdia.fi)}` }}
                >
                    {pausaMigdia.titol}
                </div>

                {dies.map((d, i) => {
                    const estat = estatDia(d);
                    const col = i + 2;
                    if (estat.tipus === 'nolectiu') {
                        return (
                            <div
                                key={i}
                                className="flex items-center justify-center rounded-sm p-2 text-center text-sm font-medium text-gray-500"
                                style={{
                                    gridColumn: col,
                                    gridRow: `2 / ${vores.length + 1}`,
                                    background: 'repeating-linear-gradient(135deg, #f5f5f5 0 8px, #ececec 8px 16px)'
                                }}
                            >
                                {estat.motiu}
                            </div>
                        );
                    }
                    const { blocs, altres } = calcularDia(d);
                    return [
                        ...blocs.map((b) => (
                            <div key={`${i}-${b.inici}`} style={{ gridColumn: col, gridRow: `${fila(b.inici)} / ${fila(b.fi)}` }}>
                                <Targeta bloc={b} />
                            </div>
                        )),
                        altres.length > 0 && (
                            <div key={`${i}-altres`} className="flex flex-col justify-center gap-0.5" style={{ gridColumn: col, gridRow: `${fila(pausaMigdia.inici)} / ${fila(pausaMigdia.fi)}` }}>
                                {altres.map((e, j) => (
                                    <Targeta key={j} bloc={{ ...e, titol: `${e.inici ? `${e.inici} ` : ''}${e.titol}` }} compacta />
                                ))}
                            </div>
                        )
                    ];
                })}
            </div>
        </section>
    );
}

function VistaMes({ any, mes }: { any: number; mes: number }) {
    const primer = new Date(any, mes, 1);
    const avui = clau(new Date());
    const cel: (Date | null)[] = [];
    for (let i = 0; i < (primer.getDay() + 6) % 7; i++) cel.push(null);
    for (let d = primer; d.getMonth() === mes; d = sumarDies(d, 1)) cel.push(d);
    while (cel.length % 7) cel.push(null);

    return (
        <section className="pagina">
            <h2 className="mb-3 !text-xl font-semibold capitalize">
                {nomsMesos[mes]} {any}
            </h2>
            <div className="grid grid-cols-7 gap-1 text-gray-900">
                {nomsDiesCurts.map((n) => (
                    <div key={n} className="rounded-sm bg-gray-900 py-1 text-center text-xs font-semibold text-white">
                        {n}
                    </div>
                ))}
                {cel.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const capDeSetmana = d.getDay() === 0 || d.getDay() === 6;
                    const estat = estatDia(d);
                    const dia = !capDeSetmana && estat.tipus === 'lectiu' ? calcularDia(d) : null;
                    const reunions = dia ? dia.blocs.filter((b) => b.categoria === 'reunio' || b.categoria === 'sortida') : [];
                    return (
                        <div
                            key={i}
                            className={`flex min-h-24 flex-col gap-0.5 rounded-sm border p-1 ${clau(d) === avui ? 'border-[#b04a58] border-2' : 'border-gray-200'} ${capDeSetmana ? 'bg-gray-50' : ''}`}
                            style={!capDeSetmana && estat.tipus === 'nolectiu' ? { background: 'repeating-linear-gradient(135deg, #f7f7f7 0 6px, #eeeeee 6px 12px)' } : undefined}
                        >
                            <span className={`text-xs font-semibold ${capDeSetmana ? 'text-gray-400' : ''}`}>{d.getDate()}</span>
                            {!capDeSetmana && estat.tipus === 'nolectiu' && <span className="text-[10px] leading-tight text-gray-500">{estat.motiu}</span>}
                            {dia && (
                                <>
                                    {reunions.map((b) => (
                                        <Targeta key={b.inici} bloc={{ ...b, titol: `${b.inici} ${b.titol}` }} compacta />
                                    ))}
                                    {dia.altres.map((e, j) => (
                                        <Targeta key={`a${j}`} bloc={{ ...e, titol: `${e.inici ? `${e.inici} ` : ''}${e.titol}` }} compacta />
                                    ))}
                                    <span className="mt-auto text-[10px] text-gray-500">{dia.blocs.length - reunions.length} classes</span>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function Llegenda() {
    return (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-700">
            {llegenda.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ background: colors[c].fons, border: `2px solid ${colors[c].vora}` }} />
                    {colors[c].nom}
                </span>
            ))}
        </div>
    );
}

type Vista = 'setmana' | 'mes';

export default function Calendari() {
    const indexAvui = useMemo(() => {
        const i = setmanes.findIndex((s) => clau(s) === clau(dilluns(new Date())));
        return i >= 0 ? i : new Date() < iniciTrimestre ? 0 : setmanes.length - 1;
    }, []);
    const [vista, setVista] = useState<Vista>('setmana');
    const [setmana, setSetmana] = useState(indexAvui);
    const indexMesAvui = useMemo(() => {
        const avui = new Date();
        const i = mesos.findIndex((m) => m.any === avui.getFullYear() && m.mes === avui.getMonth());
        return i >= 0 ? i : avui < iniciTrimestre ? 0 : mesos.length - 1;
    }, []);
    const [mes, setMes] = useState(indexMesAvui);
    const [imprimintTot, setImprimintTot] = useState(false);

    useEffect(() => {
        if (!imprimintTot) return;
        const acabar = () => setImprimintTot(false);
        window.addEventListener('afterprint', acabar, { once: true });
        window.print();
        return () => window.removeEventListener('afterprint', acabar);
    }, [imprimintTot]);

    const total = vista === 'setmana' ? setmanes.length : mesos.length;
    const actual = vista === 'setmana' ? setmana : mes;
    const moure = (n: number) => {
        const nou = Math.min(total - 1, Math.max(0, actual + n));
        vista === 'setmana' ? setSetmana(nou) : setMes(nou);
    };

    const botoVista = (v: Vista, text: string) => (
        <button
            onClick={() => setVista(v)}
            className={`cursor-pointer rounded px-4 py-2 text-sm font-semibold no-underline transition-colors ${
                vista === v ? 'bg-primary text-primary-content' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
        >
            {text}
        </button>
    );

    const pagines =
        vista === 'setmana'
            ? (imprimintTot ? setmanes : [setmanes[setmana]]).map((s) => <VistaSetmana key={clau(s)} inici={s} />)
            : (imprimintTot ? mesos : [mesos[mes]]).map((m) => <VistaMes key={`${m.any}-${m.mes}`} any={m.any} mes={m.mes} />);

    return (
        <div className="flex flex-col gap-6">
            <div className="no-imprimir flex flex-wrap items-center gap-3 rounded-lg bg-gray-900/50 p-4">
                <div className="flex gap-2">
                    {botoVista('setmana', 'Setmana')}
                    {botoVista('mes', 'Mes')}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => moure(-1)} disabled={actual === 0} className="cursor-pointer rounded bg-gray-800 px-3 py-2 text-sm text-gray-200 no-underline hover:bg-gray-700 disabled:opacity-40">
                        ← Anterior
                    </button>
                    <button
                        onClick={() => (vista === 'setmana' ? setSetmana(indexAvui) : setMes(indexMesAvui))}
                        className="cursor-pointer rounded bg-gray-800 px-3 py-2 text-sm text-gray-200 no-underline hover:bg-gray-700"
                    >
                        Avui
                    </button>
                    <button onClick={() => moure(1)} disabled={actual === total - 1} className="cursor-pointer rounded bg-gray-800 px-3 py-2 text-sm text-gray-200 no-underline hover:bg-gray-700 disabled:opacity-40">
                        Següent →
                    </button>
                </div>
                <div className="flex gap-2 sm:ml-auto">
                    <button onClick={() => window.print()} className="btn">
                        Imprimir {vista === 'setmana' ? 'setmana' : 'mes'}
                    </button>
                    <button onClick={() => setImprimintTot(true)} className="btn">
                        Imprimir trimestre
                    </button>
                </div>
            </div>

            <div className="paper overflow-x-auto rounded-lg bg-white p-4 text-gray-900 sm:p-6">
                <div className="min-w-[44rem]">
                    <p className="mb-4 text-sm text-gray-600">
                        {docent.nom} · {docent.ambient} · {docent.escola} · {trimestre.nom}, curs {docent.curs}
                    </p>
                    {pagines}
                    <Llegenda />
                </div>
            </div>
        </div>
    );
}
