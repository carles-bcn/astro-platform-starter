import {
    LANGUAGES,
    LENGTHS,
    MAX_CUSTOM_TYPE_LENGTH,
    MAX_THEME_LENGTH,
    TEXT_TYPES
} from '../../shared/catalog.js';
import { ToneSlider } from './ToneSlider.jsx';

const inputClass =
    'w-full rounded-md border border-rule bg-white/70 px-3 py-2 text-base text-ink placeholder:text-ink-soft/70 placeholder:italic focus:border-sea focus:outline-none focus:ring-1 focus:ring-sea disabled:opacity-60';

function Label({ htmlFor, children }) {
    return (
        <label htmlFor={htmlFor} className="smallcaps mb-1.5 block text-[0.95rem] text-ink-soft">
            {children}
        </label>
    );
}

function Segmented({ legend, name, options, value, onChange, disabled }) {
    return (
        <fieldset disabled={disabled}>
            <legend className="smallcaps mb-1.5 text-[0.95rem] text-ink-soft">{legend}</legend>
            <div className="grid auto-cols-fr grid-flow-col overflow-hidden rounded-md border border-rule bg-white/50">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="relative cursor-pointer border-l border-rule px-2 py-1.5 text-center first:border-l-0 has-checked:bg-ink has-checked:text-paper has-focus-visible:ring-2 has-focus-visible:ring-sea has-focus-visible:ring-inset"
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                            className="sr-only"
                        />
                        <span className="block leading-tight">{option.label}</span>
                        {option.hint && <span className="block text-xs italic opacity-75">{option.hint}</span>}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

export function Controls({ params, onChange, onWrite, onSurprise, onStop, busy }) {
    const set = (patch) => onChange({ ...params, ...patch });

    return (
        <form
            className="space-y-5"
            onSubmit={(e) => {
                e.preventDefault();
                if (!busy) onWrite();
            }}
        >
            <div>
                <Label htmlFor="type">Tipus de text</Label>
                <select
                    id="type"
                    value={params.type}
                    disabled={busy}
                    onChange={(e) => set({ type: e.target.value })}
                    className={inputClass}
                >
                    {TEXT_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.label}
                        </option>
                    ))}
                </select>
                {params.type === 'altre' && (
                    <input
                        type="text"
                        aria-label="Format lliure"
                        required
                        autoFocus
                        disabled={busy}
                        maxLength={MAX_CUSTOM_TYPE_LENGTH}
                        value={params.customType}
                        onChange={(e) => {
                            e.target.setCustomValidity('');
                            set({ customType: e.target.value });
                        }}
                        onInvalid={(e) => e.target.setCustomValidity('Escriu quin format vols.')}
                        placeholder="Prospecte d'un medicament, acta d'una reunió de veïns…"
                        className={`${inputClass} mt-2`}
                    />
                )}
            </div>

            <ToneSlider value={params.tone} disabled={busy} onChange={(tone) => set({ tone })} />

            <div>
                <Label htmlFor="theme">Tema</Label>
                <input
                    id="theme"
                    type="text"
                    disabled={busy}
                    maxLength={MAX_THEME_LENGTH}
                    value={params.theme}
                    onChange={(e) => set({ theme: e.target.value })}
                    placeholder="La tramuntana, el WiFi del tren…"
                    aria-describedby="theme-hint"
                    className={inputClass}
                />
                <p id="theme-hint" className="mt-1 text-sm text-ink-soft italic">
                    Si el deixes buit, el tria l'autor.
                </p>
            </div>

            <Segmented
                legend="Extensió"
                name="length"
                disabled={busy}
                value={params.length}
                onChange={(length) => set({ length })}
                options={LENGTHS.map((l) => ({ value: l.id, label: l.label, hint: `~${l.words} paraules` }))}
            />

            <Segmented
                legend="Llengua"
                name="lang"
                disabled={busy}
                value={params.lang}
                onChange={(lang) => set({ lang })}
                options={LANGUAGES.map((l) => ({ value: l.id, label: l.label }))}
            />

            <div className="flex gap-3 pt-1">
                {/* Claus diferents: si React reaprofités el node, el clic a «Atura» acabaria enviant el formulari. */}
                {busy ? (
                    <button
                        key="stop"
                        type="button"
                        onClick={onStop}
                        className="flex-1 rounded-md border border-ink bg-transparent px-4 py-2.5 text-lg text-ink hover:bg-ink hover:text-paper"
                    >
                        Atura
                    </button>
                ) : (
                    <button
                        key="write"
                        type="submit"
                        className="flex-1 rounded-md bg-terracotta px-4 py-2.5 text-lg text-paper shadow-sm hover:bg-terracotta-dark"
                    >
                        Escriu
                    </button>
                )}
                <button
                    type="button"
                    onClick={onSurprise}
                    disabled={busy}
                    title="Tipus, to i tema a l'atzar"
                    className="flex items-center gap-2 rounded-md border border-rule bg-white/60 px-4 py-2.5 text-lg text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <DieIcon />
                    Sorpresa
                </button>
            </div>
        </form>
    );
}

function DieIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
            <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
    );
}
