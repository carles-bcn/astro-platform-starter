import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBlocks, parseInline, slugify, splitTitle, toPlainBody } from '../src/lib/text.js';
import { createSseParser } from '../src/lib/stream.js';
import { biblioText, toRoman } from '../src/lib/biblio.js';

test('splitTitle separa el títol, també a mig stream', () => {
    assert.deepEqual(splitTitle('# La **tramuntana**\n\nBufa.'), { title: 'La tramuntana', body: 'Bufa.' });
    assert.deepEqual(splitTitle('# La tramun'), { title: 'La tramun', body: '' });
    assert.deepEqual(splitTitle('#'), { title: '', body: '' });
    assert.deepEqual(splitTitle('Sense coixinet\n\nText.'), { title: 'Sense coixinet', body: 'Text.' });
    assert.deepEqual(splitTitle('Un paràgraf normal.\nI segueix.'), { title: '', body: 'Un paràgraf normal.\nI segueix.' });
});

test('parseBlocks reconeix paràgrafs, subtítols i llistes', () => {
    const blocks = parseBlocks('Entrada.\n\n## Ingredients\n- arròs\n- sal\n\n1. Bulliu\n2. Serviu\n\n---\n\nVers u\nvers dos');
    assert.deepEqual(
        blocks.map((b) => b.type),
        ['p', 'heading', 'ul', 'ol', 'rule', 'p']
    );
    assert.deepEqual(blocks[2].items, ['arròs', 'sal']);
    assert.equal(blocks[3].start, 1);
    assert.equal(blocks[5].text, 'Vers u\nvers dos');
});

test('una línia que comença amb cursiva no és una llista', () => {
    assert.equal(parseBlocks('*Dilluns.* Plou.')[0].type, 'p');
});

test('parseInline i toPlainBody', () => {
    assert.deepEqual(parseInline('a *b* **c**'), [{ text: 'a ' }, { text: 'b', em: true }, { text: ' ' }, { text: 'c', strong: true }]);
    assert.equal(toPlainBody('## Passos\n1. *Bulliu*'), 'PASSOS\n\n1. Bulliu');
});

test('slugify', () => {
    assert.equal(slugify('L\'arròs de diumenge, a l\'Empordà!'), 'l-arros-de-diumenge-a-l-emporda');
});

test('el peu bibliogràfic sempre diu que no és de Pla', () => {
    assert.equal(toRoman(47), 'XLVII');
    assert.match(biblioText({ volume: 47, page: 213 }, 'ca'), /Obra Apòcrifa, vol\. XLVII, pàg\. 213 — .*No és un text de Josep Pla\./);
    assert.match(biblioText({ volume: 47, page: 213 }, 'es'), /No es un texto de Josep Pla\./);
});

test('el parser SSE suporta events partits entre trossos', () => {
    const events = [];
    const parse = createSseParser((event, data) => events.push([event, data]));
    parse('event: delta\ndata: {"text":"Bu');
    parse('fa"}\n\n: ping\n\nevent: done\ndata: {"stopReason":"end_turn"}\n\n');
    assert.deepEqual(events, [
        ['delta', { text: 'Bufa' }],
        ['done', { stopReason: 'end_turn' }]
    ]);
});
