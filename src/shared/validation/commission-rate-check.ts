/**
 * Commission Rate Check
 * @description Validates affiliate commission rate (0-100 percentage)
 */

import { assertFiniteNumber } from './assertions';

const COMMISSION_RATE_MIN = 0;
const COMMISSION_RATE_MAX = 100;

export function isValidCommissionRate(rate: number): boolean {
  return typeof rate === 'number'
    && Number.isFinite(rate)
    && rate >= COMMISSION_RATE_MIN
    && rate <= COMMISSION_RATE_MAX;
}

export function assertValidCommissionRate(rate: number): void {
  assertFiniteNumber(rate, 'Commission rate');
  if (rate < COMMISSION_RATE_MIN || rate > COMMISSION_RATE_MAX) {
    throw new Error(`Commission rate must be between ${COMMISSION_RATE_MIN} and ${COMMISSION_RATE_MAX}`);
  }
}
