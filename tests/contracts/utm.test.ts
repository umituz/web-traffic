/**
 * Test: UTMParameters Value Object
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UTMParameters } from '../../src/domains/tracking/value-objects/utm-parameters.vo';

test('UTMParameters - empty when no params', () => {
  const params = new URLSearchParams('?foo=bar');
  const utm = UTMParameters.fromURLSearchParams(params);
  assert.equal(utm, null);
});

test('UTMParameters - extracts from URL', () => {
  const params = new URLSearchParams('?utm_source=google&utm_medium=cpc&utm_campaign=sale');
  const utm = UTMParameters.fromURLSearchParams(params);
  assert.ok(utm);
  assert.equal(utm!.getSource(), 'google');
  assert.equal(utm!.getMedium(), 'cpc');
  assert.equal(utm!.getCampaign(), 'sale');
});

test('UTMParameters - rejects overly long values', () => {
  assert.throws(() => UTMParameters.of({ source: 'a'.repeat(300) }));
});

test('UTMParameters - rejects invalid characters', () => {
  assert.throws(() => UTMParameters.of({ source: '<script>' }));
});

test('UTMParameters - hasAnyUTM is true when any param set', () => {
  const utm = UTMParameters.of({ source: 'google' });
  assert.equal(utm.hasAnyUTM(), true);
});

test('UTMParameters - empty has no UTM', () => {
  const utm = UTMParameters.empty();
  assert.equal(utm.hasAnyUTM(), false);
});

test('UTMParameters - toJSON roundtrip', () => {
  const original = UTMParameters.of({ source: 'a', medium: 'b', campaign: 'c', term: 'd', content: 'e' });
  const json = original.toJSON();
  assert.deepEqual(json, { source: 'a', medium: 'b', campaign: 'c', term: 'd', content: 'e' });
});
