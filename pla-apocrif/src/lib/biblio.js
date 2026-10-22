// Referència bibliogràfica apòcrifa del peu de pàgina. Sempre deixa clar que el text no és de Pla.

const NUMERALS = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
];

export function toRoman(n) {
    let out = '';
    for (const [value, numeral] of NUMERALS) {
        while (n >= value) {
            out += numeral;
            n -= value;
        }
    }
    return out;
}

/** Volum i pàgina inventats, fixats en el moment de generar perquè no canviïn en recuperar el text. */
export function newBiblio() {
    return {
        volume: 38 + Math.floor(Math.random() * 60),
        page: 9 + Math.floor(Math.random() * 480)
    };
}

/** El títol de l'obra (per posar-lo en cursiva) i la resta de la referència. */
export function biblioParts({ volume, page }, lang) {
    const vol = toRoman(volume);
    return lang === 'es'
        ? {
              work: 'Obra Apócrifa',
              detail: `, vol. ${vol}, pág. ${page} — texto generado por IA a la manera de Josep Pla. No es un texto de Josep Pla.`
          }
        : {
              work: 'Obra Apòcrifa',
              detail: `, vol. ${vol}, pàg. ${page} — text generat per IA a la manera de Josep Pla. No és un text de Josep Pla.`
          };
}

export function biblioText(biblio, lang) {
    const { work, detail } = biblioParts(biblio, lang);
    return work + detail;
}
