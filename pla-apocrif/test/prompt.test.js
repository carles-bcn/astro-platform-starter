import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEXT_TYPES, TONES } from '../shared/catalog.js';
import { buildSystemPrompt, buildUserMessage } from '../server/prompt.js';

const base = { type: 'dietari', customType: '', tone: 1, theme: '', length: 'breu', lang: 'ca' };
const systemText = (params) => buildSystemPrompt(params).map((b) => b.text).join('\n');

test('la guia d\'estil hi és sempre i va en el primer bloc', () => {
    const [guide] = buildSystemPrompt(base);
    for (const fragment of ['ORIGINALS', 'parafrasegis', 'adjectiu exacte', 'tramuntana', 'Cap preàmbul', 'persones reals vives']) {
        assert.ok(guide.text.includes(fragment), fragment);
    }
    // El primer bloc no depèn dels controls.
    assert.equal(guide.text, buildSystemPrompt({ ...base, type: 'tv', tone: 5, lang: 'es' })[0].text);
});

test('cada tipus i cada to tenen indicacions pròpies', () => {
    for (const type of TEXT_TYPES.filter((t) => t.id !== 'altre')) {
        assert.doesNotMatch(systemText({ ...base, type: type.id }), /undefined/, type.id);
    }
    for (const tone of TONES) {
        const text = systemText({ ...base, tone: tone.value });
        assert.ok(text.includes(`To ${tone.value} de 5 («${tone.label}»)`));
        assert.doesNotMatch(text, /undefined/);
    }
});

test('extensió i llengua', () => {
    assert.match(systemText({ ...base, length: 'llarga' }), /900 paraules/);
    assert.match(systemText({ ...base, lang: 'es' }), /Escriu en castellà/);
});

test('el tema i el format lliure van al missatge de l\'usuari', () => {
    assert.match(buildUserMessage({ ...base, theme: 'el WiFi del tren' }), /Tema: «el WiFi del tren»/);
    assert.match(buildUserMessage(base), /tria'l tu/);
    const custom = { ...base, type: 'altre', customType: 'acta de veïns' };
    assert.match(buildUserMessage(custom), /Gènere: «acta de veïns»/);
    assert.doesNotMatch(systemText(custom), /acta de veïns/);
});
