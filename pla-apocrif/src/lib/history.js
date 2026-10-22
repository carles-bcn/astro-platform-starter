// Historial de les últimes generacions, només en aquest navegador.

const KEY = 'pla-apocrif:historial:v1';
export const MAX_HISTORY = 20;

const isEntry = (e) => e && typeof e.id === 'string' && typeof e.raw === 'string' && e.params && e.biblio;

export function loadHistory() {
    try {
        const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
        return Array.isArray(list) ? list.filter(isEntry).slice(0, MAX_HISTORY) : [];
    } catch {
        return [];
    }
}

/** Desa la llista. Retorna false si el navegador no ho permet (mode privat, quota plena…). */
export function saveHistory(list) {
    try {
        localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
        return true;
    } catch {
        return false;
    }
}

export const addToHistory = (list, entry) => [entry, ...list.filter((e) => e.id !== entry.id)].slice(0, MAX_HISTORY);
