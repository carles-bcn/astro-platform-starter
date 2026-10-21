import { TONES, findTone } from '../../shared/catalog.js';

export function ToneSlider({ value, onChange, disabled }) {
    const tone = findTone(value);

    return (
        <div>
            <div className="mb-0.5 flex items-baseline justify-between gap-3">
                <label htmlFor="tone" className="smallcaps text-[0.95rem] text-ink-soft">
                    To
                </label>
                <span className="text-lg text-terracotta" aria-hidden="true">
                    {tone.value} · {tone.label}
                </span>
            </div>
            <input
                id="tone"
                type="range"
                min={1}
                max={TONES.length}
                step={1}
                value={value}
                disabled={disabled}
                aria-valuetext={`${tone.value} · ${tone.label}`}
                onChange={(e) => onChange(Number(e.target.value))}
                className="tone-range disabled:opacity-60"
            />
            <div className="-mt-1 flex justify-between px-[3px] text-sm text-ink-soft" aria-hidden="true">
                {TONES.map((t) => (
                    <button
                        key={t.value}
                        type="button"
                        tabIndex={-1}
                        disabled={disabled}
                        onClick={() => onChange(t.value)}
                        className={`w-4 text-center ${t.value === value ? 'font-semibold text-terracotta' : ''}`}
                    >
                        {t.value}
                    </button>
                ))}
            </div>
            <p className="mt-1 min-h-[2.6em] text-[0.95rem] leading-snug text-ink-soft italic">{tone.hint}</p>
        </div>
    );
}
