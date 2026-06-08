/**
 * Test: Money Value Object
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Money } from '../../src/domains/conversion/value-objects/money.vo';

test('Money - rejects negative amount', () => {
  assert.throws(() => Money.of(-1, 'USD'));
});

test('Money - rejects invalid currency code', () => {
  assert.throws(() => Money.of(10, 'us'));
  assert.throws(() => Money.of(10, 'USDX'));
  assert.throws(() => Money.of(10, 'US'));
});

test('Money - rounds to 2 decimals for USD', () => {
  const m = Money.of(10.126, 'USD');
  assert.equal(m.getAmount(), 10.13);
});

test('Money - rounds to 0 decimals for JPY', () => {
  const m = Money.of(1000.7, 'JPY');
  assert.equal(m.getAmount(), 1001);
});

test('Money - rounds to 3 decimals for KWD', () => {
  const m = Money.of(10.12345, 'KWD');
  assert.equal(m.getAmount(), 10.123);
});

test('Money - zero factory', () => {
  const m = Money.zero('EUR');
  assert.equal(m.getAmount(), 0);
  assert.equal(m.getCurrency(), 'EUR');
});

test('Money - add requires same currency', () => {
  const a = Money.of(10, 'USD');
  const b = Money.of(5, 'EUR');
  assert.throws(() => a.add(b));
});

test('Money - add same currency', () => {
  const a = Money.of(10, 'USD');
  const b = Money.of(5.5, 'USD');
  const sum = a.add(b);
  assert.equal(sum.getAmount(), 15.5);
});

test('Money - subtract rejects negative result', () => {
  const a = Money.of(5, 'USD');
  const b = Money.of(10, 'USD');
  assert.throws(() => a.subtract(b));
});

test('Money - multiply requires non-negative factor', () => {
  const m = Money.of(10, 'USD');
  assert.throws(() => m.multiply(-1));
  assert.throws(() => m.multiply(NaN));
  const doubled = m.multiply(2);
  assert.equal(doubled.getAmount(), 20);
});

test('Money - isZero and isPositive', () => {
  assert.ok(Money.zero().isZero());
  assert.ok(!Money.zero().isPositive());
  assert.ok(Money.of(5, 'USD').isPositive());
});

test('Money - currency uppercased', () => {
  const m = Money.of(10, 'usd');
  assert.equal(m.getCurrency(), 'USD');
});

test('Money - equals value-based', () => {
  const a = Money.of(10, 'USD');
  const b = Money.of(10, 'USD');
  const c = Money.of(11, 'USD');
  const d = Money.of(10, 'EUR');
  assert.ok(a.equals(b));
  assert.ok(!a.equals(c));
  assert.ok(!a.equals(d));
});
