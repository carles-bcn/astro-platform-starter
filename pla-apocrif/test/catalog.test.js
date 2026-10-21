import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS, typeLabel, validateParams } from '../shared/catalog.js';

test('accepta els paràmetres per defecte', () => {
    const result = validateParams(DEFAULT_PARAMS);
    assert.equal(result.ok, true);
    assert.deepEqual(result.params, DEFAULT_PARAMS);
});

test('rebutja valors fora de catàleg amb missatges en català', () => {
    assert.match(validateParams({ ...DEFAULT_PARAMS, type: 'sonet' }).message, /tipus de text/);
    assert.match(validateParams({ ...DEFAULT_PARAMS, tone: 6 }).message, /de l'1 al 5/);
    assert.match(validateParams({ ...DEFAULT_PARAMS, length: 'enorme' }).message, /extensió/);
    assert.match(validateParams({ ...DEFAULT_PARAMS, lang: 'fr' }).message, /llengua/);
    assert.match(validateParams({ ...DEFAULT_PARAMS, theme: 'x'.repeat(301) }).message, /300/);
    assert.equal(validateParams(null).ok, false);
});

test('«Altre…» exigeix el format lliure i el conserva', () => {
    assert.equal(validateParams({ ...DEFAULT_PARAMS, type: 'altre', customType: '  ' }).ok, false);
    const result = validateParams({ ...DEFAULT_PARAMS, type: 'altre', customType: ' prospecte ' });
    assert.equal(result.params.customType, 'prospecte');
    assert.equal(typeLabel(result.params), 'prospecte');
});

test('descarta el format lliure si el tipus no és «Altre…»', () => {
    const result = validateParams({ ...DEFAULT_PARAMS, type: 'carta', customType: 'res' });
    assert.equal(result.params.customType, '');
});
