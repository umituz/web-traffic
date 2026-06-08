/**
 * Test: Calculation Utilities
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  roundCurrencyAmount,
  currencyPrecisionFactor,
  calculateExponentialBackoff,
  classifyDeviceTypeByScreen,
  calculateCommissionAmount,
  calculateConversionRate,
  calculateQueueOverflow,
  trimQueueOverflow,
  minutesToMilliseconds,
  secondsToMilliseconds,
  elapsedMilliseconds,
} from '../../src/shared/calculations';

test('roundCurrencyAmount - rounds to 2 decimals', () => {
  assert.equal(roundCurrencyAmount(10.126, 2), 10.13);
  assert.equal(roundCurrencyAmount(0.005, 2), 0.01);
  assert.equal(roundCurrencyAmount(0.004, 2), 0);
});

test('roundCurrencyAmount - rounds to 0 decimals (JPY)', () => {
  assert.equal(roundCurrencyAmount(1000.7, 0), 1001);
  assert.equal(roundCurrencyAmount(1000.4, 0), 1000);
});

test('roundCurrencyAmount - rounds to 3 decimals (KWD)', () => {
  assert.equal(roundCurrencyAmount(1.12345, 3), 1.123);
});

test('roundCurrencyAmount - rejects invalid inputs', () => {
  assert.throws(() => roundCurrencyAmount(NaN, 2));
  assert.throws(() => roundCurrencyAmount(10, -1));
  assert.throws(() => roundCurrencyAmount(10, 1.5));
});

test('currencyPrecisionFactor - returns correct power of 10', () => {
  assert.equal(currencyPrecisionFactor(0), 1);
  assert.equal(currencyPrecisionFactor(2), 100);
  assert.equal(currencyPrecisionFactor(3), 1000);
});

test('calculateExponentialBackoff - exponential growth', () => {
  assert.equal(calculateExponentialBackoff(0, 100), 100);
  assert.equal(calculateExponentialBackoff(1, 100), 200);
  assert.equal(calculateExponentialBackoff(2, 100), 400);
  assert.equal(calculateExponentialBackoff(3, 100), 800);
});

test('calculateExponentialBackoff - rejects negative', () => {
  assert.throws(() => calculateExponentialBackoff(-1, 100));
  assert.throws(() => calculateExponentialBackoff(0, -1));
});

test('classifyDeviceTypeByScreen - returns null for undefined', () => {
  assert.equal(classifyDeviceTypeByScreen(undefined), null);
});

test('classifyDeviceTypeByScreen - classifies mobile', () => {
  assert.equal(classifyDeviceTypeByScreen(375), 'mobile');
  assert.equal(classifyDeviceTypeByScreen(767), 'mobile');
});

test('classifyDeviceTypeByScreen - classifies tablet', () => {
  assert.equal(classifyDeviceTypeByScreen(768), 'tablet');
  assert.equal(classifyDeviceTypeByScreen(1024), 'tablet');
});

test('classifyDeviceTypeByScreen - classifies desktop', () => {
  assert.equal(classifyDeviceTypeByScreen(1025), 'desktop');
  assert.equal(classifyDeviceTypeByScreen(1920), 'desktop');
});

test('calculateCommissionAmount - basic calculation', () => {
  assert.equal(calculateCommissionAmount(100, 10), 10);
  assert.equal(calculateCommissionAmount(200, 15), 30);
  assert.equal(calculateCommissionAmount(0, 50), 0);
});

test('calculateCommissionAmount - rejects invalid rate', () => {
  assert.throws(() => calculateCommissionAmount(100, -1));
  assert.throws(() => calculateCommissionAmount(100, 101));
});

test('calculateCommissionAmount - rejects negative revenue', () => {
  assert.throws(() => calculateCommissionAmount(-1, 10));
});

test('calculateConversionRate - basic calculation', () => {
  assert.equal(calculateConversionRate(10, 5), 50);
  assert.equal(calculateConversionRate(4, 1), 25);
  assert.equal(calculateConversionRate(100, 100), 100);
});

test('calculateConversionRate - zero visits returns zero', () => {
  assert.equal(calculateConversionRate(0, 0), 0);
});

test('calculateConversionRate - rejects negative inputs', () => {
  assert.throws(() => calculateConversionRate(-1, 0));
  assert.throws(() => calculateConversionRate(0, -1));
});

test('calculateConversionRate - caps at 100% when conversions exceed visits', () => {
  assert.equal(calculateConversionRate(5, 6), 100);
  assert.equal(calculateConversionRate(1, 10), 100);
});

test('calculateQueueOverflow - returns 0 if within limit', () => {
  assert.equal(calculateQueueOverflow(50, 100), 0);
  assert.equal(calculateQueueOverflow(100, 100), 0);
});

test('calculateQueueOverflow - returns overflow amount', () => {
  assert.equal(calculateQueueOverflow(105, 100), 5);
  assert.equal(calculateQueueOverflow(150, 100), 50);
});

test('calculateQueueOverflow - rejects non-positive max', () => {
  assert.throws(() => calculateQueueOverflow(50, 0));
  assert.throws(() => calculateQueueOverflow(50, -1));
});

test('trimQueueOverflow - trims oldest items', () => {
  const result = trimQueueOverflow([1, 2, 3, 4, 5], 3);
  assert.deepEqual(result.retained, [3, 4, 5]);
  assert.deepEqual(result.dropped, [1, 2]);
});

test('trimQueueOverflow - no trim when within limit', () => {
  const result = trimQueueOverflow([1, 2, 3], 10);
  assert.deepEqual(result.retained, [1, 2, 3]);
  assert.deepEqual(result.dropped, []);
});

test('minutesToMilliseconds - correct conversion', () => {
  assert.equal(minutesToMilliseconds(1), 60_000);
  assert.equal(minutesToMilliseconds(30), 1_800_000);
  assert.equal(minutesToMilliseconds(60), 3_600_000);
});

test('minutesToMilliseconds - rejects negative', () => {
  assert.throws(() => minutesToMilliseconds(-1));
});

test('secondsToMilliseconds - correct conversion', () => {
  assert.equal(secondsToMilliseconds(1), 1000);
  assert.equal(secondsToMilliseconds(15), 15_000);
  assert.equal(secondsToMilliseconds(30), 30_000);
});

test('secondsToMilliseconds - rejects negative', () => {
  assert.throws(() => secondsToMilliseconds(-1));
});

test('elapsedMilliseconds - calculates positive duration', () => {
  const start = Date.now() - 1000;
  const elapsed = elapsedMilliseconds(start);
  assert.ok(elapsed >= 1000);
});

test('elapsedMilliseconds - never negative', () => {
  const elapsed = elapsedMilliseconds(Date.now() + 1000);
  assert.equal(elapsed, 0);
});

test('elapsedMilliseconds - explicit end time', () => {
  assert.equal(elapsedMilliseconds(100, 500), 400);
});
