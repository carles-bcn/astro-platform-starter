// Prova real contra l'API: genera tres combinacions i les desa a proves/resultats.md.
// Ús: npm run prova   (necessita ANTHROPIC_API_KEY al fitxer .env)
import fs from 'node:fs';
import path from 'node:path';
import { findLength, findTone, typeLabel } from '../shared/catalog.js';
import { ROOT, loadEnv } from '../server/env.js';
import { missingKeyError, toAppError } from '../server/errors.js';
import { generate, getConfig } from '../server/generate.js';

loadEnv();

const COMBINATIONS = [
    { type: 'dietari', customType: '', tone: 1, theme: '', length: 'mitjana', lang: 'ca' },
    { type: 'recepta', customType: '', tone: 3, theme: 'un arròs de diumenge', length: 'mitjana', lang: 'ca' },
    { type: 'tv', customType: '', tone: 5, theme: 'un concurs de cuina amb robots', length: 'mitjana', lang: 'ca' }
];

const describe = (p) =>
    `${typeLabel(p)} · to ${p.tone} (${findTone(p.tone).label}) · tema: ${p.theme || '(lliure)'} · ${findLength(p.length).label}`;

const { model, effort, hasKey } = getConfig();
if (!hasKey) {
    console.error(missingKeyError().message);
    process.exit(1);
}

const sections = [];
let failures = 0;

for (const [i, params] of COMBINATIONS.entries()) {
    const header = `${i + 1}. ${describe(params)}`;
    console.log(`\n━━ ${header}\n`);
    const started = Date.now();
    let text = '';
    try {
        const result = await generate(params, {
            onThinking: () => process.stdout.write('(pensant…)\n'),
            onText: (t) => {
                text += t;
                process.stdout.write(t);
            }
        });
        const seconds = ((Date.now() - started) / 1000).toFixed(1);
        const words = text.split(/\s+/).filter(Boolean).length;
        console.log(`\n\n[${result.stopReason} · ${words} paraules · ${seconds} s]`);
        sections.push(`## ${header}\n\n_${result.model} · ${words} paraules · ${seconds} s · ${result.stopReason}_\n\n${text.trim()}`);
    } catch (err) {
        failures++;
        const appError = toAppError(err, model);
        console.error(`\nError (${appError.code}): ${appError.message}`);
        sections.push(`## ${header}\n\n**Error (${appError.code}):** ${appError.message}`);
    }
}

const outDir = path.join(ROOT, 'proves');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'resultats.md');
fs.writeFileSync(
    outFile,
    `# Proves de Pla Apòcrif\n\n${new Date().toLocaleString('ca')} · model ${model} · effort ${effort ?? '(per defecte)'}\n\n` +
        '> Textos generats per IA a la manera de Josep Pla. No són textos de Josep Pla.\n\n' +
        sections.join('\n\n---\n\n') +
        '\n'
);
console.log(`\nResultats desats a ${path.relative(process.cwd(), outFile)}`);
process.exitCode = failures ? 1 : 0;
