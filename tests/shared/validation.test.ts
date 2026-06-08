/**
 * Test: Validation Utilities
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertNonEmptyString,
  assertString,
  assertFiniteNumber,
  assertHasPrefix,
  isValidSlug,
  assertValidSlug,
  isValidCurrencyCode,
  assertValidCurrencyCode,
  normalizeCurrencyCode,
  isValidUtmValue,
  assertValidUtmValue,
  assertValidEventName,
  assertValidPageviewPath,
  isValidCommissionRate,
  assertValidCommissionRate,
  assertValidLandingPage,
} from '../../src/shared/validation';

test('assertNonEmptyString - accepts valid', () => {
  assertNonEmptyString('hello', 'name');
  assertNonEmptyString('  a  ', 'name');
});

test('assertNonEmptyString - rejects invalid', () => {
  assert.throws(() => assertNonEmptyString('', 'name'));
  assert.throws(() => assertNonEmptyString('   ', 'name'));
  assert.throws(() => assertNonEmptyString(null, 'name'));
  assert.throws(() => assertNonEmptyString(123, 'name'));
});

test('assertString - accepts any string', () => {
  assertString('hello', 'name');
  assertString('', 'name');
});

test('assertString - rejects non-strings', () => {
  assert.throws(() => assertString(123, 'name'));
  assert.throws(() => assertString(null, 'name'));
  assert.throws(() => assertString(undefined, 'name'));
});

test('assertFiniteNumber - accepts valid', () => {
  assertFiniteNumber(0, 'n');
  assertFiniteNumber(-5, 'n');
  assertFiniteNumber(3.14, 'n');
});

test('assertFiniteNumber - rejects invalid', () => {
  assert.throws(() => assertFiniteNumber(NaN, 'n'));
  assert.throws(() => assertFiniteNumber(Infinity, 'n'));
  assert.throws(() => assertFiniteNumber('5', 'n'));
  assert.throws(() => assertFiniteNumber(null, 'n'));
});

test('assertHasPrefix - accepts matching prefix', () => {
  assertHasPrefix('session-abc', 'session-');
  assertHasPrefix('event-1', 'event-');
});

test('assertHasPrefix - rejects non-matching', () => {
  assert.throws(() => assertHasPrefix('foo-1', 'session-'));
  assert.throws(() => assertHasPrefix('session', 'session-'));
});

test('isValidSlug - validates correctly', () => {
  assert.equal(isValidSlug('abc'), true);
  assert.equal(isValidSlug('partner-123'), true);
  assert.equal(isValidSlug('a_b_c'), true);
  assert.equal(isValidSlug('a'), false);  // too short
  assert.equal(isValidSlug('a'.repeat(100)), false); // too long
  assert.equal(isValidSlug('has space'), false);
  assert.equal(isValidSlug('has!bang'), false);
});

test('assertValidSlug - throws on invalid', () => {
  assert.throws(() => assertValidSlug(''));
  assert.throws(() => assertValidSlug('a b'));
});

test('isValidCurrencyCode - validates ISO 4217', () => {
  assert.equal(isValidCurrencyCode('USD'), true);
  assert.equal(isValidCurrencyCode('EUR'), true);
  assert.equal(isValidCurrencyCode('JPY'), true);
  assert.equal(isValidCurrencyCode('usd'), false);
  assert.equal(isValidCurrencyCode('US'), false);
  assert.equal(isValidCurrencyCode('USDX'), false);
});

test('assertValidCurrencyCode - throws on invalid', () => {
  assert.throws(() => assertValidCurrencyCode('usd'));
  assert.throws(() => assertValidCurrencyCode('123'));
});

test('normalizeCurrencyCode - uppercases', () => {
  assert.equal(normalizeCurrencyCode('usd'), 'USD');
  assert.equal(normalizeCurrencyCode('EuR'), 'EUR');
});

test('isValidUtmValue - validates characters and length', () => {
  assert.equal(isValidUtmValue('google'), true);
  assert.equal(isValidUtmValue('a-b_c.d/e'), true);
  assert.equal(isValidUtmValue('a'.repeat(200)), true);
  assert.equal(isValidUtmValue('a'.repeat(201)), false);
  assert.equal(isValidUtmValue('<script>'), false);
});

test('assertValidUtmValue - allows undefined', () => {
  assertValidUtmValue('', 'source'); // empty string treated as undefined
});

test('assertValidEventName - accepts valid', () => {
  assertValidEventName('button_click');
  assertValidEventName('a');
});

test('assertValidEventName - rejects empty', () => {
  assert.throws(() => assertValidEventName(''));
  assert.throws(() => assertValidEventName('   '));
});

test('assertValidEventName - rejects too long', () => {
  assert.throws(() => assertValidEventName('a'.repeat(101)));
});

test('assertValidPageviewPath - accepts valid', () => {
  assertValidPageviewPath('/home');
  assertValidPageviewPath('/products/123');
});

test('assertValidPageviewPath - rejects empty', () => {
  assert.throws(() => assertValidPageviewPath(''));
  assert.throws(() => assertValidPageviewPath('   '));
});

test('assertValidPageviewPath - rejects too long', () => {
  assert.throws(() => assertValidPageviewPath('/' + 'a'.repeat(2048)));
});

test('isValidCommissionRate - validates range', () => {
  assert.equal(isValidCommissionRate(0), true);
  assert.equal(isValidCommissionRate(10), true);
  assert.equal(isValidCommissionRate(100), true);
  assert.equal(isValidCommissionRate(-1), false);
  assert.equal(isValidCommissionRate(101), false);
  assert.equal(isValidCommissionRate(NaN), false);
});

test('assertValidCommissionRate - throws on out of range', () => {
  assert.throws(() => assertValidCommissionRate(-1));
  assert.throws(() => assertValidCommissionRate(101));
});

test('assertValidLandingPage - accepts non-empty', () => {
  assertValidLandingPage('/home');
});

test('assertValidLandingPage - rejects empty', () => {
  assert.throws(() => assertValidLandingPage(''));
  assert.throws(() => assertValidLandingPage('   '));
});
