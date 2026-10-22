import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Carrega el fitxer .env si existeix. Les variables ja definides a l'entorn tenen preferència. */
export function loadEnv() {
    try {
        process.loadEnvFile(path.join(ROOT, '.env'));
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
}
